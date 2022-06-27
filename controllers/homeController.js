const Url = require("../models/Url")
const {nanoid} = require('nanoid');          /* Librería que da un ID único a cada elemento de la base de datos */

// async significa: lectura de la base de datos
const leerUrls = async(req, res) => {
    try {
        /* lean transforma el objeto de mongoose a objeto javascript y la consulta es más rápida */
        const urls = await Url.find({user: req.user.id}).lean();    /* req.user.id viene de passport */
        res.render('home', {urls: urls});    /* Renderiza el home.hbs en la ruta raíz, y le pasa como parámetro el array urls */    
    } catch (error) {
        //console.log(error);
        //res.send("Error al leer las Urls provenientes de la base de datos");
        req.flash("mensajes", [{msg: error.message}]);      /* Invocando flash con el error encontrado */
        return res.redirect("/home");
    }
};

const agregarUrl = async(req, res) => {
    try {
        const originURL = req.body;
        const url = new Url({
            origin: originURL.origin, 
            shortURL: nanoid(8) /* Valor creado automáticamente */, 
            user: req.user.id
        });
              
        //console.log(url);
        await url.save();
        req.flash("mensajes", [{msg: "Url agregada 😎"}]);      /* Invocando flash con el error encontrado */
        res.redirect("/home");

    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);      /* Invocando flash con el error encontrado */
        return res.redirect("/home");
    }
};

const eliminarUrl = async(req, res) => {
    const {id} = req.params;
    try {
        //await Url.findByIdAndDelete(id);
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)){
            throw new Error("Este usuario no tiene permisos para eliminar esta Url");
        }
        await url.remove();
        req.flash("mensajes", [{msg: "Url eliminada 👍"}]);
        res.redirect("/home");
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);  
        return res.redirect("/home");
    }
}

const editarUrlForm = async(req, res) => {
    const { id } = req.params;
    try {
        const url = await Url.findById(id).lean();

        if(!url.user.equals(req.user.id)){
            throw new Error("Este usuario no tiene permisos para editar esta Url")
        }

        res.render('home', {url});

    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);      /* Invocando flash con el error encontrado */
        return res.redirect("/home");
    }
}

const editarUrl = async(req, res) => {
    const { id } = req.params;
    const { origin } = req.body;
    try {
        const url = await Url.findById(id);

        if(!url.user.equals(req.user.id)){
            throw new Error("Este usuario no tiene permisos para editar esta Url")
        }

        await url.updateOne({origin});
        req.flash("mensajes", [{msg: "Url editada"}]);
        //await Url.findByIdAndUpdate(id, {origin: origin});
        res.redirect("/home");
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/home");
    }
}

const redireccionamiento = async(req, res) => {
    const {shortURL} = req.params; 
    try {
        const urlDB = await Url.findOne({shortURL});
        res.redirect(urlDB.origin);
    } catch (error) {
        req.flash("mensajes", [{msg: "No existe esta Url configurada"}]);    
        return res.redirect("/auth/login");
    }
}

module.exports = { 
    leerUrls, 
    agregarUrl, 
    eliminarUrl, 
    editarUrlForm, 
    editarUrl, 
    redireccionamiento, 
};