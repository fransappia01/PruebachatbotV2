const {nombre, dni} = require ('../index')

// Implementacion de funciones

// Define la función manejarSolicitandoDatos

async function manejarSolicitandoDatos(msg) {
    // Obtener los datos del cliente del mensaje anterior
    const datosCliente = msg.body.split('\n');
    nombre = datosCliente[0];
    dni = datosCliente[1];
  
    // Verificar si el mensaje está vacío
    if (!nombre || !nombre.replace(/\s/g, '').length || !dni || !dni.replace(/\s/g, '').length) {
      await client.sendMessage(
        msg.from,
        'Por favor, asegúrate de ingresar tu nombre y tu DNI para continuar.');
      return;
    }
  
    // Validar digitos del DNI
    if (dni.length !== 8) {
      await client.sendMessage(
        msg.from,
        'El DNI debe tener 8 dígitos. Por favor, inténtalo nuevamente.');
  
      estado = 'solicitandoDatos';
      return;
    } else {
  
      // MANEJO DE OPCION 1
      await client.sendMessage(
        msg.from,
        `¡Gracias, ${nombre}! Por favor, elige el tipo de servicio que deseas:\n` +
          '1. Cambio de aceite\n' +
          '2. Cambio de neumáticos\n' +
          '3. Revisión general\n' +
          '4. Salir'
      );
      estado = 'SolicitandoServicio';
    }
  }
  
// Función para manejar la opción de cancelación de turno
async function cancelarTurno(msg) {
    estado = 'solicitandoCancelacionTurno';
    await client.sendMessage(
      msg.from,
      'Haz solicitado cancelar un turno! A continuación escríbenos tus datos: \n' +
        '* Nombre y Apellido\n' +
        '* DNI\n' +
        '* Numero del turno'
    );
  }

// Función para obtener los datos del cliente del mensaje anterior
function obtenerDatosCliente(msg) { 
    const datosCliente = msg.body.split('\n');
    nombre = datosCliente[0];
    dni = datosCliente[1];
    const numeroTurno = datosCliente[2];
  
    if (!nombre || !nombre.replace(/\s/g, '').length || !dni || !dni.replace(/\s/g, '').length) {
      client.sendMessage(
        msg.from,
        'Por favor, asegúrate de ingresar tu nombre y tu DNI para continuar.'
      );
      return;
    }
  
    if (dni.length !== 8) {
      client.sendMessage(
        msg.from,
        'El DNI debe tener 8 dígitos. Por favor, inténtalo nuevamente.'
      );
      return;
    }
}  

module.exports = {
    manejarSolicitandoDatos,
    cancelarTurno,
    obtenerDatosCliente
}