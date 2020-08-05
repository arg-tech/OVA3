var SVGRoot = null;

var TrueCoords = null;
var GrabPoint = null;
var DragTarget = null;

var IATMode = true;
var CurrentFocus = null;
var CurrentlyEditing = 0;
var editMode = false;

window.shiftPress = false;
window.nodeCounter = 1;

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

function addParticipant(firstname, surname) {
    var p = new Participant;
    p.firstname = firstname;
    p.surname = surname;
    p.id = participants.length+1;
    $('#p_select').append($("<option/>", {
        value: p.id,
        text: firstname+" "+surname
    }));
    participants.push(p);
    return p;
}

function addLocution(node) {
  if($('#p_firstname').val() != ''){
      firstname = $('#p_firstname').val();
      surname = $('#p_surname').val();
      $('#p_firstname').val('');
      $('#p_surname').val('');
      addParticipant(firstname,surname);
      participantID = participants.length;
  }else{
      participantID = $('#p_select').val();
      participant = participants[participantID-1];
      firstname = participant.firstname;
      surname = participant.surname;
  }

  window.nodeCounter = window.nodeCounter + 1;
  var newLNodeID = window.nodeCounter;
  //var ltext = 'Speaker X says '.concat(t);
  var ltext = (firstname + ' ' + surname + ' ' + 'says ').concat(t);
  console.log(TrueCoords.x + ' ' + TrueCoords.y);
  var n = nodes[nodes.length-1];
  console.log(n.x);
  AddNode(ltext, 'L', newLNodeID, (n.x + 450), n.y);

  window.nodeCounter = window.nodeCounter + 1;
  var newYANodeID = window.nodeCounter;
  AddNode('Asserting', 'YA', newYANodeID, (n.x+225), n.y);

  var edge = newEdge(newLNodeID, newYANodeID);
  DrawEdge(newLNodeID, newYANodeID)
  UpdateEdge(edge);
  edge = newEdge(newYANodeID, newNodeID);
  DrawEdge(newYANodeID, newNodeID);
  UpdateEdge(edge);
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

function addlclick(skipcheck){
    if($('#p_select').val() == '-' && !skipcheck){
        if($('#prt_name').is(':visible')){
            newprt();
            return false;
        }
        if($('#p_firstname').val() == ''){
            $('#p_firstname').css('border-color', '#f00');
            return false;
        }else{
            $('#p_firstname').css('border-color', '#bbb');
        }
        if($('#p_surname').val() == ''){
            $('#p_surname').css('border-color', '#f00');
            return false;
        }else{
            $('#p_surname').css('border-color', '#bbb');
        }
    }
    console.log(mySel);
    addLocution(mySel);
    $('#new_participant').hide();
    $('#p_sel_wrap').show();
    $('#p_select').val('-');
    $('#p_name').val('');
    $('#prt_name').show();
    $('#locution_add').hide();
    $('#socialusers').hide();
    $('#modal-bg').hide();

    return false;
}

function addlcancel(){
    $('#new_participant').hide();
    $('#p_sel_wrap').show();
    $('#p_select').val('-');
    $('#p_name').val('');
    $('#prt_name').show();
    $('#socialusers').hide();
    $('#locution_add').hide();
    $('#modal-bg').hide();

    var n = nodes[nodes.length-1];
    deleteNode(n);

    return false;
}

function pfilter(element) {
    var value = $(element).val();
    var rgval = new RegExp(value, "i");
    showing = 0;

    ipsn = $('#p_name').position();
    ih = $('#p_name').outerHeight();
    st = ipsn.top + ih;
    $('#socialusers').css({ "top": st+"px", "left": ipsn.left+"px" });

    $(".pselname").each(function() {
        if ($(this).text().search(rgval) > -1) {
            $(this).show();
            showing = showing + 1;
        } else {
            $(this).hide();
        }
    });

    if(showing > 0 && showing < 15){
        $('#socialusers').show();
    }else{
        $(".pselname").hide();
        $('#socialusers').show();
    }
}

function newprt() {
    $('#socialusers').hide();
    $('#prt_name').hide();
    $('#p_sel_wrap').hide();

    var np_name = $('#p_name').val();
    splt = np_name.split(' ');
    np_firstname = splt.shift();
    np_surname = splt.join(' ');

    $('#p_firstname').val(np_firstname);
    $('#p_surname').val(np_surname);

    $('#new_participant').show();

    return false;
}
