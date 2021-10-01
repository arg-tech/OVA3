window.multisel = false;

var SVGRoot = null;
var SVGRootG = null;

var TrueCoords = null;
var GrabPoint = null;
var DragTarget = null;

var rIATMode = ("plus" in getUrlVars());
var dialogicalMode = rIATMode;
var CurrentFocus = null;
var multiSel = false;
var multiSelRect = {};
var CurrentlyEditing = 0;
var editMode = false;
var FormOpen = false;
var dragEdges = [];
var count = 0;

var mSel = [];
var mselo = [];

var lastedit = 0;

const NAV_MAP = {
    187: { dir: 1, act: 'zoom', name: 'in' } /* + */,
    61: { dir: 1, act: 'zoom', name: 'in' } /* + WTF, FF? */,
    189: { dir: -1, act: 'zoom', name: 'out' } /* - */,
    173: { dir: -1, act: 'zoom', name: 'out' } /* - WTF, FF? */,
    37: { dir: -1, act: 'move', name: 'left', axis: 0 } /* ? */,
    38: { dir: -1, act: 'move', name: 'up', axis: 1 } /* ? */,
    39: { dir: 1, act: 'move', name: 'right', axis: 0 } /* ? */,
    40: { dir: 1, act: 'move', name: 'down', axis: 1 } /* ? */
};

const NF = 16;
var VB = null;
var DMAX = 0;
var WMIN = 0;
let rID = null, f = 0, nav = {}, tg = Array(4);
var scale = 0;

//zooming on mousewheel scroll
const zoom = (event) => {
    if (FormOpen == false) {
        tsvg = document.getElementById('inline').getBoundingClientRect();
        svgleft = tsvg.left;
        if (event.clientX > svgleft) {
            event.preventDefault();
            if (event.deltaY < 0) {
                tg[2] = VB[2] / Math.pow(1.1, -1);
                tg[3] = VB[3] / Math.pow(1.1, -1);
                tg[0] = .00001 * (DMAX[0] - tg[2]);
                tg[1] = .00001 * (DMAX[1] - tg[3]);
            } else {
                tg[2] = VB[2] / Math.pow(1.1, 1);
                tg[3] = VB[3] / Math.pow(1.1, 1);
                tg[0] = .00001 * (DMAX[0] - tg[2]);
                tg[1] = .00001 * (DMAX[1] - tg[3]);
            }

            nav.act = 'zoom';
            updateView();
        }
    }
}

window.shiftPress = false;
window.nodeCounter = 1;
window.unsaved = false;

document.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('keydown', myKeyDown, true);
window.addEventListener('keyup', myKeyUp, true);
document.onwheel = zoom;

window.bwmode = false;
if ("bw" in getUrlVars()) {
    window.bwmode = true;
}

window.cqmode = false;
if ("cq" in getUrlVars()) {
    window.cqmode = true;
}

