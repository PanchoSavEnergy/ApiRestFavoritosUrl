// Importación de librerías

const express = require('express');
const { body } = require('express-validator');          /* Añade la librería de validaciones al cuerpo del mensaje */
const {  
    registerForm, 
    registerUser,
    confirmarCuenta, 
    loginForm,
    loginUser,
    cerrarSesion, 
} = require('../controllers/authController');
const router = express.Router();

//--------------------------------------------------------------------------
// Lógica de rutificación

/* Register va primero porque la idea es registrar al nuevo usuario antes de logearlo */
router.get("/register", registerForm);                  /* Renderiza el register.hbs en la ruta register */
router.post("/register", [                              /* [] = inicia un array */    
    /* Se invoca la librería express-validator con los datos del register.hbs */
    body("userName", "Ingrese un nombre válido").trim().notEmpty().escape(),
    body("email","Ingrese un email válido").trim().isEmail().normalizeEmail(),
    body("password","Contraseña de mínimo 6 carácteres")
        .trim()
        .isLength({min: 6})
        .escape()
        .custom((value, {req}) => {
            if(value !== req.body.repassword){
                throw new Error("No coinciden las contraseñas");
            } else {
                return value;
            }
        })
                                                                    
    /* Explicaciones de los comandos anteriores:
        trim = limpia lo que escribió el usuario  
        notEmpty = revisa que no venga vacío el mensaje 
        escape = todo lo que se envíe será interpretado como string (ej: ASCII 30 será string) 
        isEmail = valida si el string recibido tiene formato de email
        normalizeEmail = normaliza el email ingresado poniendo todo en minúscula y otros detalles de outlook, yahoo y gmail
        isLength = tamaño del mensaje
        custom = agregar una función propia
    */             
],registerUser);                        /* Registrar usuario a través del formulario */
router.get("/confirmar/:token", confirmarCuenta)  /* Ruta de comprobación de usuario (correo electrónico) */
router.get("/login", loginForm);                        /* Renderiza el login.hbs en la ruta login */
router.post("/login", [
    body("email","Ingrese un email válido").trim().isEmail().normalizeEmail(),
    body("password","Contraseña de mínimo 6 carácteres").trim().isLength({min: 6}).escape()
], loginUser);
router.get("/logout", cerrarSesion);

//--------------------------------------------------------------------------
// Exportación

module.exports = router