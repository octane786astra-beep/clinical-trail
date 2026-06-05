# Clinical Trial Optimizer (CTO) Enterprise

A cutting-edge, AI-powered platform for optimizing clinical trial protocols, cohort selection, and operational feasibility.

## 🚀 Recent Enterprise Redesign Features
The platform recently underwent a massive architectural and aesthetic overhaul to an Enterprise Light Theme, tailored for medical professionals and institutional review boards.

### 1. Seamless Netflix-Style Scroll Layout
- **Continuous Flow:** The Landing Page is no longer an isolated view. It acts as a full-screen Hero section that naturally scrolls directly into the core Dashboard workspace.
- **Sticky Navigation:** As you scroll deep into the application views, the Sidebar and Header gracefully stick to the boundaries of the viewport.
- **Back-to-Top Navigation:** Clicking the CTO Enterprise logo in the Sidebar immediately auto-scrolls the application back to the top-level Hero introduction.

### 2. Framer-Motion Animations
- **Dashboard Staggering:** The main dashboard KPI cards and analytics charts now render using subtle, spring-based staggered micro-animations provided by `framer-motion`.

### 3. Light Theme Aesthetics
The entire dark "cyberpunk" theme was replaced with a pristine White, Slate, and Emerald green color palette:
- **EditorView:** Features a crisp, clean code compiler area utilizing white backgrounds with sharp slate borders and precise terminal logs.
- **OptimizeView:** The complex multi-agent optimization solver was brought into the light theme, with an enterprise-grade topography mapping aesthetic.
- **ReportsView:** Data-tables are rendered cleanly with highly legible text, status badges, and precise dividing lines.
- **DnaBackground:** The 3D Three.js canvas in the background was updated with glass-morphic lighting materials and bright blue strands to compliment the platform.

## 🛠️ Tech Stack
- **Frontend Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion + GSAP (ScrollTrigger)
- **3D Graphics:** Three.js + React Three Fiber
- **Charting:** Recharts
- **Icons:** Lucide React

## 📦 Getting Started

To run the platform locally on your machine:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open `http://localhost:3000` to view the application in your browser.
