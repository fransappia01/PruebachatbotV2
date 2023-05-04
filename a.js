const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const SESSION_FILE_PATH = './session.json';


let estado = 'inicio';
let nombre = '';
let dni = '';
let clientesEnEspera = [];
let client;
let sessionData;

// Guardar sesión
const guardarSesion = () => {
  fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(client.options.session));
  console.log('Sesión guardada correctamente');
};

// Cargar sesión
const cargarSesion = () => {
  if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
  }
};

cargarSesion();

client = new Client({
  session: sessionData
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('¡Cliente listo!');
  guardarSesion();
});

client.on('authenticated', (session) => {
  console.log('Sesión autenticada');
  sessionData = session;
  guardarSesion();
});

client.on('message', async (msg) => {
  if (msg.body === '123456') {
    // Enviar un mensaje con opciones al cliente
    await client.sendMessage(
      msg.from,
      '¡Hola! ¿Cómo estás? Por favor, selecciona una opción:\n' +
        '1. Realizar un turno\n' +
        '2. Cancelar un turno\n' +
        '3. Consultar estado del turno'
    );
 } else if (estado === 'inicio' && msg.body === '1') {
    // Manejar la opción 1
    estado = 'solicitandoDatos';
    await client.sendMessage(
      msg.from,
      'Haz solicitado la realización de un turno! A continuación escríbenos tus datos: \n' +
        '* Nombre y Apellido\n' +
        '* DNI\n'
    );
 } else if (estado === 'solicitandoDatos') {
    // Obtener los datos del cliente del mensaje anterior
    const datosCliente = msg.body.split('\n');
    nombre = datosCliente[0];
    dni = datosCliente[1];

    // Verificar si el mensaje está vacío
    if (!nombre || !nombre.replace(/\s/g, '').length || !dni || !dni.replace(/\s/g, '').length) {
      await client.sendMessage(
        msg.from,
        'Por favor, asegúrate de ingresar tu nombre y tu DNI para continuar.'
      );
      return;
    }

    // Validar digitos del DNI
    if (dni.length !== 8) {
      await client.sendMessage(
        msg.from,
        'El DNI debe tener 8 dígitos. Por favor, inténtalo nuevamente.'
      );
      estado = 'solicitandoDatos';
      return;
    } else {
      // Manejar la opción 1
      await client.sendMessage(
        msg.from,
        `¡Gracias, ${nombre}! Por favor, elige el tipo de servicio que deseas:\n` +
          '1. Cambio de aceite\n' +
          '2. Cambio de neumáticos\n' +
          '3. Revisión general\n'
      );
    }
 } else if (msg.body === '2') {
        // Manejar la opción 2
        await client.sendMessage(
            msg.from,
            'Solicitar numero de turno'
        );
 } else if (msg.body === '3') {
        // Manejar la opción 3
        await client.sendMessage(
            msg.from,
            'Solicitar numero de turno'
        );
 }
});

client.initialize();        





