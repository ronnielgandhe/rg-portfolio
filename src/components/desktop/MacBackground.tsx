import { useEffect, useState } from 'react';

const WALLPAPER = '/backgroundappleuse.png';

export default function MacBackground({ overlayOpacity = 0.1 }: { overlayOpacity?: number } = {}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    const done = () => setReady(true);
    img.onload = done;
    img.onerror = done;
    img.src = WALLPAPER;
    if (img.complete) done();
  }, []);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `url(${WALLPAPER})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      {/* Dark overlay to reduce distraction from terminal */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          background: `rgba(0, 0, 0, ${overlayOpacity})`,
          opacity: ready ? 1 : 0,
          transition: 'background 0.4s ease, opacity 0.3s ease',
        }}
      />
    </>
  );
}
