import type { log } from 'console';
import express from 'express';
import { writeFileSync, readFileSync} from 'fs';
import multer from 'multer';

const app = express();
const PORT = 4555;

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static('public'));

const HEADER_SIZE = 44;

// bitflipper algorithm (default)
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

app.get('/glitch', (req, res) => {
    try {
        // approach 1: using local wav file
        const inputBuffer = readFileSync('./input.wav');
        const intensity = 0.005;
        // giltch the file
        const glitchedBuffer = glitchAudioBuffer(inputBuffer, intensity);
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', 'attachment; filename="glitched.wav"');
        res.send(glitchedBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Make sure the local file exists')
    }
});

app.listen(PORT, () => {
    console.log(`Audio server running on http://localhost:${PORT}`);
});
