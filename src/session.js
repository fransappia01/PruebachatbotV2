const express = require('express');
const qrcode = require('qrcode');
const puppeteer = require("puppeteer");
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
let qrImage; // Variable para almacenar el código QR generado

puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions']})

const client = new Client({
  clientId: "client-o",
  puppeteer: {
    args: ['--no-sandbox','--disable-setuid-sandbox'],
    ignoreDefaultArgs: ['--disable-extensions'],
    ignoreHTTPSErrors: true,
    defaultViewport: null,
    // Ignorar propiedades y funciones específicas durante la evaluación
    // para evitar errores
    ignoreDefaultViewport: true,
    ignoreCache: true,
    extraHTTPHeaders: {
      'Accept-Language': 'en'
    },
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    devtools: false,
    userDataDir: null
  }
});

// Evento 'qr'
client.on('qr', async qr => {
  try {
    // Genera el código QR como una imagen 
    qrImage = await qrcode.toDataURL(qr, { errorCorrectionLevel: 'L' });

    // No es necesario enviar el código QR aquí
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
    console.log('QR listo');
    res.send(`<img src="${qrImage}" alt="WhatsApp QR Code" />`);
  } else {
    // Si el cliente aún no está listo, envía un mensaje temporal
    res.send('Generando código QR...');
  }
});

// Ruta para servir la página HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/qr-prueba.html');
});


// Variable para guardar el servidor
let server;

// Función para iniciar el servidor
function startServer() {
  const port = process.env.PORT || 3000;
  server = app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
  });
}

// Función para detener el servidor
function stopServer() {
  if (server) {
    server.close(() => {
      console.log('Servidor detenido');
    });
  }
}

// Iniciar el servidor
startServer();

module.exports = {
  client
}