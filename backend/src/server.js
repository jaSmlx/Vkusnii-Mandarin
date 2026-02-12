const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend работает');
});

app.get('/api/dishes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                dish_id,
                name,
                category,
                price,
                weight,
                description,
                ingredients,
                calories,
                proteins,
                fats,
                carbs,
                image
            FROM dishes
            WHERE is_active = true
            ORDER BY dish_id
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(3000, () => {
    console.log('Сервер запущен: http://localhost:3000');
});