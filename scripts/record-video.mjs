// Renders video.html frame by frame with your installed Chrome, then muxes the song with ffmpeg.
// Usage: node scripts/record-video.mjs [--frames 1,5,12.3]   (dev server must be running on :5180)
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const URL = process.env.VIDEO_URL || "http://localhost:5180/video.html";
const FPS = 30;
const OUT_DIR = join(ROOT, "video");
const FRAMES = process.env.FRAMES_DIR || join(OUT_DIR, ".frames");
const OUT = join(OUT_DIR, "DevenWedsChandni-Invite.mp4");
const SONG = join(ROOT, "public/audio/song.mp3");
const SONG_START = 2; // seconds into the song

const sampleArg = process.argv.indexOf("--frames");
const samples = sampleArg > -1 ? process.argv[sampleArg + 1].split(",").map(Number) : null;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
const duration = await page.evaluate(() => window.__duration);
const stage = page.locator("#stage");

if (samples) {
  mkdirSync(join(OUT_DIR, "samples"), { recursive: true });
  for (const t of samples) {
    await page.evaluate((t) => window.__seek(t), t);
    await stage.screenshot({ path: join(OUT_DIR, "samples", `t${String(t).padStart(5, "0")}.jpg`), type: "jpeg", quality: 80 });
  }
  console.log(`saved ${samples.length} samples to ${join(OUT_DIR, "samples")}`);
  await browser.close();
  process.exit(0);
}

rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
const total = Math.round(duration * FPS);
const t0 = Date.now();
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.__seek(t), i / FPS);
  await stage.screenshot({ path: join(FRAMES, `${String(i).padStart(5, "0")}.jpg`), type: "jpeg", quality: 95 });
  if (i % 60 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();

execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-framerate", String(FPS), "-i", join(FRAMES, "%05d.jpg"),
  "-ss", String(SONG_START), "-t", String(duration), "-i", SONG,
  "-af", `afade=t=in:st=0:d=0.6,afade=t=out:st=${duration - 2.5}:d=2.5`,
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high",
  "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart",
  OUT,
], { stdio: "inherit" });
rmSync(FRAMES, { recursive: true, force: true });
console.log(`done: ${OUT}`);
