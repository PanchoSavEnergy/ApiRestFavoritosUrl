// JavaScript FrontEnd

console.log("Hola soy el front-end");

document.addEventListener('click', e => {
    if(e.target.dataset.short){
        //const url = `http://localhost:32/home/${e.target.dataset.short}`;
        const url = `${window.location.origin}/home/${e.target.dataset.short}`;

        navigator.clipboard
            .writeText(url)
            .then(() => {
                console.log("Url copiada en el portapapeles");
            })
            .catch((err) => {
                console.log("Hubo un error copiando la Url - ", err);
            })
    }
    
})