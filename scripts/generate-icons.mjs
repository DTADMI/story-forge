import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");
const source = resolve(publicDir, "images", "StoryForge_logo.png");

async function generate() {
  const sizes = [
    { name: "favicon-16x16.png", w: 16, h: 16 },
    { name: "favicon-32x32.png", w: 32, h: 32 },
    { name: "apple-touch-icon.png", w: 180, h: 180 },
    { name: "android-chrome-192x192.png", w: 192, h: 192 },
    { name: "android-chrome-512x512.png", w: 512, h: 512 },
  ];

  for (const { name, w, h } of sizes) {
    const dest = resolve(publicDir, name);
    await sharp(source).resize(w, h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(dest);
    console.log(`Generated: ${name} (${w}x${h})`);
  }

  // Generate favicon.ico (multi-size)
  await sharp(source).resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile(resolve(publicDir, "favicon.ico"));
  console.log("Generated: favicon.ico");

  console.log("All icons generated successfully.");
}

generate().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
