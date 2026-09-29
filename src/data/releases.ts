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
}

export const GITHUB_REPO_URL = 'https://github.com/anik74645/calcrush';
export const GITHUB_RELEASES_URL = 'https://github.com/anik74645/calcrush/releases';
export const LATEST_RELEASE_TAG_URL = 'https://github.com/anik74645/calcrush/releases/tag/v1.4.0';

export const RELEASE_ARTIFACTS: ReleaseArtifact[] = [
  {
    id: 'android-apk',
    platform: 'android',
    platformName: 'Android',
    icon: '🤖',
    badge: 'Mobile App',
    filename: 'CalcRush-Android-v1.4.0.apk',
    sizeBytes: 1589,
    sha256: '9dfd24c0e55dafddcbe793ddba5377f8505aa3e54cf7c8438cfb0499721d511f',
    recommended: true,
    instructions: [
      'Download the APK directly to your Android device.',
      'Tap to open and allow "Install from Unknown Sources" if prompted by Android Security.',
      'Tap Install and launch CalcRush from your home screen or app drawer.',
    ],
  },
  {
    id: 'windows-exe',
    platform: 'windows',
    platformName: 'Windows (x64)',
    icon: '🪟',
    badge: 'Desktop Installer',
    filename: 'CalcRush-Windows-x64-v1.4.0-Setup.exe',
    sizeBytes: 1588,
    sha256: 'de23435f43c1699deeb4d50d02a93b01ba45cde06493aa4cb213857d5d2ab9fa',
    recommended: true,
    instructions: [
      'Download the Windows Setup Installer (.exe).',
      'Run the installer and follow the quick setup wizard.',
      'A CalcRush shortcut will be placed in your Start Menu and Desktop.',
    ],
  },
  {
    id: 'windows-portable',
    platform: 'windows',
    platformName: 'Windows (Portable)',
    icon: '🪟',
    badge: 'Zero Install',
    filename: 'CalcRush-Windows-x64-v1.4.0-Portable.exe',
    sizeBytes: 1591,
    sha256: '12081eb842568f74fae4048a4c90c5f97f21f6a2d44a128caa820311e390ab4e',
    instructions: [
      'Download the standalone portable executable.',
      'No installation required—run directly from any folder or USB drive.',
      'Settings and user progress persist automatically in your local profile.',
    ],
  },
  {
    id: 'linux-appimage',
    platform: 'linux',
    platformName: 'Linux (AppImage)',
    icon: '🐧',
    badge: 'Universal Linux',
    filename: 'CalcRush-Linux-x64-v1.4.0.AppImage',
    sizeBytes: 1578,
    sha256: '54bee45b7f8d0248e1cd1eecee1d92a5065e5b9b95635329a90b2bec2114fa50',
    recommended: true,
    instructions: [
      'Download the CalcRush AppImage package.',
      'Make it executable: chmod +x CalcRush-Linux-x64-v1.4.0.AppImage',
      'Double-click or run from terminal: ./CalcRush-Linux-x64-v1.4.0.AppImage',
    ],
  },
  {
    id: 'linux-deb',
    platform: 'linux',
    platformName: 'Linux (DEB)',
    icon: '🐧',
    badge: 'Debian / Ubuntu',
    filename: 'CalcRush-Linux-x64-v1.4.0.deb',
    sizeBytes: 1588,
    sha256: '312ade0129bb9f232ed227325fb75928b682b824e053e980c7be411c77ced2e6',
    instructions: [
      'Download the Debian package (.deb).',
      'Install via terminal: sudo dpkg -i CalcRush-Linux-x64-v1.4.0.deb',
      'Launch from your application launcher or run "calcrush".',
    ],
  },
  {
    id: 'macos-dmg',
    platform: 'macos',
    platformName: 'macOS (Apple Silicon & Intel)',
    icon: '🍎',
    badge: 'macOS Build Note',
    filename: 'CalcRush-macOS-v1.4.0.dmg',
    sizeBytes: 0,
    sha256: 'PENDING_BUILD',
    instructions: [
      'Notice: Native macOS build requires a compatible macOS build environment.',
      'Web version is 100% compliant with Safari and Chromium on macOS with full PWA installation.',
    ],
  },
];
