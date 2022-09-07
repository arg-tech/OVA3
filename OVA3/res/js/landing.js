$(function() {
        'use strict';

  $('.form-control').on('input', function() {
          var $field = $(this).closest('.form-group');
          if (this.value) {
            $field.addClass('field--not-empty');
          } else {
            $field.removeClass('field--not-empty');
          }
        });

});

function ovaReg() {
    if($('#dlgmode').prop('checked')) {
        plus = "&plus=true";
    }else{
        plus = "";
    }

    if($('#urlinput').val() == ""){
        url = "local";
    }else{
        url = $('#urlinput').val();
    }

    if($('#afinput').val() != "" && $('#asinput').val() != ""){
        extra = "&af=" + $('#afinput').val() + "&as=" + $('#asinput').val();
    }else{
        extra = ''
    }

    window.location.href = "analyse.php?url=" + url + plus + extra;

    return false;
}
