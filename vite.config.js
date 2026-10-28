import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { generateContestQr } from './scripts/generate-qr.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
const DB_FILE = path.join(DATA_DIR, 'contest.json');
const ADMIN_TOKEN = 'papupass-admin-session-token-2026';

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function loadDb() {
  ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      revealed: false,
      participants: [],
      votesByVoter: {} // { [voterId]: participantId }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return { revealed: false, participants: [], votesByVoter: {} };
  }
}

function saveDb(db) {
  ensureDirs();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function getLocalIp() {
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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error('Imagen demasiado grande (máx 25MB)'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function buildStateResponse(db, { isAdmin, voterId }) {
  const voteCounts = {};
  for (const p of db.participants) {
    voteCounts[p.id] = 0;
  }
  for (const pid of Object.values(db.votesByVoter || {})) {
    if (voteCounts[pid] !== undefined) {
      voteCounts[pid] += 1;
    }
  }

  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);
  const canSeeVotes = Boolean(isAdmin || db.revealed);

  // Calculate winner(s) automatically
  let maxVotes = 0;
  for (const count of Object.values(voteCounts)) {
    if (count > maxVotes) maxVotes = count;
  }

  const winners =
    canSeeVotes && maxVotes > 0
      ? db.participants
          .filter((p) => voteCounts[p.id] === maxVotes)
          .map((p) => ({
            ...p,
            votes: voteCounts[p.id],
            percentage: totalVotes > 0 ? Math.round((voteCounts[p.id] / totalVotes) * 100) : 0
          }))
      : [];

  const participants = db.participants.map((p) => {
    const count = voteCounts[p.id] || 0;
    return {
      id: p.id,
      name: p.name,
      costume: p.costume || '',
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      votes: canSeeVotes ? count : null,
      percentage: canSeeVotes && totalVotes > 0 ? Math.round((count / totalVotes) * 100) : null,
      isWinner: canSeeVotes && maxVotes > 0 && count === maxVotes
    };
  });

  return {
    revealed: Boolean(db.revealed),
    totalVotes: canSeeVotes ? totalVotes : null,
    totalParticipants: db.participants.length,
    myVote: voterId && db.votesByVoter ? db.votesByVoter[voterId] || null : null,
    participants,
    winners,
    localIp: getLocalIp()
  };
}

function contestApiPlugin() {
  return {
    name: 'contest-api-plugin',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const addr = server.httpServer.address();
        const actualPort = typeof addr === 'object' && addr ? addr.port : 5173;
        generateContestQr(actualPort).catch((err) => {
          console.error('No se pudo generar el QR automáticamente:', err);
        });
      });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;
        const authHeader = req.headers['x-admin-token'] || urlObj.searchParams.get('adminToken');
        const isAdmin = authHeader === ADMIN_TOKEN;

        try {
          // GET /api/state
          if (req.method === 'GET' && pathname === '/api/state') {
            const voterId = urlObj.searchParams.get('voterId') || '';
            const db = loadDb();
            return sendJson(res, 200, buildStateResponse(db, { isAdmin, voterId }));
          }

          // POST /api/admin/login
          if (req.method === 'POST' && pathname === '/api/admin/login') {
            const body = await readJsonBody(req);
            const username = (body.username || '').trim().toLowerCase();
            const password = body.password || '';
            if (username === 'admin' && password === 'papupass') {
              return sendJson(res, 200, { ok: true, token: ADMIN_TOKEN });
            }
            return sendJson(res, 401, {
              ok: false,
              error: 'Credenciales incorrectas. Usa el usuario "admin" y la contraseña correcta.'
            });
          }

          // POST /api/admin/participants
          if (req.method === 'POST' && pathname === '/api/admin/participants') {
            if (!isAdmin) {
              return sendJson(res, 403, { error: 'No autorizado' });
            }
            const body = await readJsonBody(req);
            const name = (body.name || '').trim();
            const costume = (body.costume || '').trim();
            const imageData = body.imageData || '';

            if (!name || !imageData) {
              return sendJson(res, 400, { error: 'El nombre y la imagen del disfraz son obligatorios.' });
            }

            ensureDirs();
            const id = crypto.randomUUID();
            let imageUrl = imageData;

            const match = imageData.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
            if (match) {
              const extRaw = match[1].toLowerCase();
              const ext = extRaw === 'jpeg' ? 'jpg' : extRaw.replace(/[^a-z0-9]/g, '') || 'png';
              const buffer = Buffer.from(match[2], 'base64');
              const filename = `${id}.${ext}`;
              fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
              imageUrl = `/uploads/${filename}`;
            }

            const db = loadDb();
            db.participants.push({
              id,
              name,
              costume,
              imageUrl,
              createdAt: new Date().toISOString()
            });
            saveDb(db);

            return sendJson(res, 200, buildStateResponse(db, { isAdmin: true, voterId: '' }));
          }

          // DELETE /api/admin/participants/:id
          if (req.method === 'DELETE' && pathname.startsWith('/api/admin/participants/')) {
            if (!isAdmin) {
              return sendJson(res, 403, { error: 'No autorizado' });
            }
            const participantId = pathname.replace('/api/admin/participants/', '').trim();
            const db = loadDb();
            const target = db.participants.find((p) => p.id === participantId);
            if (target && target.imageUrl && target.imageUrl.startsWith('/uploads/')) {
              const filePath = path.join(process.cwd(), 'public', target.imageUrl);
              if (fs.existsSync(filePath)) {
                try {
                  fs.unlinkSync(filePath);
                } catch {}
              }
            }
            db.participants = db.participants.filter((p) => p.id !== participantId);
            for (const [voter, votedPid] of Object.entries(db.votesByVoter || {})) {
              if (votedPid === participantId) {
                delete db.votesByVoter[voter];
              }
            }
            saveDb(db);
            return sendJson(res, 200, buildStateResponse(db, { isAdmin: true, voterId: '' }));
          }

          // POST /api/vote
          if (req.method === 'POST' && pathname === '/api/vote') {
            const body = await readJsonBody(req);
            const voterId = (body.voterId || '').trim();
            const participantId = (body.participantId || '').trim();

            if (!voterId || !participantId) {
              return sendJson(res, 400, { error: 'Datos de voto incompletos.' });
            }

            const db = loadDb();
            if (db.revealed) {
              return sendJson(res, 400, { error: 'La votación ya ha finalizado y los resultados fueron revelados.' });
            }
            if (db.votesByVoter[voterId]) {
              return sendJson(res, 400, { error: 'Ya has emitido tu voto en este concurso.' });
            }
            const exists = db.participants.some((p) => p.id === participantId);
            if (!exists) {
              return sendJson(res, 404, { error: 'El participante seleccionado no existe.' });
            }

            db.votesByVoter[voterId] = participantId;
            saveDb(db);
            return sendJson(res, 200, buildStateResponse(db, { isAdmin, voterId }));
          }

          // POST /api/admin/reveal
          if (req.method === 'POST' && pathname === '/api/admin/reveal') {
            if (!isAdmin) {
              return sendJson(res, 403, { error: 'No autorizado' });
            }
            const body = await readJsonBody(req);
            const db = loadDb();
            db.revealed = Boolean(body.revealed);
            saveDb(db);
            return sendJson(res, 200, buildStateResponse(db, { isAdmin: true, voterId: '' }));
          }

          // POST /api/admin/reset-votes
          if (req.method === 'POST' && pathname === '/api/admin/reset-votes') {
            if (!isAdmin) {
              return sendJson(res, 403, { error: 'No autorizado' });
            }
            const db = loadDb();
            db.votesByVoter = {};
            db.revealed = false;
            saveDb(db);
            return sendJson(res, 200, buildStateResponse(db, { isAdmin: true, voterId: '' }));
          }

          return sendJson(res, 404, { error: 'Endpoint no encontrado' });
        } catch (err) {
          return sendJson(res, 500, { error: err.message || 'Error interno del servidor' });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), contestApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
