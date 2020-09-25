var SVGRoot = null;
var SVGRootG = null;

var TrueCoords = null;
var GrabPoint = null;
var DragTarget = null;


var IATMode = true;
var CurrentFocus = null;
var CurrentlyEditing = 0;
var editMode = false;
var FormOpen = false;
var dragEdges = [];

const NAV_MAP = {
  187: { dir:  1, act: 'zoom', name: 'in' } /* + */,
  61: { dir:  1, act: 'zoom', name: 'in' } /* + WTF, FF? */,
 189: { dir: -1, act: 'zoom', name: 'out' } /* - */,
 173: { dir: -1, act: 'zoom', name: 'out' } /* - WTF, FF? */,
  37: { dir: -1, act: 'move', name: 'left', axis: 0 } /* ⇦ */,
  38: { dir: -1, act: 'move', name: 'up', axis: 1 } /* ⇧ */,
  39: { dir:  1, act: 'move', name: 'right', axis: 0 } /* ⇨ */,
  40: { dir:  1, act: 'move', name: 'down', axis: 1 } /* ⇩ */
};
const NF = 16;
var VB = null;
var DMAX = 0;
var WMIN = 0;
let rID = null, f = 0, nav = {}, tg = Array(4);
var scale = 0;

//zooming on mousewheel croll
const zoom = (event) => {
  if (FormOpen == false) {
    tsvg = document.getElementById('inline').getBoundingClientRect();
    svgleft = tsvg.left;
    //console.log(document.activeElement.tagName);
    //console.log(event.clientX);
    if (event.clientX > svgleft) {
      event.preventDefault();
      if (event.deltaY < 0) {
        tg[2] = VB[2]/Math.pow(1.1, -1);
        tg[3] = VB[3]/Math.pow(1.1, -1);
        tg[0] = .00001*(DMAX[0] - tg[2]);
        tg[1] = .00001*(DMAX[1] - tg[3]);
      } else {
        tg[2] = VB[2]/Math.pow(1.1, 1);
        tg[3] = VB[3]/Math.pow(1.1, 1);
        tg[0] = .00001*(DMAX[0] - tg[2]);
        tg[1] = .00001*(DMAX[1] - tg[3]);
      }

      nav.act = 'zoom';
      updateView();
    }
  }
}

window.shiftPress = false;
window.nodeCounter = 1;
window.unsaved = true;

window.addEventListener('keydown',myKeyDown,true);
window.addEventListener('keyup',myKeyUp,true);
document.onwheel = zoom;

window.bwmode = false;
if("bw" in getUrlVars()){
    window.bwmode = true;
}




