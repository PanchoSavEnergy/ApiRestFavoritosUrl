// Este request ya tiene todas las configuraciones de la librería passport

module.exports = (req, res, next) => {
    if(req.isAuthenticated()){              /* En caso que el usuario tenga una sesión activa */
        return next(); 
    }
    res.redirect("/auth/login");
}