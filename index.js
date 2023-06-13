const qrcode = require('qrcode-terminal');
const { Client, LegacySessionAuth, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

// Defino variables
let estado = 'inicio';  
let nombre = '';
let dni = '';
let clientesEnEspera = [];
let sessionData;


// Conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'gestion_turnos'
});

// Con esto no hace falta poner el QR desde un celular ya autenticado
const client = new Client({
     authStrategy: new LocalAuth({
          clientId: "client-one" 
     })
})

  client.on('qr', (qr) => {
    // Generar y escanear este código con tu teléfono
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', (session) => {
    console.log('Sesión autenticada');
  });


// Aca comienza el flujo de mensajes
client.on('message', async (msg) => {
  if (msg.body === '123456') {

    estado = 'inicio';  // asi reinicio el flujo cada vez que mando 123456

    // Enviar un mensaje con opciones al cliente
    await client.sendMessage(
      msg.from,
      '¡Hola! ¿Cómo estás? Por favor, selecciona una opción:\n' +
        '1. Realizar un turno\n' +
        '2. Cancelar un turno\n' +
        '3. Consultar estado del turno\n' +
        '4. Salir'
    );
 }

 
 else if (estado === 'inicio' && msg.body === '1') {
    // Manejar la opción 1
    estado = 'solicitandoDatos';
    await client.sendMessage(
      msg.from,
      'Haz solicitado la realización de un turno! A continuación escríbenos tus datos: \n' +
        '* Nombre y Apellido\n' +
        '* DNI\n'
    );
 }
 
 // Manejo del estado solicitandoDatos
 else if (estado === 'solicitandoDatos') {

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

 // Manejo del estado SolicitandoServicio
 else if (estado == 'SolicitandoServicio' && msg.body === '1' ){
  await client.sendMessage(
     msg.from,
      'Solicito un cambio de aceite.'
  );
 }
 else if (estado == 'SolicitandoServicio' && msg.body === '2' ){
  await client.sendMessage(
     msg.from,
     'Solicito un cambio de neumaticos.'
);
}
else if (estado == 'SolicitandoServicio' && msg.body === '3' ){
  await client.sendMessage(
     msg.from,
     'Solicito una revision general.'
);
}
else if (estado == 'SolicitandoServicio' && msg.body === '4' ){

  await client.sendMessage(
     msg.from,
     'Gracias por haberte comunicado con nosotros.¡Hasta la proxima!'
);
}

// MANEJO DE OPCION 2
else if (estado === 'inicio' && msg.body === '2') {
  // Manejar la opción 1
  estado = 'solicitandoCancelacionTurno';
  await client.sendMessage(
    msg.from,
    'Haz solicitado cancelar un turno! A continuación escríbenos tus datos: \n' +
      '* Nombre y Apellido\n' +
      '* DNI\n' +
      '* Numero del turno'
  );
}
else if (estado === 'solicitandoCancelacionTurno') {

  // Obtener los datos del cliente del mensaje anterior
  const datosCliente = msg.body.split('\n');
  nombre = datosCliente[0];
  dni = datosCliente[1];
  const numeroTurno = datosCliente[2];
 
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
    return;
  } else {

    // Consultar la base de datos para verificar el estado del turno
    connection.query(
      `SELECT estado FROM turno WHERE numero = ${numeroTurno} AND id_cliente = (SELECT id FROM cliente WHERE dni = ${dni} AND nombre = '${nombre}')`,
      (error, results, fields) => {
  if (error) {
      console.log(error);
      estado = 'inicio';
      return;
      }

    console.log(results); // Solo para ver si trae datos

  if (results.length === 0) {
// El turno no fue encontrado en la base de datos
      client.sendMessage(
      msg.from,
      `Lo siento ${nombre}, no se encontró ningún turno asociado al número ${numeroTurno}.\n` +
      'Si desea regresar al menu principal presione "123456". '
      );
  } else {
          // El turno fue encontrado en la base de datos
      const estadoTurno = results[0].estado;

if (estadoTurno === 'Cancelado') {

       client.sendMessage(
       msg.from,
       `Lo siento ${nombre}, el turno ${numeroTurno} ya ha sido cancelado anteriormente.\n` +
       'Si desea regresar al menu principal presione "123456". '
            );
            
} else {
// Actualizar el estado del turno a "cancelado"
   connection.query(
       `UPDATE turno SET estado = 'Cancelado' WHERE numero = ${numeroTurno} AND id_cliente = (SELECT id FROM cliente WHERE dni = ${dni} AND nombre = '${nombre}')`,
       (error, results, fields) => {
       if (error) {
        console.log(error);
        estado = 'inicio';
        return;
        }

  console.log(results); // Solo para ver si trae datos
// Confirmar la cancelación del turno al usuario
   client.sendMessage(
   msg.from,
  `El turno ${numeroTurno} ha sido cancelado correctamente.\n`+
  'Si desea regresar al menu principal presione "123456". '
  );
     }
       );
         }
       }
     }
  );
}
}

// MANEJO DE OPCION 3
else if (estado === 'inicio' && msg.body === '3') {
    // Manejar la opción 1
    estado = 'solicitandoEstadoTurno';
    await client.sendMessage(
      msg.from,
      'Haz solicitado ver el estado de un turno! A continuación escríbenos tus datos: \n' +
        '* Nombre y Apellido\n' +
        '* DNI\n' +
        '* Numero del turno'
    );
 }

 else if (estado === 'solicitandoEstadoTurno') {

  // Obtener los datos del cliente del mensaje anterior
  const datosCliente = msg.body.split('\n');
  nombre = datosCliente[0];
  dni = datosCliente[1];
  const numeroTurno = datosCliente[2];
  //estado = 'procesandoSolicitud';

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

    //estado = 'solicitandoDatos';
    return;
  } else {

    // Consultar la base de datos para verificar el estado del turno
    connection.query(
      `SELECT estado FROM turno WHERE numero = ${numeroTurno} AND id_cliente = (SELECT id FROM cliente WHERE dni = ${dni} AND nombre = '${nombre}')`,
      (error, results, fields) => {
        if (error) {
          console.log(error);
          estado = 'inicio';
          return;
        }
    
    console.log(results); // Solo para ver si trae datos


    if (results.length === 0) {
      // El turno no fue encontrado en la base de datos
      client.sendMessage(
        msg.from,
        `Lo siento ${nombre}, no se encontró ningún turno asociado al número ${numeroTurno}.\n`+
        'Si desea regresar al menu principal presione "123456". '

      );
    } else {
      // El turno fue encontrado en la base de datos
      const estadoTurno = results[0].estado;
      client.sendMessage(
        msg.from,
        `El estado de tu turno ${numeroTurno} es: ${estadoTurno}\n` +
        'Si desea regresar al menu principal presione "123456". '
        );
      }
    }
  );
}

}  else if (msg.body === '4') {
        // MANEJO DE OPCION 4
        await client.sendMessage(
            msg.from,
            'Gracias por haberte comunicado con nosotros.¡Hasta la proxima!'
        );
 }
    
});

client.initialize();        

// revisar la opcion con la base de datos