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
var count = 0; //
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

/**
 * Zooming on mousewheel scroll
 * @param {*} event 
 */
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
window.longEdge = [false, false];
window.nodeCounter = 1;
window.textCounter = 1;
window.edgeCounter = 1;
window.unsaved = false;
window.saveImage = false;

document.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('keydown', myKeyDown, true);
window.addEventListener('keyup', myKeyUp, true);
document.onwheel = zoom;

//set default settings
window.defaultSettings = JSON.parse(window.defaultSettings);
window.bwmode = window.defaultSettings["display"]["black_white"]; //set display settings
window.defaultSchemesets = [["YA", 0], ["RA", 0], ["CA", 0], ["MA", 0], ["TA", 0], ["PA", 0]]; //set scheme set settings
//set analysis settings
window.cqmode = window.defaultSettings["analysis"]["cq"];
window.eAddMode = window.defaultSettings["analysis"]["eAdd"];
//set timestamp settings
window.startdatestmp = window.defaultSettings["timestamp"]["startdatestmp"];
window.addTimestamps = window.defaultSettings["timestamp"]["addTimestamps"];
window.showTimestamps = window.defaultSettings["timestamp"]["showTimestamps"];
window.editTimestamp = false;

/**
 * Initializes 
 * @param {*} evt 
 */
