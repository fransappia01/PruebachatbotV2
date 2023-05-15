const qrcode = require('qrcode-terminal');
const { client } = require('./src/session');
const { connection, connectToDatabase } = require('./src/database');

connectToDatabase()

client.on('message', async (msg) => {

  if (msg.body === '12345') {
    const phone = msg.to.replace('@c.us', '');
    const sql = `SELECT * FROM Workshops WHERE phone = '${phone}'`;

    connection.query(sql, async (err, results) => {
      if (err) throw err;

      // Si se encontró el taller en la base de datos
      if (results.length > 0) {
        const WorkshopName = results[0].name;
        console.log('Nombre del taller:', WorkshopName);

          // Responder al mensaje del usuario
          await client.sendMessage(
            msg.from,
            `¡Hola! Te comunicaste con ${WorkshopName}. Por favor, selecciona una opción:\n` +
              '1. Realizar un turno\n' +
              '2. Cancelar un turno\n' +
              '3. Consultar estado del turno\n' +
              '4. Terminos y Condiciones\n' +
              '5. Salir'
          );
      } else {
        console.log('No se encontró ningún taller con ese número de teléfono.');
      }
    });
  }
});

client.initialize();

  