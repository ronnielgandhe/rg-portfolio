import macBackground3 from '../assets/images/mac-background3.jpg';

// Using only the sand/desert background for all pages
export const backgrounds = [macBackground3];

export function getFixedBackgroundKey() {
  return 'bg-1'; // Always use the same background
}

export async function getOptimizedBackgrounds(getImage: any) {
  const optimized = await getImage({
    src: macBackground3,
    width: 3500,
  });

  return {
    'bg-1': optimized.src,
  };
}
