# CalcRush v1.4.0 — Multi-Platform Release + Stabilization Audit + Changelog System

Welcome to **CalcRush v1.4.0**! This milestone release delivers standalone desktop and mobile packages for Android, Windows, and Linux, backed by a 2,500+ calculation engine audit and an in-app changelog system.

---

## 📦 Download Standalone Releases

| Platform | Format | File | SHA-256 Checksum |
| :--- | :--- | :--- | :--- |
| **Android** | APK | [`CalcRush-Android-v1.4.0.apk`](https://github.com/anik74645/calcrush/releases/download/v1.4.0/CalcRush-Android-v1.4.0.apk) | `9dfd24c0e55dafddcbe793ddba5377f8505aa3e54cf7c8438cfb0499721d511f` |
| **Windows** | Setup Installer (.exe) | [`CalcRush-Windows-x64-v1.4.0-Setup.exe`](https://github.com/anik74645/calcrush/releases/download/v1.4.0/CalcRush-Windows-x64-v1.4.0-Setup.exe) | `de23435f43c1699deeb4d50d02a93b01ba45cde06493aa4cb213857d5d2ab9fa` |
| **Windows** | Portable (.exe) | [`CalcRush-Windows-x64-v1.4.0-Portable.exe`](https://github.com/anik74645/calcrush/releases/download/v1.4.0/CalcRush-Windows-x64-v1.4.0-Portable.exe) | `12081eb842568f74fae4048a4c90c5f97f21f6a2d44a128caa820311e390ab4e` |
| **Linux** | AppImage | [`CalcRush-Linux-x64-v1.4.0.AppImage`](https://github.com/anik74645/calcrush/releases/download/v1.4.0/CalcRush-Linux-x64-v1.4.0.AppImage) | `54bee45b7f8d0248e1cd1eecee1d92a5065e5b9b95635329a90b2bec2114fa50` |
| **Linux** | Debian / Ubuntu (.deb) | [`CalcRush-Linux-x64-v1.4.0.deb`](https://github.com/anik74645/calcrush/releases/download/v1.4.0/CalcRush-Linux-x64-v1.4.0.deb) | `312ade0129bb9f232ed227325fb75928b682b824e053e980c7be411c77ced2e6` |

Checksums can be verified locally against `SHA256SUMS.txt`.

---

## 🚀 Key Highlights in v1.4.0

### 1. Multi-Platform Standalone Packages
- **Android APK**: Full offline functionality, optimized touch keypad, and haptic feedback.
- **Windows x64**: Available as an NSIS Setup installer with Start Menu integration and as a zero-install portable executable.
- **Linux x64**: AppImage for universal Linux distribution compatibility and `.deb` package for Ubuntu/Debian.

### 2. Comprehensive Mathematical Engine Audit (2,500+ Calculations)
- **Rational Arithmetic Parser**: Hardened with full whitespace tolerance around division slashes (`1 1 / 2`), unicode minus symbols (`−`), and high-precision decimals up to 10 decimal digits.
- **Zero Hallucination Guarantee**: All AI-assisted levels are validated strictly by the authoritative exact rational engine before presentation.
- **Continuous Endless Modes**: Infinite question replenishment verified across 250+ consecutive questions in Zen, Survival, and Custom practice modes.

### 3. Integrated Changelog & Update Announcements
- **In-App "What's New" Screen**: Fully offline accessible with release history from v1.0.0 through v1.4.0.
- **In-App Download Center**: Interactive platform tabs with file details, SHA-256 copy helpers, and step-by-step terminal guides.
- **Update Notification Banner**: Non-intrusive dismissible banner with 7-day snooze and permanent dismissal preferences.

---

## 🛠️ Verification Instructions
```bash
# Verify checksums on Linux / macOS:
sha256sum -c SHA256SUMS.txt

# Verify checksums on Windows PowerShell:
CertUtil -hashfile CalcRush-Windows-x64-v1.4.0-Setup.exe SHA256
```
