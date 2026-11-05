# TerraFarm Agroecological Simulator 🌱

A production-grade, interactive agroecological and regenerative farming simulation game featuring subterranean root/mycorrhizal fungi X-ray modeling, real-time groundwater hydrology, dynamic microclimates, and persistent Cloud Firestore progression.

## 🚀 Quick Start in VS Code

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **Package Manager**: `npm` (bundled with Node.js) or `bun` / `pnpm`
- **VS Code** with optional recommended extensions:
  - *Tailwind CSS IntelliSense*
  - *ESLint*
  - *TypeScript and JavaScript Language Features*

---

### Step 1: Open in VS Code
1. Extract `terrafarm-project.zip` into your chosen folder (e.g. `~/terrafarm`).
2. Open VS Code and select **File > Open Folder...** and pick the `terrafarm` directory.

---

### Step 2: Install Dependencies
Open the integrated terminal in VS Code (`Ctrl + ~` or `Cmd + ~`) and run:

```bash
npm install
```

---

### Step 3: Run the Development Server
Start the local Vite development server:

```bash
npm run dev
```

Once started, open your browser and navigate to:
👉 **`http://localhost:3000`** (or the port displayed in your terminal).

---

### Step 4: Available Scripts
- `npm run dev`: Starts local development server with instant HMR.
- `npm run build`: Compiles optimized production bundle into `dist/`.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs TypeScript validation checks (`tsc --noEmit`).

---

### 📁 Project Architecture

- **`src/`**
  - **`canvas/`**: Interactive canvas viewport (`FarmCanvas.tsx`) & dynamic weather particle system (`WeatherOverlaySystem.ts`).
  - **`simulation/`**: Pure agronomic calculation engine (`engine.ts`), hydrology/aquifer math, biodiversity algorithms (`ecologicalImpact.ts`), and gamification badges (`gamification.ts`).
  - **`components/`**: Modular HUD dashboards (`Dashboard.tsx`, `ActionBar.tsx`, `WaterTableCrossSection.tsx`, `AuthModal.tsx`, `CloudDatabaseModal.tsx`, `LeaderboardAndBadgesModal.tsx`, etc.).
  - **`state/`**: Zustand central game store (`gameStore.ts`) managing tick loops, audio, and state machines.
  - **`config/`**: Crops, climate regimes, agroecological quizzes, translations, and scenic backdrops.
  - **`services/`**: Firebase Firestore database synchronization (`firebase.ts`) and Google Workspace APIs (`gmail.ts`).
  - **`audio/`**: Synthesized Web Audio API sound effects (`sound.ts`).
