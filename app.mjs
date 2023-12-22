// importData.mjs

import pg from 'pg';
import fs from 'fs/promises';

async function run() {
    try {
        // Baca file JSON
        const jsonData = JSON.parse(await fs.readFile('data.json', 'utf8'));

        // Konfigurasi koneksi ke PostgreSQL
        const client = new pg.Client({
            user: 'postgres',
            host: 'localhost',
            database: 'poodle',
            password: '123456',
            port: 5432,
        });

        // Koneksi ke PostgreSQL
        await client.connect();

        // Batch Insertion
        const batchSize = 100;
        const totalRecords = jsonData.length;
        let currentIndex = 0;

        async function insertBatch() {
            const endIndex = Math.min(currentIndex + batchSize, totalRecords);
            const batchData = jsonData.slice(currentIndex, endIndex);

            const values = batchData.map(item => `('${item.address}', ${item.amount})`).join(',');

            const query = `INSERT INTO whiteliste(address, amount) VALUES ${values}`;

            const result = await client.query(query);

            console.log(`Inserted ${result.rowCount} records into the database.`);
            currentIndex += batchSize;

            if (currentIndex < totalRecords) {
                await insertBatch(); // Recursive call for the next batch
            } else {
                console.log('Data insertion complete.');
                await client.end();
            }
        }

        // Panggil fungsi pertama kali
        await insertBatch();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Panggil fungsi utama
run();