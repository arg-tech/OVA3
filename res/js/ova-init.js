window.multisel = false;

var SVGRoot = null;
var SVGRootG = null;

var TrueCoords = null;
var GrabPoint = null;
var DragTarget = null;

var dialogicalMode = ("plus" in getUrlVars());
var rIATMode = false;
var CurrentFocus = null;
var multiSel = false;
var multiSelRect = {};
var CurrentlyEditing = 0;
var editMode = false;
var FormOpen = false;
var dragEdges = [];
var count = 0;
var users = [];

var mSel = [];
var mselo = [];

var lastedit = 0;
var lasteditCollab = 0;
var groupID = 1;

const NAV_MAP = {
    187: { dir: 1, act: 'zoom', name: 'in' } /* + */,
    61: { dir: 1, act: 'zoom', name: 'in' } /* + WTF, FF? */,
    107: { dir: 1, act: 'zoom', name: 'in' } /* numpad + */,
    189: { dir: -1, act: 'zoom', name: 'out' } /* - */,
    173: { dir: -1, act: 'zoom', name: 'out' } /* - WTF, FF? */,
    109: { dir: -1, act: 'zoom', name: 'out' } /* numpad - */,
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
window.textCounter = 1;
window.edgeCounter = 1;
window.unsaved = false;

document.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('keydown', myKeyDown, true);
window.addEventListener('keyup', myKeyUp, true);
document.onwheel = zoom;

//set default settings
window.defaultSettings = JSON.parse(window.defaultSettings);
window.bwmode = window.defaultSettings["display"]["black_white"]; //set display settings
window.cqmode = window.defaultSettings["analysis"]["cq"]; //set analysis settings
window.defaultSchemesets = [["YA", 0], ["RA", 0], ["CA", 0], ["MA", 0], ["TA", 0], ["PA", 0]]; //set scheme set settings

//set timestamp settings
window.startdatestmp = window.defaultSettings["timestamp"]["startdatestmp"];
window.addTimestamps = window.defaultSettings["timestamp"]["addTimestamps"];
window.showTimestamps = window.defaultSettings["timestamp"]["showTimestamps"];
window.editTimestamp = false;

function Init(evt) {
    SVGRoot = document.getElementById('inline');
    SVGRootG = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    SVGRoot.appendChild(SVGRootG);
    TrueCoords = SVGRoot.createSVGPoint();
    GrabPoint = SVGRoot.createSVGPoint();
    window.sessionid = $.now().toString() + Math.random().toString().substring(3, 8);

    VB = SVGRoot.getAttribute('viewBox').split(' ').map(c => +c);
    VB_width = VB[2];
    DMAX = [10604, 135472];
    WMIN = 455;

    document.getElementById('n_file').addEventListener('change', loadFileBtn, false);

    $(window).bind('beforeunload', function () {
        if (window.unsaved) {
            return 'There are unsaved changes to your analysis.';
        }
    });

    if ("aifdb" in getUrlVars()) {
        aifdbid = getUrlVars()["aifdb"];
        $.get('./db/' + aifdbid, function (data) {
            if (lastedit == 0) {
                loadFile(data, false);
            }
        }).fail(function () {
            loadfromdb(aifdbid, false);
        });
    }

    $.getJSON("browserint.php?x=ipxx&url=" + window.DBurl + "/schemes/all/", function (json_data) {
        schemes = json_data.schemes;
        schemes.sort(sort_by('name', true, function (a) { return a.toUpperCase() }));
        for (index in schemes) {
            scheme = schemes[index];
            scheme_name = scheme.name.replace(/([a-z])([A-Z])/g, "$1 $2");
            scheme_type = scheme.schemeTypeID;

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

            $('#ra_sset').append('<option value="' + schemeset.id + '">' + schemeset.name + '</option>');
            $('#ca_sset').append('<option value="' + schemeset.id + '">' + schemeset.name + '</option>');
            $('#ya_sset').append('<option value="' + schemeset.id + '">' + schemeset.name + '</option>');
            $('#ma_sset').append('<option value="' + schemeset.id + '">' + schemeset.name + '</option>');
            $('#ta_sset').append('<option value="' + schemeset.id + '">' + schemeset.name + '</option>');
            $('#pa_sset').append('<option value="' + schemeset.id + '">' + schemeset.name + '</option>');
        }

        //set default scheme sets through config file
        var stgs = window.defaultSettings["schemeset"];
        var keys = Object.getOwnPropertyNames(stgs);
        for (var i = 0; i < keys.length; i++) {
            if (stgs[keys[i]] != "") {
                var found = schemesets.find(s => s.name == stgs[keys[i]]);
                if (typeof found !== "undefined") {
                    var selSet = document.getElementById(keys[i].toLowerCase() + '_sset');
                    selSet.value = found.id;
                    setDefaultSchemeset(keys[i], found.id);
                }
            }
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

    $('#analysis_text').focusout(function () {
        postEdit("text", "edit", $('#analysis_text').html());
    });

    //set up the load analysis modal select with a list of the corpora
    $.getJSON("helpers/corporalist.php", function (data) {
        var sel = document.getElementById("corpus_sel");
        $.each(data.corpora, function (idx, c) {
            title = c.title.replace(/&amp;#/g, "&#");
            $("<option />", { value: c.shortname, html: title }).appendTo(sel);
        });
    });

    //set defaults
    setFontSize(window.defaultSettings["display"]["font_size"]);
    setRIATMode();
}

//start of main collaborate feature code//
function updateAnalysis() {
    var path = 'helpers/edithistory.php?last=' + lasteditCollab + '&analysisID=' + window.analysisID;

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
            lasteditCollab = edits.edits[i].editID;
            // console.log("lasteditCollab: " + lasteditCollab);
        }

        doretry = eretry;
        eretry = [];
        for (j = 0; j < doretry.length; j++) {
            edge = doretry[j][0];
            op = doretry[j][1];
            if (op == 'add') {
                s = updateAddEdge(edge);
            } else {
                updateDelEdge(edge);
            }
        }
        setTimeout(updateAnalysis, 2000);
    });
}

//redraw any edges connected to a given node
function updateConnectedEdges(node) {
    var l = edges.length;
    for (var i = l - 1; i >= 0; i--) {
        if (edges[i].visible && (edges[i].toID == node.nodeID || edges[i].fromID == node.nodeID)) {
            edgeID = 'n' + edges[i].fromID + '-n' + edges[i].toID;
            document.getElementById(edgeID).remove(); //remove the edge previously connected to the moved node
            DrawEdge(edges[i].fromID, edges[i].toID); //draw the edge to connect the node at its new position
            UpdateEdge(edges[i]); //update the edge position
        }
    }
}

function updateAddNode(node) {
    // console.log("updateAddNode called");
    // console.log(node);
    //create a new node and add to array of all nodes
    var n = new Node;
    n.nodeID = node.nodeID;
    n.type = node.type;
    n.scheme = node.scheme;
    n.participantID = node.participantID;
    n.text = node.text;
    n.x = node.x;
    n.y = node.y;
    n.visible = node.visible;
    n.timestamp = node.timestamp;
    nodes.push(n);

    if (n.visible) {
        DrawNode(n.nodeID, n.type, n.text, n.x, n.y); //if the node is visible then draw the node on the svg
        if (window.showTimestamps && n.type == 'L') { DrawTimestamp(n.nodeID, n.timestamp, n.x, n.y); }
        updateConnectedEdges(n);
    } else if (n.type == 'L') {
        var r1 = /\b\w+:\s\w+\s\w+:/g;
        var r2 = /\b\w+:\s\w+\s\w+\s:/g;
        if (r1.test(n.text) || r2.test(n.text)) { //if the node is an analyst node
            var index = n.text.indexOf(":");
            var username = ' ' + n.text.slice(0, index);
            if (users.indexOf(username) == -1) {
                users.push(username);
            }
        }
    }
}

function updateDelNode(node) {
    var index = findNodeIndex(node.nodeID);
    if (index > -1) { //if the node exists
        nodes.splice(index, 1); //remove the node
        if (node.visible) {
            document.getElementById(node.nodeID).remove(); //remove the deleted node from svg
        }
    }
}

function updateEditNode(node) {
    // console.log("updateEditNode called");
    // console.log("editing node: " + node.nodeID);
    var index = findNodeIndex(node.nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.x = node.x;
        n.y = node.y;
        n.type = node.type;
        n.scheme = node.scheme;
        n.text = node.text;
        n.timestamp = node.timestamp;

        if (node.visible) { //update svg if the node has been drawn on it
            if (document.getElementById(node.nodeID)) {
                document.getElementById(node.nodeID).remove(); //remove the old version of the node
            }
            DrawNode(n.nodeID, n.type, n.text, n.x, n.y); //draw the updated version of the node
            if (window.showTimestamps && n.type == 'L') { DrawTimestamp(n.nodeID, n.timestamp, n.x, n.y); }
            updateConnectedEdges(n);
        }
    }
}

function updateAddEdge(edge) {
    // console.log("updateAddEdge called");
    // console.log("adding edge: " + edge.fromID + "->" + edge.toID);
    if (edge == null || edge.fromID == '' || edge.toID == '') {
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
    // console.log("updateDelEdge called");
    // console.log("deleting edge: " + edge.fromID + "->" + edge.toID);
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
    // if (iframe.nodeName.toLowerCase() == 'div') {
    // console.log(document.getElementById('analysis_text'));
    if (document.getElementById('analysis_text') != null) {
        // if (iframe.getElementsByTagName('div')) {
        // console.log("in if");
        if (window.getSelection) {
            userSelection = window.getSelection();
        } else if (document.selection) {
            userSelection = document.selection.createRange();
        }
        if (userSelection.text) { // IE
            txt = userSelection.text;
        } else if (userSelection != "") {
            // console.log("in else if")
            range = getRangeObject(userSelection);
            txt = userSelection.toString();
            // console.log(txt)

            var span = document.createElement("span");
            var newNodeID = ((window.nodeCounter + 1) + "_" + window.sessionid);
            span.id = "node" + newNodeID;
            if (rIATMode == false) {
                span.className = "highlighted";
            } else {
                span.className = "hlcurrent";
            }
            range.surroundContents(span);
            window.groupID++;
            postEdit("text", "edit", $('#analysis_text').html());
        }
    } else if (iframe.getElementsByTagName('iframe')) {
        // console.log("identified iframe");
        txt = document.getElementById('extside').contentWindow.getSelection().toString();
        window.groupID++;
        // console.log(txt);
    } else {
        // console.log("in else");
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        // console.log(innerDoc);
        txt = iframe.contentWindow.getSelection().toString();
        window.groupID++;
        // console.log(txt);
    }
    return txt;
}

//function to add the highlight to text on LHS
function hlcurrent(nodeID, undone) {
    // console.log('hlcurrent called');
    // console.log(mySel);
    // console.log('CurrentlyEditing: ' + CurrentlyEditing);
    // console.log("nodeID: " + nodeID);

    var span = document.getElementById("node" + nodeID);
    if (dialogicalMode && span == null && mySel.type == 'I') {
        span = document.getElementById("node" + CurrentlyEditing);
    }

    if (span != null) {
        span.id = "node" + nodeID;
        span.className = "highlighted";
        if (nodeID != 'none') {
            span.className = "highlighted";
            $('#analysis_text').animate({
                scrollTop: $('#analysis_text').scrollTop() + $("#node" + nodeID).offset().top - 200
            }, 1000);
            var undone = typeof undone !== 'undefined' ? undone : 0;
            postEdit("text", "edit", $('#analysis_text').html(), undone);
        }
    }
}

//function to remove the highlight from text on LHS
function remhl(nodeID, undone) {
    var span = document.getElementById("node" + nodeID);
    if (span != null) {
        var text = span.textContent || span.innerText;
        var node = document.createTextNode(text);
        span.parentNode.replaceChild(node, span);
        var undone = typeof undone !== 'undefined' ? undone : 0;
        postEdit("text", "edit", $('#analysis_text').html(), undone);
    }
}

//function to re-add the highlight to text on LHS for a given node
function hlText(node) {
    if (userSelection != "") {
        range = getRangeObject(userSelection);
        txt = userSelection.toString();

        var span = document.createElement("span");
        span.className = "highlighted";
        span.id = "node" + node.nodeID;
        range.surroundContents(span);
        postEdit("text", "edit", $('#analysis_text').html(), 1);
    }
}

//function to find and update a span id of highlighted text on LHS
function hlUpdate(nodeID, type, newID, undone) {
    var span = document.getElementById("node" + nodeID);
    if (span == null && !dialogicalMode && type == 'I') {
        var id = nodeID.split("_", 2);
        var lNodeID = (parseInt(id[0]) + 1) + "_" + id[1];
        span = document.getElementById("node" + lNodeID);
    }
    if (span != null) {
        span.id = "node" + newID;
        postEdit("text", "edit", $('#analysis_text').html(), undone);
    }
}

function postEdit(type, action, content, undone, contentID) {
    //set default values
    var undone = typeof undone !== 'undefined' ? undone : 0;
    var contentID = typeof contentID !== 'undefined' ? contentID : null;
    if (contentID === null) {
        if (type == 'text') {
            window.textCounter++;
            contentID = window.textCounter + "_" + window.sessionid;
        } else if (type == 'edge') {
            window.edgeCounter++;
            contentID = window.edgeCounter + "_" + window.sessionid;
        }
    }
    // console.log("==============");
    // console.log("analysisID: " + window.analysisID);
    // console.log("sessionid: " + window.sessionid);
    // console.log("type: " + type);
    // console.log("action: " + action);
    // console.log("cnt: " + JSON.stringify(content));
    // console.log("groupID: " + window.groupID);
    // console.log("undone: " + undone);
    // console.log("contentID: " + contentID);

    if (type == 'text') {
        $.post("helpers/edit.php", { analysisID: window.analysisID, sessionid: window.sessionid, type: type, action: action, cnt: content, groupID: window.groupID, undone: undone, contentID: contentID }).done(function (data) {
            dt = JSON.parse(data);
            lastedit = dt.last;
        });
    } else {
        if (content == null) {
            alert("Error with " + type + " " + action);
        } else {
            $.post("helpers/edit.php", { analysisID: window.analysisID, sessionid: window.sessionid, type: type, action: action, cnt: JSON.stringify(content), groupID: window.groupID, undone: undone, contentID: contentID }).done(function (data) {
                dt = JSON.parse(data);
                lastedit = dt.last;
                // console.log("lastedit: " + lastedit);
            });
        }
    }
    window.unsaved = true;
}

function undo() {
    // console.log("undo called");
    var allEdits = [];
    var path = 'helpers/undo.php?sessionid=' + window.sessionid + '&analysisID=' + window.analysisID;

    $.get(path, function (data) {
        allEdits = JSON.parse(data);
        if (allEdits.edits[0] != undefined) { //if there are edits to undo
            var type = allEdits.edits[0].type;
            var action = allEdits.edits[0].action;
            // console.log("==============");
            // console.log(allEdits.edits);

            if (action == 'add') {
                undoAdd(allEdits.edits);
            } else if (action == 'delete' || type == 'text') {
                undoDelete(allEdits.edits, allEdits.lastID);
            } else if (action == 'edit') {
                undoEdit(allEdits.edits);
            }
        }
    });
}

//readd all of the deleted nodes and edges in toUndo
function undoDelete(toUndo, lastEditID) {
    // console.log("undoDelete called");
    var isLastEdit = false;
    var confirmUndo = true;
    // console.log("undo editID: " + toUndo[0].editID);
    // console.log("last edit ID: " + lastEditID);
    if (toUndo[0].editID == lastEditID) { //if undoing the last change to an analysis
        isLastEdit = true;
    } else {
        //confirmUndo = confirm("Are you sure you want to undo? \nTo undo you will need to reselect the text as further changes have been made to this analysis. \nIf you select to cancel, this edit will be skipped if you undo again.");
        confirmUndo = false;
        alert("Cannot undo as further changes have been made to this analysis by another analyst. This edit will be skipped if you select undo again.");
    }

    if (confirmUndo) {
        var highlight = false;
        var toHighlight = null;

        for (i = 0; i < toUndo.length; i++) {
            if (toUndo[i].type == 'text') {
                if (isLastEdit && toUndo[i].content) {
                    // console.log("____________");
                    // console.log("overwriting text on LHS");
                    updateEditText(toUndo[i].content); //overwrite the text on LHS to readd any highlighting that was removed
                    postEdit("text", "edit", $('#analysis_text').html(), 1);
                } else {
                    highlight = true;
                }
            } else {
                toAdd = JSON.parse(toUndo[i].content);
                if (toUndo[i].type == 'node') { //if toAdd is a node
                    // console.log("____________");
                    // console.log("adding node: " + toAdd.nodeID);
                    updateAddNode(toAdd); //readd node
                    postEdit("node", "add", toAdd, 1, toAdd.nodeID);
                    //add highlight to text on LHS when adding locutions in dialogical mode or when adding I nodes when not in dialogical mode
                    if ((dialogicalMode && toAdd.type == 'L' && toAdd.visible) || (!dialogicalMode && toAdd.type == 'I')) {
                        toHighlight = toAdd;
                    }
                } else if (toUndo[i].type == 'edge') { //if toAdd is an edge
                    // console.log("____________");
                    // console.log("adding edge: " + toAdd.fromID + "->" + toAdd.toID);
                    updateAddEdge(toAdd); //readd edge
                    postEdit("edge", "add", toAdd, 1);
                }
            }
        }

        if (highlight) {
            //get user to highlight text on LHS for toHighlight node
            // console.log("need to reselect text");
            //hlText(toHighlight);
        }
    }
}

//delete all of the added nodes and edges in toUndo
function undoAdd(toUndo) {
    // console.log("undoAdd called");
    for (i = 0; i < toUndo.length; i++) {
        toDel = JSON.parse(toUndo[i].content);
        if (toUndo[i].type == 'node') { //if toDel is a node
            // console.log("____________");
            // console.log("deleting node: " + toDel.nodeID);
            //remove highlight from text on LHS when removing locutions in dialogical mode or when removing I nodes when not in rapid IAT mode
            if ((dialogicalMode && toDel.type == 'L' && toDel.visible) || (!rIATMode && toDel.type == 'I')) {
                remhl(toDel.nodeID, 1);
            }
            updateDelNode(toDel); //delete node
            postEdit("node", "delete", toDel, 1, toDel.nodeID);
        } else if (toUndo[i].type == 'edge') { //if toDel is an edge
            // console.log("____________");
            // console.log("deleting edge: " + toDel.fromID + "->" + toDel.toID);
            updateDelEdge(toDel); //delete edge
            postEdit("edge", "delete", toDel, 1);

        }
    }
}

//change all of the edited nodes in toUndo back to their previous state
function undoEdit(toUndo) {
    // console.log("undoEdit called");
    for (i = 0; i < toUndo.length; i++) {
        if (toUndo[i].type == 'node') {
            toEdit = JSON.parse(toUndo[i].content);
            // console.log("editing node: " + toEdit.nodeID);
            updateEditNode(toEdit); //edit node
            postEdit("node", "edit", toEdit, 1, toEdit.nodeID);
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

        //set default start date timestamp
        if (json_data.hasOwnProperty("startdatestmp")) {
            setTimestampStart(json_data.startdatestmp);
        }
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
    //console.log("adding locution");
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

    window.groupID++;
    window.nodeCounter++;
    var newLNodeID = (window.nodeCounter + "_" + window.sessionid);

    // var ltext = (firstname + ' ' + surname + ': ').concat(t);
    var ltext = (firstname + ' ' + surname + ': ').concat(node.text);
    var nindex = findNodeIndex(CurrentlyEditing);
    var n = nodes[nindex];
    var yCoord = n.y;
    if (nodes[nindex + 1]) {
        if (nodes[nindex + 1].type == 'L') {
            yCoord = parseInt(yCoord) + 50;
            //console.log(yCoord);
        }
    }

    if (window.addTimestamps) {
        AddNode(ltext, 'L', null, participantID, newLNodeID, (parseInt(n.x) + 450), parseInt(yCoord), true, 0, node.timestamp);
        var index = findNodeIndex(newLNodeID);
        delTimestamp(node.nodeID, 1); //delete the timestamp from the i node
        window.groupID++;
        if (window.showTimestamps) {
            DrawTimestamp(nodes[index].nodeID, nodes[index].timestamp, nodes[index].x, nodes[index].y); //draw the timestamp on the svg
        }
    } else {
        AddNode(ltext, 'L', null, participantID, newLNodeID, (parseInt(n.x) + 450), parseInt(yCoord));
    }


    window.nodeCounter++;
    var newYANodeID = (window.nodeCounter + "_" + window.sessionid);
    // AddNode('Asserting', 'YA', '74', 0, newYANodeID, (n.x + 225), yCoord);
    AddNode('Asserting', 'YA', '74', 0, newYANodeID, (parseInt(n.x) + 225), parseInt(yCoord));


    var edge = newEdge(newLNodeID, newYANodeID);
    DrawEdge(newLNodeID, newYANodeID)
    UpdateEdge(edge);
    edge = newEdge(newYANodeID, CurrentlyEditing);
    DrawEdge(newYANodeID, CurrentlyEditing);
    UpdateEdge(edge);

    hlcurrent(newLNodeID);
}

function getRangeObject(selectionObject) {
    // console.log(selectionObject.getRangeAt);
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


    var index = findNodeIndex(CurrentlyEditing);
    var toDelete = true;

    for (var i = 0; i < edges.length; i++) {
        if (edges[i].toID == CurrentlyEditing || edges[i].fromID == CurrentlyEditing) {
            toDelete = false;
        }
    }

    if (toDelete == true) {
        window.groupID++;
        deleteNode(nodes[index]);
    }

    remhl((CurrentlyEditing++));
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
    // console.log("filter schemes called");
    var setschemes = window.ssets[schemesetID];
    var type = document.getElementById("s_type").value;
    switch (type) {
        case "RA":
            $("#s_ischeme option").each(function () {
                $(this).show();
            });
            if (schemesetID !== "0") {
                $("#s_ischeme option").each(function () {
                    if (setschemes.indexOf($(this).val()) == -1) {
                        $(this).hide();
                    }
                });
            }
            break;
        case "CA":
            $("#s_cscheme option").each(function () {
                $(this).show();
            });
            if (schemesetID !== "0") {
                $("#s_cscheme option").each(function () {
                    if (setschemes.indexOf($(this).val()) == -1) {
                        $(this).hide();
                    }
                });
            }
            break;
        case "YA":
            $("#s_lscheme option").each(function () {
                $(this).show();
            });
            if (schemesetID !== "0") {
                $("#s_lscheme option").each(function () {
                    if (setschemes.indexOf($(this).val()) == -1) {
                        $(this).hide();
                    }
                });
            }
            break;
        case "TA":
            $("#s_tscheme option").each(function () {
                $(this).show();
            });
            if (schemesetID !== "0") {
                $("#s_tscheme option").each(function () {
                    if (setschemes.indexOf($(this).val()) == -1) {
                        $(this).hide();
                    }
                });
            }
            break;
        case "MA":
            $("#s_mscheme option").each(function () {
                $(this).show();
            });
            if (schemesetID !== "0") {
                $("#s_mscheme option").each(function () {
                    if (setschemes.indexOf($(this).val()) == -1) {
                        $(this).hide();
                    }
                });
            }
            break;
        case "PA":
            $("#s_pscheme option").each(function () {
                $(this).show();
            });
            if (schemesetID !== "0") {
                $("#s_pscheme option").each(function () {
                    if (setschemes.indexOf($(this).val()) == -1) {
                        $(this).hide();
                    }
                });
            }
            break;
        default:
            return false;
    }
}

//change the default scheme set
function setDefaultSchemeset(type, schemesetID) {
    var index = window.defaultSchemesets.findIndex(x => x.includes(type));
    if (index == -1) { //if no default was set for that type
        window.defaultSchemesets.push([type, schemesetID]);
    } else { //if there already was a default set for that type
        window.defaultSchemesets[index][1] = schemesetID;
    }
    filterschemes(schemesetID);
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
            // {
            //     element: '#descriptor_selects',
            //     intro: "Assign schematic roles to each of the nodes.",
            // },
            {
                element: '#cq_selects',
                intro: "Status of each Critical Question. For additional Critical Questions, click the down arrow to select the corresponding node. Critical Questions associated with undercutters can only be instantiated by undercutters; likewise, premises by premises.",
            },
            {
                element: '#timestamp_label',
                intro: "Displays the timestamp for this node."
            },
            {
                element: '#edit_timestamp_btn',
                intro: "Click here to edit the timestamp for this node."
            },
            {
                element: '#n_text',
                intro: "Edit the text for this node."
            },
            {
                element: '#del_node_btn',
                intro: "Click here to delete this node."
            },
            {
                element: '#l_add_btn',
                intro: "Click here to add a locution for this node."
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
                element: '#tab-display',
                intro: "<p>Display Settings</p> <p>Click here to view display settings.</p>",
            },
            {
                element: '#tab-analysis',
                intro: "<p>Analysis Settings</p> <p>Click here to view analysis settings.</p>",
            },
            {
                element: '#tab-schemes',
                intro: "<p>Scheme Set Settings</p> <p>Click here to view scheme set settings.</p>",
            },
            {
                element: '#tab-timestamps',
                intro: "<p>Timestamp Settings</p> <p>Click here to view timestamp settings.</p>",
            },
            {
                element: '#font-size',
                intro: "Set text size."
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
            },
            {
                element: '#cqtoggle',
                intro: "Toggle Critical Question Mode"
            },
            {
                element: '#ra_sset',
                intro: "<p>Filter the list of available argumentation schemes for RA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#ca_sset',
                intro: "<p>Filter the list of available argumentation schemes for CA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#ya_sset',
                intro: "<p>Filter the list of available argumentation schemes for YA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#ta_sset',
                intro: "<p>Filter the list of available argumentation schemes for TA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#ma_sset',
                intro: "<p>Filter the list of available argumentation schemes for MA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#pa_sset',
                intro: "<p>Filter the list of available argumentation schemes for PA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#timestampRegExp',
                intro: "<p>Timestamp Format</p> <p>When adding timestamps, this format can be used to offset the start date and time by a number of hours, minutes or seconds. It should be included within the text being analysed wherever the offset should start.</p>"
            },
            {
                element: '#startTimestampLabel',
                intro: "<p>Start Date and Time</p> <p>When adding timestamps, this date and time should be changed to when the text being analsyed began. All timestamps are calculated based off of it.</p>"
            },
            {
                element: '#startTimestampBtn',
                intro: "<p>Change Start Date and Time</p> <p>Click here to change the start date and time.</p>"
            },
            {
                element: '#timestamptoggle',
                intro: "<p>Toggle Add Timestamps</p><p>Turning on add timestamps will add a timestamp to a locution node when it is added.</p>"
            },
            {
                element: '#showTimestamptoggle',
                intro: "<p>Toggle Show Timestamps</p> <p>Turning on show timestamps will display above locution nodes any timestamps that have been added to them, while turning it off will hide all timestamps on locution nodes.</p>"
            },
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
                element: '#undo',
                intro: "Click here to undo the last change you made to an analysis.</p>",
                position: 'bottom-middle-aligned',
            },
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
                intro: "<p>Click here to load a previous analysis saved in JSON format or to AIFdb.</p>",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#em_loada',
                intro: "<p>Click here to load a previous analysis saved in JSON format or to AIFdb.</p>",
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
                intro: "<p>Click here to access your analysis settings or to share your analysis for collborative working.</p>",
                position: 'left',
            }
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

function loadTut() {
    var intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: '#n_file',
                intro: "Select a JSON analysis from your local files to load."
            },
            {
                element: '#corpus_sel',
                intro: "Select a corpus from the drop-down list to load. It should start loading immediately, however it may take a few minutes to load large corpora."
            },
            {
                element: '#nsetID',
                intro: "Enter the AIFdb node set ID of the analysis you want to load."
            },
            {
                element: '#loadNodeSetBtn',
                intro: "Click here to load an analysis with the entered node set ID."
            },
            {
                element: '#load-replace',
                intro: "Check this box, if you want to replace your current analysis when loading a saved analysis. Ensure it's checked before using any of the above options to load if so. If unchecked, the saved analysis will be placed under the current analysis when it's loaded."
            },
            {
                element: '#list',
                intro: "Displays the details of what analysis has been loaded or has failed to load."
            }
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

//change the font size of the text on the LHS
function setFontSize(size) {
    if (size == "ts" || size == "tm" || size == "tl") {
        $("#left1").removeClass("ts tm tl");
        $("#left1").addClass(size);
    }
    return false;
}

//change rIAT mode based on default settings
function setRIATMode() {
    if (dialogicalMode && window.defaultSettings["analysis"]["rIAT"]) {
        window.rIATMode = true;
    } else {
        $("#riattoggle").toggleClass("on off");
    }
}

//change tab on settings modal
function settingsTab(evt, tab) {
    var tabs = document.getElementsByClassName("stg");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("selected");
    }
    evt.currentTarget.classList.add("selected");
    $('#displaystg').hide();
    $('#anastg').hide();
    $('#timestg').hide();
    $('#schemestg').hide();
    $('#' + tab).show();
    return false;
}

//change tab on helpsheet modal
function helpTab(evt, tab) {
    var tabs = document.getElementsByClassName("helpsheet");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("selected");
    }
    evt.currentTarget.classList.add("selected");
    $('#shortcuts-help').hide();
    $('#node-help').hide();
    $('#edge-help').hide();
    $('#timestamp-help').hide();
    $('#' + tab).show();
    return false;
}

//change the start date and time for the timestamps
function setTimestampStart(startdatestmp) {
    if (typeof startdatestmp !== 'undefined') { //set the start date time stamp to the given value
        window.startdatestmp = startdatestmp;
        document.getElementById("startTimestampLabel").innerHTML = window.startdatestmp;
    } else { //validate the user input and update the date time stamp
        var date = document.getElementById("dateInput").value;
        var time = document.getElementById("timeInput").value;
        var timezoneTime = document.getElementById("timezoneInput").value;
        var timezoneSelect = document.getElementById("timezoneSelect").value;
        if (date != "" && time != "" && timezoneTime != "") {
            var d = date.split("-", 3);
            var t = timezoneTime.split(":", 2);
            var timezone = "GMT" + timezoneSelect + t[0] + t[1];
            var start = d[0] + "/" + d[1] + "/" + d[2] + " " + time + " " + timezone;
            // console.log(start);
            if (window.editTimestamp) { //if editing a locution's timestamp
                var tstamp = Math.round(new Date(start).getTime());
                var tsd = new Date();
                tsd.setTime(tstamp);
                var str = tsd.toString();
                document.getElementById("timestamp_label").innerHTML = str;
                window.editTimestamp = false;
                updateTimestamp(mySel.nodeID, str);
                if (window.showTimestamps) {
                    var edited = editTimestampSVG(mySel.nodeID, str);
                    if (!edited) { DrawTimestamp(mySel.nodeID, str, mySel.x, mySel.y); }
                }
                // console.log(mySel);
                $('#delTimestampBtn').hide();
                closeModal('#modal-timestamps'); FormOpen = false;
                editpopup(mySel);
            } else { //if updating the start date time stamp
                window.startdatestmp = start;
                document.getElementById("startTimestampLabel").innerHTML = window.startdatestmp;
                closeModal('#modal-timestamps'); FormOpen = false;
                openModal('#modal-settings');
            }
        }
    }
    return false;
}

function deleteTimestamp() {
    if (mySel.timestamp != "") {
        delTimestamp(mySel.nodeID);
        removeTimestamps(mySel.nodeID);
        document.getElementById("timestamp_label").innerHTML = "The timestamp has been deleted.";
    }
    window.editTimestamp = false;
    $('#delTimestampBtn').hide();
    closeModal('#modal-timestamps'); FormOpen = false;
    editpopup(mySel);
}