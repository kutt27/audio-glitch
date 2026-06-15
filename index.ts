import type { log } from 'console';
import express from 'express';
import { writeFileSync, readFileSync} from 'fs';

const app = express();
const PORT = 4555;

// databending algorithm
function glitchAudioBuffer(inputBuffer: Buffer, errorRate: number = 0.01): Buffer {
    // create a copy of the original file
    const outputBuffer = Buffer.from(inputBuffer);

    // waf headers are present from 0 -> 44 bytes space
    const HEADER_SIZE = 44;
    for (let i = HEADER_SIZE; i < outputBuffer.length; i++) {
        if (Math.random() < errorRate) {
            // randomly flip individual bits using Bitwise xor
            const randomBitMask = 1 << Math.floor(Math.random() * 8);
            outputBuffer[i] = outputBuffer[i] ^ randomBitMask;
        }
    }
    return outputBuffer;
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
