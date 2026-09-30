export interface ReleaseArtifact {
  id: string;
  platform: 'android' | 'windows' | 'linux' | 'macos';
  platformName: string;
  icon: string;
  badge: string;
  filename: string;
  sizeBytes: number;
  sha256: string;
  instructions: string[];
  recommended?: boolean;
  status?: 'native' | 'pwa' | 'in_development';
}

export const GITHUB_REPO_URL = 'https://github.com/anik74645/calcrush';
export const GITHUB_RELEASES_URL = 'https://github.com/anik74645/calcrush/releases';
export const LATEST_RELEASE_TAG_URL = 'https://github.com/anik74645/calcrush/releases/tag/v1.5.0';

export const RELEASE_ARTIFACTS: ReleaseArtifact[] = [
  {
    id: 'windows-exe',
    platform: 'windows',
    platformName: 'Windows (x64)',
    icon: '🪟',
    badge: 'PE32+ Executable',
    filename: 'CalcRush-Windows-x64-v1.5.0-Setup.exe',
    sizeBytes: 88816640,
    sha256: '6638985e3bb9d5fc1740fffff139a62315d08326d844e0b39ebcfb1d282a2e8d',
    recommended: true,
    status: 'native',
    instructions: [
      'Download the CalcRush Windows executable (.exe).',
      'Double-click to launch the standalone local calculation runtime.',
      'CalcRush will automatically serve on http://127.0.0.1:3854 with full offline persistence.',
    ],
  },
  {
    id: 'windows-portable',
    platform: 'windows',
    platformName: 'Windows (Portable)',
    icon: '🪟',
    badge: 'Standalone PE32+',
    filename: 'CalcRush-Windows-x64-v1.5.0-Portable.exe',
    sizeBytes: 88816640,
    sha256: 'a0640b9303a2d22f94c90f868ca41bbe237182b07d6396055ed574a2372afb36',
    status: 'native',
    instructions: [
      'Download the standalone portable executable.',
      'No installation required—run directly from any folder or USB drive.',
      'Settings and user progress persist automatically in your local profile.',
    ],
  },
  {
    id: 'linux-deb',
    platform: 'linux',
    platformName: 'Linux (DEB)',
    icon: '🐧',
    badge: 'Debian / Ubuntu Package',
    filename: 'CalcRush-Linux-x64-v1.5.0.deb',
    sizeBytes: 113480,
    sha256: '306ef6cd0508bcb911d4118c26b3423c816568ee17483d91284c1b410a6640a1',
    recommended: true,
    status: 'native',
    instructions: [
      'Download the genuine Debian binary package (.deb).',
      'Install via terminal: sudo dpkg -i CalcRush-Linux-x64-v1.5.0.deb',
      'Launch from your application menu or run "calcrush" in terminal.',
    ],
  },
  {
    id: 'linux-appimage',
    platform: 'linux',
    platformName: 'Linux (Standalone ELF)',
    icon: '🐧',
    badge: 'ELF 64-bit Executable',
    filename: 'CalcRush-Linux-x64-v1.5.0.AppImage',
    sizeBytes: 82535624,
    sha256: '19aab2dc3fae2d21423ca903669d7cab47ea8d4f95e6ab599791d250c652a339',
    status: 'native',
    instructions: [
      'Download the CalcRush Linux x86-64 standalone executable.',
      'Make it executable: chmod +x CalcRush-Linux-x64-v1.5.0.AppImage',
      'Run directly: ./CalcRush-Linux-x64-v1.5.0.AppImage',
    ],
  },
  {
    id: 'android-pwa',
    platform: 'android',
    platformName: 'Android (Installable PWA)',
    icon: '🤖',
    badge: 'PWA Home Screen App',
    filename: 'CalcRush-Android-PWA',
    sizeBytes: 0,
    sha256: 'INSTALLED_VIA_BROWSER',
    recommended: true,
    status: 'pwa',
    instructions: [
      'Open CalcRush in Chrome or any Chromium-based browser on your Android device.',
      'Tap the browser menu (three dots at top right) and select "Install app" or "Add to Home screen".',
      'CalcRush runs as a dedicated fullscreen mobile application with offline support and haptic feedback.',
      'Native signed APK wrapper is in active development and requires an Android SDK / Gradle build pipeline.',
    ],
  },
  {
    id: 'macos-pwa',
    platform: 'macos',
    platformName: 'macOS (Installable PWA)',
    icon: '🍎',
    badge: 'Desktop PWA',
    filename: 'CalcRush-macOS-PWA',
    sizeBytes: 0,
    sha256: 'INSTALLED_VIA_BROWSER',
    status: 'pwa',
    instructions: [
      'Open CalcRush in Safari or Chrome on macOS.',
      'In Safari: Click File → "Add to Dock", or click the Share button → "Add to Dock".',
      'In Chrome: Click the Install icon in the address bar.',
      'CalcRush runs as a dedicated desktop window with native dock integration and offline capability.',
    ],
  },
];
