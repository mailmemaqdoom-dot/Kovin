/**
 * Kovin PWA icon generator.
 * Hand-encodes real PNG files using only Node's built-in zlib —
 * no image libraries, no native deps. Re-run after any brand
 * colour change: `node scripts/generate-icons.js`.
 *
 * Design: the copper interpunct dot from the Kov·in wordmark,
 * isolated as the app icon mark — the one shape used consistently
 * as Kovin's signature visual element throughout the whole site.
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const COPPER = [0xE3, 0x53, 0x36];
const PAPER  = [0xF7, 0xF4, 0xEF];

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(zlib.crc32(crcInput) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(width, height, pixelFn) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      raw[offset++] = r; raw[offset++] = g; raw[offset++] = b; raw[offset++] = a;
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

/** Anti-aliased blend factor for a circle edge at given distance/radius. */
function aa(dist, radius) {
  if (dist <= radius - 0.75) return 1;
  if (dist >= radius + 0.75) return 0;
  return (radius + 0.75 - dist) / 1.5;
}
function blend(a, b, t) {
  return [
    Math.round(a[0] * t + b[0] * (1 - t)),
    Math.round(a[1] * t + b[1] * (1 - t)),
    Math.round(a[2] * t + b[2] * (1 - t)),
  ];
}

/** Rounded-rect outside test (for "any"-purpose icons with pre-rounded corners). */
function isOutsideRounded(x, y, size, r) {
  const inLeft = x < r, inRight = x > size - r, inTop = y < r, inBottom = y > size - r;
  if (inLeft && inTop) return Math.hypot(x - r, y - r) > r;
  if (inRight && inTop) return Math.hypot(x - (size - r), y - r) > r;
  if (inLeft && inBottom) return Math.hypot(x - r, y - (size - r)) > r;
  if (inRight && inBottom) return Math.hypot(x - (size - r), y - (size - r)) > r;
  return false;
}

/**
 * dotRadiusRatio: dot radius as a fraction of icon size.
 *   - maskable icons keep the dot within Android's ~40% safe-zone radius.
 *   - "any" icons can be a touch bolder since nothing clips them.
 */
function makeIcon(size, { dotRadiusRatio, rounded = false, cornerRatio = 0.22 }) {
  const cx = size / 2, cy = size / 2;
  const dotRadius = size * dotRadiusRatio;
  const cornerRadius = size * cornerRatio;
  return makePng(size, size, (x, y) => {
    if (rounded && isOutsideRounded(x + 0.5, y + 0.5, size, cornerRadius)) return [0, 0, 0, 0];
    const dist = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
    const t = aa(dist, dotRadius);
    const [r, g, b] = t >= 1 ? PAPER : t <= 0 ? COPPER : blend(PAPER, COPPER, t);
    return [r, g, b, 255];
  });
}

const outDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const jobs = [
  { name: 'icon-192.png',          size: 192, dotRadiusRatio: 0.30, rounded: true  },
  { name: 'icon-512.png',          size: 512, dotRadiusRatio: 0.30, rounded: true  },
  { name: 'icon-192-maskable.png', size: 192, dotRadiusRatio: 0.26, rounded: false },
  { name: 'icon-512-maskable.png', size: 512, dotRadiusRatio: 0.26, rounded: false },
  { name: 'apple-touch-icon.png',  size: 180, dotRadiusRatio: 0.30, rounded: false }, // iOS rounds its own corners
  { name: 'favicon-32.png',        size: 32,  dotRadiusRatio: 0.32, rounded: true  },
  { name: 'favicon-16.png',        size: 16,  dotRadiusRatio: 0.34, rounded: true  },
];

jobs.forEach(({ name, size, dotRadiusRatio, rounded }) => {
  const png = makeIcon(size, { dotRadiusRatio, rounded });
  fs.writeFileSync(path.join(outDir, name), png);
  console.log(`Wrote icons/${name} (${size}x${size}, ${png.length} bytes)`);
});

console.log('\nDone. ' + jobs.length + ' icons generated.');
