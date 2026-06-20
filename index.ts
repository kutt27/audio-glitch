import express from 'express';
import multer from 'multer';
import path from 'path';

const app = express();
const PORT = 3000;

// Configure multer to store files in memory as Buffers
const upload = multer({ storage: multer.memoryStorage() });

// Serve static frontend files from a 'public' directory
app.use(express.static('public'));

const HEADER_SIZE = 44; // Skip WAV header

// Bit Flipper
function bitFlipper(buffer: Buffer, intensity: number): Buffer {
  const out = Buffer.from(buffer);
  for (let i = HEADER_SIZE; i < out.length; i++) {
    if (Math.random() < intensity) {
      const randomBitMask = 1 << Math.floor(Math.random() * 8);
      out[i] = out[i] ^ randomBitMask;
    }
  }
  return out;
}

// Bit Crusher - Trims the resolution down for a retro 8-bit sound
function bitCrusher(buffer: Buffer, intensity: number): Buffer {
  const out = Buffer.from(buffer);
  // Scale mask based on intensity (0 to 1). Higher intensity = more bits crushed.
  const shift = Math.floor(intensity * 7) + 1;
  const mask = 0xFF << shift;

  for (let i = HEADER_SIZE; i < out.length; i++) {
    out[i] = out[i] & mask;
  }
  return out;
}

// Stutter / Repeat - Repeats tiny blocks of audio data
function stutterEffect(buffer: Buffer, intensity: number): Buffer {
  const out = Buffer.from(buffer);
  // Intensity dictates how frequently chunks repeat
  const chunkLength = 1000;

  for (let i = HEADER_SIZE; i < out.length - chunkLength; i += chunkLength) {
    if (Math.random() < intensity) {
      // Grab a chunk and repeat it over the next block
      out.copy(out, i + chunkLength, i, i + chunkLength);
    }
  }
  return out;
}

// --- ROUTE ---
app.post('/process-audio', upload.single('audiofile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const inputBuffer = req.file.buffer;
    const algo = req.body.algorithm;
    const intensity = parseFloat(req.body.intensity) || 0.01;

    let outputBuffer: Buffer;

    // Route to selected algorithm
    switch (algo) {
      case 'crusher':
        outputBuffer = bitCrusher(inputBuffer, intensity);
        break;
      case 'stutter':
        outputBuffer = stutterEffect(inputBuffer, intensity);
        break;
      case 'flipper':
      default:
        outputBuffer = bitFlipper(inputBuffer, intensity);
        break;
    }

    // Return the glitched buffer directly back to the browser
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', `attachment; filename="glitched_${algo}.wav"`);
    res.send(outputBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing the audio.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
