import fs from 'fs';
import path from 'path';


export const DATA_DIR = path.resolve(process.cwd(), 'data');


export function ensureDataDir() {
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}


export function pathForTable(name: string) {
return path.join(DATA_DIR, `${name}.json`);
}


export function saveJSON(filePath: string, data: any) {
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


export function loadJSON(filePath: string) {
return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}


export function listTables(): string[] {
ensureDataDir();
return fs.readdirSync(DATA_DIR)
.filter(f => f.endsWith('.json'))
.map(f => f.replace(/\.json$/i, ''));
}