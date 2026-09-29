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
export const LATEST_RELEASE_TAG_URL = 'https://github.com/anik74645/calcrush/releases/tag/v1.4.1';

export const RELEASE_ARTIFACTS: ReleaseArtifact[] = [
  {
    id: 'windows-exe',
    platform: 'windows',
    platformName: 'Windows (x64)',
    icon: '🪟',
    badge: 'PE32+ Executable',
    filename: 'CalcRush-Windows-x64-v1.4.1-Setup.exe',
    sizeBytes: 88816640,
    sha256: '2579d218ed221c35782fedbc38fa889a319c6dd815bef67919a938c1b4bf071e',
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
    filename: 'CalcRush-Windows-x64-v1.4.1-Portable.exe',
    sizeBytes: 88816640,
    sha256: 'c43c2c66f647062efe645d3599a222484599c99ac76c5e018655ea4eb089b498',
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
    filename: 'CalcRush-Linux-x64-v1.4.1.deb',
    sizeBytes: 163628,
    sha256: 'e2b0cded854cd6567834930fa0fc4f67ded9071c12e3cb86b3389795beedba67',
    recommended: true,
    status: 'native',
    instructions: [
      'Download the genuine Debian binary package (.deb).',
      'Install via terminal: sudo dpkg -i CalcRush-Linux-x64-v1.4.1.deb',
      'Launch from your application menu or run "calcrush" in terminal.',
    ],
  },
  {
    id: 'linux-appimage',
    platform: 'linux',
    platformName: 'Linux (Standalone ELF)',
    icon: '🐧',
    badge: 'ELF 64-bit Executable',
    filename: 'CalcRush-Linux-x64-v1.4.1.AppImage',
    sizeBytes: 82535624,
    sha256: 'e6bfb23df53a188bc811592e1c5e43712e883e6e06dcfbbb9e66782d85b04cb6',
    status: 'native',
    instructions: [
      'Download the CalcRush Linux x86-64 standalone executable.',
      'Make it executable: chmod +x CalcRush-Linux-x64-v1.4.1.AppImage',
      'Run directly: ./CalcRush-Linux-x64-v1.4.1.AppImage',
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
