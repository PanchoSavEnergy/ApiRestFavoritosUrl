const express = require('express');     /* Invoca librería de plantillas express (plantillas pag web) */
const { leerUrls, agregarUrl, eliminarUrl, editarUrlForm, editarUrl, redireccionamiento } = require("../controllers/homeController");
const { formPerfil, editarFotoPerfil } = require('../controllers/perfilController');
const urlValidar = require('../middlewares/urlValidar');
const verificarUser = require('../middlewares/verificarUser');
const router = express.Router();        /* Invoca las rutas integradas en la clase express */

router.get("/", verificarUser, leerUrls);
router.post("/", verificarUser, urlValidar, agregarUrl);
router.get("/eliminar/:id", verificarUser, eliminarUrl);
router.get("/editar/:id", verificarUser, editarUrlForm);
router.post("/editar/:id", verificarUser, urlValidar, editarUrl);
router.get("/perfil", verificarUser, formPerfil);
router.post("/perfil", verificarUser, editarFotoPerfil);
router.get("/:shortURL", redireccionamiento);
//router.get("/home/QUBXNMKy", redireccionamiento);

module.exports = router;