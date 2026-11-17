import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import type {
  AppTabMode,
  ClientWsMessage,
  RoomChatEntry,
  RoomPeer,
  RoomRaceState,
  RoomSnapshot,
  ServerWsMessage,
  SyncedLabState,
} from './src/shared/protocol';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

interface ServerPeer extends RoomPeer {
  ws: WebSocket;
}

interface ServerRoom {
  roomCode: string;
  peers: Map<string, ServerPeer>;
  race: RoomRaceState | null;
  lab: SyncedLabState | null;
  flashcardIndex: number | null;
  chat: RoomChatEntry[];
}

const rooms = new Map<string, ServerRoom>();

function sanitizeRoomCode(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 2);
  return digits ? digits.padStart(2, '0') : '42';
}

function sanitizeCallsign(raw: string): string {
  const clean = String(raw || '').trim().slice(0, 18);
  return clean || 'Explorer';
}

function getOrCreateRoom(roomCode: string): ServerRoom {
  const code = sanitizeRoomCode(roomCode);
  let room = rooms.get(code);
  if (!room) {
    room = {
      roomCode: code,
      peers: new Map(),
      race: null,
      lab: null,
      flashcardIndex: null,
      chat: [],
    };
    rooms.set(code, room);
  }
  return room;
}

function toSnapshot(room: ServerRoom): RoomSnapshot {
  return {
    roomCode: room.roomCode,
    peers: Array.from(room.peers.values()).map(({ ws: _ws, ...peer }) => peer),
    race: room.race,
    lab: room.lab,
    flashcardIndex: room.flashcardIndex,
    chat: room.chat.slice(-25),
  };
}

