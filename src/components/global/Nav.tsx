import { useState, useEffect } from 'react';
import AppleMenu, { type MenuSection } from '../nav/AppleMenu';
import { 
  User, 
  Activity, 
  Camera, 
  Mail, 
  FileText
} from 'lucide-react';

interface NavProps {
  currentPath?: string;
  recentPosts?: Array<{
    title: string;
    slug: string;
    publishedAt: string;
    readingTime: number;
  }>;
}

export default function Nav({ currentPath = '/', recentPosts = [] }: NavProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Projects menu configuration - plain text only
  const projectSections: MenuSection[] = [
    {
      items: [
        {
          label: 'QuantTerminal',
          href: '/projects/quantterminal',
          description: 'Real-time trading dashboard'
        },
        {
          label: 'YourNews',
          href: 'https://github.com/ronnielgandhe/yournews',
          external: true,
          description: 'News aggregation platform'
        }
      ]
    },
    {
      items: [
        {
          label: 'All projects',
          href: '/projects'
        }
      ]
    }
  ];

  // Blog menu configuration - plain text only
  const blogSections: MenuSection[] = [
    {
      items: recentPosts.length > 0 ? recentPosts.map(post => ({
        label: post.title,
        href: `/blog/${post.slug}`,
        description: `${formatDate(post.publishedAt)} • ${post.readingTime} min read`
      })) : [
        {
          label: 'Building a Terminal Portfolio',
          href: '/blog/building-terminal-portfolio',
          description: 'Oct 1, 2025 • 8 min read'
        },
        {
          label: 'Sharpe Without Illusions',
          href: '/blog/sharpe-without-illusions',
          description: 'Sep 15, 2025 • 12 min read'
        }
      ]
    },
    {
      items: [
        {
          label: 'All posts',
          href: '/blog'
        }
      ]
    }
  ];

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Logo/Name */}
        <a 
          href="/" 
          className="font-medium text-ink hover:text-accent transition-apple flex items-center gap-2"
        >
          <User size={16} />
          Ronniel Gandhe
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {/* Projects Dropdown - Apple style */}
          <AppleMenu
            triggerLabel="Projects"
            sections={projectSections}
          />

          {/* Blog Dropdown - Apple style */}
          <AppleMenu
            triggerLabel="Blog"
            sections={blogSections}
          />

          {/* Single Links */}
          <a 
            href="/fitness" 
            className="flex items-center gap-1 px-3 py-2 text-sm text-ink-mute hover:text-ink transition-apple focus:outline-none focus:ring-1 focus:ring-white/20 rounded"
          >
            <Activity size={16} />
            Fitness
          </a>

          <a 
            href="/pictures" 
            className="flex items-center gap-1 px-3 py-2 text-sm text-ink-mute hover:text-ink transition-apple focus:outline-none focus:ring-1 focus:ring-white/20 rounded"
          >
            <Camera size={16} />
            Pictures
          </a>

          <a 
            href="/contact" 
            className="flex items-center gap-1 px-3 py-2 text-sm text-ink-mute hover:text-ink transition-apple focus:outline-none focus:ring-1 focus:ring-white/20 rounded"
          >
            <Mail size={16} />
            Contact
          </a>

          <a 
            href="/Ronniel_Gandhe_Resume.pdf" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 text-sm text-accent hover:bg-accent/10 transition-apple focus:outline-none focus:ring-1 focus:ring-accent/50 rounded"
          >
            <FileText size={16} />
            Résumé
          </a>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <AppleMenu
            triggerLabel="Menu"
            align="right"
            sections={[
              {
                items: [
                  { label: 'Projects', href: '/projects' },
                  { label: 'Blog', href: '/blog' }
                ]
              },
              {
                items: [
                  { label: 'Fitness', href: '/fitness' },
                  { label: 'Pictures', href: '/pictures' },
                  { label: 'Contact', href: '/contact' }
                ]
              },
              {
                items: [
                  { 
                    label: 'Résumé', 
                    href: '/Ronniel_Gandhe_Resume.pdf', 
                    external: true
                  }
                ]
              }
            ]}
            className="md:hidden"
          />
        </div>
      </div>
    </nav>
  );
}