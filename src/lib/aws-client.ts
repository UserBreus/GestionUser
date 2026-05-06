const AWS_URL = '/api/sql';
export async function executeAWSQuery(query: string): Promise<any[]> {
    try {
        // Fuerza la base de datos correcta al inicio de la consulta
        const devQuery = `USE Ventas_Dev; ${query}`;
        
        const response = await fetch(AWS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: devQuery })
        });
        const json = await response.json();
        if (json.error) {
            console.error("AWS Error:", json.error, query);
            throw new Error(json.error);
        }
        return json.data || [];
    } catch (e) {
        console.error("AWS Query Exception:", e);
        throw e;
    }
}