function Init(evt) {
    SVGRoot = document.getElementById('inline');
    SVGRootG = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    SVGRoot.appendChild(SVGRootG);
    TrueCoords = SVGRoot.createSVGPoint();
    GrabPoint = SVGRoot.createSVGPoint();
    window.sessionid = $.now().toString() + Math.random().toString().substring(3, 8);

    VB = SVGRoot.getAttribute('viewBox').split(' ').map(c => +c);
    DMAX = [10604, 135472];
    WMIN = 455;

    document.getElementById('n_file').addEventListener('change', loadbutton, false);

    $(window).bind('beforeunload', function () {
        if (window.unsaved) {
            return 'There are unsaved changes to your analysis.';
        }
    });

    if ("aifdb" in getUrlVars()) {
        aifdbid = getUrlVars()["aifdb"];
        $.get('./db/' + aifdbid, function (data) {
            if (lastedit == 0) {
                loadfile(data);
            }
        }).fail(function () {
            loadfromdb(aifdbid);
        });
    }

    $.getJSON("browserint.php?x=ipxx&url=" + window.DBurl + "/schemes/all/", function (json_data) {
        schemes = json_data.schemes;
        schemes.sort(sort_by('name', true, function (a) { return a.toUpperCase() }));
        for (index in schemes) {
            scheme = schemes[index];
            scheme_name = scheme.name.replace(/([a-z])([A-Z])/g, "$1 $2");
            scheme_type = scheme.schemeTypeID

            if (scheme_type == 1 || scheme_type == 2 || scheme_type == 3 || scheme_type == 9) {
                $('#s_ischeme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
            } else if (scheme_type == 4 || scheme_type == 5) {
                $('#s_cscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
            } else if (scheme_type == 7 || scheme_type == 12) {
                $('#s_lscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
            } else if (scheme_type == 11) {
                $('#s_mscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
            } else if (scheme_type == 6) {
                $('#s_pscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
            } else if (scheme_type == 8) {
                $('#s_tscheme').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
            }
        }
    });

    updateAnalysis();
    $.getJSON("browserint.php?x=ipxx&url=" + window.SSurl, function (json_data) {
        window.ssets = {};
        schemesets = json_data.schemesets;
        schemesets.sort(sort_by('name', true, function (a) { return a.toUpperCase() }));
        for (index in schemesets) {
            schemeset = schemesets[index];
            $('#s_sset').append('<option value="' + schemeset.id + '">' + schemeset.name + '</option>');
            window.ssets[schemeset.id] = schemeset.schemes;
        }
    });
    getSocial();

    $('#analysis_text').on('paste', function () {
        setTimeout(function (e) {
            var domString = "", temp = "";
            $("#analysis_text div").each(function () {
                temp = $(this).html();
                domString += ((temp == "<br>") ? "" : temp) + "<br>";
            });

            /*temp = $("#analysis_text div").html();
            domString += ((temp == "<br>") ? "" : temp) + "<br>";*/

            if (domString != "") {
                $('#analysis_text').html(domString);
            }
            var orig_text = $('#analysis_text').html();
            orig_text = orig_text.replace(/<br>/g, '&br&');
            orig_text = orig_text.replace(/<br \/>/g, '&br&');
            orig_text = orig_text.replace(/<span([^>]*)class="highlighted([^>]*)>([^>]*)<\/span>/g, "&span$1class=\"highlighted$2&$3&/span&");

            $('#analysis_text').html(orig_text);

            var repl_text = $('#analysis_text').text();
            repl_text = repl_text.replace(/&br&/g, '<br>');
            repl_text = repl_text.replace(/&span([^&]*)class="highlighted([^&]*)&([^&]*)&\/span&/g, "<span$1class=\"highlighted$2>$3</span>");

            $('#analysis_text').html(repl_text);
            postEdit("text", "edit", $('#analysis_text').html());
        }, 1);
    });

}

//start of main collaborate feature code//
function updateAnalysis() {
    var path = 'helpers/edithistory.php?last=' + lastedit + '&akey=' + window.akey;

    $.get(path, function (data) {
        edits = JSON.parse(data);
        eretry = [];
        for (i = 0; i < edits.edits.length; i++) {
            if (edits.edits[i].sessionid == window.sessionid) {
                //do nothing for our own edits
            } else if (edits.edits[i].type == 'node' && edits.edits[i].action == 'add') {
                node = JSON.parse(edits.edits[i].content);
                updateAddNode(node);
            } else if (edits.edits[i].type == 'node' && edits.edits[i].action == 'delete') {
                node = JSON.parse(edits.edits[i].content);
                updateDelNode(node);
            } else if (edits.edits[i].type == 'node' && edits.edits[i].action == 'move') {
                node = JSON.parse(edits.edits[i].content);
                updateMoveNode(node);
            } else if (edits.edits[i].type == 'node' && edits.edits[i].action == 'edit') {
                node = JSON.parse(edits.edits[i].content);
                updateEditNode(node);
            } else if (edits.edits[i].type == 'edge' && edits.edits[i].action == 'add') {
                edge = JSON.parse(edits.edits[i].content);
                eretry.push([edge, 'add']);
            } else if (edits.edits[i].type == 'edge' && edits.edits[i].action == 'delete') {
                edge = JSON.parse(edits.edits[i].content);
                eretry.push([edge, 'del']);
            } else if (edits.edits[i].type == 'text' && edits.edits[i].action == 'edit') {
                updateEditText(edits.edits[i].content);
            }
            lastedit = edits.edits[i].editID;
        }

        doretry = eretry;
        eretry = [];
        for (j = 0; j < doretry.length; j++) {
            edge = doretry[j][0];
            op = doretry[j][1];
            if (op == 'add') {
                s = updateAddEdge(edge);
                /*if(s == false){
                    eretry.push(edge);
                }*/
            } else {
                updateDelEdge(edge);
            }
        }
        setTimeout(updateAnalysis, 2000);
    });
}

function updateAddNode(node) {
    if (node.nodeID > window.nodeCounter) {
        window.nodeCounter = node.nodeID;
    }
    nodes.push(node);
    if (node.visible) {
        DrawNode(node.nodeID, node.type, node.text, node.x, node.y); //if the node is visible then draw the node on the svg
    }
}

function updateDelNode(node) {
    //deleteNode(node) is used for updating the original analysis (i.e. contains postEdit() call)

    //remove the node
    var index = findNodeIndex(node.nodeID);
    nodes.splice(index, 1);
    if (node.visible) {
        document.getElementById(node.nodeID).remove(); //remove the deleted node from svg
    }
}

function updateMoveNode(node) {
    //updateNodePosition(nodeID, x, y) is used for updating the original analysis (i.e. contains postEdit() call)
    var index = findNodeIndex(node.nodeID);
    n = nodes[index];
    n.x = node.x;
    n.y = node.y;

    if (node.visible) { //update svg if the node has been drawn on it
        document.getElementById(node.nodeID).remove(); //remove the node from the previous position
        DrawNode(n.nodeID, n.type, n.text, n.x, n.y); //draw the node at the new position

        //move any connected edges
        var l = edges.length;
        for (var i = l - 1; i >= 0; i--) {
            if (edges[i].toID == n.nodeID || edges[i].fromID == n.nodeID) {
                edgeID = 'n' + edges[i].fromID + '-n' + edges[i].toID;
                document.getElementById(edgeID).remove(); //remove the edge previously connected to the moved node
                DrawEdge(edges[i].fromID, edges[i].toID); //draw the edge to connect the node at its new position
                UpdateEdge(edges[i]); //update the edge position
            }
        }
    }
}

function updateEditNode(node) {
    //updateNode(nodeID, type, scheme, text, x, y) is used for updating the original analysis (i.e. contains postEdit() call)
    var index = findNodeIndex(node.nodeID);
    n = nodes[index];
    n.type = node.type;
    n.scheme = node.scheme;
    n.text = node.text;

    if (node.visible) { //update svg if the node has been drawn on it
        document.getElementById(node.nodeID).remove(); //remove the old version of the node
        DrawNode(n.nodeID, n.type, n.text, n.x, n.y); //draw the updated version of the node

        //move any connected edges
        var l = edges.length;
        for (var i = l - 1; i >= 0; i--) {
            if (edges[i].toID == n.nodeID || edges[i].fromID == n.nodeID) {
                edgeID = 'n' + edges[i].fromID + '-n' + edges[i].toID;
                document.getElementById(edgeID).remove(); //remove the edge previously connected to the moved node
                DrawEdge(edges[i].fromID, edges[i].toID); //draw the edge to connect the node at its new position
                UpdateEdge(edges[i]); //update the edge position
            }
        }
    }
}

function updateAddEdge(edge) {
    //newEdge(fromID, toID, visible) is used for updating the original analysis (i.e. contains postEdit() call) 
    if (edge.fromID == '' || edge.toID == '') {
        return false;
    } else {
        var e = new Edge;
        e.fromID = edge.fromID;
        e.toID = edge.toID;
        e.visible = edge.visible;
        edges.push(e);

        if (e.visible) { //if the edge is visible then draw the edge on the svg
            DrawEdge(e.fromID, e.toID);
            UpdateEdge(e);
        }
        return true;
    }
}

function updateDelEdge(edge) {
    //deleteEdges(edge) is used for updating the original analysis (i.e. contains postEdit() call)

    var l = edges.length;
    for (var i = l - 1; i >= 0; i--) {
        if (edges[i].toID == edge.toID && edges[i].fromID == edge.fromID) {
            if (edges[i].visible) { //if the edge was drawn on the svg
                edgeID = 'n' + edges[i].fromID + '-n' + edges[i].toID;
                document.getElementById(edgeID).remove(); //remove the edge from svg
            }
            edges.splice(i, 1); //remove the edge
            break;
        }
    }
}

function updateEditText(txt) {
    var iframe = document.getElementById('left1');
    if (iframe.nodeName.toLowerCase() == 'div') {
        $('#analysis_text').html(txt);
    }
}
//end of main collaborate feature code//

function getSelText() {
    var iframe = document.getElementById('left1');
    var txt = "";
    count = count + 1;
    if (iframe.nodeName.toLowerCase() == 'div') {
        if (window.getSelection) {
            userSelection = window.getSelection();
        } else if (document.selection) {
            userSelection = document.selection.createRange();
        }
        if (userSelection.text) { // IE
            txt = userSelection.text;
        } else if (userSelection != "") {
            range = getRangeObject(userSelection);
            txt = userSelection.toString();

            var span = document.createElement("span");
            if (rIATMode == false) {
                span.className = "highlighted";
                if (window.nodeCounter == 1) {
                    span.id = "node" + window.nodeCounter + 1;
                } else {
                    span.id = "node" + window.nodeCounter;
                }
            } else {
                span.className = "hlcurrent";
                if (window.nodeCounter == 1) {
                    span.id = "node" + window.nodeCounter + 3;
                } else {
                    span.id = "node" + window.nodeCounter + 2;
                }
                span.id = "node" + (window.nodeCounter + 2);
            }
            range.surroundContents(span);
            postEdit("text", "edit", $('#analysis_text').html());
        }
    } else {
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        txt = iframe.contentWindow.getSelection().toString();
    }
    return txt;
}

function hlcurrent(nodeID) {
    span = document.getElementById("node" + nodeID);
    if (span != null) {
        span.className = "highlighted";
        //$(".hlcurrent").removeClass("highlighted");

        if (nodeID != 'none') {
            //$("#node"+nodeID).addClass("hlcurrent");
            span.className = "highlighted";
            //if($("#node"+nodeID).length != 0) {
            $('#analysis_text').animate({
                scrollTop: $('#analysis_text').scrollTop() + $("#node" + nodeID).offset().top - 200
            }, 1000);
            //}
            postEdit("text", "edit", $('#analysis_text').html());
        }
    }
}

//function to remove the highlight from text
function remhl(nodeID) {
    var span;
    span = document.getElementById("node" + nodeID)
    if (span != null) {
        var text = span.textContent || span.innerText;
        var node = document.createTextNode(text);
        span.parentNode.replaceChild(node, span);
        postEdit("text", "edit", $('#analysis_text').html());
    }
}

function postEdit(type, action, content) {
    if (type == 'text') {
        $.post("helpers/edit.php", { type: type, action: action, cnt: content, akey: window.akey, sessionid: window.sessionid }).done(function (data) {
            dt = JSON.parse(data);
            lastedit = dt.last;
        });
    } else {
        if (content == null) {
            alert("Error with " + type + " " + action);
        } else {
            $.post("helpers/edit.php", { type: type, action: action, cnt: JSON.stringify(content), akey: window.akey, sessionid: window.sessionid }).done(function (data) {
                dt = JSON.parse(data);
                lastedit = dt.last;
                console.log("lastedit: " + lastedit);
            });
        }
    }
    window.unsaved = true;
}

function undo() {
    var index = 0;
    var action = '';

    var path = 'helpers/edithistory.php?last=' + 0 + '&akey=' + window.akey;
    $.get(path, function (data) {
        allEdits = JSON.parse(data);
        index = allEdits.edits.length - 1;
        edits = [];

        for (i = index; i > 0; i--) {
            while (action == '') {
                if (allEdits.edits[i].action == 'add' || allEdits.edits[i].action == 'delete') {
                    action = allEdits.edits[i].action;
                }
            }
            //get array of edits to undo
            if (allEdits.edits[i].action == action) {
                edits.push(allEdits.edits[i]);
            } else {
                break;
            }
        }
        console.log(edits);

        if (action == 'add') {
            undoAdd(edits);
        } else if (action == 'delete') {
            undoDelete(edits);
        }
    });
}

function undoDelete(deleted) {
    deletedNodes = [];
    deletedEdges = [];

    //separate the deleted array into an array of nodes and edges
    for (i = 0; i < deleted.length; i++) {
        deletedContent = JSON.parse(deleted[i].content);
        if (deletedContent.nodeID != null) {
            deletedNodes.push(deletedContent); //if a node add to the deleted nodes array
        } else if (deletedContent.fromID != null) {
            deletedEdges.push(deletedContent); //if an edge add to the deleted edges array
        }
    }

    //readd all of the deleted nodes
    for (i = 0; i < deletedNodes.length; i++) {
        if (nodes.indexOf(deletedNodes[i]) == -1) { //if the node doesn't exist then add it
            console.log("adding node: " + deletedNodes[i].nodeID);
            AddNode(deletedNodes[i].text, deletedNodes[i].type, deletedNodes[i].scheme, deletedNodes[i].participantID,
                deletedNodes[i].nodeID, deletedNodes[i].x, deletedNodes[i].y, deletedNodes[i].visible); //readd node
        }
    }

    //readd all of the deleted edges
    for (i = 0; i < deletedEdges.length; i++) {
        if (edges.indexOf(deletedEdges[i]) == -1) { //if the edge doesn't exist then add it
            console.log("adding edge: " + deletedEdges[i].fromID + "->" + deletedEdges[i].toID);
            //readd edge
            updateAddEdge(deletedEdges[i]);
            postEdit("edge", "add", deletedEdges[i]);
        }
    }
}

function undoAdd(added) {
    addedNodes = [];
    addedEdges = [];

    //separate the added array into an array of nodes and edges
    for (i = 0; i < added.length; i++) {
        addedContent = JSON.parse(added[i].content);
        if (addedContent.nodeID != null) {
            addedNodes.push(addedContent); //if a node add to the added nodes array
        } else if (addedContent.fromID != null) {
            addedEdges.push(addedContent); //if an edge add to the added edges array
        }
    }

    //delete all of the added nodes
    for (i = 0; i < addedNodes.length; i++) {
        if (nodes.indexOf(addedNodes[i]) == -1) { //if the node exists then remove it
            console.log("deleting node: " + addedNodes[i].nodeID);
            //delete node
            updateDelNode(addedNodes[i]);
            postEdit("node", "delete", addedNodes[i]);
        }
    }

    //delete all of the added edges
    for (i = 0; i < addedEdges.length; i++) {
        if (edges.indexOf(addedEdges[i]) == -1) { //if the edge exists then remove it
            console.log("deleting edge: " + addedEdges[i].fromID + "->" + addedEdges[i].toID);
            //delete edge
            updateDelEdge(addedEdges[i]);
            postEdit("edge", "delete", addedEdges[i]);
        }
    }
}

function getSocial() {
    $.getJSON("social.json", function (json_data) {
        for (i in json_data.users) {
            user = json_data.users[i];
            uimg = '<img src="res/img/avatar_blank.gif" />';
            for (j in user.info) {
                if (user.info[j].name == 'Avatar') {
                    uimg = '<img src="' + user.info[j].value + '" />'
                }
            }
            $('<a href="#" class="pselname" onClick="$(\'#p_firstname\').val(\'' + user.firstname + '\');$(\'#p_surname\').val(\'' + user.surname + '\');addlclick(true);return false;">' + uimg + user.firstname + ' ' + user.surname + '</a>').appendTo('#socialusers');
            addParticipant(user.firstname, user.surname);
        }
        $('<a href="#" style="padding-left: 56px;" onClick="newprt();return false;">+ Add new</a>').appendTo('#socialusers');
    });
}

function addParticipant(firstname, surname) {
    var found = findParticipantID(firstname, surname);
    if (found === 0) {
        var p = new Participant;
        p.firstname = firstname;
        p.surname = surname;
        p.participantID = participants.length + 1;
        $('#p_select').append($("<option/>", {
            value: p.participantID,
            text: firstname + " " + surname
        }));
        participants.push(p);
        return p;
    }
    else {
        return participants[found - 1];
    }
}

function addLocution(node) {
    console.log("adding locution");
    if ($('#p_firstname').val() != '') {
        firstname = $('#p_firstname').val();
        surname = $('#p_surname').val();
        $('#p_firstname').val('');
        $('#p_surname').val('');
        participant = addParticipant(firstname, surname);
        participantID = participant.participantID;
    } else {
        participantID = $('#p_select').val();
        participant = participants[participantID - 1];
        firstname = participant.firstname;
        surname = participant.surname;
    }


    window.nodeCounter = window.nodeCounter + 1;
    var newLNodeID = window.nodeCounter;


    // var ltext = (firstname + ' ' + surname + ': ').concat(t);
    var ltext = (firstname + ' ' + surname + ': ').concat(node.text);
    var nindex = findNodeIndex(CurrentlyEditing);
    var n = nodes[nindex];
    var yCoord = n.y;
    if (nodes[nindex + 1]) {
        if (nodes[nindex + 1].type == 'L') {
            yCoord = parseInt(yCoord) + 50;
            console.log(yCoord);
        }
    }

    AddNode(ltext, 'L', '0', participantID, newLNodeID, (parseInt(n.x) + 450), parseInt(yCoord));
    var index = findNodeIndex(newLNodeID);


    window.nodeCounter = window.nodeCounter + 1;
    var newYANodeID = window.nodeCounter;
    // AddNode('Asserting', 'YA', '74', 0, newYANodeID, (n.x + 225), yCoord);
    AddNode('Asserting', 'YA', '74', 0, newYANodeID, (parseInt(n.x) + 225), parseInt(yCoord));


    var edge = newEdge(newLNodeID, newYANodeID);
    DrawEdge(newLNodeID, newYANodeID)
    UpdateEdge(edge);
    edge = newEdge(newYANodeID, CurrentlyEditing);
    DrawEdge(newYANodeID, CurrentlyEditing);
    UpdateEdge(edge);

    // span = document.getElementById("node"+newLNodeID);
    // span.className="highlighted";
    //console.log(newLNodeID);
    hlcurrent(newLNodeID);
}

function getRangeObject(selectionObject) {
    if (selectionObject.getRangeAt) {
        return selectionObject.getRangeAt(0);
    } else {
        var range = document.createRange();
        range.setStart(selectionObject.anchorNode, selectionObject.anchorOffset);
        range.setEnd(selectionObject.focusNode, selectionObject.focusOffset);
        return range;
    }
}


function addlclick(skipcheck) {
    if ($('#p_select').val() == '-' && !skipcheck) {
        if ($('#prt_name').is(':visible')) {
            newprt();
            return false;
        }
        if ($('#p_firstname').val() == '') {
            $('#p_firstname').css('border-color', '#f00');
            return false;
        } else {
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
    //console.log(mySel)
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
        if (edges[i].toID == node.nodeID) {
            var nID = edges[i].fromID;
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
        if (edges[i].fromID == node.nodeID) {
            var nID = edges[i].toID;
            var nIndex = findNodeIndex(nID);
            nlist.push(nodes[nIndex]);
        }
    }
    return nlist;
}


function addlcancel() {
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
    remhl(CurrentlyEditing + 1)
    return false;
}

function pfilter(element) {
    var value = $(element).val();
    var rgval = new RegExp(value, "i");
    var showing = 0;

    ipsn = $('#p_name').position();
    ih = $('#p_name').outerHeight();
    st = ipsn.top + ih;
    $('#socialusers').css({ "top": st + "px", "left": ipsn.left + "px" });
    $(".pselname").each(function () {
        if ($(this).text().search(rgval) > -1) {
            $(this).show();
            showing = showing + 1;
        } else {
            $(this).hide();
        }
    });

    if (showing > 0 && showing < 15) {
        $('#socialusers').show();
    } else {
        $(".pselname").hide();
        $('#socialusers').hide();
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
    if (iframe.nodeName.toLowerCase() == 'div') {
        txt = $('#analysis_text').html();
    } else {
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        txt = "";
    }
    return txt;
}

function setAllText(txt) {
    var iframe = document.getElementById('left1');
    if (iframe.nodeName.toLowerCase() == 'div') {
        $('#analysis_text').html(txt);
    }
}


function addCQ(fesel) {
    fename = fesel.id.substring(2);
    if (fesel.selectedIndex == 0) {
        $('#cqi-' + fename).css('color', '#c0392b');
    } else {
        $('#cqi-' + fename).css('color', '#27ae60');
    }
}

function setdescriptors(schemeID, node) {
    document.getElementById("descriptor_selects").style.display = "block";
    //document.getElementById("node_edit").style.height = "350px";

    $.getJSON("browserint.php?x=ipxx&url=" + window.DBurl + "/formedges/scheme/" + schemeID, function (json_data) {
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
        for (index in nodes_in) {
            nin = nodes_in[index];
            if (nin.type == 'I' || nin.type == 'L') {
                nodeselect.append('<option value="' + nin.text + '">' + nin.text + '</option>');
            } else {
                nodes_in_in = getNodesIn(nin);
                for (inindex in nodes_in_in) {
                    ninin = nodes_in_in[inindex];
                    if (ninin.type == 'I') {
                        ucselect.append('<option value="' + ninin.text + '">' + ninin.text + '</option>');
                    }
                }
            }
        }

        for (index in json_data.formedges) {
            adddesc = true;
            formedge = json_data.formedges[index];

            if (formedge.Explicit == 1) {
                selected = node.descriptors['s_' + formedge.name];
                var newselect = $('<select id="s_' + formedge.name + '" class="dselect" onChange="addCQ(this);"></select>');
                newselect.append('<option value="-">Click to select</option>');

                if (formedge.CQ != null) {
                    addcq = true;
                    $('#cq_selects').prepend('<div style="clear:both"><strong>Q: </strong>' + formedge.CQ + ' <div style="color:#c0392b; float:right; font-size:22px; margin-top:-8px;" id="cqi-' + formedge.name + '">&#x25CF;</div></div>');
                }

                if (formedge.formEdgeTypeID in { '1': '', '5': '', '9': '', '11': '', '13': '', '15': '', '16': '', '20': '', '22': '' }) {
                    for (index in nodes_in) {
                        nin = nodes_in[index];
                        if (nin.type == 'I' || nin.type == 'L') {
                            if (nin.text == selected) {
                                $('#cqi-' + formedge.name).css('color', '#27ae60');
                                newselect.append('<option value="' + nin.text + '" selected="selected">' + nin.text + '</option>');
                            } else {
                                newselect.append('<option value="' + nin.text + '">' + nin.text + '</option>');
                            }
                        }
                    }
                } else if (formedge.formEdgeTypeID in { '2': '', '7': '', '10': '', '12': '', '14': '', '17': '', '21': '' }) {
                    for (index in nodes_out) {
                        nut = nodes_out[index];
                        if (nut.text == selected) {
                            newselect.append('<option value="' + nut.text + '" selected="selected">' + nut.text + '</option>');
                        } else {
                            newselect.append('<option value="' + nut.text + '">' + nut.text + '</option>');
                        }
                    }
                } else {
                    continue;
                }

                $('#descriptor_selects').append('<label id="">' + formedge.name + '</label>');
                $('#descriptor_selects').append(newselect);
            } else {
                if (formedge.CQ != null) {
                    addcq = true;
                    $('#cq_selects').append('<div style="clear:both"><strong>Q: </strong>' + formedge.CQ + ' <div style="color:#c0392b; float:right; font-size:22px; margin-top:-8px;" id="cqi-' + formedge.name + '"><a href="" onClick="$(\'#cq' + formedge.name + '\').toggle();$(this).html($(this).text()==\'&#x25BE;\'?\'&#x25B4;\':\'&#x25BE;\');return false;" style="color:#444;text-decoration:none;font-size:16px;">&#x25BE;</a>&#x25CF;</div></div>');
                    if (formedge.descriptorID != null) {
                        nsclone = nodeselect.clone().prop('id', 'cq' + formedge.name);
                    } else {
                        nsclone = ucselect.clone().prop('id', 'cq' + formedge.name);
                    }
                    $('#cq_selects').append(nsclone);
                    if ('cq' + formedge.name in node.cqdesc && node.cqdesc['cq' + formedge.name] != '-') {
                        $('#cqi-' + formedge.name).css('color', '#27ae60');
                        $("#cq" + formedge.name + " option").filter(function () {
                            return $(this).text() == node.cqdesc['cq' + formedge.name];
                        }).prop('selected', true);
                    }
                }
            }
        }

        if (!adddesc) {
            $('#descriptor_selects').hide();
        }

        if (window.cqmode && addcq) {
            $('#cq_selects').prepend('<b>Critical Questions</b>');
            $('#cq_selects').show();
        } else {
            $('#cq_selects').hide();
        }
    });
}

function filterschemes(schemesetID) {
    $("#s_cscheme option").each(function () {
        $(this).show();
    });

    $("#s_ischeme option").each(function () {
        $(this).show();
    });

    $("#s_lscheme option").each(function () {
        $(this).show();
    });

    $("#s_mscheme option").each(function () {
        $(this).show();
    });

    $("#s_pscheme option").each(function () {
        $(this).show();
    });

    $("#s_tscheme option").each(function () {
        $(this).show();
    });

    if (schemesetID != "0") {
        setschemes = window.ssets[schemesetID]

        $("#s_cscheme option").each(function () {
            if (setschemes.indexOf($(this).val()) == -1) {
                $(this).hide();
            }
        });

        $("#s_ischeme option").each(function () {
            if (setschemes.indexOf($(this).val()) == -1) {
                $(this).hide();
            }
        });

        $("#s_lscheme option").each(function () {
            if (setschemes.indexOf($(this).val()) == -1) {
                $(this).hide();
            }
        });

        $("#s_mscheme option").each(function () {
            if (setschemes.indexOf($(this).val()) == -1) {
                $(this).hide();
            }
        });

        $("#s_pscheme option").each(function () {
            if (setschemes.indexOf($(this).val()) == -1) {
                $(this).hide();
            }
        });

        $("#s_tscheme option").each(function () {
            if (setschemes.indexOf($(this).val()) == -1) {
                $(this).hide();
            }
        });
    }
}

var sort_by = function (field, reverse, primer) {
    var key = function (x) { return primer ? primer(x[field]) : x[field] };
    return function (a, b) {
        var A = key(a), B = key(b);
        return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1, 1][+!!reverse];
    }
}

function dialogicalModeOnOff() {
    if (dialogicalMode) {
        if ($('#afinput').val() == "Anon" || $('#afinput').val() == "" || $('#asinput').val() == "User" || $('#asinput').val() == "") {
            openModal('#modal-username');
        }
        else {
            extra = "&af=" + $('#afinput').val() + "&as=" + $('#asinput').val();
            window.location.href = "analyse.php?url=local&plus=true" + extra;
        }
        return false;
    }
    else {
        window.location.href = "analyse.php?url=local";
        return false;
    }
}

function genldot() {
    var doto = "digraph odg {";
    var ranks = "";
    var alreadyDrawn = {};
    if ("plus" in getUrlVars()) {
        doto = doto + "rankdir=RL;";
    }

    for (var i = 0, l = nodes.length; i < l; i++) {
        dnode = nodes[i];
        doto = doto + dnode.nodeID + ' [label="xxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx"];';

        if (dnode.type != 'I' && dnode.type != 'L') {

            dout = getNodesOut(dnode);
            for (var j = 0, ol = dout.length; j < ol; j++) {
                if (alreadyDrawn[dnode.nodeID + "-" + dout[j].nodeID] !== 100) {
                    doto = doto + dnode.nodeID + ' -> ' + dout[j].nodeID;
                    alreadyDrawn[dnode.nodeID + "-" + dout[j].nodeID] = 100;
                    if ("plus" in getUrlVars() && dnode.type != 'YA' && dout[j].type != 'YA') {
                        doto = doto + " [constraint=false]";
                        if ((dnode.type == 'RA' || dnode.type == 'CA') && dout[j].type == 'I') {
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
            din = getNodesIn(dnode);
            for (var j = 0, ol = din.length; j < ol; j++) {
                if (alreadyDrawn[din[j].nodeID + "-" + dnode.nodeID] !== 100) {
                    doto = doto + din[j].nodeID + ' -> ' + dnode.nodeID;

                    alreadyDrawn[din[j].nodeID + "-" + dnode.nodeID] = 100;
                    if ("plus" in getUrlVars() && dnode.type != 'YA' && din[j].type != 'YA') {
                        doto = doto + " [constraint=false]";
                        if ((din[j].type == 'RA' || din[j].type == 'CA') && dnode.type == 'I') {
                            ranks = ranks + '{ rank = same; ' + din[j].nodeID + '; ' + dnode.nodeID + '; }';
                        }
                    }
                    doto = doto + ';';
                }
                // doto = doto + din[j].nodeID + ' -> ' + dnode.nodeID;
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
        function (reply) {
            ldata = JSON.parse(reply);
            for (var i = 0, l = nodes.length; i < l; i++) {
                mnode = nodes[i];
                if (mnode.nodeID in ldata) {
                    xpos = parseInt(ldata[mnode.nodeID]["x"]);
                    mnode.x = xpos * 0.8;
                    if (xpos > mwidth - 100) { mwidth = xpos + 100; }
                    ypos = parseInt(ldata[mnode.nodeID]["y"]);
                    mnode.y = ypos;
                    if (ypos > mheight - 100) { mheight = ypos + 100; }
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

function locTut() {
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
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

function nodeTut() {
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
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

function setTut() {
    var intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: '#txtstgs',
                intro: "Set text size."
            },
            {
                element: '#cqtoggle',
                intro: "Toggle Critical Question Mode"
            },
            {
                element: '#bwtoggle',
                intro: "Toggle Black and White Mode",
            },
            {
                element: '#dialogicaltoggle',
                intro: "<p>Toggle Dialogical Mode</p> <p>Turning off dialogical mode will remove the dialogical aspect.</p>",
            },
            {
                element: '#riattoggle',
                intro: "<p>Toggle Rapid IAT Mode</p> <p>Turning off Rapid IAT mode will stop the dialogical aspect from being automatically added.</p>",
            }
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

function mainTut() {
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
                intro: "<p>Select text to the left and click here to add a node.</p><p>Ctrl+Click a node to edit.</p><p>Shift+Click and drag between nodes to add edges</p>",
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
            },
            {
                element: '#xmenutoggle',
                intro: "<p>Click here to access your account, analysis settings, or to share your analysis for collborative working.</p>",
                position: 'left',
            }
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}
