const mongoose = require('mongoose');        /* Llama a la librería mongoose: interacción con mongoDB */
const {Schema} = mongoose;                   /* Invoca el esquema que viene de mongoose */

const urlSchema = new Schema({
    origin: {
        type: String,           /* Tipo de variable */
        unique: true,           /* Booleano que determina si el valor es único (irrepetible) */
        required: true          /* Booleano que determina si el valor es requerido */
    },
    shortURL: {
        type: String,
        unique: true,           
        required: true,         
    },
    user: {
        type: Schema.Types.ObjectId,    /* ID de objeto gestionado por mongoose */
        ref: "User",                    /* Referencia al nombre del esquema */
        required: true,
    }
});

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;