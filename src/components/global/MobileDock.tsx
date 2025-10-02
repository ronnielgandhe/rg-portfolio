import { BsGithub, BsSpotify, BsFolder } from 'react-icons/bs';
import { IoIosMail, IoIosCall } from 'react-icons/io';
import { HiOutlinePhotograph } from 'react-icons/hi';

export default function MobileDock() {
  const handleEmailClick = () => {
    window.location.href = 'mailto:ronnielgandhe@gmail.com';
  };

  const handleGithubClick = () => {
    window.open('https://github.com/ronnielgandhe', '_blank');
  };

  const handleSpotifyClick = () => {
    window.open('https://open.spotify.com', '_blank');
  };

  const handleProjectsClick = () => {
    window.location.href = '/projects';
  };

  const handlePicturesClick = () => {
    window.location.href = '/pictures';
  };

  return (
    <div className='fixed bottom-0 left-0 right-0 md:hidden'>
      <div className='mx-4 mb-4 p-3 bg-gradient-to-t from-gray-700 to-gray-800 backdrop-blur-xl rounded-3xl flex justify-around items-center max-w-[400px] mx-auto'>
        <button
          onClick={handleProjectsClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-16 h-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center'>
            <BsFolder size={32} className='text-white' />
          </div>
        </button>

        <button
          onClick={handlePicturesClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-16 h-16 bg-gradient-to-t from-purple-600 to-pink-400 rounded-2xl flex items-center justify-center'>
            <HiOutlinePhotograph size={32} className='text-white' />
          </div>
        </button>

        <a href='tel:+1234567890' className='flex flex-col items-center'>
          <div className='w-16 h-16 bg-gradient-to-t from-green-600 to-green-400 rounded-2xl flex items-center justify-center'>
            <IoIosCall size={35} className='text-white' />
          </div>
        </a>

        <button
          onClick={handleEmailClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-16 h-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center'>
            <IoIosMail size={35} className='text-white' />
          </div>
        </button>

        <button
          onClick={handleGithubClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-16 h-16 bg-gradient-to-t from-black to-black/60 rounded-2xl flex items-center justify-center'>
            <BsGithub size={32} className='text-white' />
          </div>
        </button>

        <button
          onClick={handleSpotifyClick}
          className='flex flex-col items-center cursor-pointer'
        >
          <div className='w-16 h-16 bg-gradient-to-t from-black to-black/60 rounded-2xl flex items-center justify-center'>
            <BsSpotify size={32} className='text-[#1ED760]' />
          </div>
        </button>
      </div>
    </div>
  );
}
