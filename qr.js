const express = require('express');
const qrcode = require('qrcode');
const { Client } = require('whatsapp-web.js');

const app = express();
const client = new Client();
let qrImage; // Variable para almacenar el código QR generado

// Evento 'qr'
client.on('qr', async qr => {
  try {
    // Genera el código QR como una imagen 
    qrImage = await qrcode.toDataURL(qr, { errorCorrectionLevel: 'L' });

    // Envía el código QR como respuesta HTTP en la ruta '/codigoqr'
  } catch (error) {
    console.error('Error al generar el código QR:', error);
  }
});

// Evento 'ready': Se ejecuta luego de que el cliente escaneó el código QR
client.on('ready', () => {
  console.log('Cliente listo y autenticado en WhatsApp');
});

// Inicializa el cliente de WhatsApp
client.initialize();

// Ruta para obtener el código QR
app.get('/codigoqr', (req, res) => {

  if (qrImage) {
    // Si el cliente está listo, ya se generó el código QR y se envió en el evento 'qr'
    res.send(`<img src="${qrImage}" alt="WhatsApp QR Code" />`);
  } else {
    // Si el cliente aún no está listo, envía un mensaje temporal
    res.send('Generando código QR...');
  }
});

// Inicia el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