function Init(evt) {
    SVGRoot = document.getElementById('inline');
    SVGRootG = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    SVGRoot.appendChild(SVGRootG);
    TrueCoords = SVGRoot.createSVGPoint();
    GrabPoint = SVGRoot.createSVGPoint();
    window.sessionid = $.now().toString() + Math.random().toString().substring(3, 8);

    var mw = $("#mainwrap").width();
    $("#right1").width(mw - $("#left1").width() - 41);
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
                    if (selSet !== null && typeof selSet !== "undefined") {
                        selSet.value = found.id;
                        setDefaultSchemeset(keys[i], found.id);
                    }
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

    $("#analysis_text").on("dblclick", "span", function (event) {
        event.stopPropagation();
        index = findNodeIndex(event.currentTarget.id.substring(4), false);
        // console.log("index: " + index);
        //center the view on the node
        var newx = nodes[index].x - 550;
        var newy = nodes[index].y - 400;
        VB = [newx, newy, 1500, 1500];
        SVGRoot.setAttribute('viewBox', [newx, newy, 1500, 1500]);
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
    eAddModeOnOff();
}


/**
 * Updates the analysis with any edits made by another user when collaborating
 */
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

/**
 * Updates any edges connected to a given node by redrawing them, used when collaborating
 * @param {Node} node - The node to update the connected edges for
 */
function updateConnectedEdges(node) {
    var l = edges.length;
    for (var i = l - 1; i >= 0; i--) {
        if (edges[i].visible && (edges[i].toID == node.nodeID || edges[i].fromID == node.nodeID)) {
            edgeID = 'n' + edges[i].fromID + '-n' + edges[i].toID;
            document.getElementById(edgeID).remove(); //remove the edge previously connected to the moved node
            DrawEdge(edges[i].fromID, edges[i].toID); //draw the edge to connect the node at its new position
            UpdateEdge(edges[i]); //update the edge position
            updateMarkEdge(edges[i]);
        }
    }
}

/**
 * Updates an edge by marking it if both nodes the edge connects are marked or by unmarking it if not
 * @param {Edge} edge - The edge to be marked or unmarked
 * @returns {Boolean} Indicates if the edge was successfully updated (true) or not (false)
 */
function updateMarkEdge(edge) {
    var mark = false;
    var from = document.getElementById(edge.fromID);
    var to = document.getElementById(edge.toID);
    if (from == null || to == null) { return false; }
    if (from.classList.contains('hl') && to.classList.contains('hl')) { mark = true; } //if both nodes are marked, then mark the edge
    markEdge(edge.fromID, edge.toID, mark);
    return true;
}

/**
 * Creates and adds a new node, used when collaborating
 * @param {Node} node - The node to add
 */
function updateAddNode(node) {
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
    n.marked = node.marked;
    n.descriptors = node.descriptors;
    n.cqdesc = node.cqdesc;
    nodes.push(n);

    if (n.visible) {
        DrawNode(n.nodeID, n.type, n.text, n.x, n.y, n.marked); //if the node is visible then draw the node on the svg
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

/**
 * Finds and deletes the given node, used when collaborating
 * @param {Node} node - The node to delete
 */
function updateDelNode(node) {
    var index = findNodeIndex(node.nodeID);
    if (index > -1) { //if the node exists
        nodes.splice(index, 1); //remove the node
        if (node.visible) {
            document.getElementById(node.nodeID).remove(); //remove the deleted node from svg
        }
    }
}

/**
 * Finds and edits a node, used when collaborating
 * @param {Node} node - The node to edit
 */
function updateEditNode(node) {
    var index = findNodeIndex(node.nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.x = node.x;
        n.y = node.y;
        n.type = node.type;
        n.scheme = node.scheme;
        n.text = node.text;
        n.timestamp = node.timestamp;
        n.marked = node.marked;
        n.visible = node.visible;
        n.descriptors = node.descriptors;
        n.cqdesc = node.cqdesc;

        if (n.visible) { //update svg if the node has been drawn on it
            if (document.getElementById(node.nodeID)) {
                document.getElementById(node.nodeID).remove(); //remove the old version of the node
            }
            DrawNode(n.nodeID, n.type, n.text, n.x, n.y, n.marked); //draw the updated version of the node
            if (window.showTimestamps && n.type == 'L') { DrawTimestamp(n.nodeID, n.timestamp, n.x, n.y); }
            updateConnectedEdges(n);
        }
    }
    else { console.log(node.nodeID + " not found (updateEditNode)"); }
}

/**
 * Creates and adds a new edge, used when collaborating
 * @param {Edge} edge - The edge to add
 * @returns {Boolean} - Indicates if the edge was added (true) or not (false)
 */
function updateAddEdge(edge) {
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
            updateMarkEdge(e);
        }
        return true;
    }
}

/**
 * Finds and deletes a given edge, used when collaborating
 * @param {Edge} edge - The edge to delete
 */
function updateDelEdge(edge) {
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

/**
 * Updates the analysis text by replacing it with the given text
 * @param {String} txt - The new text
 */
function updateEditText(txt) {
    var iframe = document.getElementById('left1');
    if (iframe.nodeName.toLowerCase() == 'div') {
        $('#analysis_text').html(txt);
    }
}

/**
 * Gets selected text from 'left1' element
 * @returns {String} txt - The text that was selected
 */
function getSelText() {
    var iframe = document.getElementById('left1');
    var analysisTxt = document.getElementById('analysis_text');
    var txt = "";
    count = count + 1; //
    if (analysisTxt != null && analysisTxt.getAttribute("style") !== "display:none;") {
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


/**
 * Highlights the analysis text matching the node's text
 * @param {String} nodeID - The ID of the node to match text with
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 */
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
        $('#analysis_text').animate({
            scrollTop: $('#analysis_text').scrollTop() + $("#node" + nodeID).offset().top - 200
        }, 1000);
        var undone = typeof undone !== 'undefined' ? undone : 0;
        postEdit("text", "edit", $('#analysis_text').html(), undone);
    }
}

/**
 * Removes the highlight from the analysis text matching the node's text
 * @param {String} nodeID - The ID of the node to remove the highlight for
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 */
function remhl(nodeID, undone) {
    var span = document.getElementById("node" + nodeID);
    if (span != null) { //if a span exists for this node
        var text = span.textContent || span.innerText;
        var node = document.createTextNode(text);
        var cSpans = span.children;
        // console.log(cSpans);
        span.parentNode.replaceChild(node, span);
        for (var i = 0; i < cSpans.length; i++) {
            var id = cSpans[i].id.substring(4);
            // console.log("found child span: " + id);
            var index = findNodeIndex(id);
            if (index > -1) { //if the node still exists
                hlText(nodes[index]); //re-highlight the analysis text for the node
            }
        }
        var undone = typeof undone !== 'undefined' ? undone : 0;
        postEdit("text", "edit", $('#analysis_text').html(), undone);
    }
}

/**
 * Highlights a section of the analysis text matching a given node's text. 
 * Note: it will only be able to find and highlight exact matches in the analysis text that haven't already been highlighted,
 *  i.e. if the node's text has been reconstructed or contains interposed material 
 * it will not be able to find and highlight the analysis text. 
 * If the analysis text contains repetitions exactly matching the node's text, the first unhighlighted repetition will then be highlighted.
 * @param {Node} node - The node to highlight the analysis text for
 * @returns {Boolean} - Indicates if the analysis text was successfully highlighted (true) or not (false)
 */
function hlText(node) {
    // console.log("hlText called");
    var toHl = node.text;
    if (node.type == 'L') { //if a locution, remove the participant's name from the node's text
        var text = node.text.split(": ");
        toHl = text[1];
    }

    const cNodes = document.getElementById('analysis_text').childNodes;
    for (var c of cNodes) {
        if (c.nodeType === 3) { //if the child node is of type text
            var start = c.nodeValue.indexOf(toHl);
            // console.log(c); console.log(start);
            if (start > -1) { //if found in that text node
                const range = document.createRange();
                range.setStart(c, start);
                range.setEnd(c, start + toHl.length);

                var span = document.createElement("span");
                span.className = "highlighted";
                span.id = "node" + node.nodeID;
                range.surroundContents(span);
                postEdit("text", "edit", $('#analysis_text').html(), 1);
                return true;
            }
        }
    }
    return false;
}

/**
 * Finds and updates the span ID of highlighted analysis text for a given node
 * @param {String} nodeID - The ID to search for
 * @param {String} type - The type of node
 * @param {String} newID - The new ID to set the span ID to
 * @param {Boolean} post - Optional, indicates if the updated text should be added to the database (true) or not (false). The default is true.
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 */
function hlUpdate(nodeID, type, newID, post, undone) {
    var span = document.getElementById("node" + nodeID);
    if (span == null && !dialogicalMode && type == 'I') {
        var id = nodeID.split("_", 2);
        var lNodeID = (parseInt(id[0]) + 1) + "_" + id[1];
        span = document.getElementById("node" + lNodeID);
    }
    if (span != null) {
        span.id = "node" + newID;
        var post = typeof post !== 'undefined' ? post : true;
        if (post) {
            var undone = typeof undone !== 'undefined' ? undone : 0;
            postEdit("text", "edit", $('#analysis_text').html(), undone);
        }
    }
}

/**
 * Adds an edit to the database through a post request
 * @param {String} type - Whether the edit is for a node, edge or the text
 * @param {String} action - Whether the edit is to add, delete or edit
 * @param {*} content - The object content to add to the database
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 * @param {String} contentID - Optional, the ID for this content
 */
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
            });
        }
    }
    window.unsaved = true;
}

