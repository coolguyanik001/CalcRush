# CalcRush v1.4.1 — Multi-Platform Release Hotfix + Binary Validation + Bug Fixes

Welcome to **CalcRush v1.4.1**! This stabilization hotfix addresses downloadable package issues identified following the v1.4.0 release. It replaces placeholder files with genuine compiled native binaries for Windows and Linux, recalculates cryptographic SHA-256 integrity checksums, and accurately designates installable PWA capabilities for Android and macOS.

---

## 🐛 Bug Fixes & Reliability Improvements

- **Fixed Invalid Android Package**: Removed the invalid 1.6 KB placeholder APK that caused "There was a problem parsing the package." Android mobile devices are now cleanly routed to the installable progressive web app (PWA) with native-grade fullscreen mode, local storage persistence, custom numeric keypad, and haptic feedback.
- **Genuine Windows Binaries**: Replaced HTML placeholder artifacts with real compiled **PE32+ 64-bit Windows executables** (85 MB each) for both Setup and Portable editions.
- **Genuine Linux Binaries**:
  - Validated native **Linux x86-64 ELF standalone executable** (79 MB).
  - Validated genuine **Debian package (.deb)** (160 KB) built using standard `dpkg-deb` with full desktop entry (`/usr/share/applications/calcrush.desktop`) and `/usr/bin/calcrush` launcher.
- **Cryptographic Checksums**: Freshly generated and verified SHA-256 hashes matching the real compiled binary payloads byte-for-byte.
- **Honest Platform Labeling**: Clarified that macOS and mobile Android browser installations run as installable PWAs rather than misleading binary downloads.
- **Keypad Input Polish**: Refined minus sign handling to allow negative signs after spaces in mixed fraction expressions.
- **Release Pipeline Hardening**: Updated release builder scripts to enforce strict binary compilation and non-zero byte size verification.

---

## 📦 Verified Distribution Artifacts (v1.4.1)

| Platform | Format | File Name | Size | SHA-256 Hash | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Windows** | Setup PE32+ (.exe) | `CalcRush-Windows-x64-v1.4.1-Setup.exe` | 84.7 MB | `2579d218ed221c35782fedbc38fa889a319c6dd815bef67919a938c1b4bf071e` | **Validated PE32+** |
| **Windows** | Portable PE32+ (.exe) | `CalcRush-Windows-x64-v1.4.1-Portable.exe` | 84.7 MB | `c43c2c66f647062efe645d3599a222484599c99ac76c5e018655ea4eb089b498` | **Validated PE32+** |
| **Linux** | AppImage / ELF (.AppImage) | `CalcRush-Linux-x64-v1.4.1.AppImage` | 78.7 MB | `e6bfb23df53a188bc811592e1c5e43712e883e6e06dcfbbb9e66782d85b04cb6` | **Validated ELF 64-bit** |
| **Linux** | Debian / Ubuntu (.deb) | `CalcRush-Linux-x64-v1.4.1.deb` | 160 KB | `e2b0cded854cd6567834930fa0fc4f67ded9071c12e3cb86b3389795beedba67` | **Validated Debian pkg** |
| **Android** | Installable PWA | *Installed via Chrome / Chromium* | — | `INSTALLED_VIA_BROWSER` | **Verified PWA** |
| **macOS** | Installable PWA | *Installed via Safari / Chrome* | — | `INSTALLED_VIA_BROWSER` | **Verified PWA** |

---

## 🔍 Verification Commands
Verify local binary hashes against `SHA256SUMS.txt`:
```bash
# On Linux or macOS:
sha256sum -c SHA256SUMS.txt

# On Windows (PowerShell):
CertUtil -hashfile CalcRush-Windows-x64-v1.4.1-Setup.exe SHA256
```
