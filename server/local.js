const path = require('node:path');
const express = require('express');
const app = require('./index');

const port = Number(process.env.PORT || 3001);

// Permite usar `npm start` localmente después de generar dist/.
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get(/.*/, (_req, res) => res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')));

app.listen(port, '0.0.0.0', () => console.log(`API de reservas disponible en el puerto ${port}`));
