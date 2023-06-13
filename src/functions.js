const { Agent } = require('https');
 
 // Funcion para traer politicas y privacidad de cada Taller por nombre de taller
 
 async function getSMS(phone_number, workshopName) {
    // Configurar la URL de la API y los datos de la solicitud
    const url = 'https://localhost:7097/api/Sms/GetSmsByWorkshop';
    const data = { phone_number, name: workshopName};
  
    try {
      // Importar dinámicamente el módulo node-fetch
      const { default: fetch } = await import('node-fetch');
  
      // Realizar la solicitud a la API utilizando fetch
      const rawResponse = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        agent: new Agent({ rejectUnauthorized: false })
      });
  
      // Obtener la respuesta del servidor en formato JSON
      const content = await rawResponse.json();
      return content;
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      throw new Error('Error al realizar la solicitud');
    }
  }
  
  
  // Funcion que trae el nombre del taller por numero de telefono asociado

 async function getWorkshopNameByPhone(phone_number) {
    // Configurar la URL de la API con los parámetros de consulta
    const url = `https://localhost:7097/api/Sms/GetWorkshopNameByPhone?phone_number=${phone_number}`;
  
    try {
      // Importar dinámicamente el módulo node-fetch
      const { default: fetch } = await import('node-fetch');
  
      // Realizar la solicitud GET a la API utilizando fetch
      const rawResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain'
        },
        agent: new Agent({ rejectUnauthorized: false })
      });
  
      // Verificar el estado de la respuesta
      if (rawResponse.ok) {
        // Obtener el nombre del taller de la respuesta
        const workshopName = await rawResponse.text();
  
        console.log('Response from API:', workshopName); 
        return workshopName;
        
      } else {
        console.error('Error al realizar la solicitud. Estado:', rawResponse.status);
        return null;
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      return null;
    }
  }

// Funcion para traer el estado de un turno en base al numero de turno que le pasa el usuario

async function getAppointmentStatusByPhone(appointment_number) {
  // Configurar la URL de la API con los parámetros de consulta
  const url = `https://localhost:7097/api/Sms/GetAppointmentStatusByAppointmentNumber?appointment_number=${appointment_number}`;

  try {
    // Importar dinámicamente el módulo node-fetch
    const { default: fetch } = await import('node-fetch');

    // Realizar la solicitud GET a la API utilizando fetch
    const rawResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      },
      agent: new Agent({ rejectUnauthorized: false })
    });

    // Verificar el estado de la respuesta
    if (rawResponse.ok) {
      // Obtener el nombre del taller de la respuesta
      const status = await rawResponse.text();

      console.log('Response from API:', status); 
      return status;
      
    } else {
      console.error('Error al realizar la solicitud. Estado:', rawResponse.status);
      return null;
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return null;
  }
}

  module.exports = {
    getSMS,
    getWorkshopNameByPhone,
    getAppointmentStatusByPhone
  };