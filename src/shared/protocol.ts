export type AppTabMode = 'labs' | 'flashcards' | 'challenges' | 'quiz';

export type RefLabMode = 'boundary' | 'lens';
export type LensKind = 'convex' | 'concave';
export type BoundaryPresetId =
  | 'air-glass'
  | 'glass-air'
  | 'air-water'
  | 'water-air'
  | 'water-glass'
  | 'glass-diamond';

export type ColorLabMode = 'prism' | 'rgb' | 'filter';
export type PrismBeamType = 'white' | 'red' | 'green' | 'violet';
export type FilterChoice = 'none' | 'red' | 'green' | 'blue' | 'magenta' | 'yellow' | 'cyan';

export interface SyncedLabState {
  refLabMode: RefLabMode;
  lensKind: LensKind;
  boundaryPreset: BoundaryPresetId;
  incAngle: number;
  showWavefronts: boolean;
  lensFocal: number;
  colorLabMode: ColorLabMode;
  prismBeam: PrismBeamType;
  rgbR: boolean;
  rgbG: boolean;
  rgbB: boolean;
  filter1: FilterChoice;
  filter2: FilterChoice;
}

export interface RoomPeer {
  id: string;
  callsign: string;
  isHost: boolean;
  activeTab: AppTabMode;
  quizScore: number;
  quizAnswered: number;
  quizTotal: number;
  quizFinished: boolean;
  quizFinishedAt: number | null;
  challengeScore: number;
  streak: number;
}

export interface RoomRaceState {
  raceId: string;
  title: string;
  questionIds: string[];
  startedBy: string;
  startedAt: number;
  timedSeconds: number | null;
  active: boolean;
}

export interface RoomChatEntry {
  id: string;
  senderId: string;
  callsign: string;
  text: string;
  timestamp: number;
}

export interface RoomSnapshot {
  roomCode: string;
  peers: RoomPeer[];
  race: RoomRaceState | null;
  lab: SyncedLabState | null;
  flashcardIndex: number | null;
  chat: RoomChatEntry[];
}

export type ClientWsMessage =
  | { type: 'room:join'; roomCode: string; callsign: string; activeTab: AppTabMode }
  | { type: 'room:leave' }
  | { type: 'peer:tab'; activeTab: AppTabMode }
  | { type: 'lab:sync'; lab: SyncedLabState }
  | { type: 'flashcard:sync'; cardIndex: number }
  | { type: 'race:start'; title: string; questionIds: string[]; timedSeconds: number | null }
  | { type: 'race:progress'; score: number; answered: number; total: number; streak: number; finished: boolean }
  | { type: 'challenge:score'; challengeScore: number; label: string }
  | { type: 'room:chat'; text: string };

export type ServerWsMessage =
  | { type: 'room:joined'; peerId: string; snapshot: RoomSnapshot }
  | { type: 'room:state'; snapshot: RoomSnapshot }
  | { type: 'lab:updated'; senderId: string; senderName: string; lab: SyncedLabState }
  | { type: 'flashcard:updated'; senderId: string; senderName: string; cardIndex: number }
  | { type: 'race:started'; race: RoomRaceState; snapshot: RoomSnapshot }
  | { type: 'room:notice'; text: string }
  | { type: 'room:error'; message: string };
