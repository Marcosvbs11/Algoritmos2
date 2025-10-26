import express from "express";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());

// Caminho absoluto para a pasta "public"
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

// -------------------- Funções auxiliares --------------------
function pathForTable(name: string) {
  return path.join(__dirname, "data", `${name}.json`);
}

function saveJSON(filePath: string, data: any) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadJSON(filePath: string) {
  if (!fs.existsSync(filePath)) throw new Error(`Arquivo ${filePath} não encontrado`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// -------------------- Rotas CRUD --------------------
app.post("/create-table", (req, res) => {
  try {
    const { name, schema } = req.body;
    if (!name || !schema) throw new Error("Campos 'name' e 'schema' são obrigatórios");

    const filePath = pathForTable(name);
    if (fs.existsSync(filePath)) throw new Error(`Tabela ${name} já existe`);

    saveJSON(filePath, { schema, records: [] });
    res.json({ success: true, message: `Tabela '${name}' criada com sucesso!` });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/insert", (req, res) => {
  try {
    const { tableName, record } = req.body;
    if (!tableName || !record) throw new Error("Campos 'tableName' e 'record' são obrigatórios");

    const filePath = pathForTable(tableName);
    const table = loadJSON(filePath);
    table.records.push(record);
    saveJSON(filePath, table);

    res.json({ success: true, message: "Registro inserido com sucesso!" });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/select", (req, res) => {
  try {
    const { tableName, fields, joinTableName, joinKey } = req.body;
    if (!tableName || !fields) throw new Error("Campos 'tableName' e 'fields' são obrigatórios");

    const mainTable = loadJSON(pathForTable(tableName));
    let result = mainTable.records.map((r: Record<string, any>) => {
      const out: Record<string, any> = {};
      for (const f of fields) out[f] = r[f];
      return out;
    });

    // Caso tenha JOIN
    if (joinTableName && joinKey) {
      const joinTable = loadJSON(pathForTable(joinTableName));
      result = result.map((r: Record<string, any>) => {
        const joinRow = joinTable.records.find(
          (jr: any) => String(jr[joinKey[1]]) === String(r[joinKey[0]])
        );
        return { ...r, ...joinRow };
      });
    }

    res.json({ rows: result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// -------------------- Dados iniciais (seed) --------------------
function seedExample() {
  const alunosPath = pathForTable("alunos");
  if (fs.existsSync(alunosPath)) return;

  const alunos = {
    schema: { fields: ["id_aluno", "nome", "cpf"], pk: "id_aluno", fks: {} },
    records: [
      { id_aluno: "A001", nome: "Ana Silva", cpf: "111.111.111-11" },
      { id_aluno: "A002", nome: "Bruno Costa", cpf: "222.222.222-22" },
    ],
  };

  const cursos = {
    schema: { fields: ["id_curso", "nome_curso"], pk: "id_curso", fks: {} },
    records: [
      { id_curso: "C01", nome_curso: "Redes" },
      { id_curso: "C02", nome_curso: "Software" },
    ],
  };

  const matriculas = {
    schema: {
      fields: ["id_mat", "id_aluno", "id_curso", "semestre"],
      pk: "id_mat",
      fks: {
        id_aluno: ["alunos", "id_aluno"],
        id_curso: ["cursos", "id_curso"],
      },
    },
    records: [{ id_mat: "M001", id_aluno: "A001", id_curso: "C01", semestre: "2025.1" }],
  };

  saveJSON(alunosPath, alunos);
  saveJSON(pathForTable("cursos"), cursos);
  saveJSON(pathForTable("matriculas"), matriculas);
}

seedExample();

// -------------------- Inicialização --------------------
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${port}`);
  console.log("🌱 Tabelas iniciais criadas em ./data/");
});
