import type { EventEmitter } from 'events';

export interface InteractionEvent {
  type: 'lesson' | 'quest' | 'minigame';
  id: string;
  worldState?: string;
}

/** Simple typed event bus shared between Phaser and React */
export class GameEventBus {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }

  on(event: string, fn: (data: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
  }

  off(event: string, fn: (data: any) => void) {
    this.listeners.get(event)?.delete(fn);
  }
}

export const eventBus = new GameEventBus();
