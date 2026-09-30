# CalcRush v1.5.0 Release Notes

**Release Date:** September 2026  
**Release Type:** Major Feature + Security + Reliability Update  
**Version:** v1.5.0  

---

## 📌 Executive Summary

CalcRush v1.5.0 introduces Phase 1.5: a full-featured, production-ready account system, Google Sign-In with OAuth verification, email verification with expiring 6-digit OTP codes, self-service password recovery, seamless Guest-to-Account progress migration, cross-device cloud synchronization with live status indicators, an optional Buy Me a Coffee support popup for creator SENSHIN, achievements expansion, enhanced statistics, and comprehensive security hardening.

CalcRush remains **100% free with zero locked core features, no Patreon, no paid subscriptions, no ads, and no in-app payment gates**.

---

## 🔐 1. Authentication System & User Management

### Guest Mode (Preserved & Offline-First)
- CalcRush never forces account creation. Users can open the app and instantly start training as a Guest.
- All core calculations, competitive tiers, practice modes, mistake bank, and local settings work 100% offline.

### Account Creation (Sign Up)
- Registration requires: Full Name, Valid Email, Password ($\ge 6$ characters), and Password Confirmation.
- Password hashing uses Node `crypto.pbkdf2Sync` with 10,000 rounds of SHA-512 and cryptographically unique per-user salts.
- Duplicate email prevention with user-friendly error feedback.

### Google Sign-In (Honest Real Implementation)
- End-to-end integration with Google OAuth and tokeninfo validation.
- If Google OAuth credentials are not configured on deployment, CalcRush clearly reports:
  > `"Google Sign-In is currently unavailable. (Google OAuth credentials have not been configured on this deployment yet.)"`
- Does not pretend authentication succeeded when unconfigured.

### Email Verification with OTP Codes
- Cryptographically generated 6-digit numeric verification codes (`crypto.randomInt`).
- Codes expire after 15 minutes.
- Rate limiting: maximum 5 attempts before code invalidation; 60-second cooldown between resend requests.
- Environment reporting: when external email transport (SMTP/Resend) is not configured, the interface clearly displays Development / Preview mode status and provides the generated verification code so testers can verify end-to-end without being blocked.

### Password Recovery ("Forgot Password?")
- Self-service recovery flow sending an expiring 6-digit reset code.
- Verification and new password confirmation.
- Secure design avoids leaking account existence to untrusted requesters.

---

## 👤 2. Guest → Account Migration

When a guest user registers or signs in:
- CalcRush asks:
  > `"Save your CalcRush progress to your account?"`
- Summarizes their current progress (Questions Solved, Level, Rating, Best Streak).
- Upon confirmation:
  - Migrates rating, unlocked levels, competitive history, practice history, mistake bank, bonus records, achievements, and AI Level Maker levels.
  - Safe conflict resolution: unions sessions without duplication, keeps highest streaks, and combines unique custom levels.
- If declined, local guest data is preserved intact.

---

## ☁️ 3. Cross-Device Cloud Synchronization

- Authenticated users access their progress seamlessly across devices.
- Synchronized datasets:
  - Competitive rating & tier unlocks
  - Competitive & practice session logs
  - Mistake bank items
  - Bonus mode records
  - Achievements progress
  - Saved AI Level Maker levels
  - User training preferences (sound, haptics, daily goal)
- Live status indicator:
  - 🟢 **Synced**: Cloud state matches local state.
  - 🟡 **Syncing**: Background push/pull in progress.
  - 🔴 **Sync Error**: Temporary communication issue; local data preserved.
  - ⚪ **Offline**: Offline mode active.
- `"Last synced: [timestamp]"` display and manual **"Sync Now"** button.

---

## ☕ 4. Buy Me a Coffee Support System

- **Creator Name:** SENSHIN
- **Buy Me a Coffee URL:** `https://buymeacoffee.com/senshin`
- **CalcRush Website:** `https://calcrush.ai.studio`
- **Support Modal:**
  - Title: `☕ Enjoying CalcRush?`
  - Body: `"CalcRush is built to make mathematics practice faster, smarter, and more engaging. If you've found it useful, you can support its development with a small contribution. Every bit helps. 🧮"`
  - Buttons: `[ ☕ Support CalcRush ]`, `[ Remind Me Later ]`, `[ Don't Show Again ]`.
- **Gameplay Protection:**
  - Never appears during active calculations or gameplay.
  - Triggers only after completing sessions and respects snooze / permanent dismissal preferences.
  - Always voluntarily accessible in Profile → Section 4 (Support).

---

## 👤 5. Five-Section Profile Page

Organized into 5 distinct, structured sections:
1. **ACCOUNT**: Name with inline editing, Email, Verification Status badge with "Verify Email" button, and Google Connection status with "Connect Google" button.
2. **SYNC**: Real-time cloud sync status (🟢 🟡 🔴 ⚪), Last synced timestamp, and "Sync Now" button.
3. **SECURITY**: "Change Password" modal, session information, and "Delete Account" permanent purge modal.
4. **SUPPORT**: Buy Me a Coffee developer support card, SENSHIN creator link, and website links.
5. **APPLICATION**: Training preferences (Sound, Haptics, Daily Target), Export Backup JSON, Download Center, and Reset Local Progress.

---

## 🏆 6. Expanded Achievements & Analytics

- **20 Total Achievements**: Added `Cross-Device Ascendant` (Cloud sync), `Level Architect` (AI level maker), `Sub-Second Sorcerer` (sub-1.0s answer), `Century Run` (100-streak), `Calculation Grandmaster` (5,000 questions), and `Verified Mind` (email verified).
- **Latency Distribution Breakdown**: Visual categorization of correct response speeds:
  - ⚡ Lightning (&lt; 1.5s)
  - 🏎️ Rapid (1.5s – 3.0s)
  - 🎯 Steady (3.0s – 5.0s)
  - 🧠 Methodical (&gt; 5.0s)

---

## 🛠️ 7. AI Level Maker Improvements

- **Interactive Parameter Tuning**: Slider controls for Question Count (5–50), Difficulty (Level 1–10), Target Pace (1–12s), and toggle buttons for Fractions, Decimals, Negatives, PEMDAS, and Mixed numbers.
- **Export & Import JSON**: Export saved custom levels as structured JSON or import level blueprints from clipboard.
- **Favorites & Search Filter**: Fast in-app search across saved level titles, descriptions, and topics.

---

## 🛡️ 8. Security & Data Isolation Audit

- **Zero Client Trust**: All user identification on sensitive routes (`/api/sync/*`, `/api/auth/update-profile`, `/api/auth/change-password`, `/api/auth/delete-account`) is authenticated strictly via server-side Bearer tokens.
- **Data Isolation**: User A cannot read, query, or overwrite User B's sessions or custom levels.
- **Salted Hashing**: PBKDF2-HMAC-SHA512 with 64-byte derived keys and unique 16-byte random salts.
- **Safe Fallbacks**: Zero crashes on offline usage, network interruptions, or invalid token states.