/**
 * Handles undoing edits made to an analysis
 * @returns {Promise<Boolean>} - Indicates if the edits were successfully undone (true) or not (false)
 */
async function undo() {
    // console.log("undo called");
    try {
        var allEdits = await $.get('helpers/undo.php?sessionid=' + window.sessionid + '&analysisID=' + window.analysisID);
        allEdits = JSON.parse(allEdits);
        if (allEdits.edits[0] != undefined) { //if there are edits to undo
            var type = allEdits.edits[0].type;
            var action = allEdits.edits[0].action;
            // console.log("==============");
            // console.log(allEdits.edits);

            if (action == 'add') {
                return await undoAdd(allEdits.edits);
            } else if (action == 'delete' || type == 'text') {
                return await undoDelete(allEdits.edits, allEdits.lastID);
            } else if (action == 'edit') {
                return await undoEdit(allEdits.edits);
            }
        }
    } catch (e) {
        console.log(e);
    }
    return false;
}

/**
 * Undoes delete edits
 * @param {*} toUndo - The delete edits to be undone
 * @param {Number} lastEditID - The ID of the last edit made
 * @returns {Promise<Boolean>} - Indicates if the edits were successfully undone (true) or not (false)
 */
function undoDelete(toUndo, lastEditID) {
    // console.log("undoDelete called");
    return new Promise(resolve => {
        var isLastEdit = false;
        var confirmUndo = true;
        // console.log("undo editID: " + toUndo[0].editID);
        // console.log("last edit ID: " + lastEditID);
        if (toUndo[0].editID == lastEditID) { //if undoing the last change to an analysis
            isLastEdit = true;
        } else {
            confirmUndo = confirm("Are you sure you want to undo?\nFurther changes have been made to this analysis by another analyst.\nIf you select to cancel, this edit will be skipped if you undo again.");
            // //block undoing deleting a node if not the last edit
            // confirmUndo = false;
            // alert("Cannot undo as further changes have been made to this analysis by another analyst. This edit will be skipped if you select undo again.");
            // resolve(false); //the edits cannot be undone
        }

        if (confirmUndo) {
            var highlight = false;
            var toHighlight = [];
            var url = getUrlVars()["url"];

            for (i = 0; i < toUndo.length; i++) {
                if (toUndo[i].type == 'text') {
                    if (isLastEdit && toUndo[i].content) {
                        // console.log("____________");
                        // console.log("overwriting text on LHS");
                        updateEditText(toUndo[i].content); //overwrite the text on LHS to readd any highlighting that was removed
                        postEdit("text", "edit", $('#analysis_text').html(), 1);
                    }
                } else {
                    toAdd = JSON.parse(toUndo[i].content);
                    if (toUndo[i].type == 'node') { //if toAdd is a node
                        // console.log("____________");
                        // console.log("adding node: " + toAdd.nodeID);
                        updateAddNode(toAdd); //readd node
                        postEdit("node", "add", toAdd, 1, toAdd.nodeID);

                        //add highlight to analysis text on LHS when adding locutions in dialogical mode or when adding I nodes in non-dialogical mode
                        //Note: if in dialogical mode with rapid IAT off and the highlight span linked to the I node, it won't be re-highlighted
                        if (!isLastEdit && url == 'local') {
                            if ((dialogicalMode && toAdd.type == 'L' && toAdd.visible) || (!dialogicalMode && toAdd.type == 'I')) {
                                highlight = true;
                                toHighlight.push(toAdd);
                            }
                        }
                    } else if (toUndo[i].type == 'edge') { //if toAdd is an edge
                        // console.log("____________");
                        // console.log("adding edge: " + toAdd.fromID + "->" + toAdd.toID);
                        updateAddEdge(toAdd); //readd edge
                        postEdit("edge", "add", toAdd, 1);
                    }
                }
            }

            if (highlight) { //re-highlights the analysis text on LHS if needed
                for (var i = 0; i < toHighlight.length; i++) {
                    console.log("need to re-highlight text for: " + toHighlight[i].nodeID);
                    if (!hlText(toHighlight[i])) { //mostly if in non-dialogical mode and the I node's text had been reconstructed
                        alert("Cannot re-highlight the analysis text for this node.\nPlease delete the node and manually re-add it instead by highlighting the text and clicking on the canvas.");
                    }
                }
            }
        }
        resolve(true); //the edits have been undone
    });
}

