const User = require("../models/User");
const { validationResult } = require('express-validator');
const {nanoid} = require("nanoid");
const nodemailer = require("nodemailer");                   /* Simulación de envío de correos electrónicos */
require('dotenv').config();                                 /* Invocación de las variables de entorno */

const registerForm = (req, res) => {
    res.render('register'); /* Renderiza la página */
}

const registerUser = async(req, res) => {

    const errors = validationResult(req);  /* Va a mostrar algún error proveniente de express-validator en auth.js */
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());      /* Invocando flash con el error encontrado */
        return res.redirect("/auth/register");
        //return res.json(errors);
    }

    console.log(req.body);
    const {userName, email, password} = req.body;           /* Instancia los valores ingresados en el formulario */
    try {
        let user = await User.findOne({email});             /* Busca el email en la base de datos  */
        if(user) throw new Error("Ya existe el usuario");   /* En caso que exista el usuario, saltará error de usuario duplicado */

        user = new User({userName, email, password, tokenConfirm: nanoid()});
        await user.save();                                  /* El objeto user es un super-objeto de mongoose, por eso se puede llamar 
                                                               al save() y comunicarse con la base de datos */
        
        // enviar correo electrónico con la confirmación de la cuenta
        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.USEREMAIL,
              pass: process.env.PASSEMAIL
            }
          });

        await transport.sendMail({
            from: '"proyectopancho 😎" <foo@example.com>',
            to: user.email,
            subject: "Verificación de cuenta de correo electrónico 📧",
            html: `<a href="${
                process.env.PATHHEROKU || 'http://localhost:32'
            }/auth/confirmar/${user.tokenConfirm}">Verifica tu cuenta aquí 👀</a>`
        });

        req.flash("mensajes", [{msg: "Revise su correo electrónico y valide su cuenta"}]);      /* Invocando flash con el error encontrado */
        res.redirect("/auth/login");
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);      /* Invocando flash con el error encontrado */
        return res.redirect("/auth/register");
        //res.json({error: error.message});
    }
}

const confirmarCuenta = async(req, res) => {
    const { token } = req.params;               /* Acá se obtiene el token */

    try {
        const user = await User.findOne({tokenConfirm: token});   /* Buscar el usuario en base al token */
        if(!user) throw new Error("No existe este usuario");

        user.cuentaConfirmada = true;       /* El usuario ha ingresado al link y ha confirmado la cuenta */
        user.tokenConfirm = null;           /* Se resetea el tokenConfirm, ya que se ha autenticado el usuario */

        await user.save();                  /* Guardar en la base de datos (user = super-objeto mongoose) */
        
        req.flash("mensajes", [{msg: "Cuenta verificada, ahora puede iniciar sesión"}]);   /* Invocando flash */
        res.redirect("/auth/login");

    } catch (error) {
        res.json({ error: error.message });
        req.flash("mensajes", [{msg: error.message}]);      /* Invocando flash con el error encontrado */
        return res.redirect("/auth/login");
    }
}

const loginForm = (req, res) => {
    res.render('login'); /* Renderiza la página */
}

const loginUser = async(req, res) => {

    // 1. Validaciones provenientes de express-validator en auth.js
    const errors = validationResult(req);           /* validationResult es el resultado de express-validator */
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());      /* Invocando flash, sesión de una única invocación, con los errores */
        return res.redirect("/auth/login");
    }

    // 2. Obteniendo los parámetros de los formularios
    const {email, password} = req.body;

    try {
        // 3. Validaciones de usuario
        const user = await User.findOne({email});
        if(!user) throw new Error("Este email no se encuentra registrado");
        if(!user.cuentaConfirmada) throw new Error("La cuenta aún no ha sido validada. Por favor, revise su correo.");
        if(!await user.comparePassword(password)) throw new Error("Contraseña inválida");

        // 4. Creando la sesión con passport
        req.login(user, function(err){
            if(err) throw new Error("Error al crear la sesión");    /* Si se activa, entonces hay error con Passport */
            res.redirect("/home");                                  /* Sino, entonces lleva al home */
        });

    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);      /* Invocando flash con el error encontrado */
        return res.redirect("/auth/login");
    }
}

const cerrarSesion = (req, res) => {
    req.logout();                                   /* Método de Passport */
    res.redirect("/auth/login");   
}

module.exports = {
    registerForm,
    registerUser,
    confirmarCuenta,
    loginForm,
    loginUser,
    cerrarSesion,
}