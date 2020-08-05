var SVGRoot = null;

var TrueCoords = null;
var GrabPoint = null;
var DragTarget = null;

var CurrentFocus = null;
var CurrentlyEditing = 0;
var editMode = false;

window.shiftPress = false;
window.nodeCounter = 1;
window.unsaved = true;

window.addEventListener('keydown',myKeyDown,true);
window.addEventListener('keyup',myKeyUp,true);

window.bwmode = false;
if("bw" in getUrlVars()){
    window.bwmode = true;
}

function Init(evt){
    SVGRoot = document.getElementById('inline');
    TrueCoords = SVGRoot.createSVGPoint();
    GrabPoint = SVGRoot.createSVGPoint();
    Canvas = document.getElementById('Canvas');
    
    document.getElementById('n_file').addEventListener('change', loadbutton, false);

    $(window).bind('beforeunload', function(){
        if(window.unsaved){
            return 'There are unsaved changes to your analysis.';
        }
    });
}

function getSelText()
{
  var iframe = document.getElementById('left1');
  var txt = "";
  if(iframe.nodeName.toLowerCase() == 'div'){
      if(window.getSelection) {
          userSelection = window.getSelection();
      }else if(document.selection) {
          userSelection = document.selection.createRange();
      }
      if (userSelection.text){ // IE
          txt = userSelection.text;
      }else if(userSelection != ""){
          range = getRangeObject(userSelection);
          txt = userSelection.toString();
          // var span = document.createElement("span");
          // span.className="highlighted";
          // span.id = "node"+window.nodeIDcounter;
          // range.surroundContents(span);
          //postEdit("text", "edit", $('#ova_arg_area_div').html());
      }
  }else{
      var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      txt = iframe.contentWindow.getSelection().toString();
  }
  return txt;
}

function getRangeObject(selectionObject) {
    if(selectionObject.getRangeAt){
        return selectionObject.getRangeAt(0);
    }else{
        var range = document.createRange();
        range.setStart(selectionObject.anchorNode,selectionObject.anchorOffset);
        range.setEnd(selectionObject.focusNode,selectionObject.focusOffset);
        return range;
    }
}

function getAllText() {
    var iframe = document.getElementById('left1');
    if(iframe.nodeName.toLowerCase() == 'div'){
        txt = $('#analysis_text').html();
    }else{
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        txt = "";
    }
    return txt;
}

function setAllText(txt) {
    var iframe = document.getElementById('left1');
    if(iframe.nodeName.toLowerCase() == 'div'){
        $('#analysis_text').html(txt);
    }
}