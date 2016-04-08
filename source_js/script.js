var divs = document.getElementsByClassName('alert');
for(var i=0; i<divs.length; i++) {
  divs[i].addEventListener("click", highlightThis);
  /*
  divs[i].addEventListener("click", highlightThis, true);
  divs[i].addEventListener("click", highlightThis, false);*/
}

function highlightThis(event) {
    //event.stopPropagation();
  
    var backgroundColor = this.style.backgroundColor;
    this.style.backgroundColor='yellow';
    alert(this.className);
    this.style.backgroundColor=backgroundColor;
}



$(window).on('hashchange', function(e){
    var url = window.location.href;
    doHighlight(url);
});

function doHighlight(url) {
    if (url.indexOf("settings") > -1) {
        $("#menu-settings").addClass("active");
        $("#menu-tasks").removeClass("active");
        $("#menu-users").removeClass("active");
    } 
    else if (url.indexOf("users") > -1) {
        $("#menu-users").addClass("active");
        $("#menu-tasks").removeClass("active");
        $("#menu-settings").removeClass("active");
    } 
    else if (url.indexOf("tasks") > -1) {
        $("#menu-tasks").addClass("active");
        $("#menu-settings").removeClass("active");
        $("#menu-users").removeClass("active");
    } 
}

var url = window.location.href;
doHighlight(url);
