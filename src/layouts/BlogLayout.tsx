import MobileDock from '../components/global/MobileDock';
import DesktopDock from '../components/global/DesktopDock';
import Nav from '../components/global/Nav';
import BlogPostCard from '../components/BlogPostCard';

interface BlogPost {
  title: string;
  slug: string | undefined;
  summary: string;
  publishedAt: string;
  readingTime?: number;
  tags: string[];
}

interface BlogLayoutProps {
  posts: BlogPost[];
  initialBg: string;
  backgroundMap: Record<string, string>;
  recentPosts?: Array<{
    title: string;
    slug: string;
    publishedAt: string;
    readingTime: number;
  }>;
}

export default function BlogLayout({ posts, initialBg, backgroundMap, recentPosts }: BlogLayoutProps) {
  // Always use bg-1 (the sand/mountain background)
  const currentBg = 'bg-1';

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundMap[currentBg]})` }}
      />

      {/* Navbar */}
      <div className="relative z-10">
        <Nav currentPath="/blog" recentPosts={recentPosts} />
      </div>

      {/* Main Content */}
      <div className="relative z-0 pt-12 pb-32 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12 mt-8">
            <div className="glass rounded-lg p-6 inline-block">
              <h1 className="text-3xl font-bold text-white mb-2 font-mono">
                <span className="text-green-400">$</span> cd ~/blog
              </h1>
              <p className="text-gray-300 font-mono text-sm">
                Technical writing on systematic trading, infrastructure, and software engineering.
              </p>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-12">
              <div className="glass rounded-lg p-8 inline-block">
                <p className="text-gray-300 font-mono">
                  <span className="text-green-400">$</span> ls -la
                  <br />
                  <span className="text-gray-500">No posts yet. Check back soon!</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Docks */}
      <MobileDock />
      <DesktopDock />
    </div>
  );
}
