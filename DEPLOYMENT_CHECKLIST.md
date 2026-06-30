# MeraEhsaas — Final Deployment Checklist

## Build Status
- ✅ TypeScript: 0 errors
- ✅ Next.js compilation: successful (78s)
- ✅ Capacitor Android: configured
- ✅ Capacitor iOS: configured
- ✅ All routes protected/public correctly

---

## Web Deployment (Vercel)

### Commands
```bash
git push origin main
# Vercel auto-deploys from main branch
```

### Verification
- [ ] Set environment variables in Vercel dashboard
- [ ] Verify NEXT_PUBLIC_APP_URL matches your domain
- [ ] Add domain to Supabase Auth redirect URLs
- [ ] Verify login works
- [ ] Verify Google OAuth works
- [ ] Verify image uploads work
- [ ] Test on mobile browser

---

## Android (Google Play Store)

### Build Commands
```bash
# 1. Build static export
npm run build:mobile

# 2. Sync to Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio:
# Build > Generate Signed Bundle/APK > Android App Bundle
# Select release keystore > Build
```

### One-Time Setup
```bash
# Generate release keystore
keytool -genkey -v -keystore meraehsaas-release.keystore \
  -alias meraehsaas -keyalg RSA -keysize 2048 -validity 10000
```

### Play Store Submission
- [ ] App icon 512x512 PNG (no alpha)
- [ ] Feature graphic 1024x500 PNG
- [ ] 4+ screenshots (1080x1920)
- [ ] Short description: "A quiet space for poetry, emotions, and stories."
- [ ] Full description written
- [ ] Category: Social
- [ ] Content rating: complete questionnaire
- [ ] Privacy policy URL: https://meraehsaas.com/privacy
- [ ] Target audience: 13+
- [ ] Data safety form: completed
- [ ] Test account credentials provided
- [ ] Signed AAB uploaded
- [ ] Internal testing track first, then production

---

## iOS (Apple App Store)

### Build Commands
```bash
# 1. Build static export
npm run build:mobile

# 2. Sync to iOS project
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. In Xcode:
# Select "Any iOS Device" as target
# Product > Archive
# Distribute App > App Store Connect
```

### App Store Submission
- [ ] App icon 1024x1024 (no alpha, no rounded corners)
- [ ] Screenshots for 6.7", 6.5", 5.5"
- [ ] App name (30 chars): "MeraEhsaas"
- [ ] Subtitle: "Poetry & Emotions"
- [ ] Description
- [ ] Keywords (100 chars)
- [ ] Category: Social Networking
- [ ] Age rating: 12+
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Demo credentials in review notes
- [ ] Build uploaded via Xcode

---

## Generate App Icons

```bash
# Install asset generator
npm install -D @capacitor/assets

# Place source files:
# resources/icon.png (1024x1024, opaque)
# resources/splash.png (2732x2732, centered logo)

# Generate all icons and splash screens
npx @capacitor/assets generate \
  --iconBackgroundColor '#1a1a1a' \
  --splashBackgroundColor '#f8f6f4' \
  --splashBackgroundColorDark '#0f0f0f'
```

---

## Supabase Production Setup

- [ ] All migrations run (schema, rls, seed, community-features, notifications, print-orders)
- [ ] Storage buckets created: `avatars` (public), `post-images` (public)
- [ ] Storage policies applied
- [ ] Google OAuth configured
- [ ] Email templates customized
- [ ] Realtime enabled for `comments` table
- [ ] Admin user set: `UPDATE profiles SET role='admin' WHERE username='you'`

---

## Security Audit Results

| Check | Status |
|-------|--------|
| All routes protected by middleware | ✅ |
| Admin routes require admin role | ✅ |
| RLS on all database tables | ✅ |
| No API keys in client bundle | ✅ (only NEXT_PUBLIC_* exposed) |
| HTTPS enforced (Android) | ✅ (networkSecurityConfig) |
| HTTPS enforced (iOS) | ✅ (ATS default) |
| Cleartext traffic disabled | ✅ |
| Input validation on forms | ✅ |
| File upload size limits | ✅ (2MB) |
| Password min length | ✅ (8 chars) |
| XSS: no dangerouslySetInnerHTML on user content | ✅ |
| CSRF: Supabase handles via tokens | ✅ |

---

## Performance

| Metric | Target | Status |
|--------|--------|--------|
| TypeScript errors | 0 | ✅ |
| Build compilation | < 90s | ✅ (78s) |
| Bundle optimization | tree-shaking | ✅ |
| Image optimization | AVIF/WebP | ✅ |
| Lazy loading images | enabled | ✅ |
| Infinite scroll (not load-all) | yes | ✅ |
| Service worker caching | enabled | ✅ |
| Font preconnect | configured | ✅ |

---

## Legal Pages

| Page | URL | Public |
|------|-----|--------|
| Privacy Policy | /privacy | ✅ |
| Terms of Service | /terms | ✅ |
| Delete Account | /delete-account | ✅ |
| About / Version | /about | ✅ |

---

## Final Notes

- The web version (Vercel) uses SSR via `next.config.ts`
- The mobile builds use static export via `next.config.mobile.ts`
- Both share the same codebase — no duplication
- The `android/` and `ios/` folders are Capacitor-managed native projects
- App version is `1.0.0` (update in `package.json`, `android/app/build.gradle`, and Xcode)
