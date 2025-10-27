const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
function tablePath(name) {
  return path.join(dataDir, `${name}.json`);
}

function loadTable(name) {
  const file = tablePath(name);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveTable(name, table) {
  fs.writeFileSync(tablePath(name), JSON.stringify(table, null, 2), "utf8");
}
app.get("/api/tables", (req, res) => {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));
  res.json(files.map(f => f.replace(".json", "")));
});
app.post("/api/tables", (req, res) => {
  const { name, columns } = req.body;
  if (!name || !columns || columns.length === 0) {
    return res.status(400).json({ error: "Dados inválidos" });
  }
  if (fs.existsSync(tablePath(name))) {
    return res.status(400).json({ error: "Tabela já existe" });
  }
  const table = { name, columns, records: [] };
  saveTable(name, table);
  res.json({ success: true, message: `Tabela '${name}' criada com sucesso!` });
});
app.post("/api/tables/:name/records", (req, res) => {
  const { name } = req.params;
  const table = loadTable(name);
  if (!table) return res.status(404).json({ error: "Tabela não encontrada" });

  table.records.push(req.body);
  saveTable(name, table);
  res.json({ success: true, message: "Registro adicionado com sucesso!" });
});
app.get("/api/tables/:name", (req, res) => {
  const { name } = req.params;
  const table = loadTable(name);
  if (!table) return res.status(404).json({ error: "Tabela não encontrada" });
  res.json(table);
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});