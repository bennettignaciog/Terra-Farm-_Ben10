# Implementation Plan: Comprehensive Firebase Firestore & Auth Integration

Integrate and thoroughly verify Firebase Cloud Firestore and Firebase Authentication into TerraFarm Agro-Ecological Simulator, enabling every player to register, log in, auto-save simulation progress, manage cloud snapshots across devices, and compete on the global watershed standings.

---

## 1. Architecture & Data Model

### A. Firestore Collections & Document Schemas
The database uses the provisioned database `ai-studio-terrafarmagroeco-9cd7e915-5621-4706-ac8e-bad0d6281cd8` under project `studious-insight-qjq9c`.

1. **`users/{userId}` (Private User Profiles)**
   - `id`: string (Firebase Auth UID)
   - `displayName`: string (Farmer display name, max 50 chars)
   - `email`: string | null (Optional email for registered accounts)
   - `totalEcoPoints`: number (Cumulative player score)
   - `farmCount`: number (Number of created saves)
   - `updatedAt`: ISO timestamp string
   - `createdAt`: ISO timestamp string

2. **`users/{userId}/farmSaves/{saveId}` (User's Private Farm Snapshots - Full CRUD)**
   - `id`: string (Unique save identifier, e.g. `save_<timestamp>_<hash>`)
   - `userId`: string (Auth UID matching document owner)
   - `farmName`: string (Custom farm title, e.g. "Verdant Oasis Sanctuary")
   - `climateZone`: string (`arid`, `temperate`, `tropical`, `boreal`)
   - `day`: number (Day of season 1–90)
   - `season`: number (0: Spring, 1: Summer, 2: Autumn, 3: Winter)
   - `year`: number (Simulation year)
   - `cash`: number (Cash balance)
   - `ecoPoints`: number (Farm score)
   - `biodiversityScore`: number (0–100 calculated index)
   - `soilHealthAverage`: number (0–100 calculated SOM & compaction metric)
   - `farmDataJson`: string (Complete serialized `FarmState` object including all 36 tiles, upgrades, crops, water table depth)
   - `createdAt`: ISO timestamp string
   - `updatedAt`: ISO timestamp string

3. **`leaderboard/{entryId}` (Global Watershed Standings - Read & Publish)**
   - `id`: string (`entry_<userId>_<year>_<season>`)
   - `userId`: string (Author UID)
   - `farmerName`: string (Player display name)
   - `farmName`: string (Farm title)
   - `ecoPoints`: number (Published score)
   - `biodiversityScore`: number
   - `soilHealthAverage`: number
   - `year`: number
   - `seasonName`: string
   - `climateZone`: string
   - `updatedAt`: ISO timestamp string

4. **`communityNotes/{noteId}` (Agroecological Field Notes - Read, Create & Upvote)**
   - `id`: string
   - `userId`: string
   - `authorName`: string
   - `category`: string
   - `title`: string
   - `content`: string
   - `likes`: number
   - `createdAt`: ISO timestamp string

---

## 2. Authentication Flow

Support all three requested sign-in options seamlessly:
1. **Google Sign-In**: Standard 1-click Google popup authentication with profile sync.
2. **Email & Password**: Registration (with display name and password validation) and Login.
3. **1-Click Guest Access**: Instant anonymous sign-in so any visitor can play and save immediately without entering credentials.
4. **Guest Account Linking**: Allows guest players to link an email and password to upgrade their session to a permanent account without losing their saves or points.
5. **Sign Out**: Clean session termination and state reset.

---

## 3. CRUD Operations

| Operation | Action & Service | Trigger in UI |
| :--- | :--- | :--- |
| **Create** | `saveFarmToCloud` | Header "Save" button, Auto-save at Day 90, "Create Snapshot" in modal |
| **Read** | `fetchUserFarmSaves`, `loadFarmFromCloud` | "Manage Saves" tab, "Restore Farm" button |
| **Update** | `saveFarmToCloud` (with existing save ID) | Overwrite / update existing snapshot with current state |
| **Delete** | `deleteFarmFromCloud` | Trash icon on save card in Cloud Database Modal |
| **Publish** | `publishToLeaderboard` | "Publish Standing to Watershed" button |

---

## 4. UI & Visual Integration

1. **Top Bar Profile & Quick Save**:
   - Logged-in state shows farmer avatar, name, and live cloud status.
   - Unauthenticated state shows prominent "Sign In" button.
   - Dedicated "Save" button with visual feedback ("Saving...", "Saved at [time]").
2. **Auth Modal (`AuthModal.tsx`)**:
   - Tabbed view for Sign In, Create Account, and Instant Guest Play.
   - Profile overview with upgrade options and auto-save toggles when logged in.
3. **Cloud Database Modal (`CloudDatabaseModal.tsx`)**:
   - Multi-device snapshot management: displays save date, season/year, cash, soil health, biodiversity, with one-click restore and delete.
   - Live Firestore connection status indicator.
4. **Auto-Save**:
   - Listens to Day 90 season boundary in `App.tsx` and automatically persists progress when enabled.

---

## 5. Security Rules & Deployment

Deploy and verify strict Firestore Security Rules in `firestore.rules`:
- User profile documents (`/users/{userId}`) can only be written by the authenticated owner.
- Farm saves (`/users/{userId}/farmSaves/{saveId}`) are strictly isolated to the owning user (`request.auth.uid == userId`).
- Leaderboard entries can be read by anyone, but created/updated only by the authenticated owner matching their UID.
- Full validation for field types, maximum string lengths, and numeric boundaries to prevent malicious writes.

---

## 6. Verification Steps

1. Run `DeployRules` RPC to ensure the latest rules are deployed to Firestore.
2. Verify build compilation via `compile_applet` and type safety via `lint_applet`.
3. Verify live read/write capability to Firestore.
4. Test all authentication paths (Google, Email/Password, Guest) and session persistence.
5. Verify snapshot CRUD (Create snapshot, Read list, Restore state into canvas, Delete snapshot).
