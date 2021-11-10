function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function striphtml(html){
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
 }