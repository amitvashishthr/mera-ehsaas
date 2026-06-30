# MeraEhsaas — Release Guide

## App Information

| Field | Value |
|-------|-------|
| App ID | `com.meraehsaas.app` |
| App Name | MeraEhsaas |
| Version | 1.0.0 |
| Build | 1 |
| Min Android | API 22 (Android 5.1) |
| Target Android | API 34 (Android 14) |
| Min iOS | iOS 14.0 |

---

## Generate App Icons

```bash
# Install asset generator
npm install -D @capacitor/assets

# Place source icon at resources/icon.png (1024x1024, no transparency)
# Place splash at resources/splash.png (2732x2732, centered logo)

# Generate all platform icons and splash screens
npx @capacitor/assets generate \
  --iconBackgroundColor '#1a1a1a' \
  --iconBackgroundColorDark '#1a1a1a' \
  --splashBackgroundColor '#f8f6f4' \
  --splashBackgroundColorDark '#0f0f0f'
```

### Manual Icon Placement

**Android:** `android/app/src/main/res/`
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)
- Same sizes for `ic_launcher_round.png` and `ic_launcher_foreground.png`

**iOS:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- 1024x1024 (App Store)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 76x76 (iPad @1x)

---

## Build Commands

### Android APK (Debug)
```bash
npm run build:mobile
npx cap sync android
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Android AAB (Release — for Play Store)
```bash
npm run build:mobile
npx cap sync android
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Sign Android Release
```bash
# Generate keystore (one time)
keytool -genkey -v -keystore meraehsaas-release.keystore \
  -alias meraehsaas -keyalg RSA -keysize 2048 -validity 10000

# Add to android/app/build.gradle:
# signingConfigs {
#   release {
#     storeFile file('../../meraehsaas-release.keystore')
#     storePassword 'YOUR_PASSWORD'
#     keyAlias 'meraehsaas'
#     keyPassword 'YOUR_PASSWORD'
#   }
# }
```

### iOS Archive (for App Store)
```bash
npm run build:mobile
npx cap sync ios
# Open Xcode
npx cap open ios
# In Xcode: Product > Archive > Distribute App
```

---

## Google Play Store Checklist

- [ ] App icon (512x512 PNG, no alpha)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots: phone (2-8), tablet (optional)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Category: Social
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL: `https://meraehsaas.com/privacy`
- [ ] Target audience: 13+
- [ ] Signed AAB uploaded
- [ ] Data safety form completed
- [ ] App access (if login required): provide test credentials
- [ ] Ads declaration: No ads

### Data Safety Declaration
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email | Yes | No | Account |
| Name | Yes | No | Profile |
| Photos | Yes | No | Posts |
| Location (city) | Yes | No | Print delivery |

---

## Apple App Store Checklist

- [ ] App icon (1024x1024, no alpha, no rounded corners)
- [ ] Screenshots: 6.7" (1290x2796), 6.5" (1284x2778), 5.5" (1242x2208)
- [ ] iPad screenshots (optional)
- [ ] App name (30 chars)
- [ ] Subtitle (30 chars)
- [ ] Description
- [ ] Keywords (100 chars)
- [ ] Category: Social Networking
- [ ] Age rating: 12+
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Build uploaded via Xcode/Transporter
- [ ] App Review Information:
  - Demo account credentials
  - Notes for reviewer
- [ ] In-App Purchases: None (print orders are external)

---

## Pre-Release Checklist

### Functionality
- [ ] Login (email/password) works
- [ ] Login (Google) works
- [ ] Signup works
- [ ] Post creation works
- [ ] Image upload works
- [ ] Like/comment works
- [ ] Follow/unfollow works
- [ ] Search works
- [ ] Collections work
- [ ] Print orders work
- [ ] Notifications work
- [ ] Profile edit works
- [ ] Dark mode works
- [ ] Offline page shows correctly

### Performance
- [ ] App opens in under 3 seconds
- [ ] Feed scrolls smoothly (60fps)
- [ ] Images lazy load
- [ ] No memory leaks on navigation

### Security
- [ ] All routes protected
- [ ] No API keys in client bundle
- [ ] HTTPS enforced
- [ ] Input sanitization
- [ ] XSS prevention verified

### Platform-Specific
- [ ] Android back button works
- [ ] iOS swipe-back works
- [ ] Status bar styles correctly
- [ ] Safe areas respected
- [ ] Keyboard doesn't obscure inputs
- [ ] No white flash on navigation
- [ ] Pull-to-refresh works

### Legal
- [ ] Privacy policy accessible at /privacy
- [ ] Terms of service at /terms
- [ ] Delete account at /delete-account
- [ ] About page with version at /about

---

## Environment Variables for Production

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://meraehsaas.com
```

---

## Post-Release

- [ ] Monitor crash reports (Play Console / App Store Connect)
- [ ] Respond to reviews within 24h
- [ ] Monitor Supabase usage/quotas
- [ ] Schedule regular updates (bi-weekly)
