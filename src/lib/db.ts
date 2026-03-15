import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

export function readData<T>(filename: string): T[] {
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) return [];
  const raw = readFileSync(filepath, 'utf-8');
  return JSON.parse(raw);
}

export function writeData<T>(filename: string, data: T[]): void {
  const filepath = join(DATA_DIR, filename);
  writeFileSync(filepath, JSON.stringify(data, null, 2));
}

export function readSingle<T>(filename: string): T | null {
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) return null;
  const raw = readFileSync(filepath, 'utf-8');
  return JSON.parse(raw);
}

export function writeSingle<T>(filename: string, data: T): void {
  const filepath = join(DATA_DIR, filename);
  writeFileSync(filepath, JSON.stringify(data, null, 2));
}
