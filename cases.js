client.on('message', async (msg) => {
  switch(msg.body) {

    case '123456':
      estado = 'inicio';
      await client.sendMessage(
        msg.from,
        '¡Hola! ¿Cómo estás? Por favor, selecciona una opción:\n' +
          '1. Realizar un turno\n' +
          '2. Cancelar un turno\n' +
          '3. Consultar estado del turno\n' +
          '4. Salir'
      );
      break;

    case '1':
      if (estado === 'inicio') {
        estado = 'solicitandoDatos';
        await client.sendMessage(
          msg.from,
          'Haz solicitado la realización de un turno! A continuación escríbenos tus datos: \n' +
            '* Nombre y Apellido\n' +
            '* DNI\n'
        );
      } else if (estado === 'solicitandoServicio') {
        await client.sendMessage(
          msg.from,
          `¡Gracias, ${nombre}! Por favor, elige el tipo de servicio que deseas:\n` +
            '1. Cambio de aceite\n' +
            '2. Cambio de neumáticos\n' +
            '3. Revisión general\n' +
            '4. Salir'
        );
        estado = 'solicitandoServicio';
      }
      break;

    case '2':
      if (estado === 'inicio') {
        estado = 'solicitandoCancelacionTurno';
        await client.sendMessage(
          msg.from,
          'Haz solicitado cancelar un turno! A continuación escríbenos tus datos: \n' +
            '* Nombre y Apellido\n' +
            '* DNI\n' +
            '* Numero del turno'
        );
      }
      break;

    case '3':
      // TODO: Implementar lógica para consultar el estado del turno
      break;

    case '4':
      await client.sendMessage(
        msg.from,
        'Gracias por haberte comunicado con nosotros.¡Hasta la proxima!'
      );
      break;

    default:
      if (estado === 'solicitandoDatos') {
        const datosCliente = msg.body.split('\n');
        nombre = datosCliente[0];
        dni = datosCliente[1];

        if (!nombre || !nombre.replace(/\s/g, '').length || !dni || !dni.replace(/\s/g, '').length) {
          await client.sendMessage(
            msg.from,
            'Por favor, asegúrate de ingresar tu nombre y tu DNI para continuar.'
          );
          return;
        }

        if (dni.length !== 8) {
          await client.sendMessage(
            msg.from,
            'El DNI debe tener 8 dígitos. Por favor, inténtalo nuevamente.'
          );
          return;
        } else {
          await client.sendMessage(
            msg.from,
            `¡Gracias, ${nombre}! Por favor, elige el tipo de servicio que deseas:\n` +
              '1. Cambio de aceite\n' +
              '2. Cambio de neumáticos\n' +
              '3. Revisión general\n' +
              '4. Salir'
          );
          estado = 'solicitandoServicio';
        }
      } else if (estado === 'solicitandoServicio') {
        switch(msg.body) {
          case '1':
            await client.sendMessage(
              msg.from,
              'Solicito un cambio de aceite.'
            );
            break;

          case '2':
            await client.sendMessage(
              msg.from,
              'Solicito un cambio de neumaticos.'
            );
            break;
          
          case '3':
            await client.sendMessage(
              msg.from,
              'Solicito una revision general.'
            );
            break;

          case '4':
            await client.sendMessage(
              msg.from,
              'Gracias por haberte comunicado con nosotros.¡Hasta la proxima!'
         );
        }
      }
      break;
    
    case '2':
      if (estado === 'inicio') {
        estado = 'solicitandoCancelacionTurno';
        await client.sendMessage(
          msg.from,
          'Haz solicitado cancelar un turno! A continuación escríbenos tus datos: \n' +
            '* Nombre y Apellido\n' +
            '* DNI\n' +
            '* Numero del turno'
        );
      }
      break;
    
    case '3':
      // TODO: Implementar lógica para consultar el estado del turno
      break;
    
    case '4':
      await client.sendMessage(
        msg.from,
        'Gracias por haberte comunicado con nosotros.¡Hasta la próxima!'
        );
      }
         
     });




     //--------------------------------

     const qrcode = require('qrcode-terminal');
     const { client } = require('./src/session');
     const { connection, connectToDatabase } = require('./src/database');
     
     connectToDatabase()
     
     client.on('message', async (msg) => {
       console.log('Mensaje recibido:', msg.body);
     
       if (msg.body === '12345') {
         const phone = msg.to.replace('@c.us', '');
         const sql = `SELECT * FROM Taller WHERE phone = '${phone}'`;
     
         connection.query(sql, async (err, results) => {
           if (err) throw err;
     
           // Si se encontró el taller en la base de datos
           if (results.length > 0) {
             const nombreTaller = results[0].nombre;
             console.log('Nombre del taller:', nombreTaller);
     
               // Responder al mensaje del usuario
               await client.sendMessage(
                 msg.from,
                 `¡Hola! Te comunicaste con ${nombreTaller}. Por favor, selecciona una opción:\n` +
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
     