function sendWs(ws: WebSocket, msg: ServerWsMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcastRoom(room: ServerRoom, msg: ServerWsMessage, excludePeerId?: string): void {
  const payload = JSON.stringify(msg);
  for (const [id, peer] of room.peers.entries()) {
    if (excludePeerId && id === excludePeerId) continue;
    if (peer.ws.readyState === WebSocket.OPEN) {
      peer.ws.send(payload);
    }
  }
}

function appendRoomChat(room: ServerRoom, senderId: string, callsign: string, text: string): void {
  const clean = String(text || '').trim().slice(0, 140);
  if (!clean) return;
  room.chat.push({
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    senderId,
    callsign,
    text: clean,
    timestamp: Date.now(),
  });
  if (room.chat.length > 30) {
    room.chat = room.chat.slice(-30);
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, activeRooms: rooms.size });
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    let currentPeerId: string | null = null;
    let currentRoom: ServerRoom | null = null;

    const leaveCurrentRoom = () => {
      if (!currentRoom || !currentPeerId) return;
      const peer = currentRoom.peers.get(currentPeerId);
      currentRoom.peers.delete(currentPeerId);

      if (currentRoom.peers.size === 0) {
        rooms.delete(currentRoom.roomCode);
      } else {
        const hasHost = Array.from(currentRoom.peers.values()).some((p) => p.isHost);
        if (!hasHost) {
          const nextHost = currentRoom.peers.values().next().value;
          if (nextHost) nextHost.isHost = true;
        }
        if (peer) {
          appendRoomChat(currentRoom, 'system', 'Room', `${peer.callsign} left Room ${currentRoom.roomCode}.`);
        }
        broadcastRoom(currentRoom, { type: 'room:state', snapshot: toSnapshot(currentRoom) });
      }
      currentRoom = null;
      currentPeerId = null;
    };

    ws.on('message', (raw) => {
      let msg: ClientWsMessage;
      try {
        msg = JSON.parse(String(raw)) as ClientWsMessage;
      } catch {
        sendWs(ws, { type: 'room:error', message: 'Invalid WebSocket payload.' });
        return;
      }

      if (msg.type === 'room:join') {
        leaveCurrentRoom();
        const room = getOrCreateRoom(msg.roomCode);
        const peerId = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        const callsign = sanitizeCallsign(msg.callsign);
        const isHost = room.peers.size === 0;

        const newPeer: ServerPeer = {
          id: peerId,
          callsign,
          isHost,
          activeTab: msg.activeTab || 'labs',
          quizScore: 0,
          quizAnswered: 0,
          quizTotal: 0,
          quizFinished: false,
          quizFinishedAt: null,
          challengeScore: 0,
          streak: 0,
          ws,
        };

        room.peers.set(peerId, newPeer);
        currentPeerId = peerId;
        currentRoom = room;

        appendRoomChat(room, 'system', 'Room', `${callsign} joined Room ${room.roomCode}.`);
        const snapshot = toSnapshot(room);
        sendWs(ws, { type: 'room:joined', peerId, snapshot });
        broadcastRoom(room, { type: 'room:state', snapshot }, peerId);
        return;
      }

      if (!currentRoom || !currentPeerId) return;
      const self = currentRoom.peers.get(currentPeerId);
      if (!self) return;

      switch (msg.type) {
        case 'room:leave': {
          leaveCurrentRoom();
          break;
        }
        case 'peer:tab': {
          self.activeTab = msg.activeTab as AppTabMode;
          broadcastRoom(currentRoom, { type: 'room:state', snapshot: toSnapshot(currentRoom) });
          break;
        }
        case 'lab:sync': {
          currentRoom.lab = msg.lab;
          broadcastRoom(
            currentRoom,
            { type: 'lab:updated', senderId: self.id, senderName: self.callsign, lab: msg.lab },
            self.id
          );
          break;
        }
        case 'flashcard:sync': {
          currentRoom.flashcardIndex = msg.cardIndex;
          broadcastRoom(
            currentRoom,
            { type: 'flashcard:updated', senderId: self.id, senderName: self.callsign, cardIndex: msg.cardIndex },
            self.id
          );
          break;
        }
        case 'race:start': {
          const race: RoomRaceState = {
            raceId: `race_${Date.now()}`,
            title: msg.title,
            questionIds: msg.questionIds,
            startedBy: self.callsign,
            startedAt: Date.now(),
            timedSeconds: msg.timedSeconds,
            active: true,
          };
          currentRoom.race = race;
          for (const peer of currentRoom.peers.values()) {
            peer.quizScore = 0;
            peer.quizAnswered = 0;
            peer.quizTotal = msg.questionIds.length;
            peer.quizFinished = false;
            peer.quizFinishedAt = null;
            peer.streak = 0;
          }
          appendRoomChat(
            currentRoom,
            'system',
            'Race',
            `${self.callsign} launched "${msg.title}" (${msg.questionIds.length} Qs).`
          );
          broadcastRoom(currentRoom, {
            type: 'race:started',
            race,
            snapshot: toSnapshot(currentRoom),
          });
          break;
        }
        case 'race:progress': {
          self.quizScore = msg.score;
          self.quizAnswered = msg.answered;
          self.quizTotal = msg.total;
          self.streak = msg.streak;
          self.quizFinished = msg.finished;
          if (msg.finished && !self.quizFinishedAt) {
            self.quizFinishedAt = Date.now();
            appendRoomChat(
              currentRoom,
              'system',
              'Race',
              `${self.callsign} finished with ${msg.score}/${msg.total}!`
            );
          }
          broadcastRoom(currentRoom, { type: 'room:state', snapshot: toSnapshot(currentRoom) });
          break;
        }
        case 'challenge:score': {
          self.challengeScore = msg.challengeScore;
          appendRoomChat(
            currentRoom,
            'system',
            'Challenge',
            `${self.callsign} scored ${msg.challengeScore} on ${msg.label}.`
          );
          broadcastRoom(currentRoom, { type: 'room:state', snapshot: toSnapshot(currentRoom) });
          break;
        }
        case 'room:chat': {
          appendRoomChat(currentRoom, self.id, self.callsign, msg.text);
          broadcastRoom(currentRoom, { type: 'room:state', snapshot: toSnapshot(currentRoom) });
          break;
        }
      }
    });

    ws.on('close', () => {
      leaveCurrentRoom();
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Light, Refraction & Colour AFL Studio running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
