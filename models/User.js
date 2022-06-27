const mongoose = require('mongoose');
const {Schema} = mongoose;
const bcrypt = require("bcryptjs");         /* Librería que va a hashear la contraseña (hashear = codificar) */

const userSchema = new Schema({
    userName: {
        type: String,
        lowercase: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        index: {unique: true}
    },
    password: {
        type: String,
        required: true
    },
    tokenConfirm: {
        type: String,
        default: null
    },
    cuentaConfirmada: {
        type: Boolean,
        default: false
    },
    imagen: {
        type: String,
        default: null,
    }
})

// Hasheando contraseña
userSchema.pre("save", async function(next){      /* pre = Antes de usar "save", haremos un método previo (es método de mongoose) */
    const user = this;                      /* this = userName, email, password, tokenConfirm, cuentaConfirmada (propiedades) */
    if(!user.isModified("password")){       /* Si la propiedad contraseña no fue modificada */
        return next;                        /* Entonces sáltate los pasos siguientes (hash contraseña) */
    } 

    try {
        // Hasheo de contraseña
        const salt = await bcrypt.genSalt(10);                   /* Saltos de string (se usa con el hash) */
        const hash = await bcrypt.hash(user.password, salt);  /* Encriptamiento de la contraseña en base al salto */
 
        user.password = hash;

    } catch (error) {
        console.log("Hubo un problema al encriptar la contraseña - ", error);
        next();
    }
})

// Creando un nuevo método de comparación de contraseña
userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password)
}


/* "User" es el nombre del esquema, y userSchema es una instancia del esquema que viene incluido en express */
module.exports = mongoose.model("User", userSchema);