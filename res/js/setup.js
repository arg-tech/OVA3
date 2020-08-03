/*
function expandform(show) {
    if($('#adsep').is(':visible')){
        $('#adsep').hide();
        if(show == 'fs'){
            $('#ep').children().hide();
            $('#ep').animate({width: 'toggle'}, 300, function() {
                $('#fs').animate({width: "80%"}, 600);
                $('#showep').show();
            });
        }else{
            $('#fs').children().hide();
            $('#fs').animate({width: 'toggle'}, 300, function() {
                $('#ep').animate({width: "80%"}, 600);
                $('#showfs').show();
            });
        }
    } 
}*/

function resetform(c) {
    if(c == 'fs'){
        $('#showep').hide();
        $('#fs').animate({width: "30%"}, 600, function() {
            $('#ep').show();
            $('#ep').children().show();
            $('#adsep').show();
        });
    }else{
        $('#showfs').hide();
        $('#ep').animate({width: "30%"}, 600, function() {
            $('#fs').show();
            $('#fs').children().show();
            $('#adsep').show();
        });
    }   
}


function ovaPlus() {
    if($('#afinput').val() != "" && $('#asinput').val() != ""){
        extra = "&af=" + $('#afinput').val() + "&as=" + $('#asinput').val();
    }
    if($('#urlinput').val() == ""){
        window.location.href = "analyse.php?url=local&plus=true" + extra;
    }else{
        window.location.href = "analyse.php?url=" + $('#urlinput').val() + "&plus=true" + extra;
    }
    return false;
}


function ovaReg() {
    if($('#urlinput').val() == ""){
        window.location.href = "analyse.php?url=local";
    }else{
        window.location.href = "analyse.php?url=" + $('#urlinput').val();
    }
    return false;
}
