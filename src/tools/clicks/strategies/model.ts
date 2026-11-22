export interface ModelMeta {
  id?: string; name?: string;
  buckets: number; dim: number; hid: number; mlp: number; feats: number;
  tensors: Record<string, { offset: number; dtype: string; shape: number[] }>;
}

export interface ClicksModel {
  meta: ModelMeta;
  distance(links: string[], target: string): Float32Array;
  distanceFrom(source: string, targets: string[]): Float32Array;
}

export interface SemanticMeta {
  sem_buckets: number; sem_dim: number;
  tensors: Record<string, { offset: number; dtype: string; shape: number[] }>;
}

export interface SemanticModel {
  related(links: string[], target: string): Float32Array;
}

const MARKS = /[̀-ͯ]/g;
const enc = new TextEncoder();

export function words(title: string) {
  return title.replace(/_/g, ' ').normalize('NFKD').replace(MARKS, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

export function trigrams(ws: string[]) {
  const out: string[] = [];
  for (const w of ws) {
    const p = `<${w}>`;
    for (let i = 0; i + 3 <= p.length; i++) out.push(p.slice(i, i + 3));
  }
  return out;
}

export function fnv(s: string) {
  let h = 0x811c9dc5;
  for (const b of enc.encode(s)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function tokenIds(title: string, buckets: number) {
  const ws = words(title);
  const toks = [...ws.map((w) => `w:${w}`), ...trigrams(ws).map((g) => `g:${g}`)];
  return (toks.length ? toks : ['w:']).map((t) => fnv(t) & (buckets - 1));
}

const jacc = (a: string[], b: string[]) => {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const x of A) if (B.has(x)) n++;
  return n / (A.size + B.size - n);
};

export function pairFeatures(u: string, v: string) {
  const wu = words(u), wv = words(v);
  const nu = wu.join(' '), nv = wv.join(' ');
  return [
    jacc(wu, wv),
    jacc(trigrams(wu), trigrams(wv)),
    Math.min(wu.length, 10) / 5,
    nv && nu.includes(nv) ? 1 : 0,
    wu.some((w) => /^\d+$/.test(w)) ? 1 : 0,
    nu === nv ? 1 : 0,
  ];
}

const pool = (title: string, q: Int8Array, s: Float32Array, nb: number, d: number) => {
  const ids = tokenIds(title, nb);
  const out = new Float32Array(d);
  for (const id of ids) {
    const sc = s[id] / ids.length;
    for (let j = 0; j < d; j++) out[j] += q[id * d + j] * sc;
  }
  return out;
};


function tensorView(tensors: ModelMeta['tensors'], buf: ArrayBuffer) {
  return (name: string) => {
    const t = tensors[name];
    const n = t.shape.reduce((a, b) => a * b, 1);
    return t.dtype === 'int8' ? new Int8Array(buf, t.offset, n) : new Float32Array(buf, t.offset, n);
  };
}

export function buildModel(meta: ModelMeta, buf: ArrayBuffer): ClicksModel {
  const view = tensorView(meta.tensors, buf);
  const Eq = view('E_q') as Int8Array, Es = view('E_scale') as Float32Array;
  const Ws = view('Ws') as Float32Array, bs = view('bs') as Float32Array;
  const Wt = view('Wt') as Float32Array, bt = view('bt') as Float32Array;
  const W1 = view('W1') as Float32Array, b1 = view('b1') as Float32Array;
  const w2 = view('w2') as Float32Array, b2 = view('b2') as Float32Array;
  const { buckets, dim, hid, mlp, feats } = meta;
  const zin = 3 * hid + feats;

  const tower = (e: Float32Array, W: Float32Array, b: Float32Array) => {
    const out = new Float32Array(hid);
    for (let j = 0; j < hid; j++) {
      let acc = b[j];
      for (let i = 0; i < dim; i++) acc += e[i] * W[i * hid + j];
      out[j] = Math.tanh(acc);
    }
    return out;
  };

  const towerCache = new Map<string, Float32Array>();
  const linkTower = (t: string) => {
    let a = towerCache.get(t);
    if (!a) {
      a = tower(pool(t, Eq, Es, buckets, dim), Ws, bs);
      if (towerCache.size > 50000) towerCache.clear();
      towerCache.set(t, a);
    }
    return a;
  };

  const targetCache = new Map<string, Float32Array>();
  const targetTower = (t: string) => {
    let b = targetCache.get(t);
    if (!b) {
      b = tower(pool(t, Eq, Es, buckets, dim), Wt, bt);
      if (targetCache.size > 50000) targetCache.clear();
      targetCache.set(t, b);
    }
    return b;
  };

  const z = new Float32Array(zin);
  const head = (u: string, v: string, a: Float32Array, b: Float32Array) => {
    for (let j = 0; j < hid; j++) { z[j] = a[j]; z[hid + j] = b[j]; z[2 * hid + j] = a[j] * b[j]; }
    const f = pairFeatures(u, v);
    for (let j = 0; j < feats; j++) z[3 * hid + j] = f[j];
    let y = b2[0];
    for (let m = 0; m < mlp; m++) {
      let h = b1[m];
      for (let i = 0; i < zin; i++) h += z[i] * W1[i * mlp + m];
      if (h > 0) y += h * w2[m];
    }
    return y;
  };

  return {
    meta,
    distance(links, target) {
      const b = targetTower(target);
      return Float32Array.from(links, (l) => head(l, target, linkTower(l), b));
    },
    distanceFrom(source, targets) {
      const a = linkTower(source);
      return Float32Array.from(targets, (t) => head(source, t, a, targetTower(t)));
    },
  };
}

export function buildSemantic(meta: SemanticMeta, buf: ArrayBuffer): SemanticModel {
  const view = tensorView(meta.tensors, buf);
  const Sq = view('S_q') as Int8Array, Ss = view('S_scale') as Float32Array;
  const { sem_buckets, sem_dim } = meta;
  const semCache = new Map<string, Float32Array>();
  const sem = (t: string) => {
    let v = semCache.get(t);
    if (!v) {
      v = pool(t, Sq, Ss, sem_buckets, sem_dim);
      let n = 0;
      for (const x of v) n += x * x;
      n = Math.sqrt(n) || 1;
      for (let j = 0; j < sem_dim; j++) v[j] /= n;
      if (semCache.size > 50000) semCache.clear();
      semCache.set(t, v);
    }
    return v;
  };

  return {
    related(links, target) {
      const v = sem(target);
      return Float32Array.from(links, (l) => {
        const u = sem(l);
        let d = 0;
        for (let j = 0; j < sem_dim; j++) d += u[j] * v[j];
        return d;
      });
    },
  };
}

const models = new Map<string, Promise<ClicksModel>>();
let semantic: Promise<SemanticModel> | null = null;

async function fetchPair(base: string, name: string) {
  const [meta, buf] = await Promise.all([
    fetch(`${base}/${name}.json`).then((r) => { if (!r.ok) throw new Error(`${name} meta missing`); return r.json(); }),
    fetch(`${base}/${name}.bin`).then((r) => { if (!r.ok) throw new Error(`${name} weights missing`); return r.arrayBuffer(); }),
  ]);
  return { meta, buf };
}

export function setModel(id: string, m: ClicksModel) {
  models.set(id, Promise.resolve(m));
}

export function setSemantic(m: SemanticModel) {
  semantic = Promise.resolve(m);
}

export function loadModel(id: string, base = '/clicks-model'): Promise<ClicksModel> {
  let p = models.get(id);
  if (!p) {
    p = fetchPair(base, id).then(({ meta, buf }) => buildModel(meta, buf));
    p.catch(() => models.delete(id));
    models.set(id, p);
  }
  return p;
}

export function loadSemantic(base = '/clicks-model'): Promise<SemanticModel> {
  if (!semantic) {
    semantic = fetchPair(base, 'semantic').then(({ meta, buf }) => buildSemantic(meta, buf));
    semantic.catch(() => { semantic = null; });
  }
  return semantic;
}
