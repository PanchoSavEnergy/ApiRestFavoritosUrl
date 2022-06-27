const { URL } = require("url");

const urlValidar = (req, res, next) => {
    try {
        const { origin } = req.body;
        const urlFrontEnd = new URL(origin);
        if(urlFrontEnd.origin !== "null"){          /* Comparando que el formato de la Url sea correcto */
            if(urlFrontEnd.protocol === "http:" || urlFrontEnd.protocol === "https:"){
                return next();   
            }
            throw new Error("URL ingresada debe contener el formato https://");
        } else {
            throw new Error("URL ingresada no es válida 😢");
        }
    } catch (error) {
        if(error.message === "Invalid URL"){
            req.flash("mensajes", [{ msg: "URL ingresada no es válida 😢" }]);    
        } else {
            req.flash("mensajes", [{ msg: error.message }]);
        }
        return res.redirect("/home");
    }
}

module.exports = urlValidar