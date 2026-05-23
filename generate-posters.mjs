import { execSync } from 'child_process';
import { createRequire } from 'module';
import { existsSync, readdirSync } from 'fs';
import { resolve, basename, extname } from 'path';

const require = createRequire(import.meta.url);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const videoDir = resolve('public/video');
const files = readdirSync(videoDir);

// Filter for optimized video files
const optVideos = files.filter(file => file.startsWith('opt_') && extname(file).toLowerCase() === '.mp4');

console.log(`Found ${optVideos.length} optimized videos to generate posters for.`);

for (const file of optVideos) {
  const input = resolve(videoDir, file);
  const nameWithoutExt = basename(file, extname(file));
  const output = resolve(videoDir, `thumb_${nameWithoutExt}.jpg`);
  
  if (existsSync(output)) {
    console.log(`✓ Poster already exists: thumb_${nameWithoutExt}.jpg`);
    continue;
  }
  
  console.log(`Generating poster for ${file} → thumb_${nameWithoutExt}.jpg...`);
  
  try {
    // Seek to 1 second to avoid black frames at the beginning, extract 1 frame
    execSync(
      `"${ffmpegPath}" -ss 00:00:01 -i "${input}" -vframes 1 -q:v 2 -y "${output}"`,
      { stdio: 'inherit' }
    );
    console.log(`✓ Success: thumb_${nameWithoutExt}.jpg`);
  } catch (err) {
    // If seeking to 1s fails (e.g. video is very short), try seeking to 0s
    try {
      console.log(`Retrying at 0s seek for ${file}...`);
      execSync(
        `"${ffmpegPath}" -ss 00:00:00 -i "${input}" -vframes 1 -q:v 2 -y "${output}"`,
        { stdio: 'inherit' }
      );
      console.log(`✓ Success: thumb_${nameWithoutExt}.jpg`);
    } catch (retryErr) {
      console.error(`✗ Failed to generate poster for: ${file}`, retryErr.message);
    }
  }
}

console.log('\nAll poster generation tasks complete!');
