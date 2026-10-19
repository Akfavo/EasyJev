import { describe, it, expect } from 'vitest';
import {
  getStoredApiKey,
  setStoredApiKey,
  removeStoredApiKey,
  CLAUDE_KEY_STORAGE_KEY,
} from '@/lib/key-storage';

// Simulation en mémoire de l'interface Storage
class MockStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

// Simulation d'un stockage qui lève des exceptions (navigation privée stricte / quotas)
class ThrowingStorage implements Storage {
  get length(): number {
    throw new Error('SecurityError: Access denied');
  }

  clear(): void {
    throw new Error('SecurityError: Access denied');
  }

  getItem(): string | null {
    throw new Error('SecurityError: Access denied');
  }

  key(): string | null {
    throw new Error('SecurityError: Access denied');
  }

  removeItem(): void {
    throw new Error('SecurityError: Access denied');
  }

  setItem(): void {
    throw new Error('SecurityError: Access denied');
  }
}

describe('key-storage', () => {
  it('enregistre, lit et supprime une clé avec un Storage fonctionnel', () => {
    const storage = new MockStorage();

    // Absent au départ
    expect(getStoredApiKey(storage)).toBeNull();

    // Enregistrement
    const saved = setStoredApiKey('sk-ant-test-key-12345', storage);
    expect(saved).toBe(true);
    expect(storage.getItem(CLAUDE_KEY_STORAGE_KEY)).toBe('sk-ant-test-key-12345');

    // Lecture
    expect(getStoredApiKey(storage)).toBe('sk-ant-test-key-12345');

    // Suppression
    const removed = removeStoredApiKey(storage);
    expect(removed).toBe(true);
    expect(getStoredApiKey(storage)).toBeNull();
  });

  it('gère gracieusement un Storage qui lève des exceptions sans planter', () => {
    const throwingStorage = new ThrowingStorage();

    // Lecture protégée
    expect(getStoredApiKey(throwingStorage)).toBeNull();

    // Écriture protégée
    expect(setStoredApiKey('sk-ant-test-key', throwingStorage)).toBe(false);

    // Suppression protégée
    expect(removeStoredApiKey(throwingStorage)).toBe(false);
  });

  it('gère un storage indéfini (ex. environnement serveur SSR)', () => {
    expect(getStoredApiKey(undefined)).toBeNull();
    expect(setStoredApiKey('sk-ant-test-key', undefined)).toBe(false);
    expect(removeStoredApiKey(undefined)).toBe(false);
  });
});
