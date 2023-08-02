const { client } = require('./src/session');
const { getSMS, getWorkshopNameByPhone, getAppointmentStatusByPhone } = require('./src/functions');

// Variable para controlar el estado del usuario
const userState = {};

// Función para enviar mensajes al usuario
const sendMessage = async (to, message) => {
  await client.sendMessage(to, message);
};

// Función para mostrar el menú principal al usuario
const showMainMenu = async (phone_number) => {
  const workshopName = await getWorkshopNameByPhone(phone_number);
  const message = `¡Hola! Te comunicaste con ${workshopName}. Por favor, selecciona una opción:\n` +
    '1. Realizar un turno\n' +
    '2. Consultar estado del turno\n' +
    '3. Términos y Condiciones\n' +
    '4. Salir';
  await sendMessage(phone_number, message);
  // Establecer el estado del usuario como "mainMenu" para esperar la opción seleccionada
  userState[phone_number] = 'mainMenu';
};

// Función para mostrar el menú de opciones después de realizar una acción
const showOptionMenu = async (phone_number) => {
  const message = `Selecciona una opción:\n` +
    '1. Volver al menú principal\n' +
    '2. Salir';
  await sendMessage(phone_number, message);
  // Establecer el estado del usuario como "optionMenu" para esperar la opción seleccionada
  userState[phone_number] = 'optionMenu';
};

// Función para manejar las respuestas del usuario
const handleUserResponse = async (msg) => {
  const phone_number = msg.to.replace('@c.us', '');
  const userResponse = msg.body;

  if (userState[phone_number] === 'mainMenu') {
    // Usuario está en el menú principal
    switch (userResponse) {
      case '1':
        // Lógica para realizar un turno
        await sendMessage(phone_number, `Seleccionaste la opción 1: Realizar un turno. A continuación, ingrese su número de turno.`);
        // Cambiar el estado del usuario para esperar el número de turno
        userState[phone_number] = 'waitingForAppointmentNumber';
        break;
      case '2':
        // Lógica para consultar el estado del turno
        await sendMessage(phone_number, `Seleccionaste la opción 2: Consultar estado del turno. A continuación, ingrese su número de turno.`);
        // Cambiar el estado del usuario para esperar el número de turno
        userState[phone_number] = 'waitingForAppointmentNumber';
        break;
      case '3':
        // Lógica para términos y condiciones
        const privacyPolicy = await getSMS(phone_number);
        if (privacyPolicy) {
          await sendMessage(phone_number, `Seleccionaste la opción 3: Los términos y condiciones del taller son: ${privacyPolicy}`);
        } else {
          await sendMessage(phone_number, 'No se encontraron términos y condiciones para el taller ingresado.');
        }
        // Mostrar el menú de opciones después de la acción
        await showOptionMenu(phone_number);
        break;
      case '4':
        // Lógica para salir
        await sendMessage(phone_number, `Seleccionaste la opción 4: Muchas gracias por comunicarte con nosotros. ¡Hasta la próxima!`);
        // Eliminar el estado del usuario para finalizar el flujo
        delete userState[phone_number];
        break;
      default:
        // Opción inválida, mostrar mensaje de error y el menú principal nuevamente
        await sendMessage(phone_number, 'Opción inválida. Por favor, selecciona una opción válida.');
        await showMainMenu(phone_number);
        break;
    }
  } else if (userState[phone_number] === 'optionMenu') {
    // Usuario está en el menú de opciones después de realizar una acción
    switch (userResponse) {
      case '1':
        // Volver al menú principal
        await showMainMenu(phone_number);
        break;
      case '2':
        // Salir
        await sendMessage(phone_number, `Muchas gracias por comunicarte con nosotros. ¡Hasta la próxima!`);
        // Eliminar el estado del usuario para finalizar el flujo
        delete userState[phone_number];
        break;
      default:
        // Opción inválida, mostrar mensaje de error y el menú de opciones nuevamente
        await sendMessage(phone_number, 'Opción inválida. Por favor, selecciona una opción válida.');
        await showOptionMenu(phone_number);
        break;
    }
  } else if (userState[phone_number] === 'waitingForAppointmentNumber') {
    // Usuario está esperando el número de turno
    // Lógica para obtener el estado del turno
    const appointment_status = await getAppointmentStatusByPhone(userResponse);
    if (appointment_status) {
      await sendMessage(phone_number, `El estado de tu turno es: ${appointment_status}`);
    } else {
      await sendMessage(phone_number, 'Ocurrió un error al obtener el estado del turno');
    }
    // Mostrar el menú de opciones después de obtener el estado del turno
    await showOptionMenu(phone_number);
  }
};

// Manejar el evento de mensaje recibido
client.on('message', async (msg) => {
  const phone_number = msg.to.replace('@c.us', '');

  if (msg.body === '12345') {
    console.log('phone', phone_number);
    // Mostrar el menú principal al usuario cuando se comunique por primera vez
    await showMainMenu(phone_number);
  } else {
    // Manejar la respuesta del usuario
    await handleUserResponse(msg);
  }
});

// Inicializar el cliente de WhatsApp
client.initialize();


const handleConsultAppointmentStatus = async (msg) => {
  if (isWaitingForAppointmentNumber && msg.body) {
    // Lógica para obtener el estado del turno
    const appointment_number = msg.body;
    const appointment_status = await getAppointmentStatusByPhone(appointment_number);

    if (appointment_status) {
      await client.sendMessage(msg.from, `El estado de tu turno es: ${appointment_status}`);
    } else {
      await client.sendMessage(msg.from, 'Ocurrió un error al obtener el estado del turno');
    }

    // Cambiar el estado a false después de obtener el estado del turno
    isWaitingForAppointmentNumber = false;
  }
};