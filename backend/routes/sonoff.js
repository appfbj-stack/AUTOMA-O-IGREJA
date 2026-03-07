const express = require('express');
const router = express.Router();
const axios = require('axios');

// Sonoff LAN Mode (DIY mode)
// Docs: https://itead.cc/sonoff-diy-developer-documentation/

async function sonoffRequest(ip, action, params = {}) {
  const url = `http://${ip}:8081/zeroconf/${action}`;
  const payload = { deviceid: '', data: params };
  const response = await axios.post(url, payload, { timeout: 5000 });
  return response.data;
}

// POST /api/sonoff/toggle  body: { ip: "192.168.1.x", on: true }
router.post('/toggle', async (req, res) => {
  const { ip, on } = req.body;
  if (!ip) return res.status(400).json({ error: 'ip é obrigatório' });
  try {
    const result = await sonoffRequest(ip, 'switch', { switch: on ? 'on' : 'off' });
    res.json({ success: true, ip, on, result });
  } catch (err) {
    res.status(500).json({ success: false, ip, error: err.message });
  }
});

// GET /api/sonoff/status?ip=192.168.1.x
router.get('/status', async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ error: 'ip é obrigatório' });
  try {
    const result = await sonoffRequest(ip, 'info', {});
    const switchState = result?.data?.switch;
    res.json({ success: true, ip, on: switchState === 'on', raw: result });
  } catch (err) {
    res.status(500).json({ success: false, ip, error: err.message });
  }
});

// POST /api/sonoff/batch  body: { devices: [{ip, on}] }
router.post('/batch', async (req, res) => {
  const { devices } = req.body;
  if (!Array.isArray(devices)) return res.status(400).json({ error: 'devices deve ser um array' });
  const results = await Promise.allSettled(
    devices.map(({ ip, on }) =>
      sonoffRequest(ip, 'switch', { switch: on ? 'on' : 'off' })
        .then(r => ({ ip, on, success: true, result: r }))
        .catch(e => ({ ip, on, success: false, error: e.message }))
    )
  );
  res.json({ results: results.map(r => r.value || r.reason) });
});

module.exports = router;
