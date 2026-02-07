# Production Readiness Checklist

## ✅ Completed

### Backend Infrastructure
- [x] **Supabase Edge Function deployed** - Two-tier AI proxy active
- [x] **Database schema created** - `analysis_requests` table with RLS
- [x] **API key secured** - Stored in Supabase secrets
- [x] **Rate limiting enabled** - 10 analyses/day per user
- [x] **Client proxy enabled** - `USE_PROXY = true`

### App Features
- [x] **Dark mode** - Theme toggle in Profile screen
- [x] **Dashboard UI** - Glassmorphism with multi-line energy trend
- [x] **Camera integration** - Photo capture and analysis
- [x] **Meal history** - View past meals with details
- [x] **Error handling** - User-friendly messages for rate limits and non-food

---

## 🔄 In Progress

### iOS Build
- [ ] **TestFlight build** - Currently queued (Build #2)
- [ ] **Device testing** - Test on physical iPhone
- [ ] **Production validation** - Verify AI proxy works end-to-end

---

## 📋 Before App Store Submission

### 1. App Store Connect Setup
- [ ] **App metadata**
  - [ ] App name (currently "snapcal (231ec0)" - needs update)
  - [ ] Subtitle (max 30 characters)
  - [ ] Description (compelling, keyword-rich)
  - [ ] Keywords (comma-separated, max 100 characters)
  - [ ] Support URL
  - [ ] Marketing URL (optional)
  - [ ] Privacy Policy URL (required)

- [ ] **Screenshots** (required for all device sizes)
  - [ ] 6.7" iPhone (1290 x 2796) - iPhone 15 Pro Max
  - [ ] 6.5" iPhone (1284 x 2778) - iPhone 14 Plus
  - [ ] 5.5" iPhone (1242 x 2208) - iPhone 8 Plus
  - Recommended: 3-5 screenshots showing:
    - Camera/meal capture
    - Analysis results
    - Dashboard with insights
    - Meal history
    - Dark mode (optional)

- [ ] **App Preview Video** (optional but recommended)
  - Max 30 seconds
  - Shows key features

- [ ] **App Icon**
  - 1024x1024 PNG (no transparency, no rounded corners)
  - Currently using default - needs custom design

- [ ] **Category**
  - Primary: Health & Fitness
  - Secondary: Food & Drink (optional)

- [ ] **Age Rating**
  - Complete questionnaire
  - Likely: 4+ (no objectionable content)

- [ ] **Pricing**
  - Free (with potential future in-app purchases)

### 2. Legal & Privacy

- [ ] **Privacy Policy** (REQUIRED)
  - What data you collect (photos, meal data, user ID)
  - How you use it (AI analysis, insights)
  - Third-party services (Supabase, Google Gemini)
  - Data retention policy
  - User rights (delete data, export)
  - Host on accessible URL

- [ ] **Terms of Service** (recommended)
  - User responsibilities
  - Service limitations
  - Liability disclaimers

- [ ] **App Privacy Details** (App Store Connect)
  - Data types collected:
    - ✓ Photos (for meal analysis)
    - ✓ User ID (for authentication)
    - ✓ Usage data (for rate limiting)
  - Data usage:
    - ✓ App functionality
    - ✓ Analytics (optional)
  - Data linked to user: Yes
  - Data used to track user: No

### 3. Technical Requirements

- [ ] **App Review Information**
  - [ ] Demo account (if login required)
  - [ ] Contact information
  - [ ] Notes for reviewer (explain AI features)

- [ ] **Export Compliance**
  - [ ] Confirm encryption usage (standard HTTPS only)
  - Already answered "Yes" to exempt encryption

- [ ] **Content Rights**
  - [ ] Own all content in app
  - [ ] Have rights to use third-party content (icons, fonts)

### 4. Testing & Quality

- [ ] **Device Testing**
  - [ ] Test on multiple iPhone models
  - [ ] Test on different iOS versions (minimum supported)
  - [ ] Test in different regions/languages (if applicable)

- [ ] **Feature Testing**
  - [ ] Camera permissions work correctly
  - [ ] Photo analysis completes successfully
  - [ ] Rate limiting triggers at 10 requests
  - [ ] Non-food rejection works
  - [ ] Dark mode toggle works
  - [ ] All navigation flows work
  - [ ] No crashes or freezes

- [ ] **Edge Cases**
  - [ ] Poor network conditions
  - [ ] Offline mode (cached data)
  - [ ] Low storage
  - [ ] Camera permission denied
  - [ ] Supabase service down

- [ ] **Performance**
  - [ ] App launches quickly (<3 seconds)
  - [ ] Smooth scrolling
  - [ ] No memory leaks
  - [ ] Battery usage reasonable

### 5. Analytics & Monitoring (Optional but Recommended)

- [ ] **Crash Reporting**
  - [ ] Set up Sentry or similar
  - [ ] Monitor crash-free rate

- [ ] **Analytics**
  - [ ] Track key user actions
  - [ ] Monitor retention
  - [ ] Analyze feature usage

- [ ] **Performance Monitoring**
  - [ ] API response times
  - [ ] AI analysis success rate
  - [ ] Rate limit hit rate

### 6. Business Considerations

- [ ] **Monetization Strategy** (if applicable)
  - [ ] Free tier limits defined
  - [ ] Premium tier features planned
  - [ ] Pricing determined
  - [ ] RevenueCat integration (if using IAP)

- [ ] **Support Infrastructure**
  - [ ] Support email set up
  - [ ] FAQ/Help documentation
  - [ ] Bug reporting mechanism

- [ ] **Marketing Plan**
  - [ ] Launch announcement
  - [ ] Social media presence
  - [ ] App Store Optimization (ASO)

---

## 🚀 Submission Process

### Step 1: Complete TestFlight Testing
1. Install build from TestFlight
2. Test all features thoroughly
3. Fix any critical bugs
4. Submit new build if needed

### Step 2: Prepare App Store Connect
1. Log in to https://appstoreconnect.apple.com
2. Navigate to your app (snapcal)
3. Fill in all metadata
4. Upload screenshots
5. Set pricing and availability

### Step 3: Submit for Review
1. Select the build (Build #2 or later)
2. Complete all required fields
3. Submit for review
4. Wait for Apple review (typically 1-3 days)

### Step 4: Post-Approval
1. App goes live automatically or manually release
2. Monitor reviews and ratings
3. Respond to user feedback
4. Plan updates and improvements

---

## ⚠️ Common Rejection Reasons to Avoid

1. **Incomplete metadata** - Fill all required fields
2. **Missing privacy policy** - Must be accessible URL
3. **Crashes during review** - Test thoroughly
4. **Misleading screenshots** - Show actual app features
5. **Unclear app purpose** - Explain clearly in description
6. **Privacy violations** - Declare all data collection
7. **Broken features** - Ensure everything works
8. **Poor performance** - Optimize loading times

---

## 📊 Current Status Summary

### Ready for Production ✅
- Backend infrastructure
- Core app features
- Security (API keys, rate limiting)
- Dark mode

### Needs Attention ⚠️
- App Store metadata (name, description, screenshots)
- Privacy policy URL
- Comprehensive device testing
- App icon design (currently using default)

### Estimated Time to Production
- **If rushing**: 1-2 days (minimal metadata + testing)
- **Recommended**: 1-2 weeks (proper screenshots, testing, polish)
- **Ideal**: 3-4 weeks (marketing prep, analytics, thorough testing)

---

## 🎯 Recommended Next Steps

1. **Test current build** - Verify AI proxy works on device
2. **Create privacy policy** - Use template or generator
3. **Design app icon** - Professional, recognizable
4. **Take screenshots** - Show best features
5. **Write compelling description** - Clear value proposition
6. **Submit for review** - Once everything is ready

---

## 📞 Resources

- **App Store Connect**: https://appstoreconnect.apple.com
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Privacy Policy Generator**: https://www.privacypolicies.com/
- **Screenshot Templates**: https://www.figma.com/community (search "app store screenshots")
- **ASO Tools**: https://www.appfollow.io/ or https://www.apptweek.com/
