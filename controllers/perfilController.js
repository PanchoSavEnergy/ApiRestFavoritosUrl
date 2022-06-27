// Este controlador se invoca en el archivo home.js

const formidable = require('formidable');       /* Gestión del tamaño de la imagen de perfil */
const Jimp = require('jimp');                   /* Librería de edición de imágenes */
const fs = require('fs');                       /* Librería filesystem para manipular archivos de sistema (nativa) */
const path = require('path');                   /* Librería interna de node.js que interpreta comandos de directorios */
const User = require('../models/User');

module.exports.formPerfil = async(req, res) => {
    
    try {
        const user = await User.findById(req.user.id);
        res.render('perfil', {user: req.user, imagen: user.imagen});
        
    } catch (error) {
        req.flash("mensajes", [{msg: "Error al leer el usuario"}]); 
        return res.redirect("/home/perfil");
    }
}

module.exports.editarFotoPerfil = async(req, res) => {
    const form = new formidable.IncomingForm();
    form.maxFileSize = 5 * 1024 * 1024;        /* Tamaño máximo = 50 MB */

    form.parse(req, async(err, fields, files) => {
        try {
            if(err){
                throw new Error("Falló la subida de la imagen");
            }
            //console.log(fields);
            //console.log(files.myFile);
            const file = files.myFile;

            if(file.originalFilename === ""){
                throw new Error("Por favor, agrega una imagen");
            }

            const imageTypes = ["image/jpeg","image/png"];

            if(!imageTypes.includes(file.mimetype)){
                throw new Error("El formato de la imagen debe ser .jpg o .png");
            }

            if(file.size > form.maxFileSize){
                throw new Error("La imagen excede el límite de 5MB. Por favor, reduce la imagen");
            }

            const extension = file.mimetype.split("/")[1];
            const dirFile = path.join(__dirname,`../public/img/perfiles/${req.user.id}.${extension}`);

            fs.renameSync(file.filepath, dirFile);              /* Reemplazar ubicación y nombre del archivo */

            const image = await Jimp.read(dirFile);             /* Leyendo el id de la imagen guardada en la base de datos */
            image.resize(200,200).quality(90).writeAsync(dirFile);  /* Cambia tamaño, reduce calidad a 80% y guarda */



            const user = await User.findById(req.user.id);
            user.imagen = `${req.user.id}.${extension}`;
            await user.save();

            req.flash("mensajes", [{msg: "Ya se subió la imagen"}]);  
        } catch (error) {
            req.flash("mensajes", [{msg: error.message}]);    
        } finally {
            return res.redirect("/home/perfil");
        }
        
    });
}