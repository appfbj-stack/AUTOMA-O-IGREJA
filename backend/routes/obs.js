const express = require('express');
const router = express.Router();
const OBSWebSocket = require('obs-websocket-js').default;

const obs = new OBSWebSocket();
let connected = false;

async function getOBS() {
  if (!connected) {
    await obs.connect(
      `ws://${process.env.OBS_HOST || 'localhost'}:${process.env.OBS_PORT || 4455}`,
      process.env.OBS_PASSWORD
    );
    connected = true;
  }
  return obs;
}

obs.on('ConnectionClosed', () => { connected = false; });
obs.on('ConnectionError', () => { connected = false; });

// GET /api/obs/status
router.get('/status', async (req, res) => {
  try {
    const client = await getOBS();
    const streamStatus = await client.call('GetStreamStatus');
    const recordStatus = await client.call('GetRecordStatus');
    const sceneList = await client.call('GetSceneList');
    res.json({
      connected: true,
      streaming: streamStatus.outputActive,
      recording: recordStatus.outputActive,
      currentScene: sceneList.currentProgramSceneName,
      scenes: sceneList.scenes.map(s => s.sceneName),
    });
  } catch (err) {
    connected = false;
    res.status(500).json({ connected: false, error: err.message });
  }
});

// POST /api/obs/stream/start
router.post('/stream/start', async (req, res) => {
  try {
    const client = await getOBS();
    await client.call('StartStream');
    res.json({ success: true, action: 'StartStream' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/obs/stream/stop
router.post('/stream/stop', async (req, res) => {
  try {
    const client = await getOBS();
    await client.call('StopStream');
    res.json({ success: true, action: 'StopStream' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/obs/record/start
router.post('/record/start', async (req, res) => {
  try {
    const client = await getOBS();
    await client.call('StartRecord');
    res.json({ success: true, action: 'StartRecord' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/obs/record/stop
router.post('/record/stop', async (req, res) => {
  try {
    const client = await getOBS();
    await client.call('StopRecord');
    res.json({ success: true, action: 'StopRecord' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/obs/scene  body: { scene: "Nome da Cena" }
router.post('/scene', async (req, res) => {
  const { scene } = req.body;
  if (!scene) return res.status(400).json({ error: 'scene é obrigatório' });
  try {
    const client = await getOBS();
    await client.call('SetCurrentProgramScene', { sceneName: scene });
    res.json({ success: true, scene });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
