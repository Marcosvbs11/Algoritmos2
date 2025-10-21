import express from 'express';
const next: Record<string, any>[] = [];
for (const base of combined) {
for (const rec of tbl.records) {
const merged = { ...base };
for (const f of tbl.schema.fields) merged[`${t}.${f}`] = rec[f];
next.push(merged);
}
}
combined = next;
}
// aplicar joins
const parsedJoins = (joins || []).map(j => {
const [L, R] = j.split('=').map(s => s.trim());
return [L, R];
});
const filtered = combined.filter(row => parsedJoins.every(([L, R]) => String(row[L]) === String(row[R])));


// projetar campos
const rows = filtered.map(r => {
const out: Record<string, any> = {};
for (const f of fields) out[f] = r[f];
return out;
});


res.json({ rows });
} catch (e) {
res.status(500).json({ error: String(e) });
}
});


// seed simples (apenas se pasta vazia)
function seedExample() {
const fs = require('fs');
const path = require('path');
const alunosPath = pathForTable('alunos');
if (fs.existsSync(alunosPath)) return;
const alunos = {
schema: { fields: ['id_aluno', 'nome', 'cpf'], pk: 'id_aluno', fks: {} },
records: [
{ id_aluno: 'A001', nome: 'Ana Silva', cpf: '111.111.111-11' },
{ id_aluno: 'A002', nome: 'Bruno Costa', cpf: '222.222.222-22' }
]
};
const cursos = {
schema: { fields: ['id_curso', 'nome_curso'], pk: 'id_curso', fks: {} },
records: [ { id_curso: 'C01', nome_curso: 'Redes' }, { id_curso: 'C02', nome_curso: 'SW' } ]
};
const matriculas = {
schema: { fields: ['id_mat','id_aluno','id_curso','semestre'], pk: 'id_mat', fks: { id_aluno:['alunos','id_aluno'], id_curso:['cursos','id_curso'] } },
records: [ { id_mat: 'M001', id_aluno:'A001', id_curso:'C01', semestre:'2025.1' } ]
};
saveJSON(alunosPath, alunos);
saveJSON(pathForTable('cursos'), cursos);
saveJSON(pathForTable('matriculas'), matriculas);
}


seedExample();


const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Server iniciado em http://localhost:${port}`));