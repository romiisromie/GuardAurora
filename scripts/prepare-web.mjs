import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const projectRoot = process.cwd();
const qrPage = resolve(projectRoot, 'public-qr', 'index.html');
const emergencyPage = resolve(projectRoot, 'public', 'emergency', 'index.html');

await mkdir(dirname(emergencyPage), { recursive: true });
await copyFile(qrPage, emergencyPage);
console.log('Copied the QR emergency page to public/emergency for the web export.');