/**
 * Undoes add edits
 * @param {*} toUndo - The add edits to be undone
 * @returns {Promise<Boolean>} - Indicates if the edits were successfully undone (true) or not (false)
 */
function undoAdd(toUndo) {
    // console.log("undoAdd called");
    return new Promise(resolve => {
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
        resolve(true); //the edits have been undone
    });
}

/**
 * Undoes edit edits
 * @param {*} toUndo - The edits to be undone
 * @returns {Promise<Boolean>} - Indicates if the edits were successfully undone (true) or not (false)
 */
function undoEdit(toUndo) {
    // console.log("undoEdit called");
    return new Promise(resolve => {
        for (i = 0; i < toUndo.length; i++) {
            if (toUndo[i].type == 'node') {
                toEdit = JSON.parse(toUndo[i].content);
                // console.log("editing node: " + toEdit.nodeID);
                updateEditNode(toEdit); //edit node
                postEdit("node", "edit", toEdit, 1, toEdit.nodeID);
            }
        }
        resolve(true); //the edits have been undone
    });
}

/**
 * Gets and adds a list of participants from the 'social' JSON
 */
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

/**
 * Adds a participant
 * @param {String} firstname - The first name of the participant
 * @param {String} surname - The surname of the participant
 * @returns {Participant} - The new participant
 */
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

/**
 * Adds a locution
 * @param {Node} node - The node to add a locution to
 */
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

    var ltext = (firstname + ' ' + surname + ': ').concat(node.text);
    var nindex = findNodeIndex(CurrentlyEditing);
    var n = nodes[nindex];
    var yCoord = n.y;
    if (nodes[nindex + 1]) {
        if (nodes[nindex + 1].type == 'L') {
            yCoord = parseInt(yCoord) + 50;
        }
    }

    if (window.addTimestamps) {
        AddNode(ltext, 'L', null, participantID, newLNodeID, (parseInt(n.x) + 450), parseInt(yCoord), true, 0, node.timestamp);
        var index = findNodeIndex(newLNodeID, true);
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

/**
 * Gets or creates the range around a selection
 * @param {*} selectionObject - The selection to get the range for
 * @returns The range around the selection
 */
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

/**
 * Handles adding a locution
 * @param {Boolean} skipcheck 
 * @returns {Boolean}
 */
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
    $('#new_participant').hide();
    $('#p_sel_wrap').show();
    $('#p_select').val('-');
    $('#p_name').val('');
    $('#prt_name').show();
    $('#locution_add').hide();
    $('#socialusers').hide();
    $('#modal-shade').hide();

    var mw = $("#mainwrap").width();
    $("#right1").width(mw - $("#left1").width() - 41);
    return false;
}

/**
 * Gets all nodes that are connected by an edge to the given node
 * @param {Node} node - The node to get the connected nodes for
 * @returns An array of the nodes connected to
 */
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

/**
 * Gets all nodes that are connected by an edge from the given node
 * @param {Node} node - The node to get the connected nodes for
 * @returns An array of the nodes connected from
 */
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

/**
 * Handles canceling adding a locution
 * @returns {Boolean}
 */
