import { useState, useRef, useEffect } from 'react';
import { unzipSync } from 'fflate';
import { SAMPLE_FILES } from './mapping/sample';

const EXAMPLES = ['yoheinakajima/babyagi', 'mckaywrigley/chatbot-ui', 'sindresorhus/slugify'];
const SOURCE_EXT = /\.(m|c)?(j|t)sx?$|\.py$/;

const DeepReadTooltip = ({ text }) => (
  <span className="tooltip-trigger relative inline-flex align-middle ml-1 cursor-help">
    <span className="grid place-items-center w-4 h-4 rounded-full border border-[rgba(26,26,26,0.3)] text-[rgba(26,26,26,0.3)] text-[10px] leading-none transition-colors hover:border-[rgba(26,26,26,0.5)] hover:text-[rgba(26,26,26,0.5)]" style={{ paddingLeft: '1.5px' }}>?</span>
    <span className="tooltip-content absolute bottom-full left-0 mb-2 w-56 bg-[#1A1A1A] text-white text-[11px] leading-relaxed rounded px-3 py-2.5 z-50 font-normal normal-case tracking-normal whitespace-normal">
      {text}
      <span className="absolute top-full left-2 border-4 border-transparent border-t-[#1A1A1A]"></span>
    </span>
  </span>
);

const TABS = [
  { id: 'github', label: 'github repo' },
  { id: 'files', label: 'upload files' },
];

