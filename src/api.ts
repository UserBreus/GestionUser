export async function executeSql(query: string) {
  const response = await fetch('/api/sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('Error al ejecutar la consulta SQL');
  }

  return response.json();
}
