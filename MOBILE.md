# MeraEhsaas — Mobile App Guide

## Architecture

The mobile app uses **Capacitor** to wrap the Next.js web application as a native mobile app.

- **Web (Vercel):** Uses `next.config.ts` with SSR
- **Mobile (Capacitor):** Uses `next.config.mobile.ts` with static export (`output: "export"`)

## Package Info

- **App ID:** `com.meraehsaas.app`
- **App Name:** MeraEhsaas
- **Web Dir:** `out` (static export)

## Prerequisites

- Node.js 18+
- Android Studio (for Android)
- Xcode 15+ (for iOS, macOS only)
- CocoaPods (for iOS): `sudo gem install cocoapods`

## Commands

```bash
# Build for mobile (creates static export in /out)
npm run build:mobile

# Sync web assets to native projects
npm run cap:sync

# Open in Android Studio
npm run mobile:android

# Open in Xcode
npm run mobile:ios
```

## Development Workflow

1. Make code changes
2. Run `npm run build:mobile` to create static export
3. Run `npx cap sync` to copy to native projects
4. Open in IDE and run on device/emulator

## For Live Reload During Development

```bash
# Start Next.js dev server
npm run dev

# In capacitor.config.ts, temporarily add:
# server: { url: "http://YOUR_LOCAL_IP:3000" }
# Then: npx cap sync && npx cap open android
```

## Permissions

### Android
- Internet
- Camera
- Storage (read/write)
- Notifications
- Vibrate

### iOS
- Camera
- Photo Library
- Photo Library Add

## Deep Links

- Scheme: `meraehsaas://`
- Domain: `meraehsaas.com`

## App Icons

Place icons in:
- Android: `android/app/src/main/res/mipmap-*`
- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Use [capacitor-assets](https://github.com/nicolekhouri/capacitor-assets) to generate:
```bash
npx @capacitor/assets generate --iconBackgroundColor '#1a1a1a' --splashBackgroundColor '#f8f6f4'
```

## Building for Release

### Android
1. Open in Android Studio: `npm run cap:android`
2. Build > Generate Signed Bundle/APK
3. Upload to Google Play Console

### iOS
1. Open in Xcode: `npm run cap:ios`
2. Product > Archive
3. Upload to App Store Connect
