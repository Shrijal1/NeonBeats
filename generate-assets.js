const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// ─── PNG helpers ──────────────────────────────────────────────────────────────
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++)
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function pngChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * rowSize + 1 + x * 4;
      raw[dst]   = rgba[src];
      raw[dst+1] = rgba[src+1];
      raw[dst+2] = rgba[src+2];
      raw[dst+3] = rgba[src+3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function makeCanvas(W, H, bgR, bgG, bgB) {
  const buf = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    buf[i*4] = bgR; buf[i*4+1] = bgG; buf[i*4+2] = bgB; buf[i*4+3] = 255;
  }

  function blendPixel(x, y, r, g, b, a) {
    const xi = Math.round(x), yi = Math.round(y);
    if (xi < 0 || xi >= W || yi < 0 || yi >= H) return;
    const idx = (yi * W + xi) * 4;
    const af = a / 255;
    buf[idx]   = Math.min(255, buf[idx]   * (1-af) + r * af) | 0;
    buf[idx+1] = Math.min(255, buf[idx+1] * (1-af) + g * af) | 0;
    buf[idx+2] = Math.min(255, buf[idx+2] * (1-af) + b * af) | 0;
    buf[idx+3] = 255;
  }

  function fillCircle(cx, cy, radius, r, g, b, a = 255) {
    const ri = Math.ceil(radius + 1);
    for (let dy = -ri; dy <= ri; dy++) {
      for (let dx = -ri; dx <= ri; dx++) {
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= radius + 0.5) {
          const alpha = dist > radius - 0.5
            ? Math.round(255 * (radius + 0.5 - dist))
            : 255;
          blendPixel(cx + dx, cy + dy, r, g, b, Math.min(a, alpha));
        }
      }
    }
  }

  function fillEllipse(cx, cy, rx, ry, angle, r, g, b, a = 255) {
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const maxR = Math.max(rx, ry) + 2;
    for (let dy = -maxR; dy <= maxR; dy++) {
      for (let dx = -maxR; dx <= maxR; dx++) {
        const lx = dx * cosA + dy * sinA;
        const ly = -dx * sinA + dy * cosA;
        if ((lx/rx)**2 + (ly/ry)**2 <= 1.0) {
          blendPixel(cx + dx, cy + dy, r, g, b, a);
        }
      }
    }
  }

  function sampleCubic(p0, p1, p2, p3, steps = 500) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, mt = 1 - t;
      pts.push([
        mt**3*p0[0] + 3*mt**2*t*p1[0] + 3*mt*t**2*p2[0] + t**3*p3[0],
        mt**3*p0[1] + 3*mt**2*t*p1[1] + 3*mt*t**2*p2[1] + t**3*p3[1],
      ]);
    }
    return pts;
  }

  function drawStroke(pts, radius, r, g, b, a = 255) {
    for (const [x, y] of pts) fillCircle(x, y, radius, r, g, b, a);
  }

  return { buf, fillCircle, fillEllipse, sampleCubic, drawStroke, blendPixel, W, H };
}

