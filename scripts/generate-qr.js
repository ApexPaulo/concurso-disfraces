import QRCode from 'qrcode';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getLocalWifiIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

export async function generateContestQr(port = 5173) {
  const ip = getLocalWifiIp();
  const url = `http://${ip}:${port}`;

  const rootQrPath = path.resolve(process.cwd(), 'qr-concurso.png');
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicQrPath = path.join(publicDir, 'qr-concurso.png');

  const qrOptions = {
    type: 'png',
    width: 800,
    margin: 2,
    color: {
      dark: '#120724', // Morado muy oscuro casi negro para máxima lectura en cámaras
      light: '#FFF7ED' // Fondo crema cálido claro para alto contraste
    },
    errorCorrectionLevel: 'H'
  };

  await QRCode.toFile(rootQrPath, url, qrOptions);
  await QRCode.toFile(publicQrPath, url, qrOptions);

  const terminalQr = await QRCode.toString(url, { type: 'terminal', small: true });

  console.log('\n🎃 ========================================================= 🎃');
  console.log(`   CÓDIGO QR GENERADO PARA EL CONCURSO DE DISFRACES`);
  console.log(`   🔗 URL Wi-Fi: ${url}`);
  console.log(`   Imagen guardada en: ${rootQrPath}`);
  console.log('🎃 ========================================================= 🎃\n');
  console.log(terminalQr);

  return { url, rootQrPath, publicQrPath };
}

// Permitir ejecutar el script directamente con: node scripts/generate-qr.js [puerto]
const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const customPort = Number(process.argv[2]) || 5173;
  generateContestQr(customPort).catch((err) => {
    console.error('Error al generar el QR:', err);
    process.exit(1);
  });
}
