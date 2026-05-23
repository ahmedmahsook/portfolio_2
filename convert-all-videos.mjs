import { execSync } from 'child_process';
import { createRequire } from 'module';
import { existsSync, readdirSync } from 'fs';
import { resolve, basename, extname } from 'path';

const require = createRequire(import.meta.url);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const videoDir = resolve('public/video');
const files = readdirSync(videoDir);

// Filter for video files, excluding already optimized ones
const videoFiles = files.filter(file => {
  const ext = extname(file).toLowerCase();
  return (ext === '.mp4' || ext === '.mov') && !file.startsWith('opt_');
});

console.log(`Found ${videoFiles.length} video files to optimize.`);

for (const file of videoFiles) {
  const input = resolve(videoDir, file);
  // Normalize output name to lowercase and prefixed with opt_
  const nameWithoutExt = basename(file, extname(file));
  const output = resolve(videoDir, `opt_${nameWithoutExt}.mp4`);
  
  if (existsSync(output)) {
    console.log(`✓ Already optimized: opt_${nameWithoutExt}.mp4`);
    continue;
  }
  
  console.log(`\nOptimizing ${file} → opt_${nameWithoutExt}.mp4...`);
  
  try {
    // We scale to maximum 1280px on the longest side to keep it HD but extremely lightweight
    // -vf "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'"
    // -crf 28 is a great sweet spot for high compression and decent quality
    execSync(
      `"${ffmpegPath}" -i "${input}" -c:v libx264 -preset fast -crf 28 -c:a aac -b:a 128k -movflags +faststart -vf "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'" -y "${output}"`,
      { stdio: 'inherit' }
    );
    console.log(`✓ Success: opt_${nameWithoutExt}.mp4`);
  } catch (err) {
    console.error(`✗ Failed to optimize: ${file}`, err.message);
  }
}

console.log('\nAll video optimization tasks complete!');
