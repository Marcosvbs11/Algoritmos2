const listaTabelas = document.getElementById("listaTabelas");
const btnAnalisar = document.getElementById("btnAnalisarLateral");
const resultArea = document.getElementById("tableContainer");
const emptyHint = document.getElementById("emptyHint");
const selectedName = document.getElementById("selectedName");
const jsonPreview = document.getElementById("jsonPreview");

let tabelaSelecionada = null;

// --- Listar tabelas ---
async function carregarTabelas() {
  listaTabelas.innerHTML = "";
  const res = await fetch("/api/tables");
  const tabelas = await res.json();

  tabelas.forEach(t => {
    const div = document.createElement("div");
    div.classList.add("table-item");
    div.innerText = t;
    div.onclick = () => {
      document.querySelectorAll(".table-item").forEach(el => el.classList.remove("active"));
      div.classList.add("active");
      tabelaSelecionada = t;
      selectedName.innerText = t;
    };
    listaTabelas.appendChild(div);
  });
}

// --- Criar tabela ---
async function criarTabela() {
  const name = prompt("Nome da tabela:");
  if (!name) return alert("Nome inválido");
  const cols = prompt("Colunas separadas por vírgula (ex: id,nome,email):");
  if (!cols) return alert("Colunas inválidas");

  const columns = cols.split(",").map(c => c.trim());
  const res = await fetch("/api/tables", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, columns }),
  });

  const data = await res.json();
  alert(data.message || data.error);
  carregarTabelas();
}

// --- Analisar tabela ---
async function analisarTabela() {
  if (!tabelaSelecionada) return alert("Selecione uma tabela");

  const res = await fetch(`/api/tables/${tabelaSelecionada}`);
  if (!res.ok) return alert("Erro ao carregar tabela");

  const table = await res.json();
  mostrarTabela(table);
}

// --- Mostrar tabela na tela ---
function mostrarTabela(table) {
  emptyHint.style.display = "none";
  resultArea.style.display = "block";

  let html = "<table><tr>";
  table.columns.forEach(c => html += `<th>${c}</th>`);
  html += "</tr>";

  table.records.forEach(r => {
    html += "<tr>";
    table.columns.forEach(c => html += `<td>${r[c] || ""}</td>`);
    html += "</tr>";
  });

  html += "</table>";
  resultArea.innerHTML = html;
  jsonPreview.innerText = JSON.stringify(table, null, 2);
}

// --- Botões ---
document.getElementById("btnAnalisarLateral").onclick = analisarTabela;

// Criar tabela com clique direito ou outro botão
const btnCriar = document.createElement("button");
btnCriar.innerText = "Criar Tabela";
btnCriar.classList.add("btn", "btn-analise");
btnCriar.onclick = criarTabela;
document.querySelector(".controls").appendChild(btnCriar);

// --- Inicial ---
carregarTabelas();
