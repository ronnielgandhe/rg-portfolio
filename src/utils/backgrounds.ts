import macBackground1 from '../assets/images/mac-background1.jpg';
import macBackground2 from '../assets/images/mac-background2.jpg';
import macBackground3 from '../assets/images/mac-background3.jpg';

export const backgrounds = [macBackground1, macBackground2, macBackground3];

export function getRandomBackgroundKey() {
  return `bg-${Math.floor(Math.random() * backgrounds.length) + 1}`;
}

export async function getOptimizedBackgrounds(getImage: any) {
  const optimizedBackgrounds = await Promise.all(
    backgrounds.map((bg) =>
      getImage({
        src: bg,
        width: 3500,
      })
    )
  );

  return Object.fromEntries(
    optimizedBackgrounds.map((bg, index) => [`bg-${index + 1}`, bg.src])
  );
}
