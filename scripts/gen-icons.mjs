// Generates PWA PNG icons from scratch (no image deps) using Node's zlib.
// Draws a simple dumbbell mark in the accent color on a dark rounded tile.
import zlib from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { Buffer } from 'node:buffer';

const ACCENT = [255, 90, 31]; // #ff5a1f
const BG = [14, 17, 22]; // #0e1116

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng(size, maskable) {
  const px = Buffer.alloc(size * size * 4);
  const radius = maskable ? 0 : Math.round(size * 0.22);
  const pad = maskable ? Math.round(size * 0.12) : 0;

  const inRoundedRect = (x, y) => {
    if (x < pad || y < pad || x >= size - pad || y >= size - pad) return false;
    if (radius === 0) return true;
    const minX = pad + radius;
    const maxX = size - pad - radius;
    const minY = pad + radius;
    const maxY = size - pad - radius;
    let cx = x, cy = y;
    if (x < minX) cx = minX; else if (x > maxX) cx = maxX;
    if (y < minY) cy = minY; else if (y > maxY) cy = maxY;
    const dx = x - cx, dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  };

  // Dumbbell geometry (centered, horizontal)
  const cy = size / 2;
  const handleH = size * 0.10;
  const handleX0 = size * 0.34;
  const handleX1 = size * 0.66;
  const plateW = size * 0.08;
  const plateH = size * 0.34;
  const capW = size * 0.05;
  const capH = size * 0.48;

  const inDumbbell = (x, y) => {
    // handle
    if (x >= handleX0 && x <= handleX1 && Math.abs(y - cy) <= handleH / 2) return true;
    // inner plates
    if (x >= handleX0 - plateW && x < handleX0 && Math.abs(y - cy) <= plateH / 2) return true;
    if (x > handleX1 && x <= handleX1 + plateW && Math.abs(y - cy) <= plateH / 2) return true;
    // outer caps
    if (x >= handleX0 - plateW - capW && x < handleX0 - plateW && Math.abs(y - cy) <= capH / 2) return true;
    if (x > handleX1 + plateW && x <= handleX1 + plateW + capW && Math.abs(y - cy) <= capH / 2) return true;
    return false;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (!inRoundedRect(x, y)) {
        px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
        continue;
      }
      let color = BG;
      if (inDumbbell(x, y)) color = ACCENT;
      px[i] = color[0]; px[i + 1] = color[1]; px[i + 2] = color[2]; px[i + 3] = 255;
    }
  }

  // Add filter byte (0) at start of each scanline
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', makePng(192, false));
writeFileSync('public/icons/icon-512.png', makePng(512, false));
writeFileSync('public/icons/icon-maskable-512.png', makePng(512, true));
console.log('Icons generated.');
