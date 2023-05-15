const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Bocajuniors12',
  database: 'gestion_turnos'
});

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        reject(err);
      } else {
        console.log('Connected to database');
        resolve();
      }
    });
  });
}

module.exports = {
  connection,
  connectToDatabase
};
