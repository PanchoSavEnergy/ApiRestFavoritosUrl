const mongoose = require('mongoose');       /* Librería mongoose - Conexión con Base de datos mongoDB */
require('dotenv').config();                 /* Variables de entorno */

const clientDB = mongoose
    .connect(process.env.URI, {})
    .then((m) => {
        console.log('Base de datos conectada 😊');
        return m.connection.getClient();
    })
        
    .catch(e => console.log('Falló la conexión de la base de datos 😢 - Error: ' + e));

module.exports = clientDB;