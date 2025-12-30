# ARGO Float Popup Component

A production-ready React component for displaying ARGO float data with a sophisticated two-section modal interface featuring header summary and expandable level details with virtualization.

## Features

- **Two-section layout**: Header with float image and metrics, expandable details with level data
- **Virtualized scrolling**: Efficiently handles up to 2000+ data rows
- **Responsive design**: Adapts to desktop, tablet, and mobile viewports
- **Accessibility compliant**: ARIA attributes, keyboard navigation, focus management
- **Blueprint overlay**: Fixed float image background in details section
- **Smooth animations**: Expand/collapse with smooth scrolling
- **No Tailwind dependency**: Uses plain CSS with CSS variables

## Files Structure

```
src/Components/FloatPopup/
├── FloatPopup.jsx              # Main popup component
├── FloatPopup.css              # Main styles with CSS variables
├── LevelList.jsx               # Virtualized list with react-window
├── LevelList.css               # List-specific styles
├── SimpleLevelList.jsx         # Alternative without react-window
└── utils/
    └── formatters.js           # Utility functions for data formatting
```

## Installation

### Option 1: With react-window (Recommended)

```bash
npm install react-window
```

Then use the standard `LevelList.jsx` component.

### Option 2: Without react-window

If you can't install `react-window`, use the `SimpleLevelList.jsx` component instead. Update the import in `FloatPopup.jsx`:

```javascript
// Replace this line:
import LevelList from './LevelList';

// With this:
import LevelList from './SimpleLevelList';
```

### Option 3: Standalone Version

Use `FloatPopupStandalone.jsx` - a complete single-file implementation with no external dependencies beyond React.

## Usage

### Basic Implementation

```jsx
import React, { useState } from 'react';
import FloatPopup from './Components/FloatPopup/FloatPopup';

const MyComponent = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const floatData = {
    platform_number: "1902671",
    cycle_number: 3,
    status: "active", // or "inactive"
    captured_at: "2025-08-24T00:30:00Z",
    location: { lat: -18.867, lon: 60.849 },
    image_url: "/images/argo-float.jpg",
    metrics: {
      temperature_c: 15.3,
      depth_m: 1370,
      salinity_psu: 32.67,
      pressure_dbar: 369
    },
    levels: [
      { depth_m: 0, temp_c: 25.1, sal: 35.0, psal: 35.0 },
      { depth_m: 1, temp_c: 24.8, sal: 34.9, psal: 34.9 },
      // ... up to 2000 levels
    ]
  };

  return (
    <div>
      <button onClick={() => setIsPopupOpen(true)}>
        View Float Details
      </button>
      
      <FloatPopup
        isOpen={isPopupOpen}
        data={floatData}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};
```

### Data Model

The component expects a `data` prop with the following structure:

```typescript
interface FloatData {
  platform_number: string;      // Float identifier
  cycle_number: number;          // Current cycle
  status: "active" | "inactive"; // Float status
  captured_at: string;           // ISO timestamp
  location: {
    lat: number;                 // Latitude
    lon: number;                 // Longitude
  };
  image_url: string;             // Float photo URL
  metrics: {
    temperature_c: number | null;  // Surface temperature
    depth_m: number | null;        // Max depth
    salinity_psu: number | null;   // Salinity
    pressure_dbar: number | null;  // Pressure
  };
  levels: Array<{
    depth_m: number;               // Depth in meters
    temp_c: number | null;         // Temperature at depth
    sal: number | null;            // Salinity at depth
    psal: number | null;           // Practical salinity at depth
  }>;
}
```

## Customization

### Color Scheme

Modify the CSS variables in `FloatPopup.css`:

```css
:root {
  --bg-0: #0f1217;          /* App background */
  --panel: #1a1f2a;         /* Modal surface */
  --accent: #4ea1ff;        /* Ocean blue accent */
  --muted: #7f8aa3;         /* Subdued text */
  --ok: #2fd15a;            /* Active status green */
  /* ... other variables */
}
```

### Blueprint Image

Replace the blueprint background by updating the CSS:

```css
.blueprint-image {
  background-image: url('/path/to/your/float-blueprint.jpg');
}
```

### Responsive Breakpoints

Adjust breakpoints in the CSS:

```css
/* Desktop ≥1280px */
@media (max-width: 1279px) and (min-width: 1024px) { /* Laptop */ }
@media (max-width: 1023px) { /* Tablet */ }
@media (max-width: 767px) { /* Mobile */ }
```

## Performance

- **Virtualization**: Only renders visible rows for optimal performance with large datasets
- **Efficient animations**: Uses `transform` and `opacity` for smooth 60fps animations
- **Reduced motion**: Respects `prefers-reduced-motion` user preference
- **Focus management**: Proper focus trapping and restoration

## Accessibility Features

- **ARIA compliance**: Proper `role="dialog"` and `aria-modal="true"`
- **Keyboard navigation**: ESC closes, TAB cycles focus, ENTER toggles details
- **Focus management**: Traps focus within modal, restores on close
- **Screen reader support**: Semantic markup and live regions
- **High contrast**: Color variables support theme customization

## Browser Support

- **Modern browsers**: Chrome 88+, Firefox 84+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Mobile 88+
- **Features used**: CSS Grid, Flexbox, CSS Variables, Intersection Observer

## Demo

To see the component in action, import and use the demo component:

```jsx
import FloatPopupDemo from './Components/FloatPopupDemo';

// Or for standalone version:
import StandaloneDemo from './Components/FloatPopupStandalone';
```

## Notes

- Ensure float images are available in your public folder
- For production, consider lazy loading images
- The component handles null/undefined data gracefully
- Large datasets (>1000 levels) benefit from virtualization
- Consider implementing error boundaries for robust error handling