export default function InputPanel({ onScan, disabled }) {
  const [inputMode, setInputMode] = useState('github');

  const [url, setUrl] = useState('');
  const [deepRead, setDeepRead] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/leanfetch/deep-read')
      .then((r) => r.json())
      .then((d) => alive && setDeepRead(d))
      .catch(() => alive && setDeepRead({ enabled: false }));
    return () => { alive = false; };
  }, []);

  const deepOn = !!deepRead?.enabled;
  const deepText = deepOn
    ? `scan + deep read sends only the top ${deepRead.maxFindings || 10} flagged snippets (capped) to Claude on our server to confirm or reject each flag and write the assessment. ${deepRead.perIpPerDay} per day.`
    : '';

  const buildConfig = (withDeepRead) => {
    if (inputMode === 'github') {
      return { sourceType: 'github', url: url.trim(), deepRead: withDeepRead };
    }
    return { sourceType: 'files', files: uploadedFiles, uploadName: uploadedFiles.length === 1 ? uploadedFiles[0].name : `${uploadedFiles.length} files`, deepRead: withDeepRead };
  };

  const canScan = () => {
    if (inputMode === 'github') return !!url.trim();
    if (inputMode === 'files') return uploadedFiles.length > 0;
    return false;
  };

  const runDemo = () => {
    if (inputMode === 'github') {
      setUrl(EXAMPLES[0]);
      onScan({ sourceType: 'github', url: EXAMPLES[0], deepRead: false });
    } else if (inputMode === 'files') {
      setUploadedFiles(SAMPLE_FILES);
      onScan({ sourceType: 'files', files: SAMPLE_FILES, uploadName: 'demo files', deepRead: false });
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    setFileError('');
    for (const file of files) {
      if (/\.zip$/i.test(file.name)) {
        try {
          const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
            filter: (z) => SOURCE_EXT.test(z.name) && !/(^|\/)(node_modules|dist|build|vendor|\.next)\//.test(z.name) && z.originalSize <= 300 * 1024,
          });
          const decoder = new TextDecoder();
          const added = Object.entries(entries).map(([name, data]) => ({ name, content: decoder.decode(data) }));
          if (!added.length) setFileError(`${file.name} has no .js, .ts or .py files`);
          setUploadedFiles((prev) => [...prev, ...added]);
        } catch {
          setFileError(`could not read ${file.name}`);
        }
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFiles((prev) => [...prev, { name: file.name, content: reader.result }]);
      };
      reader.readAsText(file);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const inputClass =
    'w-full bg-white border border-[rgba(0,0,0,0.1)] px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[rgba(26,26,26,0.3)] focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] disabled:opacity-50';

  const tabClass = (id) =>
    `px-5 py-2.5 text-[13px] font-medium transition-colors ${
      inputMode === id
        ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]'
        : 'text-[rgba(26,26,26,0.4)] hover:text-[rgba(26,26,26,0.7)] border-b-2 border-transparent'
    }`;

  const labelClass =
    'block text-[13px] font-medium uppercase tracking-[0.08em] text-[rgba(26,26,26,0.4)] mb-2';

  return (
    <div className="panel-grow-enter bg-white border border-[rgba(0,0,0,0.06)]">
      <div className="flex justify-center border-b border-[rgba(0,0,0,0.06)] pt-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setInputMode(tab.id)}
            disabled={disabled}
            className={tabClass(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {inputMode === 'github' && (
          <>
            <div>
              <label className={labelClass}>
                github repo url <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo or owner/repo"
                disabled={disabled}
                className={inputClass}
              />
            </div>
            <div className="mt-5">
              <label className={labelClass}>
                try one{' '}
                
              </label>
              <div className="flex gap-2 flex-wrap">
                {EXAMPLES.map((ex) => (
                  <button key={ex} type="button" onClick={() => { setUrl(ex); onScan({ sourceType: 'github', url: ex, deepRead: false }); }} disabled={disabled} className="border border-[rgba(0,0,0,0.1)] text-[13px] px-4 py-2 hover:bg-[#FAFAF8] transition-colors disabled:opacity-50">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {inputMode === 'files' && (
          <>
            <div>
              <label className={labelClass}>source files <span className="text-[#DC2626]">*</span></label>
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled} className="border border-[rgba(0,0,0,0.1)] text-[13px] px-4 py-2 hover:bg-[#FAFAF8] transition-colors disabled:opacity-50">
                  choose files
                </button>
                <input ref={fileInputRef} type="file" multiple accept=".js,.jsx,.ts,.tsx,.py,.mjs,.cjs,.zip" onChange={handleFileUpload} className="hidden" />
                <span className="text-xs text-[rgba(26,26,26,0.4)] self-center">
                  {uploadedFiles.length > 0 ? `${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''} added` : 'no files selected'}
                </span>
                {fileError && <span className="text-xs text-[#DC2626] self-center">{fileError}</span>}
              </div>
              {uploadedFiles.length > 0 && (
                <div className="border border-[rgba(0,0,0,0.06)] divide-y divide-[rgba(0,0,0,0.06)] mb-3 max-h-40 overflow-y-auto">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs">
                      <span className="font-mono text-[#1A1A1A]">{f.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[rgba(26,26,26,0.3)]">{(f.content.length / 1024).toFixed(1)} KB</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-[rgba(26,26,26,0.3)] hover:text-[#DC2626]">&times;</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}


        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[rgba(26,26,26,0.4)]">
            {inputMode === 'github' ? 'public repos only. fetched, analyzed in memory, not stored.' : 'files are analyzed in memory, not stored.'}
            {deepOn && <DeepReadTooltip text={deepText} />}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={disabled} onClick={runDemo} className="text-[13px] font-medium text-[rgba(26,26,26,0.5)] hover:text-[#1A1A1A] px-4 py-2.5 transition-colors disabled:text-[rgba(26,26,26,0.2)]">
              demo scan
            </button>
            {deepOn && (
              <button type="button" disabled={disabled || !canScan()} onClick={() => onScan(buildConfig(true))} className="border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[13px] font-medium px-5 py-2.5 transition-colors disabled:border-[rgba(0,0,0,0.1)] disabled:text-[rgba(26,26,26,0.3)] disabled:hover:bg-transparent disabled:hover:text-[rgba(26,26,26,0.3)]">
                {disabled ? 'scanning...' : 'scan + deep read'}
              </button>
            )}
            <button type="button" disabled={disabled || !canScan()} onClick={() => onScan(buildConfig(false))} className="bg-[#1A1A1A] hover:bg-[#333333] text-white text-[13px] font-medium px-5 py-2.5 transition-colors disabled:bg-[rgba(26,26,26,0.15)] disabled:text-[rgba(26,26,26,0.3)]">
              {disabled ? 'scanning...' : 'scan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
