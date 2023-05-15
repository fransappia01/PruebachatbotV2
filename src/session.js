const qrcode = require('qrcode-terminal');
const { Client, LegacySessionAuth, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const {connection, connectToDatabase} = require('./database')


//const client = new Client({
//     authStrategy: new LocalAuth({
//          clientId: "client-one" 
//     })
//})

  const client = new Client({
    clientId: "client-o"
  })

  client.on('qr', (qr) => {
    // Generar y escanear este código qr
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', (session) => {
    console.log('Sesión autenticada');
  });
  

module.exports = {
    client,
    connection
}