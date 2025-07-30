// routes/meta.js
const express = require('express');
const router = express.Router();
const packageInfo = require('../package.json');

router.get('/', (req, res) => {
  res.json({
    name: packageInfo.name,
    version: packageInfo.version,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;