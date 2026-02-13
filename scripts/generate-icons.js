import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 48, 128];
const iconColor = { r: 34, g: 197, b: 94 }; // Green color (#22C55E)

async function generateIcons() {
  const iconsDir = join(__dirname, '..', 'public', 'icons');

  for (const size of sizes) {
    // Create a simple colored square with rounded corners
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="rgb(${iconColor.r}, ${iconColor.g}, ${iconColor.b})"/>
        <text
          x="50%"
          y="50%"
          dominant-baseline="middle"
          text-anchor="middle"
          font-family="Arial, sans-serif"
          font-size="${size * 0.5}px"
          font-weight="bold"
          fill="white"
        >F</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(join(iconsDir, `icon${size}.png`));

    console.log(`Generated icon${size}.png`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