function Init(evt){
    SVGRoot = document.getElementById('inline');
    SVGRootG = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    SVGRoot.appendChild(SVGRootG);
    TrueCoords = SVGRoot.createSVGPoint();
    GrabPoint = SVGRoot.createSVGPoint();

    VB = SVGRoot.getAttribute('viewBox').split(' ').map(c => +c);
    DMAX = [10604, 135472];
    WMIN = 455;


    document.getElementById('n_file').addEventListener('change', loadbutton, false);
    window.sessionid = $.now().toString()+Math.random().toString().substring(3,8);


    $(window).bind('beforeunload', function(){
        if(window.unsaved){
            return 'There are unsaved changes to your analysis.';
        }
    });

    $.getJSON("browserint.php?x=ipxx&url="+window.DBurl+"/schemes/all/", function(json_data){
    schemes = json_data.schemes;
    schemes.sort(sort_by('name', true, function(a){return a.toUpperCase()}));
    for(index in schemes){
        scheme = schemes[index];
        scheme_name = scheme.name.replace(/([a-z])([A-Z])/g, "$1 $2");
        scheme_type = scheme.schemeTypeID

        if(scheme_type == 1 || scheme_type == 2 || scheme_type == 3 || scheme_type == 9){
            $('#s_ischeme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
        }else if(scheme_type == 4 || scheme_type == 5){
            $('#s_cscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
        }else if(scheme_type == 7 || scheme_type == 12){
            $('#s_lscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
        }else if(scheme_type == 11){
            $('#s_mscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
        }else if(scheme_type == 6){
            $('#s_pscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
        }else if(scheme_type == 8){
            $('#s_tscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
        }
    }
});

 $.getJSON("browserint.php?x=ipxx&url="+window.SSurl, function(json_data){
    window.ssets = {};
    schemesets = json_data.schemesets;
    schemesets.sort(sort_by('name', true, function(a){return a.toUpperCase()}));
    for(index in schemesets){
        schemeset = schemesets[index];
        $('#s_sset').append('<option value="' + schemeset.id + '">' + schemeset.name + '</option>');
        window.ssets[schemeset.id] = schemeset.schemes;
    }
  });
  getSocial();

//   $('#analysis_text').on('paste', function() {
//     console.log("on paste");
//     setTimeout(function(e) {
//         var domString = "", temp = "";
//         $("#analysis_text div").each(function()
//         {
//             temp = $(this).html();
//             domString += ((temp == "<br>") ? "" : temp) + "<br>";
//         });
//
//         if(domString != ""){
//             $('#analysis_text').html(domString);
//         }
//         console.log($("analysis_text"));
//         var orig_text = $('#analysis_text').html();
//         console.log(orig_text);
//         orig_text = orig_text.replace(/<br>/g, '&br&');
//         orig_text = orig_text.replace(/<br \/>/g, '&br&');
//         orig_text = orig_text.replace(/<span([^>]*)class="highlighted([^>]*)>([^>]*)<\/span>/g, "&span$1class=\"highlighted$2&$3&/span&");
//
//         $('#analysis_text').html(orig_text);
//
//         var repl_text = $('#analysis_text').text();
//         repl_text = repl_text.replace(/&br&/g, '<br>');
//         repl_text = repl_text.replace(/&span([^&]*)class="highlighted([^&]*)&([^&]*)&\/span&/g, "<span$1class=\"highlighted$2>$3</span>");
//
//         $('#analysis_text').html(repl_text);
//     }, 1);
// });
  // var resetBtn = drawResetButton();
  // SVGRoot.append(resetBtn);
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

          var span = document.createElement("span");
          if (IATMode == false) {
            span.className="highlighted";
            if (window.nodeCounter == 1) {
              span.id = "node"+window.nodeCounter+1;
            } else {
              span.id = "node"+window.nodeCounter;
            }
          } else {
            span.className="hlcurrent";
            if (window.nodeCounter == 1) {
              span.id = "node"+window.nodeCounter+3;
            } else {
              span.id = "node"+window.nodeCounter+2;
            }
            span.id = "node"+(window.nodeCounter+2);
          }
          range.surroundContents(span);
          //postEdit("text", "edit", $('#analysis_text').html());
          postEdit("text", "edit", $('#analysis_text').html());
      }
  }else{
      var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      txt = iframe.contentWindow.getSelection().toString();
  }
  return txt;
}

function hlcurrent(nodeID) {
  span = document.getElementById("node"+nodeID);
  console.log(span);
  if (span != null) {
    span.className="highlighted";
      //$(".hlcurrent").removeClass("highlighted");

      if(nodeID != 'none'){
          //$("#node"+nodeID).addClass("hlcurrent");
          span.className="highlighted";
          //if($("#node"+nodeID).length != 0) {
              $('#analysis_text').animate({
              scrollTop: $('#analysis_text').scrollTop() + $("#node"+nodeID).offset().top - 200
              }, 1000);
          //}
      }
  }

}

function remhl(nodeID) {
    var span;
    span = document.getElementById("node"+nodeID)
    if(span != null){
        var text = span.textContent || span.innerText;
        var node = document.createTextNode(text);
        span.parentNode.replaceChild(node, span);
    }
}

function postEdit(type, action, content){
    if(type == 'text'){
      console.log(window.sessionid);
        $.post( "helpers/edit.php", { type: type, action: action, cnt: content, akey: window.akey, sessionid: window.sessionid } ).done(function( data ) {
            dt = JSON.parse(data);
            //lastedit = dt.last;
        });
    }else{
        if(content == null){
            alert("Error with "+type+" "+action);
        }else{
            $.post( "helpers/edit.php", { type: type, action: action, cnt: JSON.stringify(content), akey: window.akey, sessionid: window.sessionid } ).done(function( data ) {
                dt = JSON.parse(data);
                //lastedit = dt.last;
            });
        }
    }
    window.unsaved = true;
}

function getSocial() {
    $.getJSON("social.json", function(json_data){
        for(i in json_data.users) {
            user = json_data.users[i];
            uimg = '<img src="res/img/avatar_blank.gif" />';
            for(j in user.info){
                if(user.info[j].name == 'Avatar'){
                    uimg = '<img src="'+user.info[j].value+'" />'
                }
            }
            $('<a href="#" class="pselname" onClick="$(\'#p_firstname\').val(\''+user.firstname+'\');$(\'#p_surname\').val(\''+user.surname+'\');addlclick(true);return false;">'+uimg+user.firstname+' '+user.surname+'</a>').appendTo('#socialusers');
            addParticipant(user.firstname,user.surname);
        }
        $('<a href="#" style="padding-left: 56px;" onClick="newprt();return false;">+ Add new</a>').appendTo('#socialusers');
    });
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

  var ltext = (firstname + ' ' + surname + ': ').concat(t);
  var nindex = findNodeIndex(CurrentlyEditing);
  var n = nodes[nindex];
  var yCoord = n.y;
  if (nodes[nindex+1]){
    if (nodes[nindex+1].type == 'L' ) {
      yCoord +=50;
    }
  }

  AddNode(ltext, 'L', '0', participantID, newLNodeID, (n.x + 450), yCoord);
  var index = findNodeIndex(newLNodeID);


  window.nodeCounter = window.nodeCounter + 1;
  var newYANodeID = window.nodeCounter;
  AddNode('Asserting', 'YA', '74', 0, newYANodeID, (n.x+225), yCoord);

  var edge = newEdge(newLNodeID, newYANodeID);
  DrawEdge(newLNodeID, newYANodeID)
  UpdateEdge(edge);
  edge = newEdge(newYANodeID, CurrentlyEditing);
  DrawEdge(newYANodeID, CurrentlyEditing);
  UpdateEdge(edge);

  // span = document.getElementById("node"+newLNodeID);
  // span.className="highlighted";
  console.log(newLNodeID);
  hlcurrent(newLNodeID);
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
        $('#p_surname').css('border-color', '#bbb');
        // if($('#p_surname').val() == ''){
        //     $('#p_surname').css('border-color', '#f00');
        //     return false;
        // }else{
        //     $('#p_surname').css('border-color', '#bbb');
        // }
        $('#locution_add').hide();
    }
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

function getNodesIn(node) {
    var nlist = [];
    var l = edges.length;
    for (var i = 0; i < l; i++) {
        if(edges[i].toID == node.nodeID) {
          var  nID = edges[i].fromID;
          var nIndex = findNodeIndex(nID);
            nlist.push(nodes[nIndex]);
        }
    }
    return nlist;
}

function getNodesOut(node) {
    var nlist = [];
    var l = edges.length;
    for (var i = 0; i < l; i++) {
        if(edges[i].fromID == node.nodeID) {
          var  nID = edges[i].toID;
          var nIndex = findNodeIndex(nID);
          nlist.push(nodes[nIndex]);
        }
    }
    return nlist;
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


    var index = findNodeIndex(CurrentlyEditing);
    var toDelete = true;

    for (var i = 0; i < edges.length; i++) {
      if (edges[i].toID == CurrentlyEditing || edges[i].fromID == CurrentlyEditing) {
        toDelete = false;
      }
    }

    if (toDelete == true) {
      deleteNode(nodes[index]);
    }
    remhl(CurrentlyEditing+1)
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


function addCQ(fesel) {
    fename = fesel.id.substring(2);
    if(fesel.selectedIndex == 0){
        $('#cqi-'+fename).css('color', '#c0392b');
    }else{
        $('#cqi-'+fename).css('color', '#27ae60');
    }
}

function setdescriptors(schemeID, node) {
    document.getElementById("descriptor_selects").style.display = "block";
    //document.getElementById("node_edit").style.height = "350px";

    $.getJSON("browserint.php?x=ipxx&url="+window.DBurl+"/formedges/scheme/"+schemeID, function(json_data){
        $('#descriptor_selects').empty();
        $('#descriptor_selects').append('<b>Descriptors</b>');
        $('#cq_selects').empty();
        var nodes_in = getNodesIn(node);
        var nodes_out = getNodesOut(node);
        var adddesc = false;
        var addcq = false;
        window.editnode = node;

        var l = nodes.length;
        var nodeselect = $('<select class="cqselect" onChange="addCQ(this);" style="display:none;"></select>');
        nodeselect.append('<option value="-">Click to select</option>');
        var ucselect = $('<select class="cqselect" onChange="addCQ(this);" style="display:none;"></select>');
        ucselect.append('<option value="-">Click to select</option>');
        for(index in nodes_in){
            nin = nodes_in[index];
            if(nin.type == 'I' || nin.type == 'L'){
                nodeselect.append('<option value="' + nin.text + '">' + nin.text + '</option>');
            }else{
                nodes_in_in = getNodesIn(nin);
                for(inindex in nodes_in_in){
                    ninin = nodes_in_in[inindex];
                    if(ninin.type == 'I'){
                        ucselect.append('<option value="' + ninin.text + '">' + ninin.text + '</option>');
                    }
                }
            }
        }

        for(index in json_data.formedges) {
            adddesc = true;
            formedge = json_data.formedges[index];

            if(formedge.Explicit == 1){
                selected = node.descriptors['s_'+formedge.name];
                var newselect = $('<select id="s_'+formedge.name+'" class="dselect" onChange="addCQ(this);"></select>');
                newselect.append('<option value="-">Click to select</option>');

                if(formedge.CQ != null){
                    addcq = true;
                    $('#cq_selects').prepend('<div style="clear:both"><strong>Q: </strong>'+formedge.CQ+' <div style="color:#c0392b; float:right; font-size:22px; margin-top:-8px;" id="cqi-'+formedge.name+'">&#x25CF;</div></div>');
                }

                if(formedge.formEdgeTypeID in {'1':'','5':'','9':'','11':'','13':'','15':'','16':'','20':'','22':''}){
                    for(index in nodes_in) {
                        nin = nodes_in[index];
                        if(nin.type == 'I' || nin.type == 'L'){
                            if(nin.text == selected){
                                $('#cqi-'+formedge.name).css('color', '#27ae60');
                                newselect.append('<option value="' + nin.text + '" selected="selected">' + nin.text + '</option>');
                            }else{
                                newselect.append('<option value="' + nin.text + '">' + nin.text + '</option>');
                            }
                        }
                    }
                }else if(formedge.formEdgeTypeID in {'2':'','7':'','10':'','12':'','14':'','17':'','21':''}){
                    for(index in nodes_out) {
                        nut = nodes_out[index];
                        if(nut.text == selected){
                            newselect.append('<option value="' + nut.text + '" selected="selected">' + nut.text + '</option>');
                        }else{
                            newselect.append('<option value="' + nut.text + '">' + nut.text + '</option>');
                        }
                    }
                }else{
                    continue;
                }

                $('#descriptor_selects').append('<label id="">'+formedge.name+'</label>');
                $('#descriptor_selects').append(newselect);
            }else{
                if(formedge.CQ != null){
                    addcq = true;
                    $('#cq_selects').append('<div style="clear:both"><strong>Q: </strong>'+formedge.CQ+' <div style="color:#c0392b; float:right; font-size:22px; margin-top:-8px;" id="cqi-'+formedge.name+'"><a href="" onClick="$(\'#cq'+formedge.name+'\').toggle();$(this).html($(this).text()==\'&#x25BE;\'?\'&#x25B4;\':\'&#x25BE;\');return false;" style="color:#444;text-decoration:none;font-size:16px;">&#x25BE;</a>&#x25CF;</div></div>');
                    if(formedge.descriptorID != null){
                        nsclone = nodeselect.clone().prop('id', 'cq'+formedge.name);
                    }else{
                        nsclone = ucselect.clone().prop('id', 'cq'+formedge.name);
                    }
                    $('#cq_selects').append(nsclone);
                    if('cq'+formedge.name in node.cqdesc && node.cqdesc['cq'+formedge.name] != '-'){
                        $('#cqi-'+formedge.name).css('color', '#27ae60');
                        $("#cq"+formedge.name+" option").filter(function() {
                            return $(this).text() == node.cqdesc['cq'+formedge.name];
                        }).prop('selected', true);
                    }
                }
            }
        }

        if(!adddesc){
            $('#descriptor_selects').hide();
        }

        if(window.cqmode && addcq){
            $('#cq_selects').prepend('<b>Critical Questions</b>');
            $('#cq_selects').show();
        }else{
            $('#cq_selects').hide();
        }
    });
}

function filterschemes(schemesetID) {
    $("#s_cscheme option").each(function() {
        $(this).show();
    });

    $("#s_ischeme option").each(function() {
        $(this).show();
    });

    $("#s_lscheme option").each(function() {
        $(this).show();
    });

    $("#s_mscheme option").each(function() {
        $(this).show();
    });

    $("#s_pscheme option").each(function() {
        $(this).show();
    });

    $("#s_tscheme option").each(function() {
        $(this).show();
    });

    if(schemesetID != "0"){
        setschemes = window.ssets[schemesetID]

        $("#s_cscheme option").each(function() {
            if(setschemes.indexOf($(this).val()) == -1){
                $(this).hide();
            }
        });

        $("#s_ischeme option").each(function() {
            if(setschemes.indexOf($(this).val()) == -1){
                $(this).hide();
            }
        });

        $("#s_lscheme option").each(function() {
            if(setschemes.indexOf($(this).val()) == -1){
                $(this).hide();
            }
        });

        $("#s_mscheme option").each(function() {
            if(setschemes.indexOf($(this).val()) == -1){
                $(this).hide();
            }
        });

        $("#s_pscheme option").each(function() {
            if(setschemes.indexOf($(this).val()) == -1){
                $(this).hide();
            }
        });

        $("#s_tscheme option").each(function() {
            if(setschemes.indexOf($(this).val()) == -1){
                $(this).hide();
            }
        });
    }
}

var sort_by = function(field, reverse, primer){
    var key = function (x) {return primer ? primer(x[field]) : x[field]};
    return function (a,b) {
        var A = key(a), B = key(b);
        return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];
    }
}


function genldot() {
    var doto = "digraph odg {";
    var ranks = "";
    var alreadyDrawn={};
    if("plus" in getUrlVars()){
        doto = doto + "rankdir=RL;";
    }

    for (var i = 0, l = nodes.length; i < l; i++) {
        dnode = nodes[i];
        //console.log(dnode);
        //console.log(doto);
        doto = doto + dnode.nodeID + ' [label="xxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx"];';
        //console.log(doto);

        if(dnode.type != 'I' && dnode.type != 'L'){

            dout = getNodesOut(dnode);
            console.log("dout length: " + dout.length);
            for (var j = 0, ol = dout.length; j < ol; j++) {
              console.log(dnode);
              console.log(dout[j]);
              if (alreadyDrawn[dnode.nodeID+"-"+dout[j].nodeID]!==100) {
                doto = doto + dnode.nodeID + ' -> ' + dout[j].nodeID;
                alreadyDrawn[dnode.nodeID+"-"+dout[j].nodeID]=100;
                console.log(doto);
                if("plus" in getUrlVars() && dnode.type != 'YA' && dout[j].type != 'YA'){
                    doto = doto + " [constraint=false]";
                    if((dnode.type == 'RA' || dnode.type == 'CA') && dout[j].type == 'I'){
                        ranks = ranks + '{ rank = same; ' + dnode.nodeID + '; ' + dout[j].nodeID + '; }';
                    }
                }
                doto = doto + ';';
              }
                // doto = doto + dnode.nodeID + ' -> ' + dout[j].nodeID;
                // alreadyDrawn[dnode.nodeID+"-"+dout[j].nodeID]=100;
                // console.log(doto);
                // if("plus" in getUrlVars() && dnode.type != 'YA' && dout[j].type != 'YA'){
                //     doto = doto + " [constraint=false]";
                //     if((dnode.type == 'RA' || dnode.type == 'CA') && dout[j].type == 'I'){
                //         ranks = ranks + '{ rank = same; ' + dnode.nodeID + '; ' + dout[j].nodeID + '; }';
                //     }
                // }
                // doto = doto + ';';
            }
            console.log(alreadyDrawn);
            din = getNodesIn(dnode);
            console.log("din length: " + din.length);
            for (var j = 0, ol = din.length; j < ol; j++) {
              if (alreadyDrawn[din[j].nodeID+"-"+dnode.nodeID]!==100) {
                doto = doto + din[j].nodeID + ' -> ' + dnode.nodeID;

                alreadyDrawn[din[j].nodeID+"-"+dnode.nodeID]=100;
                if("plus" in getUrlVars() && dnode.type != 'YA' && din[j].type != 'YA'){
                    doto = doto + " [constraint=false]";
                    if((din[j].type == 'RA' || din[j].type == 'CA') && dnode.type == 'I'){
                        ranks = ranks + '{ rank = same; ' + din[j].nodeID + '; ' + dnode.nodeID + '; }';
                    }
                }
                doto = doto + ';';
              }
                // doto = doto + din[j].nodeID + ' -> ' + dnode.nodeID;
                console.log(doto);
            //     if("plus" in getUrlVars() && dnode.type != 'YA' && din[j].type != 'YA'){
            //         doto = doto + " [constraint=false]";
            //         if((din[j].type == 'RA' || din[j].type == 'CA') && dnode.type == 'I'){
            //             ranks = ranks + '{ rank = same; ' + din[j].nodeID + '; ' + dnode.nodeID + '; }';
            //         }
            //     }
            //     doto = doto + ';';
            }
        }
    }

    doto = doto + ranks;
    doto = doto + '}';

    mwidth = 1000;
    mheight = 12775;

    $.post("dot/index.php", { data: doto },
        function(reply) {
            ldata = JSON.parse(reply);
            console.log(ldata);
            for(var i = 0, l = nodes.length; i<l; i++) {
                mnode = nodes[i];
                if(mnode.nodeID in ldata){
                    xpos = parseInt(ldata[mnode.nodeID]["x"]);
                    mnode.x = xpos*0.8;
                    if(xpos > mwidth-100){ mwidth = xpos+100; }
                    ypos = parseInt(ldata[mnode.nodeID]["y"]);
                    mnode.y = ypos;
                    if(ypos > mheight-100){ mheight = ypos+100; }
                }
            }
            //
            // if(mwidth > WIDTH || mheight > HEIGHT){
            //     resize_canvas(mwidth, mheight);
            // }

            //invalidate();
        }
    );
}

function locTut(){
    var intro = introJs();
      intro.setOptions({
        steps: [
          {
            element: '#p_select',
            intro: "Select from participants currently used in this analysis."
          },
          {
            element: '#p_name',
            intro: "Add a new participant. Start typing the participant's name to choose from people already in the Argument Web, or to add a new person.",
          }
        ].filter(function(obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
      });

      intro.start();
}

function nodeTut(){
    var intro = introJs();
      intro.setOptions({
        steps: [
          {
            element: '#s_type',
            intro: "Click here to change the node type."
          },
          {
            element: '#s_sset',
            intro: "Filter the list of available argumentation schemes by selecting a particular scheme set.",
          },
          {
            element: '#s_cscheme',
            intro: 'Select the argumentation scheme which this node corresponds to.',
          },
          {
            element: '#s_ischeme',
            intro: 'Select the argumentation scheme which this node corresponds to.',
          },
          {
            element: '#s_lscheme',
            intro: 'Select the argumentation scheme which this node corresponds to.',
          },
          {
            element: '#s_mscheme',
            intro: 'Select the argumentation scheme which this node corresponds to.',
          },
          {
            element: '#s_pscheme',
            intro: 'Select the argumentation scheme which this node corresponds to.',
          },
          {
            element: '#s_tscheme',
            intro: 'Select the argumentation scheme which this node corresponds to.',
          },
          {
            element: '#descriptor_selects',
            intro: "Assign schematic roles to each of the nodes.",
          },
          {
            element: '#cq_selects',
            intro: "Status of each Critical Question. For additional Critical Questions, click the down arrow to select the corresponding node. Critical Questions associated with undercutters can only be instantiated by undercutters; likewise, premises by premises.",
          },
          {
            element: '#n_text',
            intro: "Edit the text for this node."
          }
        ].filter(function(obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
      });

      intro.start();
}

function mainTut(){
    var intro = introJs();
      intro.setOptions({
        steps: [
          {
            element: 'iframe#left1',
            intro: "<p>Highlight sections of text from the webpage to create a node.</p>",
            position: 'right',
          },
          {
            element: '#analysis_text',
            intro: "<p>Enter the text that you want to analyse here.</p><p>Select sections of text to create a node.</p>",
            position: 'right',
          },
          {
            element: '#right1',
            intro: "<p>Enter the text that you want to analyse here.</p><p>Select sections of text to create a node.</p>",
            position: 'left',
          },
          // {
          //   element: '#minimap',
          //   intro: "<p>An overview of the analysis can be seen here.</p><p>Drag the box to move around the canvas.</p>",
          //   position: 'left',
          // },
          {
            element: '#reset',
            intro: "<p>Move around the canvas using the arrow keys on your keyboard.</p><p>Click here to reset your view.</p>",
            position: 'bottom-middle-aligned',
          },
          {
            element: '#nadd',
            intro: "Nodes with custom text (enthymemes) can be added by clicking here and then clicking on the canvas.",
            position: 'bottom-middle-aligned',
          },
          {
            element: '#eadd',
            intro: "<p>Edges can be added between nodes by clicking here, clicking on a node and dragging to the target node.</p><p>Click once for support or twice for conflict. Click again to cancel.</p><p>Edges can also be added by holding shift (support) or 'a' (conflict).</p>",
            position: 'bottom-middle-aligned',
          },
          {
            element: '#newa',
            intro: "<p>Click here to start a new analysis. Any changes since you last saved will be lost.</p>",
            position: 'bottom-middle-aligned',
          },
          {
            element: '#em_newa',
            intro: "<p>Click here to start a new analysis. Any changes since you last saved will be lost.</p>",
            position: 'left',
          },
          {
            element: '#savea',
            intro: "<p>Your analysis can be saved locally as either a JSON file, that can be re-opened in OVA, or an image.</p><p>Analyses can also be saved to AIFdb.</p>",
            position: 'bottom-middle-aligned',
          },
          {
            element: '#em_savea',
            intro: "<p>Your analysis can be saved locally as either a JSON file, that can be re-opened in OVA, or an image.</p><p>Analyses can also be saved to AIFdb.</p>",
            position: 'left',
          },
          {
            element: '#loada',
            intro: "<p>Click here to load a previous analysis saved in JSON format.</p>",
            position: 'bottom-middle-aligned',
          },
          {
            element: '#em_loada',
            intro: "<p>Click here to load a previous analysis saved in JSON format.</p>",
            position: 'left',
          },
          {
            element: '#alay',
            intro: "<p>Automatically layout your diagram.</p><p><strong>Warning:</strong>This will move any nodes that you have already positioned.</p>",
            position: 'bottom-middle-aligned',
          },
          {
            element: '#em_alay',
            intro: "<p>Automatically layout your diagram.</p><p><strong>Warning:</strong>This will move any nodes that you have already positioned.</p>",
            position: 'left',
          },
          {
            element: '#stngs',
            intro: "<p>Click here to change analysis settings.</p>",
            position: 'bottom-middle-aligned',
          },
          {
            element: '#em_stngs',
            intro: "<p>Click here to change analysis settings.</p>",
            position: 'left',
          },
          {
            element: '#linkicon',
            intro: "<p>Click here to share your analysis.</p><p>Shared analyses are collaborative and can be edited by multiple people.</p>",
            position: 'left',
          }
        ].filter(function(obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
      });

      intro.start();
}
