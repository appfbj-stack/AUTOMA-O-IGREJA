const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /api/logs — salvar log
router.post('/', async (req, res) => {
  const { id, data, acao, usuario, resultado, detalhes } = req.body;
  try {
    await pool.query(
      `INSERT INTO logs (id, data, acao, usuario, resultado, detalhes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [id || `${Date.now()}`, data || new Date().toISOString(), acao, usuario, resultado, detalhes || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/logs — buscar logs
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const resultado = req.query.resultado;
  try {
    let query = 'SELECT * FROM logs';
    const params = [];
    if (resultado) {
      query += ' WHERE resultado = $1';
      params.push(resultado);
    }
    query += ' ORDER BY data DESC LIMIT $' + (params.length + 1);
    params.push(limit);
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/logs — limpar logs
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM logs');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
