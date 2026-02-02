# SnapCal Production Roadmap (iOS)

This roadmap outlines the steps to take SnapCal from development to a production-ready, privacy-focused iOS application.

## 1. Secure AI Infrastructure (Critical)
Currently, the app uses an API Key embedded in the code. This is **unsafe** for production.
- [x] **Create Backend Proxy:** Set up a simple Edge Function (Supabase/Firebase/Cloudflare).
    - [x] Endpoint: `POST /analyze-food`
    - [x] Inputs: Image (Base64), User ID (Anonymous).
    - [x] Logic: Authenticate request, check scan limits, call Google Gemini, return JSON.
    - [x] **Privacy:** Do not log the image. Strip PII from logs.
- [x] **Migrate App:** Update `FoodAnalysisService.ts` to call your backend URL instead of Google directly.

## 2. Cost Management & Usage Limits
To prevent unlimited Gemini API usage:
- [x] **Implement Daily Scan Limit:**
    - [x] Add `scansToday` and `lastScanDate` tracking in `AsyncStorage`.
    - [x] Limit Free users to **5 scans/day**.
    - [x] Show "Limit Reached" UI with countdown to refresh.
- [x] **Anonymous User ID:** Generate a random UUID on first install to track usage quota on the backend (prevents simple uninstall/reinstall abuse).

## 3. Privacy Assurance (The Edge)
SnapCal's selling point is privacy.
- [ ] **Local Storage Verification:** `MealContext` already uses `AsyncStorage`. Confirm no data is sent to cloud unless analyzing.
- [ ] **Ephemeral Analysis:** Explicitly state in Privacy Policy that images sent for analysis are processed in-memory and typically deleted immediately by the provider (Gemini Data Privacy).
- [ ] **Offline Mode:** Ensure the app works perfectly (viewing history, stats) without internet.

## 4. UI/UX Polish & Assets
- [ ] **App Icon:** Generate a premium App Icon (1024x1024).
- [ ] **Splash Screen:** Create a branded splash screen matching the theme.
- [ ] **Error States:** Add friendly error screens for "No Internet", "API Error", "Limit Reached".
- [x] **Haptic Feedback:** Add subtle vibrations on successful scan/log.

## 5. App Store Compliance
- [x] **Health Disclaimer:** Add a distinct disclaimer screen or modal: "Not a medical device. Consult a doctor..." (Apple Requirement).
- [ ] **Info.plist Strings:** Ensure `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` are clear and polite.
- [ ] **Privacy Policy URL:** Create a simple hosted page (Notion/GitHub Pages) for the App Store link.

## 6. Deployment Pipeline
- [ ] **EAS Build:** Configure `eas.json` for production builds.
- [ ] **Apple Developer Account:** Ensure active membership.
- [ ] **TestFlight:** Submit a build for external beta testing.

## Next Immediate Steps (Recommended)
1. **Implement Client-Side Daily Limits** (Stops the bleeding immediately).
2. **Generate App Assets** (Visual polish).
3. **Plan the Backend Proxy** (Long-term fix).
