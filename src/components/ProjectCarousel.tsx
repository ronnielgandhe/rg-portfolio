import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import ProjectCard from './ProjectCard';

interface Project {
  title: string;
  slug: string;
  year: number;
  tech: string[];
  summary: string;
  status: string;
  repoUrl?: string;
}

interface ProjectCarouselProps {
  projects: Project[];
}

export default function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!autoRotate || projects.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex(([prev]) => [(prev + 1) % projects.length, 1]);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate, projects.length]);

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setAutoRotate(false);
    const threshold = 50;
    
    if (info.offset.x > threshold) {
      // Dragged right, go to previous
      setActiveIndex(([prev]) => [
        prev === 0 ? projects.length - 1 : prev - 1,
        -1
      ]);
    } else if (info.offset.x < -threshold) {
      // Dragged left, go to next
      setActiveIndex(([prev]) => [
        (prev + 1) % projects.length,
        1
      ]);
    }
  };

  const goToIndex = (index: number) => {
    setAutoRotate(false);
    const newDirection = index > activeIndex ? 1 : -1;
    setActiveIndex([index, newDirection]);
  };

  const visibleProjects = projects.length <= 3 ? projects : [
    projects[(activeIndex - 1 + projects.length) % projects.length],
    projects[activeIndex],
    projects[(activeIndex + 1) % projects.length]
  ];

  return (
    <div className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center">
      {/* Carousel Container */}
      <div className="relative w-full max-w-7xl mx-auto flex items-center justify-center px-4">
        <div className="relative w-full flex items-center justify-center" style={{ perspective: '2000px' }}>
          {visibleProjects.map((project, idx) => {
            const isCenter = projects.length <= 3 
              ? idx === activeIndex 
              : idx === 1;
            
            const actualIndex = projects.findIndex(p => p.slug === project.slug);
            const position = projects.length <= 3 
              ? idx - activeIndex 
              : idx - 1;

            return (
              <motion.div
                key={project.slug}
                className="absolute w-full max-w-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  x: `${position * 100}%`,
                  scale: isCenter ? 1.05 : 0.85,
                  opacity: isCenter ? 1 : 0.4,
                  zIndex: isCenter ? 20 : 10,
                  rotateY: position * 10,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                drag={isCenter ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={isCenter ? handleDragEnd : undefined}
                onClick={() => !isCenter && goToIndex(actualIndex)}
                style={{
                  cursor: isCenter ? 'grab' : 'pointer',
                  transformStyle: 'preserve-3d',
                }}
                whileTap={isCenter ? { cursor: 'grabbing', scale: 1.02 } : undefined}
              >
                <ProjectCard project={project} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {projects.map((project, idx) => (
          <button
            key={project.slug}
            onClick={() => goToIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === activeIndex
                ? 'bg-green-400 w-8'
                : 'bg-gray-500 hover:bg-gray-400'
            }`}
            aria-label={`Go to ${project.title}`}
          />
        ))}
      </div>

      {/* Arrow Navigation - Desktop Only */}
      <button
        onClick={() => goToIndex((activeIndex - 1 + projects.length) % projects.length)}
        className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 z-30 glass p-4 rounded-full hover:bg-white/10 transition-all"
        aria-label="Previous project"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goToIndex((activeIndex + 1) % projects.length)}
        className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 z-30 glass p-4 rounded-full hover:bg-white/10 transition-all"
        aria-label="Next project"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Auto-rotate indicator */}
      {autoRotate && (
        <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-full flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-300 font-mono">auto-rotate</span>
        </div>
      )}
    </div>
  );
}
