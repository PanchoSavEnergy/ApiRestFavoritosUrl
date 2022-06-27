// INDICE GENERAL DEL PROYECTO

//--------------------------------------------------------------------------
// Configuración de librerías

const express = require('express');
const session = require('express-session');         /* librería sesiones de express */
const MongoStore = require('connect-mongo');        /* librería de almacenamiento de sesiones login en la base de datos */
const flash = require('connect-flash');             /* librería de sesiones flash (mueren al actualizar) */
const passport = require('passport');               /* librería para autenticación y gestión de sesiones de usuario */
const mongoSanitize = require('express-mongo-sanitize'); /* librería de limpieza de la base de datos */
const cors = require('cors');                       /* librería de filtro de quien consume nuestra página web */
const { create } = require('express-handlebars');   /* librería plantilla (front-end) de express */ 
const csrf = require('csurf');                     /* librería de seguridad, tokeniza la sesión */
const User = require('./models/User.js');
require('dotenv').config();                         /* Lee las variables de entorno escritas en .env*/ 
const clientDB = require("./database/conexion.js");
//require('./database/conexion.js');                  /* Invoca al archivo db.js que se comunica con la base de datos MongoDB */ 



const app = express();

const corsOptions = {
    credentials: true,
    origin: process.env.PATHHEROKU || "*",
    methods: ["GET", "POST"],
}

app.use(cors(corsOptions));

//--------------------------------------------------------------------------
// Configuración de sesiones

// Configuración de middleware de usuario
app.set("trust proxy", 1);
app.use(
    session({
        secret: process.env.SECRETSESSION,  /* palabra ultrasecreta que le da seguridad a la sesión */
        resave: false,                      /* solicitud de autoguardado? */
        saveUninitialized: false,           /* solicitud de autoguardado? */
        name: "session-user",
        store: MongoStore.create({          /* Create = Hacer configuraciones de la instancia mongostore */
            clientPromise: clientDB,        /* Promesa = Objeto usado para programación asíncrona, disponible durante
                                            un tiempo determinado o indeterminado (la programación le dice) */
            dbName: process.env.DBNAME,
        }),
        cookie: { 
            secure: process.env.MODO === 'production', 
            maxAge: 30*24*60*60*1000 
        },
    })
);

// Invocación de la librería de sesiones flash
app.use(flash());

// Gestión de usuarios con passport (la variable user proviene de authController.js)
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, {id: user._id, userName: user.userName})); /* Creación nueva sesión usuario */
passport.deserializeUser( async(user, done) => {
    const userDB = await User.findById(user.id);
    return done(null, { id: userDB._id, userName: userDB.userName });
});

//--------------------------------------------------------------------------
// Invocación de los archivos .hbs

/* Para poder invocar los archivos handlebars como extensión .hbs (ahorro de espacio en el nombre de la extensión) */
const hbs = create({
    extname: ".hbs",
    partialsDir: ["views/components"],  /* Esto es para poder invocar htmls dentro de otros htmls */
});

//--------------------------------------------------------------------------
// Invocaciones

// Invocación de los motores de plantilla
app.engine(".hbs",hbs.engine);      /* Motor de plantilla */
app.set("view engine",".hbs");      /* La extensión va a ser .hbs */
app.set("views","./views");         /* Y va a estar dentro de la carpeta /views */

app.use(express.static(__dirname + "/public"));     /* Archivos estáticos: la carpeta /public quedará pública */
app.use(express.urlencoded({extended: true}));      /* Se invoca esta librería para llamar al req.body */

// Invocaciones base de datos
app.use(mongoSanitize());                           /* Sanitizador de la base de datos */

// Invocación de los token en nuestros sitios
app.use(csrf());                                    /* No pueden acceder a los sitios protegidos sin el token */
app.use((req, res, next) => {                       /* Tokeniza globalmente todos nuestras renderizaciones de páginas */
    res.locals.csrfToken = req.csrfToken(); 
    res.locals.mensajes = req.flash("mensajes");
    next();
}); 

// Invocación de las rutas
app.use("/home",require('./routes/home'));          /* Permite integrar la ruta /routes/home.js al backend */
app.use("/auth",require('./routes/auth'));          /* Permite integrar la ruta /routes/auth.js al backend */

// Invocación de la conexión con mongoDB
const PORT = process.env.PORT || 32
app.listen(PORT, () => console.log("Servidor andando 😍 - Puerto: " + PORT));

