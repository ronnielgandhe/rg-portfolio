import { FaRegFolderClosed } from 'react-icons/fa6';

export default function MacTerminal() {
  const welcomeMessage = `Ronniel Gandhe — Software Engineer • Quant Developer

Location: Waterloo, ON
Email: ronnielgandhe@gmail.com
GitHub: github.com/ronnielgandhe

Type /help for commands.`;

  return (
    <div className='glass w-[600px] h-[400px] rounded-lg overflow-hidden shadow-lg mx-4 sm:mx-0'>
      <div className='bg-gray-800 h-6 flex items-center space-x-2 px-4'>
        <div className='w-3 h-3 rounded-full bg-red-500'></div>
        <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
        <div className='w-3 h-3 rounded-full bg-green-500'></div>
        <span className='text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2'>
          <FaRegFolderClosed size={14} className='text-gray-300' />
          ronnielgandhe.com — zsh
        </span>
      </div>
      <div className='p-4 text-gray-200 font-mono text-xs h-[calc(400px-1.5rem)] flex flex-col'>
        <div className='flex-1 overflow-y-auto'>
          <pre className='whitespace-pre-wrap'>{welcomeMessage}</pre>
          <div className='mt-4'>
            <div className='flex items-start space-x-2'>
              <span className='text-green-400'>{'>'}</span>
              <span className='text-gray-400'>Interactive terminal coming soon...</span>
            </div>
          </div>
        </div>
        <div className='mt-2'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2'>
            <span className='whitespace-nowrap text-gray-400'>rg@ronnielgandhe.com root %</span>
            <input
              type='text'
              disabled
              className='w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400 opacity-50'
              placeholder='Terminal will be interactive soon...'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
