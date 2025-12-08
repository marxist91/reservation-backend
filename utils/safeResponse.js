const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const logPath = path.join(__dirname, '..', 'logs', 'responses.log');

module.exports = function safeResponse(res, payload, status = 200, meta = {}) {
  const horodatage = new Date().toISOString();
  const trace_id = `res-${uuidv4()}`;
  const endpoint = meta.endpoint || 'inconnu';
  const user = meta.user || 'anonyme';
  const ip = meta.ip || res.req.ip || 'unknown-ip';

  const ligneLog = `[${horodatage}] 🧩 ${trace_id} | ${endpoint} | Status: ${status} | User: ${user} | IP: ${ip}\n`;

  if (res.headersSent) {
    const collisionLog = `[${horodatage}] ❌ DOUBLE réponse bloquée | ${trace_id} | ${endpoint} | User: ${user}\n`;
    fs.appendFileSync(logPath, collisionLog, 'utf-8');
    return;
  }

  fs.appendFileSync(logPath, ligneLog, 'utf-8');

  // Si le payload est un tableau, on l'envoie directement
  if (Array.isArray(payload)) {
    return res.status(status).json(payload);
  }
  
  // Sinon on ajoute le trace_id
  return res.status(status).json({
    trace_id,
    ...payload
  });
};
