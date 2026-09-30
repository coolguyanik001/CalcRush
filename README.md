# CalcRush — Mathematical Calculation Training Platform

[![Release](https://img.shields.io/badge/Release-v1.5.0-06b6d4.svg)](https://github.com/anik74645/calcrush/releases/tag/v1.5.0)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20Linux%20%7C%20Android%20(PWA)%20%7C%20Web-emerald.svg)](https://github.com/anik74645/calcrush/releases)
[![Tests](https://img.shields.io/badge/Tests-2%2C500%2B%20Passing-brightgreen.svg)](test-audit.ts)
[![Engine](https://img.shields.io/badge/Math-Exact%20Rational%20Arithmetic-cyan.svg)](src/engine/rational.ts)
[![Support](https://img.shields.io/badge/Support-Buy%20Me%20a%20Coffee-amber.svg)](https://buymeacoffee.com/senshin)

**CalcRush** is a high-performance mental calculation training application designed to build mental arithmetic speed, accuracy, and numerical fluency. CalcRush features an **exact rational arithmetic engine** (zero floating-point roundoff errors), 10 progressive competitive tiers, 8 bonus training modes, daily challenges, a mistake bank, an AI Level Maker, full-stack account authentication with cross-device cloud synchronization, Google Sign-In, OTP email verification, genuine compiled native standalone binaries for **Windows** and **Linux**, and installable **Progressive Web Apps (PWAs)** for mobile and desktop.

---

## 🌟 What's New in v1.5.0 (Phase 1.5)

### 🔐 1. Full-Stack Account System & Persistent Sessions
- **Guest Mode Default**: CalcRush is fully functional immediately without creating an account.
- **Account Creation**: Sign up with Name, Email, Password, and Password Confirmation.
- **Persistent Sessions**: Cryptographically secure token sessions persist across browser and application restarts.
- **Data Isolation**: Strict user token authorization ensures complete privacy; users can only access and synchronize their own records.

### 🔵 2. Google Sign-In
- Real OAuth integration with backend tokeninfo verification.
- Honest configuration reporting: if Google credentials are not configured on deployment, displays `"Google Sign-In is currently unavailable."` without pretending to authenticate.

### 📧 3. Email Verification with Expiring OTP
- 6-digit numeric verification code generated cryptographically.
- Code expiration (15 minutes), rate limiting, and 60-second resend countdown timer.
- Clear configuration reporting: in development mode without external SMTP/API keys, displays clear development preview status and codes for end-to-end verification testing.

### 🔑 4. Secure Password Recovery
- "Forgot password?" self-service recovery flow with 6-digit reset codes and password confirmation.

### 👤 5. Guest → Account Migration
- When a guest signs up or logs in, CalcRush prompts:
  `"Save your CalcRush progress to your account?"`
- Safely migrates local Elo rating, level unlocks, training history, mistake bank, bonus records, achievements, and AI Level Maker levels without data loss or duplicates.

### ☁️ 6. Cross-Device Cloud Synchronization
- Access your CalcRush profile, tier progress, and custom levels across multiple devices.
- Live status indicators:
  - 🟢 **Synced**: All data is up to date in the cloud.
  - 🟡 **Syncing**: Background push/pull in progress.
  - 🔴 **Sync Error**: Server communication issue; local data remains safe.
  - ⚪ **Offline**: Offline mode active; training continues and queues for sync.
- Displays `"Last synced: [timestamp]"` with manual **"Sync Now"** trigger.

### ☕ 7. Buy Me a Coffee Support System
- Optional external developer support link for creator **SENSHIN**:
  👉 **[https://buymeacoffee.com/senshin](https://buymeacoffee.com/senshin)**
- CalcRush website: **[https://calcrush.ai.studio](https://calcrush.ai.studio)**
- **100% Free Core**: No Patreon, no paywalls, no subscriptions, and no in-app ads.
- **Polite Behavior**: Support prompts never interrupt active calculation gameplay.

### 🏆 8. Expanded Achievements & Improved Analytics
- 20 milestone achievements across speed, accuracy streaks, question volume, cross-device sync, and custom level generation.
- Response latency distribution breakdown (Lightning &lt;1.5s, Rapid 1.5-3.0s, Steady 3.0-5.0s, Methodical &gt;5.0s).

---

## 📦 Multi-Platform Releases (v1.5.0)

| Platform | Type | File Name | Size | SHA-256 Hash | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Windows** | Setup PE32+ (.exe) | [`CalcRush-Windows-x64-v1.5.0-Setup.exe`](releases/CalcRush-Windows-x64-v1.5.0-Setup.exe) | 84.7 MB | `6638985e3bb9d5fc1740fffff139a62315d08326d844e0b39ebcfb1d282a2e8d` | **Genuine PE32+ Executable** |
| **Windows** | Portable PE32+ (.exe) | [`CalcRush-Windows-x64-v1.5.0-Portable.exe`](releases/CalcRush-Windows-x64-v1.5.0-Portable.exe) | 84.7 MB | `a0640b9303a2d22f94c90f868ca41bbe237182b07d6396055ed574a2372afb36` | **Genuine PE32+ Executable** |
| **Linux** | AppImage / ELF (.AppImage) | [`CalcRush-Linux-x64-v1.5.0.AppImage`](releases/CalcRush-Linux-x64-v1.5.0.AppImage) | 78.7 MB | `19aab2dc3fae2d21423ca903669d7cab47ea8d4f95e6ab599791d250c652a339` | **Genuine 64-bit ELF** |
| **Linux** | Debian / Ubuntu (.deb) | [`CalcRush-Linux-x64-v1.5.0.deb`](releases/CalcRush-Linux-x64-v1.5.0.deb) | 113 KB | `306ef6cd0508bcb911d4118c26b3423c816568ee17483d91284c1b410a6640a1` | **Genuine Debian Package** |
| **Android** | Installable PWA | *Installed via Chrome / Chromium* | — | `INSTALLED_VIA_BROWSER` | **Verified Mobile PWA** |
| **macOS** | Installable PWA | *Installed via Safari / Chrome* | — | `INSTALLED_VIA_BROWSER` | **Verified Desktop PWA** |

### Checksum Verification
```bash
# Linux / macOS
sha256sum CalcRush-Linux-x64-v1.5.0.AppImage

# Windows PowerShell
CertUtil -hashfile CalcRush-Windows-x64-v1.5.0-Setup.exe SHA256
```

---

## 🚀 Installation & Quick Start

### 🪟 Windows (PE32+ Executable)
- **Setup**: Run `CalcRush-Windows-x64-v1.5.0-Setup.exe` to launch the standalone local calculation runtime.
- **Portable**: Run `CalcRush-Windows-x64-v1.5.0-Portable.exe` directly from any folder or USB drive with zero installation. Progress persists in your local profile.

### 🐧 Linux (AppImage & Debian Package)
- **Debian / Ubuntu / Linux Mint (.deb)**:
  ```bash
  sudo dpkg -i CalcRush-Linux-x64-v1.5.0.deb
  calcrush
  ```
- **AppImage / Standalone Executable (All distributions)**:
  ```bash
  chmod +x CalcRush-Linux-x64-v1.5.0.AppImage
  ./CalcRush-Linux-x64-v1.5.0.AppImage
  ```

### 🤖 Android (Installable PWA)
1. Open CalcRush in Chrome or any modern mobile browser.
2. Tap the browser menu (⋮) and tap **"Install app"** or **"Add to Home screen"**.
3. CalcRush launches as a dedicated fullscreen mobile application with haptic feedback, custom touch keypad, and offline persistence.

### 🍎 macOS (Desktop PWA)
1. Open CalcRush in Safari or Chrome on macOS.
2. In Safari: Click **File → Add to Dock**. In Chrome: Click the **Install** icon in the address bar.
3. CalcRush runs as a standalone desktop window with native dock integration and offline support.

---

## 🛠️ Development & Testing

```bash
# Install dependencies
npm install

# Start local full-stack development server
npm run dev

# Run comprehensive mathematical and security test suite (2,500+ tests)
npx tsx test-audit.ts

# Build production bundle and compile native distribution packages
npx tsx scripts/build-releases.ts
```

---

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
