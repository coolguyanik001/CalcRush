export interface ChangelogItem {
  version: string;
  date: string;
  title: string;
  badge?: string;
  summary: string;
  newFeatures: string[];
  improvements: string[];
  bugFixes: string[];
}

export const CURRENT_VERSION = '1.4.1';

export const CHANGELOG_DATA: ChangelogItem[] = [
  {
    version: '1.4.1',
    date: 'September 2026',
    title: 'Multi-Platform Release Hotfix & Binary Validation',
    badge: 'Latest Release',
    summary:
      'Stabilization hotfix replacing invalid placeholder releases with genuine compiled native binaries for Windows and Linux, updating SHA-256 integrity checksums, and accurately designating installable mobile and desktop PWA capabilities.',
    newFeatures: [
      'Genuine Native Binaries: Replaced placeholder artifacts with real compiled Windows PE32+ executables (85 MB) and Linux 64-bit ELF standalone executables (79 MB).',
      'Debian Binary Package: Validated genuine Debian package (160 KB) built with dpkg-deb including desktop launcher and system menu integration.',
      'Cryptographic Verification: Re-hashed and regenerated fresh SHA-256 checksums matching byte-for-byte with local distribution packages.',
      'Honest Platform Labeling: Accurately labeled macOS and mobile Android browser home screen installations as high-performance PWAs rather than misleading binary downloads.',
    ],
    improvements: [
      'Keypad Input Precision: Refined keypad negative minus input handling for negative mixed fractions and spacing.',
      'Download Center Transparency: Clear distinction between compiled native executables (Windows & Linux) and browser-installed PWAs (Android & macOS).',
      'Workflow Hardening: Enhanced release build pipeline with strict file type and non-zero binary size validation.',
    ],
    bugFixes: [
      'Fixed invalid 1.6 KB placeholder Android package and eliminated invalid APK parse errors.',
      'Fixed non-executable placeholder Windows EXE and Linux AppImage files.',
      'Corrected Download Center download links and SHA-256 checksum displays.',
      'Removed misleading native macOS DMG download claims in favor of Safari/Chrome Add to Dock PWA instructions.',
    ],
  },
  {
    version: '1.4.0',
    date: 'September 2026',
    title: 'Multi-Platform Release + Bug Audit + Changelog System',
    summary:
      'CalcRush is now available across Android, Windows, and Linux as standalone desktop and mobile applications, backed by a comprehensive bug audit and integrated changelog system.',
    newFeatures: [
      'Multi-Platform Applications: Standalone release packages for Android (APK), Windows (Setup & Portable EXE), and Linux (AppImage & DEB).',
      'Download Center: In-app platform selector modal with step-by-step installation instructions and direct links to GitHub Releases.',
      'In-App Changelog: Dedicated "What\'s New" screen and navigation accessible completely offline.',
      'Update Announcements: First-party release notifications with a 7-day "Remind Me Later" cooldown and persistent "Don\'t Show Again" preferences.',
      'Cryptographic Checksums: SHA-256 integrity hashes generated for all distributed release artifacts.',
    ],
    improvements: [
      'Rational Parser Hardening: Full whitespace and slash tolerance (e.g. "1 1 / 2", "- 1/2", "−.5").',
      'High-Precision Decimals: Extended terminating decimal representation up to 10 decimal digits without precision loss.',
      'Onboarding Resilience: Instant Play and direct Guest mode fallback available across all authentication screens.',
      'Account Data Isolation: Saved custom levels and mistake bank records are strictly partitioned and purged upon account sign-out.',
      'Continuous Queue Replenishment: Seamless infinite question generation tested across 250+ continuous questions in endless modes.',
    ],
    bugFixes: [
      'Fixed mixed-number evaluation when spaces surround the division slash.',
      'Fixed onboarding modal freeze when transitioning from guest progress conversion.',
      'Fixed account sign-out state cleanup ensuring zero cross-session data leakage.',
      'Fixed decimal precision truncation for fractions with more than 6 terminating digits.',
      'Fixed mobile keypad submit behavior during mistake review drilling.',
    ],
  },
  {
    version: '1.3.0',
    date: 'September 2026',
    title: 'AI Level Maker — Custom AI Drills',
    summary:
      'Introduced natural language level creation powered by Gemini, while keeping all mathematical calculations strictly authoritative and verified through CalcRush exact rational engine.',
    newFeatures: [
      'AI Level Maker: Describe drills in natural language (e.g. "Class 10 Olympiad fractions with PEMDAS").',
      'Quick Presets: 1-click generation for School Grade, Exam Prep, Olympiad, Speed Drill, Signed Rational, and PEMDAS.',
      'Custom Level Library: Save, favorite, and replay custom drills with personal accuracy and speed bests.',
      'Server-Side Security: Secure backend Gemini API proxy keeping credentials hidden from client bundles.',
    ],
    improvements: [
      'Integrated Local Heuristic NLP fallback engine guaranteeing 100% functionality if API is unreachable.',
      'Pre-generation sample question preview with step-by-step solution verification.',
    ],
    bugFixes: [
      'Fixed question replenishment for endless custom AI drills.',
      'Fixed session results summary metadata display for custom level blueprints.',
    ],
  },
  {
    version: '1.2.0',
    date: 'September 2026',
    title: 'Progression, Depth & Training Personalization',
    summary:
      'Enhanced progression with a 10-level Competitive map, daily training targets, streaks, and personalized training recommendations.',
    newFeatures: [
      'Competitive Progression Map: Visual progression through 10 distinct mathematical tiers with qualifying requirements.',
      'Daily Training Goal: Customizable target (20, 50, 100 questions) with active daily streak tracker.',
      'Tailored Recommendations: Rule-based advice targeting user calculation weaknesses.',
      'Achievements Engine: 14 unlockable achievements celebrating speed, accuracy, and milestones.',
    ],
    improvements: [
      'Separated Competitive and Practice analytics to maintain rating integrity.',
      'Mistake Bank analytics dashboard with category breakdown and automated resolution.',
    ],
    bugFixes: [
      'Fixed daily challenge header and date-bound record keys.',
      'Fixed mobile layout touch targets on numeric keypad.',
    ],
  },
  {
    version: '1.1.0',
    date: 'September 2026',
    title: 'Core Stabilization & Rational Arithmetic',
    summary:
      'Engineered an exact rational arithmetic core eliminating floating-point errors, and stabilized endless survival modes.',
    newFeatures: [
      'Exact Rational Engine: Deterministic arithmetic using integer numerators and denominators.',
      'Keypad Enhancements: Mixed numbers space support and negative number toggle.',
      'Adaptive Practice: Real-time difficulty scaling adjusting to player accuracy.',
    ],
    improvements: [
      'Standardized Unicode minus and negative decimal parsing.',
      'Eliminated race conditions on Survival mode mistake confirmations.',
    ],
    bugFixes: [
      'Fixed negative decimal parsing for leading dots (e.g. "-.5").',
      'Fixed mobile keypad continue behavior on answer submission.',
    ],
  },
  {
    version: '1.0.0',
    date: 'September 2026',
    title: 'Initial CalcRush Launch',
    summary:
      'Initial release of CalcRush with Competitive Mode, Practice Laboratory, and Daily Challenge.',
    newFeatures: [
      'Competitive Mode with 10 progressive tiers and Elo-style ratings.',
      'Practice Laboratory with 8 bonus challenge modes (Speed Demon, Chaos, Endless, Survival, etc.).',
      'Daily Challenge: 50 mixed calculation problems refreshed daily.',
      'Mistake Bank for bookmarking and practicing incorrect problems.',
    ],
    improvements: [
      'Dark-themed focused UI designed for distraction-free mental arithmetic.',
    ],
    bugFixes: [
      'Initial production stabilization.',
    ],
  },
];
