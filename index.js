const { client } = require('./src/session')
const { getSMS, getWorkshopNameByPhone, GetStatusByAppointmentNumber } = require('./src/functions');

// Variables para controlar el flujo de ejecución de la respuesta del taller, almaceno el cambio de estados.
let isWaitingForWorkshopName = false;
//let isWaitingForAppointmentNumber = false;
let workshopName;


client.on('message', async (msg) => {
  const phone = msg.to.replace('@c.us', '');

  if (msg.body === '12345') {
    console.log('phone', phone);

    // Obtener el nombre del taller
    workshopName = await getWorkshopNameByPhone(phone);

    // Responder al mensaje del usuario
    await client.sendMessage(
      msg.from,
      `¡Hola! Te comunicaste con ${workshopName}. Por favor, selecciona una opción:\n` +
        '1. Realizar un turno\n' +
        '2. Consultar estado del turno\n' +
        '3. Términos y Condiciones\n' +
        '4. Salir'
    );

    // Establecer isWaitingForWorkshopName en true para esperar el nombre del taller
    isWaitingForWorkshopName = true;
  }

  // Si se está esperando el nombre del taller, procesar el mensaje según la opción seleccionada
  if (isWaitingForWorkshopName = true) {
    switch (msg.body) {
      case '1':
        console.log('opcion 1')
        // Lógica para realizar un turno
        await client.sendMessage(msg.from, `Seleccionaste la opción 1: Realizar un turno` + `A continuación, ingrese su número de turno `);
        
        break;
      case '2':
        // Lógica para consultar el estado del turno
        await client.sendMessage(msg.from, `Seleccionaste la opción 2: Consultar estado del turno!\n` + `A continuación, ingrese su número de turno `);
        let isWaitingForAppointmentNumber = true;

        client.on('message', async (message) => {
          // sin esta logica el sistema repite la respuesta muchas veces
          if (isWaitingForAppointmentNumber && message.from === msg.from) {
            const userResponse = message.body;
            console.log('User response:', userResponse);
      
            // Lógica para obtener el estado del turno
            const appointment_status = await GetStatusByAppointmentNumber(userResponse);
      
            if (appointment_status) {
              await client.sendMessage(msg.from, `El estado de tu turno es: ${appointment_status}`);
            } else {
              await client.sendMessage(msg.from, 'El numero de turno no se encuentra registrado. Ingrese "12345" para voler al menú inicial.');
            }
      
            // Cambiar el estado a false después de obtener el estado del turno
            isWaitingForAppointmentNumber = false;
          }
        });
        break;
      case '3':
        // Lógica para términos y condiciones

        const privacyPolicy = await getSMS(phone, workshopName);

        if (privacyPolicy) {
          await client.sendMessage(
            msg.from,
            `Seleccionaste la opcion 3!\n` + `Los términos y condiciones del taller son: ${privacyPolicy}`
          );
        } else {
          await client.sendMessage(
            msg.from,
            'No se encontraron términos y condiciones para el taller ingresado. Ingrese "12345" para volver al menú inicial.'
          );
        }

        break;
      case '4':
        // Lógica para salir
        await client.sendMessage(msg.from, `Muchas gracias por comunicarte con ${workshopName}! ¡Hasta la proxima!`);
        
        break;
    }

    // Cambiar el estado a false después de procesar la opción
    isWaitingForWorkshopName = false;
  }
  else{
    console.log('no entra al if')
  }
});

client.initialize();