function addlcancel() {
    $('#new_participant').hide();
    $('#p_sel_wrap').show();
    $('#p_select').val('-');
    $('#p_name').val('');
    $('#prt_name').show();
    $('#socialusers').hide();
    $('#locution_add').hide();


    var index = findNodeIndex(CurrentlyEditing, true);
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

/**
 * Filters the list of participants
 * @param {*} element 
 */
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

/**
 * 
 * @returns 
 */
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

/**
 * Gets the analysis text
 * @returns {String} txt - The analysis text
 */
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

/**
 * Sets the analysis text
 * @param {String} txt - The new analysis text to set
 */
function setAllText(txt) {
    var iframe = document.getElementById('left1');
    if (iframe.nodeName.toLowerCase() == 'div') {
        $('#analysis_text').html(txt);
    }
}

/**
 * Changes the colour for a critical question to show if it's been answered (green) or not (red)
 * @param {*} fesel - The select element to check if it's been answered
 */
function addCQ(fesel) {
    fename = fesel.id.substring(2);
    if (fesel.selectedIndex == 0) {
        $('#cqi-' + fename).css('color', '#c0392b'); //red
    } else {
        $('#cqi-' + fename).css('color', '#27ae60'); //green
    }
}

/**
 * Sets the descriptors (including critical questions) for a given scheme and node
 * @param {String} schemeID - The scheme to set descriptor options for
 * @param {Node} node - The node to set descriptor options for
 */
function setdescriptors(schemeID, node) {
    $.getJSON("browserint.php?x=ipxx&url=" + window.DBurl + "/formedges/scheme/" + schemeID, function (json_data) {
        console.log("----------");
        console.log("scheme: " + schemeID);
        console.log(json_data);

        //clears and sets the defaults
        $('#descriptor_selects').empty();
        $('#descriptor_selects').append('<b>Descriptors</b>');
        $('#cq_selects').empty();
        var nodes_in = getNodesIn(node);
        var nodes_out = getNodesOut(node);
        var adddesc = false;
        var addcq = false;

        //sets up the selects and options for the critical questions
        var nodeselect = $('<select class="cqselect" onChange="addCQ(this);" style="display:none;"></select>');
        nodeselect.append('<option value="-">Click to select</option>');
        var ucselect = $('<select class="cqselect" onChange="addCQ(this);" style="display:none;"></select>');
        ucselect.append('<option value="-">Click to select</option>');
        for (index in nodes_in) {
            nin = nodes_in[index];
            if (nin.type == 'I' || nin.type == 'L') {
                nodeselect.append('<option value="' + nin.nodeID + '">' + nin.text + '</option>');
            } else {
                nodes_in_in = getNodesIn(nin);
                for (inindex in nodes_in_in) {
                    ninin = nodes_in_in[inindex];
                    if (ninin.type == 'I') {
                        ucselect.append('<option value="' + ninin.nodeID + '">' + ninin.text + '</option>');
                    }
                }
            }
        }

        for (index in json_data.formedges) {
            adddesc = true;
            formedge = json_data.formedges[index];

            if (formedge.Explicit == 1) {
                var selected = 0;
                var selectedIDs = [];
                if (node.scheme == schemeID) { //if the scheme hasn't been changed
                    selected = findSelectedID(node, formedge.name); //find the previously selected ID
                    if (selected == 0) { //if no selected ID was found
                        selectedIDs = node.descriptors.filter(d => d.descriptorID == formedge.descriptorID && d.type == null)
                            .map(d => d.selectedID);  //check if previously selected with type set to null
                    }
                }

                var newselect = $('<select id="s_' + formedge.name + '" class="dselect" onChange="addCQ(this);" name="' + formedge.descriptorID + '"></select>');
                newselect.append('<option value="-">Click to select</option>');

                if (formedge.CQ != null) { //adds the critical question if it exists
                    addcq = true;
                    $('#cq_selects').prepend('<div style="clear:both"><strong>Q: </strong>' + formedge.CQ + ' <div style="color:#c0392b; float:right; font-size:22px; margin-top:-8px;" id="cqi-' + formedge.name + '">&#x25CF;</div></div>');
                }

                if (formedge.formEdgeTypeID in { '1': '', '5': '', '9': '', '11': '', '13': '', '15': '', '16': '', '20': '', '22': '' }) {
                    for (index in nodes_in) {
                        nin = nodes_in[index];
                        if (nin.type == 'I' || nin.type == 'L') {
                            if (nin.nodeID == selected || selectedIDs.includes(nin.nodeID)) { //reselect the option that was previously set
                                $('#cqi-' + formedge.name).css('color', '#27ae60');
                                newselect.append('<option value="' + nin.nodeID + '" selected="selected">' + nin.text + '</option>');
                            } else { //add a new option
                                newselect.append('<option value="' + nin.nodeID + '">' + nin.text + '</option>');
                            }
                        }
                    }
                } else if (formedge.formEdgeTypeID in { '2': '', '7': '', '10': '', '12': '', '14': '', '17': '', '21': '' }) {
                    for (index in nodes_out) {
                        nut = nodes_out[index];
                        if (nut.nodeID == selected || selectedIDs.includes(nut.nodeID)) { //reselect the option that was previously set
                            newselect.append('<option value="' + nut.nodeID + '" selected="selected">' + nut.text + '</option>');
                        } else { //add a new option
                            newselect.append('<option value="' + nut.nodeID + '">' + nut.text + '</option>');
                        }
                    }
                } else {
                    continue;
                }

                //add the newly created select and its label to the descriptors section
                $('#descriptor_selects').append('<label id="l_' + formedge.name + '" for="s_' + formedge.name + '">' + formedge.name + '</label>');
                $('#descriptor_selects').append(newselect);
            } else {
                if (formedge.CQ != null) { //adds the critical question if it exists
                    addcq = true;
                    $('#cq_selects').append('<div style="clear:both"><strong>Q: </strong>' + formedge.CQ + ' <div style="color:#c0392b; float:right; font-size:22px; margin-top:-8px;" id="cqi-' + formedge.name + '"><a href="" onClick="$(\'#cq' + formedge.name + '\').toggle();$(this).html($(this).text()==\'&#x25BE;\'?\'&#x25B4;\':\'&#x25BE;\');return false;" style="color:#444;text-decoration:none;font-size:16px;">&#x25BE;</a>&#x25CF;</div></div>');
                    if (formedge.descriptorID != null) {
                        nsclone = nodeselect.clone().prop({ id: 'cq' + formedge.name, name: formedge.descriptorID });
                    } else {
                        nsclone = ucselect.clone().prop({ id: 'cq' + formedge.name, name: formedge.descriptorID });
                    }
                    $('#cq_selects').append(nsclone);
                }
            }
        }

        //reselect the cq options that were previously set
        if (node.scheme == schemeID) { //if the scheme hasn't been changed
            for (cq of node.cqdesc) {
                if (cq.type != null) {
                    $('#cqi-' + cq.type).css('color', '#27ae60');
                    $('#cq' + cq.type).val(cq.selectedID);
                }
                else if (cq.descriptorID != null) { //reselect the cq options that were previously set with null type
                    if ($("select[name='" + cq.descriptorID + "'] option[value='" + cq.selectedID + "']").length > 0) {
                        var id = $("select[name='" + cq.descriptorID + "']")[0].id;
                        console.log(id);
                        $("#" + id).val(cq.selectedID);
                        $('#cqi-' + id.slice(2)).css('color', '#27ae60');
                    }
                }
            }
        }

        if (adddesc) {
            $('#tab-bar-edits').show();
            $('#tab_descriptor_selects').show();
        }

        if (window.cqmode && addcq) {
            $('#cq_selects').prepend('<b>Critical Questions</b>');
            $('#tab_cq_selects').show();
        } else {
            $('#tab_cq_selects').hide();
        }
    });
}

/**
 * Filters schemes by their scheme set
 * @param {Number} schemesetID - The ID of the scheme set to filter by
 * @returns {Boolean}
 */
function filterschemes(schemesetID) {
    // console.log(schemesetID)
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

/**
 * Sets the default scheme set
 * @param {String} type - The type to set the default for
 * @param {String} schemesetID - The ID of the scheme set to set as default
 */
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

/**
 * Handles turning dialogical mode on and off
 * @returns {Boolean}
 */
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

/**
 * Handles turning sticky add edge mode on and off
 */
function eAddModeOnOff() {
    if (window.eAddMode) {
        $("#eadd").attr("onclick", "edgeMode('switch')");
        // console.log("sticky add edge mode turned on");
    }
    else {
        $("#eadd").attr("onclick", "clearEdgeModal()");
        // console.log("sticky add edge mode turned off");
    }
}

// /**
//  * Autolayout
//  */
// function genldot() {
//     var doto = "digraph odg {";
//     var ranks = "";
//     var alreadyDrawn = {};
//     if ("plus" in getUrlVars()) {
//         doto = doto + "rankdir=RL;";
//     }

//     for (var i = 0, l = nodes.length; i < l; i++) {
//         dnode = nodes[i];
//         doto = doto + dnode.nodeID + ' [label="xxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx"];';

//         if (dnode.type != 'I' && dnode.type != 'L') {

//             dout = getNodesOut(dnode);
//             for (var j = 0, ol = dout.length; j < ol; j++) {
//                 if (alreadyDrawn[dnode.nodeID + "-" + dout[j].nodeID] !== 100) {
//                     doto = doto + dnode.nodeID + ' -> ' + dout[j].nodeID;
//                     alreadyDrawn[dnode.nodeID + "-" + dout[j].nodeID] = 100;
//                     if ("plus" in getUrlVars() && dnode.type != 'YA' && dout[j].type != 'YA') {
//                         doto = doto + " [constraint=false]";
//                         if ((dnode.type == 'RA' || dnode.type == 'CA') && dout[j].type == 'I') {
//                             ranks = ranks + '{ rank = same; ' + dnode.nodeID + '; ' + dout[j].nodeID + '; }';
//                         }
//                     }
//                     doto = doto + ';';
//                 }
//                 // doto = doto + dnode.nodeID + ' -> ' + dout[j].nodeID;
//                 // alreadyDrawn[dnode.nodeID+"-"+dout[j].nodeID]=100;
//                 // console.log(doto);
//                 // if("plus" in getUrlVars() && dnode.type != 'YA' && dout[j].type != 'YA'){
//                 //     doto = doto + " [constraint=false]";
//                 //     if((dnode.type == 'RA' || dnode.type == 'CA') && dout[j].type == 'I'){
//                 //         ranks = ranks + '{ rank = same; ' + dnode.nodeID + '; ' + dout[j].nodeID + '; }';
//                 //     }
//                 // }
//                 // doto = doto + ';';
//             }
//             din = getNodesIn(dnode);
//             for (var j = 0, ol = din.length; j < ol; j++) {
//                 if (alreadyDrawn[din[j].nodeID + "-" + dnode.nodeID] !== 100) {
//                     doto = doto + din[j].nodeID + ' -> ' + dnode.nodeID;

//                     alreadyDrawn[din[j].nodeID + "-" + dnode.nodeID] = 100;
//                     if ("plus" in getUrlVars() && dnode.type != 'YA' && din[j].type != 'YA') {
//                         doto = doto + " [constraint=false]";
//                         if ((din[j].type == 'RA' || din[j].type == 'CA') && dnode.type == 'I') {
//                             ranks = ranks + '{ rank = same; ' + din[j].nodeID + '; ' + dnode.nodeID + '; }';
//                         }
//                     }
//                     doto = doto + ';';
//                 }
//                 // doto = doto + din[j].nodeID + ' -> ' + dnode.nodeID;
//                 //     if("plus" in getUrlVars() && dnode.type != 'YA' && din[j].type != 'YA'){
//                 //         doto = doto + " [constraint=false]";
//                 //         if((din[j].type == 'RA' || din[j].type == 'CA') && dnode.type == 'I'){
//                 //             ranks = ranks + '{ rank = same; ' + din[j].nodeID + '; ' + dnode.nodeID + '; }';
//                 //         }
//                 //     }
//                 //     doto = doto + ';';
//             }
//         }
//     }

//     doto = doto + ranks;
//     doto = doto + '}';

//     mwidth = 1000;
//     mheight = 12775;

//     $.post("dot/index.php", { data: doto },
//         function (reply) {
//             ldata = JSON.parse(reply);
//             for (var i = 0, l = nodes.length; i < l; i++) {
//                 mnode = nodes[i];
//                 if (mnode.nodeID in ldata) {
//                     xpos = parseInt(ldata[mnode.nodeID]["x"]);
//                     mnode.x = xpos * 0.8;
//                     if (xpos > mwidth - 100) { mwidth = xpos + 100; }
//                     ypos = parseInt(ldata[mnode.nodeID]["y"]);
//                     mnode.y = ypos;
//                     if (ypos > mheight - 100) { mheight = ypos + 100; }
//                 }
//             }
//             //
//             // if(mwidth > WIDTH || mheight > HEIGHT){
//             //     resize_canvas(mwidth, mheight);
//             // }

//             //invalidate();
//         }
//     );
// }

/**
 * Sets the font size for the analysis text
 * @param {String} size - The new font size
 * @returns {Boolean}
 */
function setFontSize(size) {
    if (size == "ts" || size == "tm" || size == "tl") {
        $("#left1").removeClass("ts tm tl");
        $("#left1").addClass(size);
    }
    return false;
}

/**
 * Sets Rapid IAT mode based on default settings
 */
function setRIATMode() {
    if (dialogicalMode && window.defaultSettings["analysis"]["rIAT"]) {
        window.rIATMode = true;
    } else {
        $("#riattoggle").toggleClass("on off");
    }
}

/**
 * Handles changing tabs on the settings modal
 * @param {*} evt - The event
 * @param {String} tab - The tab to change to
 * @returns {Boolean}
 */
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

/**
 * Handles changing tabs on the helpsheet modal
 * @param {*} evt - The event
 * @param {String} tab - The tab to change to
 * @returns {Boolean}
 */
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

/**
 * Handles changing tabs on the edit node modal
 * @param {String} tab - The tab to change to
 * @returns {Boolean}
 */
function editsTab(tab) {
    var tabs = document.getElementsByClassName("nEdit");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("selected");
    }
    document.getElementById("tab_" + tab).classList.add("selected");
    $('#node_options').hide();
    $('#descriptor_selects').hide();
    $('#cq_selects').hide();
    $('#' + tab).show();
    return false;
}

/**
 * Sets the start date and time for the timestamps
 * @param {String} startdatestmp - Optional
 * @returns 
 */
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
            if (window.editTimestamp) { //if editing a locution's timestamp
                var tstamp = Math.round(new Date(start).getTime());
                var tsd = new Date();
                tsd.setTime(tstamp);
                var str = tsd.toString();
                document.getElementById("timestamp_label").innerHTML = str;
                window.editTimestamp = false;
                window.groupID++;
                updateTimestamp(mySel.nodeID, str);
                if (window.showTimestamps) {
                    var edited = editTimestampSVG(mySel.nodeID, str);
                    if (!edited) { DrawTimestamp(mySel.nodeID, str, mySel.x, mySel.y); }
                }
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

/**
 * Handles deleting a timestamp
 */
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

/**
 * Handles resetting the edge modal inputs to their defaults
 */
function clearEdgeModal() {
    $('#sourceBtn').show(); $('#targetBtn').show();
    //clear the previously selected source and target
    var sourceText = document.getElementById('source_text');
    sourceText.innerHTML = "";
    var targetText = document.getElementById('target_text');
    targetText.innerHTML = "";

    if (window.dialogicalMode) {
        var message = document.getElementById("edge_message");
        message.innerHTML = "";
        var sourceL = document.getElementById('sel_source_L');
        var targetL = document.getElementById('sel_target_L');
        //clear the source and target locutions
        $("#sel_source_L").empty();
        $("#sel_target_L").empty();
        $("<option />", { value: "0", html: "--No locution selected--" }).appendTo(sourceL);
        $("<option />", { value: "0", html: "--No locution selected--" }).appendTo(targetL);
        $("#sel_source_L").val("0");
        $("#sel_target_L").val("0");

        //update the select options to include all relevant locutions
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].type == "L" && nodes[i].visible) {
                $("<option />", { value: nodes[i].nodeID, html: nodes[i].text }).appendTo(sourceL);
                $("<option />", { value: nodes[i].nodeID, html: nodes[i].text }).appendTo(targetL);
            }
        }
    }
    openModal('#modal-edge');
}

