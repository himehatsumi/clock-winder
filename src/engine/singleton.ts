import { AudioController } from './audio';
import { GameEngine } from './GameEngine';

export const engine = new GameEngine();
export const audio = new AudioController(engine);
