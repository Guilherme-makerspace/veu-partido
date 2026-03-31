export const TILE_SIZE = 32;
export const SCREEN_W = 1280;
export const SCREEN_H = 720;
export const HALF_W = SCREEN_W / 2;
export const HALF_H = SCREEN_H / 2;

export const VESTIGIO_BASE = {
  fratura: 10,
  pulso: 100,
  eco: 50,
  veu: 5,
  limiar: 10,
};

export const CLASSES = {
  METAMORFO: 'metamorfo',
  DUELISTA: 'duelista',
  XAMA: 'xama',
  VORAZ: 'voraz',
};

export const CLASS_NAMES = {
  metamorfo: 'Dit',
  duelista: 'Dullant',
  xama: 'Sura',
  voraz: 'Dren',
};

export const CLASS_COLORS = {
  metamorfo: 0x3ec9a0,
  duelista: 0x5aaaee,
  xama: 0xc47afe,
  voraz: 0xe05c6a,
};

export const CLASS_DESC = {
  metamorfo: 'Absorve Essências de inimigos derrotados e combina traços passivos.',
  duelista: 'Cria armas com itens do chão. Sistema de crafting por qualidade de material.',
  xama: 'Lança Mantras que são maldições contra a realidade. Três caminhos.',
  voraz: 'Absorve maldições de inimigos. Acumula dano como Revenge Counter.',
};

export const MATERIAL_QUALITY = ['F', 'D', 'C', 'B', 'A', 'S'];

export const BIOMES = {
  CIDADE: 'cidade',
  FLORESTA: 'floresta',
  DUNGEON: 'dungeon',
  RUINAS: 'ruinas',
};

export const COLORS = {
  BG: 0x0d0c10,
  BG2: 0x13121a,
  BG3: 0x1b1926,
  SURFACE: 0x201e2e,
  BORDER: 0x2a2840,
  TEXT: 0xe8e4f0,
  MUTED: 0x8a86a0,
  ACCENT: 0x7c6af7,
  ACCENT2: 0xc47afe,
  RED: 0xe05c6a,
  AMBER: 0xe09a3a,
  TEAL: 0x3ec9a0,
  BLUE: 0x5aaaee,
  PINK: 0xe86aa8,
  GREEN: 0x6bcf8a,
  WHITE: 0xffffff,
};

export const ENEMY_TYPES = {
  FRAGMENTADO: 'fragmentado',
  CORROMPIDO: 'corrompido',
  ESPECTRO: 'espectro',
  GUARDIAO: 'guardiao',
  BOSS_VELDRIS: 'boss_veldris',
};

export const SNES_BUTTONS = {
  B: 0,
  Y: 1,
  SELECT: 2,
  START: 3,
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
  A: 0,
  X: 3,
  L: 4,
  R: 5,
};

export const KEYBOARD_P1 = {
  UP: 'W',
  DOWN: 'S',
  LEFT: 'A',
  RIGHT: 'D',
  ACTION: 'F',
  SKILL: 'G',
  MENU: 'TAB',
  CONFIRM: 'F',
  CANCEL: 'G',
};

export const KEYBOARD_P2 = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  ACTION: 'L',
  SKILL: 'K',
  MENU: 'SHIFT',
  CONFIRM: 'L',
  CANCEL: 'K',
};

export const MOVE_SPEED = 160;
export const BATTLE_TURN_DELAY = 600;
export const DIALOG_TYPEWRITER_SPEED = 30;
export const MAX_ESSENCE_SLOTS = 5;
export const MAX_CURSES = 3;
export const INVENTORY_SLOTS = 20;
export const INVENTORY_STACK = 5;
