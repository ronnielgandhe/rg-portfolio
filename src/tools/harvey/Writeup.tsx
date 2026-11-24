import Pipeline from './Pipeline';

export const REPO = 'https://github.com/ronnielgandhe/harvey';

export default function Writeup() {
  return (
    <section className="hv-full hv-write" aria-label="how it works">
      <div className="hv-label">how it works</div>
      <div className="hv-write-body">
        <p className="hv-p">your browser joins a livekit room and a python agent picks up. deepgram hears you, claude decides whether to answer or look up the law, elevenlabs talks back. legal questions go through two stage retrieval: a small model works out which statute you mean, then chroma searches inside it. plain similarity search kept missing things like "n12". the corpus is 7 sources and 5,668 chunks of ontario and federal law.</p>
      </div>
      <div className="hv-pl-wrap">
        <Pipeline />
      </div>
      <p className="hv-fine">not legal advice. <a className="hv-link" href={REPO} target="_blank" rel="noopener noreferrer">read the code</a></p>
    </section>
  );
}
