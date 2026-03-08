const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/dispositivos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM dispositivos ORDER BY nome');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dispositivos
router.post('/', async (req, res) => {
  const { id, nome, tipo, ip, porta, status } = req.body;
  try {
    await pool.query(
      `INSERT INTO dispositivos (id, nome, tipo, ip, porta, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO UPDATE SET
         nome = EXCLUDED.nome, tipo = EXCLUDED.tipo, ip = EXCLUDED.ip,
         porta = EXCLUDED.porta, status = EXCLUDED.status, updated_at = NOW()`,
      [id, nome, tipo, ip, porta || 80, status || 'desconhecido']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/dispositivos/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM dispositivos WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
