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
            calories,
            proteins::float,
            fats::float,
            carbs::float,
            image,
            ingredient 
            FROM dishes
            WHERE is_active = true
            ORDER BY dish_id;
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения блюд:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            deliveryType,
            address,
            items,
            total
        } = req.body;

        if (!name || !phone || !email || !items || !items.length) {
            return res.status(400).json({
                message: 'Некорректные данные заказа'
            });
        }

        const query = `
            INSERT INTO orders
            (
                customer_name,
                phone,
                email,
                delivery_type,
                address,
                items,
                total_price
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        await pool.query(query, [
            name,
            phone,
            email,
            deliveryType,
            address || null,
            JSON.stringify(items),
            total
        ]);

        res.status(201).json({
            message: 'Заказ успешно сохранён'
        });

    } catch (err) {
        console.error('Ошибка сохранения заказа:', err);
        res.status(500).json({
            message: 'Ошибка сервера'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});