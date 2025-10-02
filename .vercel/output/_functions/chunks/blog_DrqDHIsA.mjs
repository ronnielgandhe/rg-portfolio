import { g as getCollection } from './_astro_content_DHSJqmY8.mjs';

async function getRecentBlogPosts() {
  try {
    const allPosts = await getCollection("blog");
    const sortedPosts = allPosts.sort((a, b) => {
      const dateA = new Date(a.data.publishedAt);
      const dateB = new Date(b.data.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });
    return sortedPosts.slice(0, 3).map((post) => ({
      title: post.data.title,
      slug: post.slug,
      publishedAt: post.data.publishedAt,
      readingTime: post.data.readingTime || 5
    }));
  } catch (error) {
    console.warn("Could not fetch blog posts:", error);
    return [
      {
        title: "Building a Terminal Portfolio",
        slug: "building-terminal-portfolio",
        publishedAt: "2025-10-01",
        readingTime: 8
      },
      {
        title: "Sharpe Without Illusions",
        slug: "sharpe-without-illusions",
        publishedAt: "2025-09-15",
        readingTime: 12
      }
    ];
  }
}

export { getRecentBlogPosts as g };
