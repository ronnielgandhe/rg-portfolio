import { getCollection } from 'astro:content';

export async function getRecentBlogPosts() {
  try {
    const allPosts = await getCollection('blog');
    
    // Sort by publishedAt date (most recent first)
    const sortedPosts = allPosts.sort((a, b) => {
      const dateA = new Date(a.data.publishedAt);
      const dateB = new Date(b.data.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Return most recent 3 posts
    return sortedPosts.slice(0, 3).map(post => ({
      title: post.data.title,
      slug: post.slug,
      publishedAt: post.data.publishedAt,
      readingTime: post.data.readingTime || 5
    }));
  } catch (error) {
    console.warn('Could not fetch blog posts:', error);
    // Return fallback data
    return [
      {
        title: 'Building a Terminal Portfolio',
        slug: 'building-terminal-portfolio',
        publishedAt: '2025-10-01',
        readingTime: 8
      },
      {
        title: 'Sharpe Without Illusions',
        slug: 'sharpe-without-illusions', 
        publishedAt: '2025-09-15',
        readingTime: 12
      }
    ];
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}