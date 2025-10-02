import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Camera, Calendar } from 'lucide-react';

interface Photo {
  src: string;
  alt: string;
  createdAt?: string;
  caption?: string;
}

interface Props {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const lightboxSlides = photos.map((photo) => ({
    src: photo.src,
    alt: photo.alt,
    caption: photo.caption || photo.alt,
  }));

  return (
    <>
      {/* Gallery Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {photos.map((photo, index) => (
          <div 
            key={index}
            className="break-inside-avoid bg-bg-soft border border-border rounded-xl overflow-hidden group cursor-pointer hover:border-accent/30 transition-apple"
            onClick={() => openLightbox(index)}
          >
            {/* Image */}
            <div className="relative overflow-hidden">
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-auto object-cover group-hover:scale-105 transition-apple duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-apple flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-apple" />
              </div>
            </div>
            
            {/* Caption */}
            {(photo.caption || photo.createdAt) && (
              <div className="p-4">
                {photo.caption && (
                  <p className="text-ink text-sm font-medium mb-2 leading-relaxed">
                    {photo.caption}
                  </p>
                )}
                {photo.createdAt && (
                  <div className="flex items-center gap-2 text-ink-mute text-xs">
                    <Calendar className="w-3 h-3" />
                    <time>
                      {new Date(photo.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={currentIndex}
        styles={{
          container: { backgroundColor: 'rgba(11, 18, 32, 0.95)' },
          button: { color: '#e6e9ef' },
          navigationPrev: { color: '#e6e9ef' },
          navigationNext: { color: '#e6e9ef' },
        }}
      />

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="text-center py-24">
          <Camera className="w-12 h-12 text-ink-mute mx-auto mb-4" />
          <p className="text-ink-mute">No photos yet. Check back soon!</p>
        </div>
      )}
    </>
  );
}