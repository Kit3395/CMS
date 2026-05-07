# CASA MIRA React Design System

This package provides the foundational visual system for the CASA MIRA web app, including:

- Centralized theme tokens (`src/theme.js`)
- Global CSS variables and component surface styles (`src/design-system.css`)
- Reusable UI primitives (`src/components/DesignSystem.jsx`)
- A sample page demonstrating all components

## Contents

### 🎨 Theme Tokens (`src/theme.js`)
Defines the color palette, spacing scale, radii, shadows, and typography tokens used across the app.

### 🧩 Design System Components (`src/components/DesignSystem.jsx`)
Exports the following primitives:

- `Icon`
- `Button`
- `Card`
- `Badge`
- `Table`
- `Modal`
- `Alert`

All icons use outline‑only strokes via the `.ds-icon` class.

### 💅 Global Styles (`src/design-system.css`)
Includes:

- CSS variables for colors, spacing, radii, shadows
- Gradient backgrounds
- Soft 3D container shadows
- `.ds-icon` rules enforcing `fill: none` and `stroke-width: 1.8`

### 📄 Sample Page (`src/App.jsx`)
Renders a demo page showing all components in use.

## Running the App

```bash
npm install
npm run dev
