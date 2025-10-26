import fs from "fs";
import path from "path";
import { TableData, TableSchema } from "./types";

const dataDir = path.join(__dirname, "data");

function ensureDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function pathForTable(name: string) {
  return path.join(dataDir, `${name}.json`);
}

export function tableExists(name: string): boolean {
  return fs.existsSync(pathForTable(name));
}

export function saveTable(name: string, data: TableData) {
  ensureDir();
  fs.writeFileSync(pathForTable(name), JSON.stringify(data, null, 2));
}

export function loadTable(name: string): TableData {
  const filePath = pathForTable(name);
  if (!fs.existsSync(filePath)) throw new Error(`Tabela ${name} não existe`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function createTable(name: string, schema: TableSchema) {
  if (tableExists(name)) throw new Error(`Tabela ${name} já existe`);
  saveTable(name, { schema, records: [] });
}

export function insertRecord(name: string, record: Record<string, any>) {
  const table = loadTable(name);
  table.records.push(record);
  saveTable(name, table);
}

export function selectRecords(
  tableName: string,
  fields: string[],
  joinTableName?: string,
  joinKey?: [string, string]
) {
  const main = loadTable(tableName);
  let result = main.records.map((r) => {
    const out: Record<string, any> = {};
    for (const f of fields) out[f] = r[f];
    return out;
  });

  if (joinTableName && joinKey) {
    const joinTable = loadTable(joinTableName);
    result = result.map((r) => {
      const joinRow = joinTable.records.find(
        (jr) => String(jr[joinKey[1]]) === String(r[joinKey[0]])
      );
      return { ...r, ...joinRow };
    });
  }

  return result;
}
