const express = require('express'); 
const app = express(); 
const PORT = process.env.PORT || 3000; 
 
app.get('/health', (req, res) => { 
  res.json({ status: 'OK', timestamp: new Date().toISOString() }); 
}); 
 
app.get('/', (req, res) => { 
  res.json({ message: 'Plateforme de Réservation API', version: '1.0.0' }); 
}); 
 
app.listen(PORT, () => { 
  console.log(`🚀 Serveur démarré sur le port ${PORT}`); 
}); 
