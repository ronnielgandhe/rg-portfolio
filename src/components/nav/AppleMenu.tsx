import { useState, useRef, useEffect } from 'react';

export interface MenuSection {
  items: MenuItem[];
}

export interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  description?: string;
  disabled?: boolean;
  isDivider?: boolean;
}

interface AppleMenuProps {
  triggerLabel: string;
  sections: MenuSection[];
  align?: 'left' | 'right';
  className?: string;
}

export default function AppleMenu({ 
  triggerLabel, 
  sections, 
  align = 'left',
  className = ''
}: AppleMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  // Flatten all menu items for keyboard navigation (excluding dividers)
  const allItems = sections.flatMap(section => 
    section.items.filter(item => !item.isDivider && !item.disabled)
  );

  const openMenu = () => {
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openMenu();
        if (allItems.length > 0) {
          setFocusedIndex(0);
        }
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev + 1 >= allItems.length ? 0 : prev + 1;
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev <= 0 ? allItems.length - 1 : prev - 1;
          return next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
          itemRefs.current[focusedIndex]?.click();
        }
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset item refs when sections change
  useEffect(() => {
    itemRefs.current = new Array(allItems.length).fill(null);
  }, [allItems.length]);

  // Render menu items
  const renderMenuItems = () => {
    let itemIndex = 0;

    return sections.map((section, sectionIndex) => (
      <div key={sectionIndex}>
        {section.items.map((item, itemIndexInSection) => {
          if (item.isDivider) {
            return <div key={`divider-${itemIndexInSection}`} className="menu-divider" />;
          }

          const isFocused = focusedIndex === itemIndex;
          const currentItemIndex = itemIndex;
          
          if (!item.disabled) {
            itemIndex++;
          }

          const ItemWrapper = item.href ? 'a' : 'button';
          const itemProps = item.href 
            ? {
                href: item.href,
                ...(item.external && {
                  target: '_blank',
                  rel: 'noopener noreferrer'
                })
              }
            : { onClick: item.onClick, type: 'button' as const };

          return (
            <ItemWrapper
              key={itemIndexInSection}
              ref={(el: HTMLAnchorElement | HTMLButtonElement | null) => {
                if (!item.disabled) {
                  itemRefs.current[currentItemIndex] = el;
                }
              }}
              className={`menu-item ${item.disabled ? 'disabled' : ''}`}
              role="menuitem"
              tabIndex={isFocused ? 0 : -1}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick?.();
                  if (item.href) closeMenu();
                }
              }}
              {...itemProps}
            >
              <div className="font-medium">{item.label}</div>
              {item.description && (
                <div className="menu-item-description">
                  {item.description}
                </div>
              )}
            </ItemWrapper>
          );
        })}
        {sectionIndex < sections.length - 1 && (
          <div className="menu-divider" />
        )}
      </div>
    ));
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => isOpen ? closeMenu() : openMenu()}
        onKeyDown={handleKeyDown}
        className={`flex items-center gap-1 px-3 py-2 text-sm text-ink-mute hover:text-ink transition-apple focus:outline-none focus:ring-1 focus:ring-white/20 rounded ${className}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'apple-menu' : undefined}
      >
        {triggerLabel}
        <svg 
          width="8" 
          height="5" 
          viewBox="0 0 8 5" 
          className={`fill-current transition-apple ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M0 0l4 4 4-4H0z"/>
        </svg>
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <div
          ref={menuRef}
          id="apple-menu"
          role="menu"
          className={`absolute top-full mt-1 min-w-[200px] glass-menu z-50 ${
            align === 'right' ? 'right-0' : 'left-0'
          } menu-enter-active`}
          onKeyDown={handleKeyDown}
        >
          {renderMenuItems()}
        </div>
      )}
    </div>
  );
}