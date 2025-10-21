import { pathForTable, saveJSON, loadJSON } from './utils';


export type Schema = {
fields: string[];
pk: string;
fks: Record<string, [string, string]>; // campo -> [tabela, campoRef]
};


export type RecordRow = Record<string, any>;


export class Table {
name: string;
schema: Schema;
records: RecordRow[];


constructor(name: string, schema: Schema, records: RecordRow[] = []) {
this.name = name;
this.schema = schema;
this.records = records;
}


save() {
saveJSON(pathForTable(this.name), { schema: this.schema, records: this.records });
}


static load(name: string): Table {
const p = pathForTable(name);
if (!require('fs').existsSync(p)) throw new Error(`Tabela ${name} não encontrada`);
const data = loadJSON(p);
return new Table(name, data.schema as Schema, data.records || []);
}


static exists(name: string) {
return require('fs').existsSync(pathForTable(name));
}


insert(record: RecordRow, loadTable: (n: string) => Table) {
// valida PK
const pk = this.schema.pk;
if (this.records.some(r => String(r[pk]) === String(record[pk]))) {
throw new Error(`Violação de PK: valor ${record[pk]} já existe em ${this.name}`);
}


// validar FKs
for (const [fkField, [refTable, refField]] of Object.entries(this.schema.fks)) {
const val = record[fkField];
const refT = loadTable(refTable);
const found = refT.records.some(r => String(r[refField]) === String(val));
if (!found) throw new Error(`Violação de FK: ${val} não encontrado em ${refTable}.${refField}`);
}


this.records.push(record);
this.save();
}
}