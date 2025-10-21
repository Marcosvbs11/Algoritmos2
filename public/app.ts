type Schema = { fields: string[]; pk: string; fks: Record<string, string>; };
type RecordType = Record<string, string | number>;

document.getElementById('createTableBtn')!.addEventListener('click', async () => {
  const name = (document.getElementById('tableName') as HTMLInputElement).value;
  const schemaText = (document.getElementById('schema') as HTMLTextAreaElement).value;
  const schema: Schema = JSON.parse(schemaText);
  await fetch('/create-table', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, schema })
  });
  alert('Tabela criada com sucesso!');
});

document.getElementById('insertBtn')!.addEventListener('click', async () => {
  const tableName = (document.getElementById('insertTable') as HTMLInputElement).value;
  const recordText = (document.getElementById('record') as HTMLTextAreaElement).value;
  const record: RecordType = JSON.parse(recordText);
  await fetch('/insert', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableName, record })
  });
  alert('Registro inserido!');
});

document.getElementById('selectBtn')!.addEventListener('click', async () => {
  const tableName = (document.getElementById('selectTable') as HTMLInputElement).value;
  const fields = (document.getElementById('fields') as HTMLInputElement).value.split(',').map(f => f.trim());
  const joinTableName = (document.getElementById('joinTable') as HTMLInputElement).value;
  const joinKeyText = (document.getElementById('joinKey') as HTMLInputElement).value;
  const joinKey = joinKeyText ? (joinKeyText.split(',') as [string, string]) : undefined;

  const res = await fetch('/select', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableName, fields, joinTableName, joinKey })
  });
  const data = await res.json();
  (document.getElementById('result') as HTMLElement).textContent = JSON.stringify(data, null, 2);
});