// ─── Icon drawing ─────────────────────────────────────────────────────────────
function drawIcon(W, H) {
  const c = makeCanvas(W, H, 10, 10, 30);         // #0A0A1E background
  const { buf, fillCircle, fillEllipse, sampleCubic, drawStroke, blendPixel } = c;

  const cx = W/2, cy = H/2;
  const scale = W / 1024;

  function s(v) { return v * scale; }

  // ── Subtle radial glow in center
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - cx) / (W * 0.5);
      const dy = (y - cy) / (H * 0.5);
      const r2 = dx*dx + dy*dy;
      if (r2 < 1) {
        const strength = (1 - r2) * 0.35;
        const idx = (y * W + x) * 4;
        buf[idx]   = Math.min(255, buf[idx]   + strength * 15 | 0);
        buf[idx+1] = Math.min(255, buf[idx+1] + strength * 10 | 0);
        buf[idx+2] = Math.min(255, buf[idx+2] + strength * 40 | 0);
      }
    }
  }

  // Neon yellow: 245, 197, 24
  const [R, G, B] = [245, 197, 24];

  // ── S letter — 3 cubic bezier segments ────────────────────────────────────
  // Upper bowl: top-right → top-left
  const seg1 = sampleCubic(
    [s(678), s(195)], [s(678), s(85)], [s(346), s(85)],  [s(346), s(215)]
  );
  // Middle crossover: top-left → bottom-right
  const seg2 = sampleCubic(
    [s(346), s(215)], [s(346), s(345)], [s(678), s(375)], [s(678), s(505)]
  );
  // Lower bowl: bottom-right → bottom-left
  const seg3 = sampleCubic(
    [s(678), s(505)], [s(678), s(635)], [s(346), s(655)], [s(346), s(775)]
  );

  const sw = s(52); // stroke radius

  for (const seg of [seg1, seg2, seg3]) {
    drawStroke(seg, sw + s(22), R, G, B, 35);  // outer glow
    drawStroke(seg, sw + s(10), R, G, B, 70);  // mid glow
    drawStroke(seg, sw,         R, G, B, 255); // solid
    drawStroke(seg, sw - s(18), 255, 235, 140, 180); // bright core
  }

  // ── Musical note extending from top of S ──────────────────────────────────
  // Stem: goes UP from the top-right end of S (~678, 195)
  const stemX = s(716), stemTopY = s(60), stemBotY = s(210);
  for (let y = stemTopY; y <= stemBotY; y++) {
    const hw = s(11);
    for (let dx = -hw; dx <= hw; dx++) {
      const aa = Math.max(0, 1 - Math.abs(dx) / (hw + 1));
      blendPixel(stemX + dx, y, R, G, B, 255 * aa | 0);
    }
  }

  // Note head (filled ellipse) at stem bottom, tilted
  fillEllipse(s(680), s(215), s(42), s(30), -Math.PI/6, R, G, B, 255);
  // Bright core of note head
  fillEllipse(s(680), s(215), s(30), s(20), -Math.PI/6, 255, 235, 140, 180);

  // Flag: cubic bezier curve from stem top going right then curling down
  const flagPts = sampleCubic(
    [stemX, stemTopY],
    [stemX + s(90), stemTopY + s(20)],
    [stemX + s(100), stemTopY + s(80)],
    [stemX + s(30), stemTopY + s(110)],
    300
  );
  drawStroke(flagPts, s(11), R, G, B, 255);
  drawStroke(flagPts, s(5),  255, 235, 140, 180);

  // ── Small decorative music dots (♪) in background ─────────────────────────
  const dotPositions = [
    [s(180), s(700), s(18)],
    [s(150), s(750), s(12)],
    [s(860), s(340), s(18)],
    [s(890), s(290), s(12)],
    [s(200), s(200), s(14)],
    [s(830), s(800), s(14)],
  ];
  for (const [x, y, r] of dotPositions) {
    fillCircle(x, y, r, R, G, B, 50);
  }

  return buf;
}

// ─── Splash drawing (just styled background + center dot) ─────────────────────
function drawSplash(W, H) {
  const c = makeCanvas(W, H, 10, 10, 10);
  const { buf, fillCircle, fillEllipse, sampleCubic, drawStroke, blendPixel } = c;
  const cx = W/2, cy = H/2;

  // Radial gradient glow
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - cx) / (W * 0.4);
      const dy = (y - cy) / (H * 0.25);
      const r2 = dx*dx + dy*dy;
      if (r2 < 1) {
        const strength = (1 - r2) * 0.5;
        const idx = (y * W + x) * 4;
        buf[idx]   = Math.min(255, buf[idx]   + strength * 10 | 0);
        buf[idx+1] = Math.min(255, buf[idx+1] + strength * 10 | 0);
        buf[idx+2] = Math.min(255, buf[idx+2] + strength * 50 | 0);
      }
    }
  }

  return buf;
}

// ─── Write files ─────────────────────────────────────────────────────────────
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

console.log('Generating icon.png (1024x1024)...');
const iconBuf = drawIcon(1024, 1024);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), encodePNG(1024, 1024, iconBuf));
console.log('✓ icon.png');

console.log('Generating adaptive-icon.png (1024x1024)...');
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), encodePNG(1024, 1024, iconBuf));
console.log('✓ adaptive-icon.png');

console.log('Generating splash.png (1284x2778)...');
const splashBuf = drawSplash(1284, 2778);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), encodePNG(1284, 2778, splashBuf));
console.log('✓ splash.png');

console.log('\nAll assets generated successfully.');