/**
 * Handles the 'add edges' button on the add edge modal click event
 * @returns {Boolean} Indicates if the edges were successfully added (true) or not (false)
 */
function addLongEdge() {
    var addTA = true;
    var sourceL = $("#sel_source_L").val();
    var targetL = $("#sel_target_L").val();
    var message = document.getElementById("edge_message");
    var sourceT = document.getElementById("source_text").value;
    var targetT = document.getElementById("target_text").value;

    //checks if any of the sources or targets need to be reselected
    if (sourceT == "") { message.innerHTML = "Please select a <strong>source node</strong>."; return false; }
    if (targetT == "") { message.innerHTML = "Please select a <strong>target node</strong>."; return false; }
    if (sourceL == "0") {
        if (window.rIATMode) { message.innerHTML = "Please select a <strong>source locution</strong>."; return false; }
        else { addTA = false; }
    }
    if (targetL == "0") {
        if (window.rIATMode) { message.innerHTML = "Please select a <strong>target locution</strong>."; return false; }
        else { addTA = false; }
    }

    if (addTA) {
        var from = document.getElementById(sourceL);
        var to = document.getElementById(targetL);
        if (from == null) { message.innerHTML = "The selected source locution no longer exists, please select a different <strong>source locution</strong>."; return false; }
        if (to == null) { message.innerHTML = "The selected target locution no longer exists, please select a different <strong>target locution</strong>."; return false; }

        //calculates the x and y values for a new TA node
        from = from.getElementsByTagName('rect')[0];
        to = to.getElementsByTagName('rect')[0];
        var fx = from.getAttributeNS(null, 'x');
        var fy = from.getAttributeNS(null, 'y');
        var fw = from.getAttributeNS(null, 'width');
        var fh = from.getAttributeNS(null, 'height');
        var tx = to.getAttributeNS(null, 'x');
        var ty = to.getAttributeNS(null, 'y');
        var tw = to.getAttributeNS(null, 'width');
        var th = to.getAttributeNS(null, 'height');
        fx = parseInt(fx) + (parseInt(fw) / 2);
        fy = parseInt(fy) + (parseInt(fh) / 2);
        tx = parseInt(tx) + (parseInt(tw) / 2);
        ty = parseInt(ty) + (parseInt(th) / 2);
        var nx = ((tx - fx) / 2) + fx;
        var ny = ((ty - fy) / 2) + fy;

        //adds a TA node
        window.groupID++;
        window.nodeCounter++;
        newNodeID = (window.nodeCounter + "_" + window.sessionid);
        var mark = false;
        var radio = document.getElementById("mark_node_check");
        if (radio && radio.checked) {
            mark = true;
        }
        AddNode('Default Transition', 'TA', '82', 0, newNodeID, nx, ny, true, 0, "", mark);

        var edge;
        if (fy > ty) {
            //adds an edge between the target locution and TA nodes
            DrawEdge(targetL, newNodeID);
            edge = newEdge(targetL, newNodeID);
            UpdateEdge(edge);

            //adds an edge between the TA and source locution nodes
            DrawEdge(newNodeID, sourceL);
            edge = newEdge(newNodeID, sourceL);
        } else {
            //adds an edge between the source locution and TA nodes
            DrawEdge(sourceL, newNodeID);
            edge = newEdge(sourceL, newNodeID);
            UpdateEdge(edge);

            //adds an edge between the TA and target locution nodes
            DrawEdge(newNodeID, targetL);
            edge = newEdge(newNodeID, targetL);
        }
        UpdateEdge(edge);

        //marks the new TA and its connected edges/nodes if needed
        if (mark) {
            var index = findNodeIndex(newNodeID, true);
            var n = nodes[index];
            window.groupID++;
            markNode(n, true);
        }
    }
    closeModal('#modal-edge');
    return true;
}

/**
 * Handles the cancel button on the add edge modal click event
 */
async function cancelLongEdge() {
    if (window.dialogicalMode) {
        var sourceT = document.getElementById("source_text").value;
        var targetT = document.getElementById("target_text").value;
        if (sourceT != "" && targetT != "") {
            await undo();
            var radio = document.getElementById("mark_node_check");
            if (radio && radio.checked) { await undo(); }
        }
    }
    edgeMode('off');
    closeModal('#modal-edge');
    return false;
}