import fs from 'fs';
import path from 'path';

const REPO_OWNER = 'anik74645';
const REPO_NAME = 'calcrush';
const TAG_NAME = 'v1.4.1';
const RELEASE_NAME = 'CalcRush v1.4.1 — Multi-Platform Release Hotfix';

async function uploadRelease() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is required.');
    console.log('\nUsage:');
    console.log('  GITHUB_TOKEN="ghp_yourPersonalAccessToken" npx tsx scripts/upload-github-release.ts\n');
    console.log('Alternatively, push a git tag to let GitHub Actions upload automatically:');
    console.log('  git tag v1.4.1 && git push origin v1.4.1\n');
    console.log('Or upload manually via web UI at:');
    console.log(`  https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/new\n`);
    process.exit(1);
  }

  const releasesDir = path.join(process.cwd(), 'releases');
  if (!fs.existsSync(releasesDir)) {
    console.error(`❌ Error: releases directory not found at ${releasesDir}`);
    process.exit(1);
  }

  const filesToUpload = fs.readdirSync(releasesDir);
  console.log(`📦 Found ${filesToUpload.length} release files to upload.`);

  // 1. Read release notes
  let body = '';
  const notesPath = path.join(process.cwd(), 'RELEASE_NOTES_v1.4.1.md');
  if (fs.existsSync(notesPath)) {
    body = fs.readFileSync(notesPath, 'utf-8');
  }

  // 2. Create or find existing Release
  console.log(`🔍 Checking release ${TAG_NAME} on https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}...`);
  
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CalcRush-Release-Uploader',
  };

  let releaseData: any;
  const getRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${TAG_NAME}`, {
    headers,
  });

  if (getRes.ok) {
    releaseData = await getRes.json();
    console.log(`✓ Found existing release: ${releaseData.html_url}`);
  } else {
    console.log(`Creating new release ${TAG_NAME}...`);
    const createRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag_name: TAG_NAME,
        target_commitish: 'master',
        name: RELEASE_NAME,
        body,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error(`❌ Failed to create release: ${createRes.status} ${errText}`);
      process.exit(1);
    }
    releaseData = await createRes.json();
    console.log(`✓ Created release: ${releaseData.html_url}`);
  }

  // 3. Upload assets
  const uploadUrlBase = releaseData.upload_url.replace(/\{(\?name,label)?\}/, '');

  for (const filename of filesToUpload) {
    const filePath = path.join(releasesDir, filename);
    const fileStats = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    // Check if asset already exists
    const existingAsset = releaseData.assets?.find((a: any) => a.name === filename);
    if (existingAsset) {
      console.log(`Deleting previous asset ${filename} (id: ${existingAsset.id})...`);
      await fetch(existingAsset.url, { method: 'DELETE', headers });
    }

    const sizeStr = fileStats.size > 1024 * 1024
      ? `${(fileStats.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(fileStats.size / 1024).toFixed(1)} KB`;
    console.log(`Uploading ${filename} (${sizeStr})...`);

    const contentType = filename.endsWith('.apk')
      ? 'application/vnd.android.package-archive'
      : filename.endsWith('.exe')
      ? 'application/x-msdownload'
      : filename.endsWith('.AppImage')
      ? 'application/x-executable'
      : filename.endsWith('.deb')
      ? 'application/vnd.debian.binary-package'
      : 'application/octet-stream';

    const uploadRes = await fetch(`${uploadUrlBase}?name=${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': contentType,
        'Content-Length': fileStats.size.toString(),
      },
      body: fileBuffer,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.warn(`⚠️ Warning: Failed to upload ${filename}: ${err}`);
    } else {
      console.log(`✓ Successfully uploaded ${filename}`);
    }
  }

  console.log(`\n🎉 All setup files uploaded successfully!`);
  console.log(`Release URL: ${releaseData.html_url}`);
}

uploadRelease().catch((err) => {
  console.error('Fatal release upload error:', err);
  process.exit(1);
});
