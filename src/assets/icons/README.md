# Icons Directory

This directory contains placeholder SVG icons for the Dock. You can replace these with proper SF Symbols or Apple-style icons.

## Current Icons:

- `folder.svg` - Used for Projects dock icon (Finder-style folder)
- `photos.svg` - Used for Pictures dock icon (Photos app-style)

## How to Replace with SF Symbols:

1. **Download SF Symbols** from Apple Developer portal
2. **Export as SVG** at 48x48px resolution
3. **Replace files** in this directory:
   - Projects: Use `folder` or `archivebox` SF Symbol
   - Pictures: Use `photo.on.rectangle` or `camera.fill` SF Symbol

## Recommended SF Symbols:

### Projects (Finder-like):
- `folder` - Standard folder icon
- `archivebox` - Archive/project box
- `square.grid.3x3` - Grid layout (portfolio view)

### Pictures (Photos-like):
- `photo.on.rectangle` - Photo on rectangle
- `camera.fill` - Filled camera icon
- `photo.stack` - Stack of photos

## Color Schemes:

### Projects Icon:
- Background: `bg-gradient-to-t from-blue-600 to-blue-400`
- Icon: `text-white`

### Pictures Icon:
- Background: `bg-gradient-to-t from-purple-600 to-pink-400`
- Icon: `text-white`

## Usage in Components:

Icons are imported as React components in:
- `DesktopDock.tsx` - Desktop dock with hover effects
- `MobileDock.tsx` - Mobile dock layout

To use custom SVG icons instead of React Icons, import like:
```tsx
import ProjectsIcon from '../../assets/icons/folder.svg';
import PicturesIcon from '../../assets/icons/photos.svg';
```