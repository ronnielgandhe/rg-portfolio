import { useEffect, useRef, useState } from 'react';
import { FaRegFolderClosed } from 'react-icons/fa6';

export default function MacTerminal() {
  const welcomeMessage = `Ronniel Gandhe — Software Engineer • Quant Developer\n\nLocation: Waterloo, ON\nEmail: ronnielgandhe@gmail.com\nGitHub: github.com/ronnielgandhe\n\nType /help for commands.`;

  const [lines, setLines] = useState<string[]>(() => welcomeMessage.split('\n'));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // keep scrolled to bottom when new lines added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const submit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // append user input to lines
    setLines((prev) => [...prev, `> ${trimmed}`]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: trimmed }] }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.details || data?.error || `HTTP ${res.status}`;
        setLines((prev) => [...prev, `Error: ${errMsg}`]);
      } else {
        // show assistant response
        const msg = data?.message ?? JSON.stringify(data);
        // split into lines to preserve formatting
        const msgLines = String(msg).split('\n');
        setLines((prev) => [...prev, ...msgLines]);
      }
    } catch (err: any) {
      setLines((prev) => [...prev, `Network error: ${err?.message || String(err)}`]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className='glass w-[800px] h-[500px] rounded-lg overflow-hidden shadow-lg mx-4 sm:mx-0'>
      <div className='bg-gray-800 h-6 flex items-center space-x-2 px-4'>
        <div className='w-3 h-3 rounded-full bg-red-500'></div>
        <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
        <div className='w-3 h-3 rounded-full bg-green-500'></div>
        <span className='text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2'>
          <FaRegFolderClosed size={14} className='text-gray-300' />
          ronnielgandhe.com — zsh
        </span>
      </div>
      <div className='p-4 text-gray-200 font-mono text-xs h-[calc(500px-1.5rem)] flex flex-col'>
        <div className='flex-1 overflow-y-auto' ref={scrollRef}>
          <pre className='whitespace-pre-wrap'>
            {lines.map((l, i) => (
              <div key={i} className={l.startsWith('>') ? 'text-green-400' : undefined}>
                {l}
              </div>
            ))}
          </pre>
        </div>

        <div className='mt-2'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2'>
            <span className='whitespace-nowrap text-gray-400'>rg@ronnielgandhe.com root %</span>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
              className='w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400'
              placeholder={loading ? 'Waiting for response...' : 'Type a command or message and press Enter'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
