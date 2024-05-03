setTimeout(() => {
    document.getElementById('show-question').checked = true;
    setTimeout(() => {
        document.getElementById('show-answer').checked = true;
        setTimeout(() => {
            document.getElementById('speech').style.display = 'none';
        }, 6000);
    }, 6000);
}, 4000);


function goToPage(pageSuivante){
    // On met animationSortie en z-index 1000
    document.querySelector('.animationSortie').style.zIndex = 1000;

    let bands = document.querySelectorAll('.band');
    for (let i = 0; i < bands.length; i++) {
        var color = ["DCBBB5","D5A099","DB726E"];
        var style = ["primary","secondary","tertiary"]

        var randomColor = color[Math.floor(Math.random() * color.length)];
        var randomStyle = style[Math.floor(Math.random() * style.length)];
        
        bands[i].classList.remove("primaryOUT");
        bands[i].classList.remove("secondaryOUT");
        bands[i].classList.remove("tertiaryOUT");
        
        bands[i].classList.remove("primary");
        bands[i].classList.remove("secondary");
        bands[i].classList.remove("tertiary");
        bands[i].classList.add(randomStyle);
        bands[i].style.backgroundColor = "#" + randomColor;

        document.cookie = "band" + i + "=" + randomColor + "; path=/";

    }

    // On attend 3 second avant de changer de page
    setTimeout(() => {
        if(!pageSuivante){
            window.location.href = "/index.html#1";
        }
        else{
            window.location.href = "./src/pages/portfolio.html#1";
        }
    }, 2500);

}

// Si une touche est appyée on display none la question
document.addEventListener('keydown', function (event) {
    document.getElementById('speech').style.display = 'none';
});




function inThePage(){
    document.querySelector('.animationSortie').style.zIndex = 1000;

    let bands = document.querySelectorAll('.band');
    for (let i = 0; i < bands.length; i++) {

        var color = ["DCBBB5","D5A099","DB726E"];
        var style = ["primaryOUT","secondaryOUT","tertiaryOUT"]

        var randomStyle = style[Math.floor(Math.random() * style.length)];
        // on get le cookie de la band
        var cookie = document.cookie.split(';');
        var cookieValue = "";
        for (let j = 0; j < cookie.length; j++) {
            if(cookie[j].includes("band" + i)){
                cookieValue = cookie[j].split('=')[1];
            }
        }
        bands[i].style.backgroundColor = "#" + cookieValue;
        bands[i].classList.remove("primaryOUT");
        bands[i].classList.remove("secondaryOUT");
        bands[i].classList.remove("tertiaryOUT");
        
        bands[i].classList.remove("primary");
        bands[i].classList.remove("secondary");
        bands[i].classList.remove("tertiary");
        bands[i].classList.add(randomStyle);

    }

    setTimeout(() => {
        document.querySelector('.animationSortie').style.zIndex = -10;
    }, 2500);

}