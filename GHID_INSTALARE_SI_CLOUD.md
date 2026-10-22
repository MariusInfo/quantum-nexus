# ⚛️ QUANTUM NEXUS — Ghid Multi-Platformă (MacBook, PC, Android, iOS), Google Firebase Cloud Save & Leaderboard (0 RON)

Totul este acum configurat pe **Google Firebase** (Planul gratuit **Spark** — 0 RON, fără card bancar).

---

## 1. 🔥 Activare Cloud Save + Leaderboard în Google Firebase (în 2 minute)

Jocul are integrat direct în [index.html](file:///c:/Users/mariu/Desktop/Game/index.html#L3145-L3825) motorul **Google Firebase Authentication + Realtime Database** (pentru Cloud Save privat și Clasamentul Global pe 7 categorii, exclusiv pentru cei cu cont conectat).

### Pasul 1: Creează proiectul în Google Firebase (30 secunde)
1. Intră pe **[console.firebase.google.com](https://console.firebase.google.com/)** (conectat cu contul tău Google).
2. Apasă **Create a project** (sau **Add project**), pune numele `Quantum Nexus`, poți debifa Google Analytics (ca să se creeze instant) și apasă **Create project**.

### Pasul 2: Activează Login-ul cu Email & Parolă (20 secunde)
1. În meniul din stânga, apasă pe **Build ➔ Authentication** și apasă **Get started**.
2. La tab-ul **Sign-in method**, apasă pe **Email/Password**, bifează **Enable** (prima bifă) și apasă **Save**.

### Pasul 3: Activează Baza de Date (Realtime Database) și Regulile (30 secunde)
1. În meniul din stânga, apasă pe **Build ➔ Realtime Database** și apasă **Create Database**.
2. Alege locația (ex: *Belgium `europe-west1`* sau *United States*) -> **Next** -> **Start in locked mode** -> **Enable**.
3. După ce se deschide baza de date, apasă sus pe tab-ul **Rules**, șterge ce e acolo, lipește regulile de mai jos și apasă **Publish**:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "leaderboard": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```
*(Aceste reguli garantează că salvarea fiecărui jucător este 100% privată, iar Clasamentul Global poate fi văzut și actualizat DOAR de jucătorii care au cont conectat!).*

### Pasul 4: Ia cele 2 chei (API Key & Database URL)
1. În **Realtime Database** (tab-ul **Data**), copiază link-ul bazei tale de date (arată ca `https://quantum-nexus-default-rtdb.europe-west1.firebasedatabase.app`).
2. Apasă pe **rotița ⚙️ (Project Overview -> Project settings)** din stânga-sus:
   - Jos la **Your apps**, apasă pe iconița Web **`</>`**, pune numele `Quantum Nexus Web` și apasă **Register app**.
   - Îți va apărea blocul `const firebaseConfig = { apiKey: "AIzaSy...", databaseURL: "https://..." }`.
3. Poți fie:
   - Să lipești direct tot blocul `firebaseConfig` în joc (în fereastra **☁️ Cloud Save ➔ ⚙️ Configurare Google Firebase** — jocul extrage singur cheile!), fie
   - Să îmi trimiți mie aici `apiKey` și `databaseURL` (sau să le pui la [liniile 3157-3158](file:///c:/Users/mariu/Desktop/Game/index.html#L3157-L3158) în `DEFAULT_FIREBASE_API_KEY` și `DEFAULT_FIREBASE_DB_URL`), ca toți jucătorii tăi să fie conectați automat la serverul tău Google Firebase!

---

## 2. 💻 Cum obții jocul pentru MacBook (macOS), Windows PC, Android și iPhone (0 RON)

1. **Publicare pe GitHub Pages (Gratuit):**
   - Creează un repository pe **[GitHub.com](https://github.com/)** și urcă toate fișierele din folder.
   - Din **Settings -> Pages**, activează branch-ul `main`.
2. **Pentru Apple MacBook (`.dmg` / `.app` sau Dock App):**
   - **Instalator nativ `.dmg`:** Intră pe GitHub în tab-ul **Actions** -> descarcă **`Quantum-Nexus-MacBook-DMG`** (compilat automat de [.github/workflows/build-desktop.yml](file:///c:/Users/mariu/Desktop/Game/.github/workflows/build-desktop.yml) pentru Apple Silicon M1/M2/M3/M4 și Intel).
   - **Direct din Safari pe MacBook:** File ➔ **Add to Dock...**
3. **Pentru Windows PC (`.exe`):**
   - Descarcă **`Quantum-Nexus-Windows-EXE`** din tab-ul **Actions** de pe GitHub.
4. **Pentru Android (`.apk`) și iPhone (iOS):**
   - **Android:** Introdu link-ul pe **[PWABuilder.com](https://www.pwabuilder.com/)** pentru a descărca `.apk`-ul gratuit (sau apasă **📲 Instalează** în Chrome).
   - **iPhone / iPad:** Deschide în Safari -> **Share (⬆️) -> Add to Home Screen**.

---

## 3. 🚀 Cum lansezi un Update ca să îl primească automat toți jucătorii

Când vrei să lansezi o versiune nouă (ex: `v2.6.0`):
1. Modifici jocul în [index.html](file:///c:/Users/mariu/Desktop/Game/index.html) și schimbi la [liniile 3149-3150](file:///c:/Users/mariu/Desktop/Game/index.html#L3149-L3150):
   ```js
   const APP_VERSION = '2.6.0';
   const APP_BUILD = 260;
   ```
2. Actualizezi [version.json](file:///c:/Users/mariu/Desktop/Game/version.json) cu `"version": "2.6.0"` și `"build": 260`.
3. Toți jucătorii care au netul pornit vor primi automat fereastra de Update (jocul le salvează mai întâi progresul în Google Firebase și apoi se reîncarcă la noua versiune!).
