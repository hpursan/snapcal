# App Store Submission Checklist

## ✅ Completed

### Branding & Assets
- [x] **App name:** Aperioesca
- [x] **Logo:** Crossed-out kcal (anti-calorie-tracker symbol)
- [x] **Bundle ID:** com.hpursan.aperioesca
- [x] **App.json updated:** All branding finalized

### Backend
- [x] **AI Proxy:** Deployed to Supabase
- [x] **Rate limiting:** 10/day per user
- [x] **Database:** analysis_requests table created

### Documentation
- [x] **Privacy Policy:** Created (needs hosting)
- [x] **App Store Description:** Written
- [x] **Keywords:** Defined
- [x] **Tagline:** "The Anti Calorie Tracker"

---

## 📋 Required Before Submission

### 1. Privacy Policy URL (CRITICAL)
**Status:** ⚠️ Created, needs hosting

**Options:**
- **GitHub Pages** (Free, easy)
  - Create repo: aperioesca-privacy
  - Upload PRIVACY_POLICY.md
  - Enable GitHub Pages
  - URL: https://[username].github.io/aperioesca-privacy

- **Notion** (Quick)
  - Create public page
  - Paste privacy policy
  - Share link

- **Your own domain** (Professional)
  - aperioesca.com/privacy

**Action:** Host privacy policy and get URL

---

### 2. App Store Screenshots (REQUIRED)
**Need:** 3-5 screenshots for iPhone

**Required sizes:**
- 6.7" (iPhone 15 Pro Max): 1290 x 2796
- 6.5" (iPhone 14 Plus): 1284 x 2778

**Recommended screenshots:**
1. **Camera/Capture** - Taking photo of meal
2. **Analysis Result** - Energy band with confidence
3. **Dashboard** - Weekly insights with trends
4. **History** - Meal history list
5. **Dark Mode** (optional) - Show theme toggle

**How to create:**
- Test on iPhone after TestFlight build
- Take screenshots in app
- Use Xcode simulator for exact sizes
- Or use design tool (Figma) with mockups

---

### 3. App Store Connect Setup

**Metadata to fill:**

**App Information:**
- Name: `Aperioesca`
- Subtitle: `The Anti Calorie Tracker`
- Category: Health & Fitness
- Secondary Category: Food & Drink

**Description:**
```
Aperioesca helps you understand your eating patterns without the guilt of calorie counting.

INSIGHTS, NOT TOTALS
Instead of obsessing over exact numbers, Aperioesca shows you:
• Energy bands (light, moderate, heavy meals)
• Meal patterns over time
• Confidence levels for each analysis
• Personalized insights relative to YOUR baseline

PRIVACY-FIRST
• All data stays on your device
• No accounts, no login required
• Photos never leave your phone
• Anonymous usage tracking for AI billing only

HOW IT WORKS
1. Snap a photo of your meal
2. Get instant energy band analysis
3. View insights and patterns over time
4. Use it for a week, a month, or whenever you need

BUILT ON TRUST
• Shows confidence levels (high/medium/low)
• Transparent about uncertainty
• No punishment, no streaks, no guilt
• Relative insights: "heavier than your typical lunch"

AI-POWERED ANALYSIS
Uses advanced AI to analyze meal energy density, with clear confidence indicators and reasoning.

Your data, your device, your insights. No judgment, just awareness.
```

**Keywords:**
```
meal,food,insights,awareness,photo,energy,pattern,health,wellness,nutrition,mindful,eating
```

**Support URL:** (Your email or website)
**Marketing URL:** (Optional)
**Privacy Policy URL:** (From step 1)

---

### 4. App Privacy Details (Required)

**Data Types Collected:**
- ✅ Photos (for meal analysis)
- ✅ User ID (anonymous install ID)
- ✅ Product Interaction (usage data)

**Data Usage:**
- ✅ App Functionality
- ❌ Analytics (we don't do user analytics)
- ❌ Advertising (no ads)

**Data Linked to User:**
- ❌ No (anonymous ID only)

**Data Used to Track User:**
- ❌ No

**Third-Party Partners:**
- Supabase (backend)
- Google Gemini AI (meal analysis)

---

### 5. Age Rating
**Answer questionnaire:**
- Unrestricted Web Access: No
- Gambling: No
- Contests: No
- Mature/Suggestive Themes: None
- Violence: None
- Medical/Treatment Info: None

**Result:** 4+

---

### 6. Pricing & Availability
- **Price:** Free
- **Availability:** All countries
- **Future:** In-app purchases (optional, later)

---

### 7. App Review Information
**Contact Information:**
- First Name: Himaschal
- Last Name: Pursan
- Phone: [Your phone]
- Email: aperioesca@gmail.com

**Demo Account:**
- Not needed (no login required)

**Notes for Reviewer:**
```
Aperioesca is a privacy-first meal awareness app that uses AI to analyze food photos.

Key features to test:
1. Camera permission - Take photo of any meal
2. AI Analysis - Shows energy band (light/moderate/heavy) with confidence level
3. Rate limiting - After 10 photos, shows "daily limit reached"
4. Dark mode - Toggle in Profile screen
5. Meal history - View past meals

No login required. All data stored locally on device.
```

---

### 8. Export Compliance
- **Uses Encryption:** Yes (standard HTTPS only)
- **Exempt:** Yes (standard encryption)
- **CCATS:** Not required

---

## 🚀 Submission Steps

1. **Wait for TestFlight build** (~15 min remaining)
2. **Install and test** on iPhone
3. **Take screenshots** (5 screenshots)
4. **Host privacy policy** (GitHub Pages recommended)
5. **Log in to App Store Connect**
6. **Fill all metadata** (copy from above)
7. **Upload screenshots**
8. **Select build** (Build #2)
9. **Submit for review**

---

## ⏱️ Timeline

- **Today:** Build completes, test on device
- **Tomorrow:** Screenshots, privacy policy hosting
- **Day 3:** App Store Connect setup, submit
- **Day 4-6:** Apple review (1-3 days)
- **Day 7:** LIVE! 🎉

---

## 📞 Quick Links

- **App Store Connect:** https://appstoreconnect.apple.com
- **Privacy Policy Template:** docs/PRIVACY_POLICY.md
- **Branding Guide:** [aperioesca_branding.md]
- **Build Status:** https://expo.dev/accounts/hpursan/projects/snapcal/builds/b4cfc83f-2e2d-4ddf-a905-1f880e829a7b
