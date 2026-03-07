const express = require('express');
const router = express.Router();
const { Client, Server } = require('node-osc');

const XR12_IP = process.env.XR12_IP || '192.168.1.100';
const XR12_PORT = parseInt(process.env.XR12_PORT || '10024');

function sendOSC(address, ...args) {
  return new Promise((resolve, reject) => {
    const client = new Client(XR12_IP, XR12_PORT);
    const msg = { address, args: args.map(v => ({ type: typeof v === 'number' ? 'f' : 's', value: v })) };
    client.send(msg, (err) => {
      client.close();
      if (err) reject(err);
      else resolve(true);
    });
  });
}

// POST /api/xr12/mute  body: { channel: 1, mute: true }
router.post('/mute', async (req, res) => {
  const { channel, mute } = req.body;
  if (channel === undefined) return res.status(400).json({ error: 'channel é obrigatório' });
  try {
    const ch = String(channel).padStart(2, '0');
    await sendOSC(`/ch/${ch}/mix/on`, mute ? 0 : 1);
    res.json({ success: true, channel, mute });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/xr12/fader  body: { channel: 1, level: 0.75 }
router.post('/fader', async (req, res) => {
  const { channel, level } = req.body;
  if (channel === undefined || level === undefined) {
    return res.status(400).json({ error: 'channel e level são obrigatórios' });
  }
  try {
    const ch = String(channel).padStart(2, '0');
    await sendOSC(`/ch/${ch}/mix/fader`, parseFloat(level));
    res.json({ success: true, channel, level });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/xr12/snapshot  body: { index: 1 }
router.post('/snapshot', async (req, res) => {
  const { index } = req.body;
  if (index === undefined) return res.status(400).json({ error: 'index é obrigatório' });
  try {
    await sendOSC('/-action/goscene', parseInt(index));
    res.json({ success: true, snapshot: index });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/xr12/preset  body: { nome: "louvor"|"pregacao"|"silencio" }
router.post('/preset', async (req, res) => {
  const { nome } = req.body;
  const presets = { louvor: 1, pregacao: 2, silencio: 3 };
  const index = presets[nome];
  if (!index) return res.status(400).json({ error: 'Preset inválido. Use: louvor, pregacao, silencio' });
  try {
    await sendOSC('/-action/goscene', index);
    res.json({ success: true, preset: nome, snapshotIndex: index });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
