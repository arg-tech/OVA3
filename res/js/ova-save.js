/**
 * Generates a JSON to represent the current analysis
 * @returns {String} - The generated JSON as a string
 */
function genjson() {
    var json = {}
    var jnodes = [];
    var jschemeFulfillments = [];
    var jdescriptorFulfillments = [];
    var jlocutions = [];
    var jedges = [];
    var nodesLayout = [];
    var edgesLayout = [];

    for (var i = 0, l = nodes.length; i < l; i++) {
        var jnode = {};
        jnode['nodeID'] = nodes[i].nodeID;
        jnode['text'] = nodes[i].text;
        jnode['type'] = nodes[i].type;
        jnodes.push(jnode);

        var n = {};
        n['nodeID'] = nodes[i].nodeID;
        n['visible'] = nodes[i].visible;
        n['x'] = nodes[i].x;
        n['y'] = nodes[i].y;
        n['timestamp'] = nodes[i].timestamp;
        nodesLayout.push(n);

        if (nodes[i].scheme != null) {
            var jschemeFulfillment = {};
            jschemeFulfillment['nodeID'] = nodes[i].nodeID;
            jschemeFulfillment['schemeID'] = nodes[i].scheme;
            jschemeFulfillments.push(jschemeFulfillment);
        }

        // if (nodes[i].descriptor != null) {
        //     var jdescriptorFulfillment = {};
        //     jdescriptorFulfillment['nodeID'] = nodes[i].nodeID;
        //     jdescriptorFulfillment['descriptorID'] = nodes[i].descriptor;
        //     jdescriptorFulfillments.push(jdescriptorFulfillment);
        // }

        if (nodes[i].participantID != 0) {
            var jlocution = {};
            jlocution['nodeID'] = nodes[i].nodeID;
            jlocution['personID'] = nodes[i].participantID;
            // jlocution['start'] = Math.round(new Date(nodes[i].timestamp).getTime() / 1000);
            if (nodes[i].timestamp !== "") {
                var timestamp = new Date(nodes[i].timestamp);
                var date = timestamp.toISOString().split("T", 2);
                var time = date[1].split(".", 1);
                jlocution['start'] = date[0] + " " + time;
                jlocution['end'] = null;
            }
            jlocutions.push(jlocution);
        }
    }

    for (var i = 0, l = edges.length; i < l; i++) {
        var jedge = {};
        jedge['edgeID'] = i + 1;
        jedge['fromID'] = edges[i].fromID;
        jedge['toID'] = edges[i].toID;
        jedges.push(jedge);

        var e = {};
        e['fromID'] = edges[i].fromID;
        e['toID'] = edges[i].toID;
        e['visible'] = edges[i].visible;
        edgesLayout.push(e);
    }

    var aif = {
        "nodes": jnodes,
        "edges": jedges,
        "schemefulfillments": jschemeFulfillments,
        "descriptorfulfillments": jdescriptorFulfillments,
        "participants": participants,
        "locutions": jlocutions
    };
    json['AIF'] = aif;

    var ova = {
        "firstname": window.afirstname,
        "surname": window.asurname,
        "nodes": nodesLayout,
        "edges": edgesLayout
    };
    json['OVA'] = ova;

    var url = getUrlVars()["url"];
    var txt = '';

    if (url == 'local') {
        txt = getAllText();
        url = '';
    }

    var text = {
        "txt": txt,
        "url": url
    };
    json['text'] = text;

    jstr = JSON.stringify(json);

    return jstr;
}

/**
 * Generates a link to share the current analysis
 * @returns {Boolean}
 */
function genlink() {
    alink = window.location;
    $('#shareinput').val(alink);
    console.log(nodes);
    console.log(edges);
    document.getElementById("edited-by").innerHTML = "Analysis edited by: " + users.toString();
    return false;
}

/**
 * Saves and downloads the current analysis as a JSON file called 'analysis.json'
 * @returns {Boolean}
 */
function save2file() {
    var jstr = genjson();

    $.generateFile({
        filename: 'analysis.json',
        content: jstr,
        script: 'download.php'
    });

    window.unsaved = false;

    return false;
}

/**
 * Removes the current analysis
 * @returns {Boolean}
 */
function clearAnalysis() {
    var currentTxt = getAllText();
    var exampleTxt = "Enter your text here...";
    if (currentTxt != exampleTxt) {
        //Clears the text
        setAllText(exampleTxt);
        postEdit("text", "edit", exampleTxt, 1);
    }

    for (var i = edges.length - 1; i >= 0; i--) { delEdge(edges[i]); } //Removes all edges
    for (var i = nodes.length - 1; i >= 0; i--) { delNode(nodes[i]); } //Removes all nodes

    //Clears the svg
    SVGRoot.removeChild(SVGRootG);
    SVGRootG = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    SVGRoot.appendChild(SVGRootG);
    return false;
}

/**
 * Updates the load analysis modal to show the replace current analysis option
 * @param {Boolean} show - Indicates if the replace option should be shown (true) or not (false), optional
 * @returns {Boolean}
 */
function showReplace(show) {
    if (nodes.length > 0 || show) {
        var replace = document.getElementById("load-replace");
        replace.setAttribute("style", "display:block;");
    } else if (!show) {
        var replace = document.getElementById("load-replace");
        replace.setAttribute("style", "display:none;");
    }
    return false;
}

/**
 * Handles the selection and loading of files
 * @param {*} evt - The event
 * @returns {Boolean}
 */
function loadFileBtn(evt) {
    var files = evt.target.files; // FileList object
    var multi = false;
    var current = "";
    var replace = document.getElementById("load_replace");
    var list = document.getElementById('list');
    if (files.length > 1 || !replace.checked) { multi = true; current = list.innerHTML.slice(4, -5); }

    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                loadFile(e.target.result, multi);
                showReplace();
            };
        })(f);

        reader.readAsText(f);

        output.push('<span style="font-size:0.8em;">Loaded file: <strong>', f.name, '</strong> - ',
            f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</span><br>');
    }
    list.innerHTML = '<ul>' + current + output.join('') + '</ul>';
    return false;
}

/**
 * Handles the selection and loading of a corpus
 * @param {Number} corpusName - The short name of the corpus to load
 * @returns  {Boolean}
 */
function loadCorpus(corpusName) {
    // console.log("corpus: " + corpusName);
    var current = "";
    var multi = false;
    var replace = document.getElementById("load_replace");
    var list = document.getElementById('list');
    if (!replace.checked) { multi = true; current = list.innerHTML.slice(4, -5); }
    else { clearAnalysis(); }

    $.getJSON("helpers/corporanodesets.php?shortname=" + corpusName, function (data) {
        $.each(data.nodeSets, function (idx, nodeSet) {
            var nSetID = parseInt(nodeSet);
            $.get('./db/' + nSetID, function (data) {
                console.log("loading from ./db");
                loaded = loadFile(data, true);
                if (loaded) {
                    list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;">Loaded analysis: Node Set ID <strong>' + nSetID + '</strong></span><br>' + '</ul>';
                    showReplace(true);
                } else {
                    list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;color:rgba(224, 46, 66, 1);">Failed to load analysis: Node Set ID <strong>' + nSetID + '</strong></span><br>' + '</ul>';
                }
            }).fail(function () {
                // console.log("loading with node set id: " + nSetID);
                loadfromdb(nSetID, multi);
            });
        });
        var cName = $("#corpus_sel option:selected").text();
        list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;">Loaded corpus: <strong>' + cName + '</strong></span><br>' + '</ul>'; //  - Node set IDs: ' + data.nodeSets.join(', ') + '
    });
    showReplace(true);
    return false;
}

/**
 * Handles the user input for loading an analysis from a node set ID
 * @param {Number} nodesetID - The node set ID of the analysis to load
 * @returns  {Boolean}
 */
function loadNodeSet(nodesetID) {
    var nsetID = parseInt(nodesetID);
    if (Number.isInteger(nsetID) && nsetID > 0) { //if a valid node set ID
        // console.log("nodeset ID: " + nodesetID);
        var multi = false;
        var current = "";
        var replace = document.getElementById("load_replace");
        var list = document.getElementById('list');
        if (!replace.checked) { multi = true; current = list.innerHTML.slice(4, -5); }

        var loaded = false;
        $.get('./db/' + nsetID, function (data) {
            console.log("loading from ./db");
            loaded = loadFile(data, multi);
            if (loaded) {
                list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;">Loaded analysis: Node Set ID <strong>' + nsetID + '</strong></span><br>' + '</ul>';
                showReplace(true);
            } else {
                list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;color:rgba(224, 46, 66, 1);">Failed to load analysis: Node Set ID <strong>' + nsetID + '</strong></span><br>' + '</ul>';
            }
        }).fail(function () {
            // console.log("loading with node set id");
            loadfromdb(nsetID, multi);
        });
    }
    return false;
}

/**
 * Loads a JSON file
 * @param {*} jstr - The JSON file to load
 * @param {Boolean} multi - Indicates if the loaded analysis should replace the current analysis (false) or be added to it (true)
 * @return {Boolean} - Indicates if the JSON file was successfully loaded (true) or not (false)
 */
function loadFile(jstr, multi) {
    if (typeof jstr !== 'object') {
        var json = JSON.parse(jstr);
    } else {
        var json = jstr;
    }

    var offset = 0;
    if (multi) {
        offset = calOffset('y');
        // console.log("offset: " + offset);
    } else {
        clearAnalysis(); //remove the previous analysis before loading the new analysis
    }

    var oplus = false;
    if ("plus" in getUrlVars()) {
        oplus = true;
    }

    if (json['OVA']) { //if in OVA3 format
        loadOva3Json(json, oplus, offset);
        return true;
    } else if (json['nodes']) {
        var jnodes = json['nodes'];
        if (jnodes.length > 0 && !(jnodes[0].hasOwnProperty('x'))) { //if in db format
            loaddbjson(json, oplus, offset);
            return true;
        } else if (jnodes.length > 0 && jnodes[0].hasOwnProperty('id')) { //if in OVA2 format
            loadOva2Json(json, oplus, offset);
            return true;
        }
    }
    return false;
}

/**
 * Loads analysis maps from OVA3 formatted JSONs
 * @param {Object} json - The json to be loaded in
 * @param {Boolean} oplus - Indicates if the analysis should be loaded in dialogical (true) or non-dialogical (false) mode
 * @param {Number} offset - The offset to be added to the y coordinates
 * @return {void} Nothing
 */
function loadOva3Json(json, oplus, offset) {
    console.log("loading OVA3 json");

    //load participants
    var p = json['AIF']['participants'];
    if (p != undefined) {
        for (var i = 0, l = p.length; i < l; i++) {
            firstname = p[i].firstname;
            surname = p[i].surname;
            addParticipant(firstname, surname)
        }
    }

    var text = false;
    if (json['text']['txt'] != "") {
        text = loadText(json['text']['txt']);
    }
    if (!text && json['text'].hasOwnProperty("url")) {
        loadUrl(json['text']['url']);
    }

    //create the nodes
    var jnodes = json['AIF']['nodes'];
    var nodelist = {};
    var pID = 0;
    for (var i = 0, l = jnodes.length; i < l; i++) {
        if (oplus) {
            if (jnodes[i].type == "L") {
                pID = findParticipantIDText(jnodes[i].text);
                nodelist[jnodes[i].nodeID] = newNode(jnodes[i].nodeID, jnodes[i].type, null, pID, jnodes[i].text, 0, 0, false, 1);
            } else {
                nodelist[jnodes[i].nodeID] = newNode(jnodes[i].nodeID, jnodes[i].type, null, 0, jnodes[i].text, 0, 0, false, 1);
            }
        } else if (jnodes[i].type == "I" || jnodes[i].type == "RA" || jnodes[i].type == "CA" || jnodes[i].type == "MA" || jnodes[i].type == "EN") {
            nodelist[jnodes[i].nodeID] = newNode(jnodes[i].nodeID, jnodes[i].type, null, 0, jnodes[i].text, 0, 0, false, 1);
            if (jnodes[i].type == "I" && text) { hlUpdate(jnodes[i].nodeID, jnodes[i].type, jnodes[i].nodeID, 1); }
        }
    }

    window.nodeCounter += jnodes.length; //update the node counter

    //set any scheme fulfillments
    var sf = json['AIF']['schemefulfillments'];
    if (sf != undefined) {
        for (var i = 0; i < sf.length; i++) {
            updateNodeScheme(sf[i].nodeID, sf[i].schemeID, 1);
        }
    }

    //set the layout of the nodes and draw them on the svg
    var n = json['OVA']['nodes'];
    var newY = 0;
    for (var i = 0, l = n.length; i < l; i++) {
        if (nodelist[n[i].nodeID]) {
            if (n[i].visible) {
                newY = parseInt(n[i].y) + offset;
                updateNode(n[i].nodeID, n[i].x, newY, n[i].visible, 1);
                DrawNode(nodelist[n[i].nodeID].nodeID, nodelist[n[i].nodeID].type, nodelist[n[i].nodeID].text, nodelist[n[i].nodeID].x, nodelist[n[i].nodeID].y);
                if (n[i].timestamp) {
                    updateTimestamp(n[i].nodeID, n[i].timestamp, 1);
                    if (window.showTimestamps) { DrawTimestamp(n[i].nodeID, n[i].timestamp, nodelist[n[i].nodeID].x, nodelist[n[i].nodeID].y); }
                }
            }
        }
    }

    //create and draw any connecting edges
    var e = json['OVA']['edges'];
    var from, to, edge;
    for (var i = 0, l = e.length; i < l; i++) {
        from = e[i].fromID;
        to = e[i].toID;
        if (from in nodelist && to in nodelist) { //if both the nodes the edge connects exist
            edge = newEdge(from, to, e[i].visible, 1);
            if (e[i].visible) {
                DrawEdge(from, to);
                UpdateEdge(edge);
            }
        }
    }
}

/**
 * Loads analysis maps from OVA2 formatted JSONs
 * @param {Object} json - The json to be loaded in
 * @param {Boolean} oplus - Indicates if the analysis should be loaded in dialogical (true) or non-dialogical (false) mode
 * @param {Number} offset - The offset to be added to the y coordinates
 * @return {void} Nothing
 */
function loadOva2Json(json, oplus, offset) {
    console.log("loading OVA2 json");

    //load participants
    var p = json['participants'];
    var pID = 0;
    if (p != undefined) {
        for (var i = 0, l = p.length; i < l; i++) {
            firstname = p[i].firstname;
            surname = p[i].surname;
            addParticipant(firstname, surname)
        }
    }

    var text = loadText(json['analysis']['txt']); //load text on LHS

    //load nodes
    var nodelist = {};
    var jnodes = json['nodes'];
    var nID = '';
    var count = window.nodeCounter;
    var newY = 0;
    for (var i = 0, l = jnodes.length; i < l; i++) {
        if ((count + jnodes[i].id) > window.nodeCounter) {
            window.nodeCounter = (count + jnodes[i].id); //update the node counter
        }
        nID = ((count + jnodes[i].id) + "_" + window.sessionid);
        newY = parseInt(jnodes[i].y) + offset;
        if (oplus) {
            if (jnodes[i].type == "L") {
                pID = findParticipantIDText(jnodes[i].text);
                nodelist[nID] = newNode(nID, jnodes[i].type, jnodes[i].scheme, pID, jnodes[i].text, jnodes[i].x, newY, jnodes[i].visible, 1, jnodes[i].timestamp);
                if (jnodes[i].visible) {
                    DrawNode(nID, jnodes[i].type, jnodes[i].text, jnodes[i].x, newY);
                    if (text) { hlUpdate(jnodes[i].id, jnodes[i].type, nID, 1); }
                    if (window.showTimestamps) { DrawTimestamp(nID, jnodes[i].timestamp, jnodes[i].x, newY); }
                }
            } else {
                nodelist[nID] = AddNode(jnodes[i].text, jnodes[i].type, jnodes[i].scheme, 0, nID, jnodes[i].x, newY, jnodes[i].visible, 1);
            }
        } else if (jnodes[i].type == "I" || jnodes[i].type == "RA" || jnodes[i].type == "CA" || jnodes[i].type == "MA" || jnodes[i].type == "EN") {
            nodelist[nID] = AddNode(jnodes[i].text, jnodes[i].type, jnodes[i].scheme, 0, nID, jnodes[i].x, newY, jnodes[i].visible, 1);
            if (jnodes[i].type == "I" && text) { hlUpdate((jnodes[i].id - 2), jnodes[i].type, nID, 1); }
        }
    }
    window.nodeCounter++; //update the node counter

    //load edges
    var e = json['edges'];
    var edgeList = {};
    var from, to, id;
    for (var i = 0, l = e.length; i < l; i++) {
        from = ((count + e[i].from.id) + "_" + window.sessionid);
        to = ((count + e[i].to.id) + "_" + window.sessionid);
        id = (count + e[i].from.id) + "_" + (count + e[i].to.id);
        if (from in nodelist && to in nodelist && !(id in edgeList)) { //if both the nodes the edge connects exist and the edge hasn't already been loaded
            edgeList[id] = newEdge(from, to, e[i].visible, 1);
            if (edgeList[id].visible) {
                DrawEdge(from, to);
                UpdateEdge(edgeList[id]);
            }
        }
    }
}

/**
 * Calculates the offset from the top left of the svg box required to place another analysis map to the right (x offset) 
 * or under (y offset) the current analysis map drawn on the svg
 * @param {String} type - Represents offsetting from the x or y coordinates, must be either 'x' or 'y'
 * @returns {number} - The calculated offset or zero if an offset can't be calculated
 */
function calOffset(type) {
    var offset = 0;
    if (nodes.length >= 1 && (type == 'x' || type == 'y')) { //if the current analysis contains any nodes and the type is x or y
        nodes.sort((a, b) => type == 'x' ? b.x - a.x : b.y - a.y); //sort the nodes from largest to smallest x or y coordinates
        offset = (type == 'x' ? parseInt(nodes[0].x) : parseInt(nodes[0].y)) + 40; //offset by the largest x or y coordinate plus 40
    }
    return offset;
}

/**
 * Loads and displays text
 * @param {String} text - The text to be loaded in and displayed
 * @returns {Boolean} - If the text was successfully loaded (true) or not (false)
 */
function loadText(text) {
    if (text != "") {
        var url = getUrlVars()["url"];
        if (url != 'local') {
            //update the url variable to be local without reloading
            var currentUrl = new URL(window.location);
            currentUrl.searchParams.set('url', 'local');
            history.pushState(null, null, currentUrl);

            var iframe = document.getElementById('extside');
            iframe.setAttribute("style", "display:none;"); //hide the iframe
            var textArea = document.getElementById('analysis_text');
            textArea.setAttribute("style", "display:block;"); //show the text area on the left
        }

        //check if the current text displayed should be replaced or kept
        var currentTxt = getAllText();
        var exampleTxt = "Enter your text here...";
        var waitTxt = "Loading URL, please wait.";
        var allTxt = currentTxt !== exampleTxt && currentTxt !== waitTxt ? currentTxt + "<div><br></div>" + text : text;

        //display the text in the analysis text div on the left
        setAllText(allTxt);
        postEdit("text", "edit", allTxt, 1);
        return true;
    }
    return false;
}

/**
 * Loads and displays the PDF or website at the given URL
 * @param {String} url - The URL to be loaded in
 * @returns  {Boolean} - If the URL was successfully loaded (true) or not (false)
 */
function loadUrl(url) {
    if (url != "") {
        var textArea = document.getElementById('analysis_text');
        textArea.innerHTML = "Loading URL, please wait.";

        //update the url variable to the loaded url value without reloading
        var currentUrl = new URL(window.location);
        currentUrl.searchParams.set('url', url);
        history.pushState(null, null, currentUrl);

        //display the pdf or website in the iframe on the left
        $.get("helpers/getsource.php?url=" + url + "&returnAnalysis=" + true, function (data) {
            dt = JSON.parse(data);
            var analysis = dt.analysis;

            textArea.setAttribute("style", "display:none;"); //hide the text area on the left
            var iframe = document.getElementById('extside');
            iframe.setAttribute("style", "display:flex;width:100%;height:100%;border-right:1px solid #666;"); //show the iframe
            iframe.setAttribute("src", analysis); //load the pdf or website
        });
        return true;
    }
    return false;
}

/**
 * Loads analysis maps from AIF formatted JSONs
 * @param {Object} json - The json to be loaded in
 * @param {Boolean} oplus - Indicates if the analysis should be loaded in dialogical (true) or non-dialogical (false) mode
 * @param {Number} offset - The offset to be added to the y coordinates
 * @return {void} Nothing
 */
function loaddbjson(json, oplus, offset) {
    console.log("loading DB json");

    //load participants
    var p = json['participants'];
    if (p != "undefined") {
        for (var i = 0, l = p.length; i < l; i++) {
            firstname = p[i].firstname;
            surname = p[i].surname;
            addParticipant(firstname, surname)
        }
    }

    //load nodes
    var nodelist = {};
    var xpos = 0;
    var ypos = 0;
    var jnodes = json['nodes'];
    var r1 = /\b\w+:\s\w+\s\w+:/g;
    var r2 = /\b\w+:\s\w+\s\w+\s:/g;
    var participant = null;
    var pName = [];
    var nID = "";
    var count = window.nodeCounter;

    for (var i = 0, l = jnodes.length; i < l; i++) {
        node = jnodes[i];
        xpos = 50 + (i * 10);
        ypos = 50 + offset;

        if ((count + node.nodeID) > window.nodeCounter) {
            window.nodeCounter = (count + node.nodeID); //update the node counter
        }
        nID = ((count + node.nodeID) + "_" + window.sessionid);

        if (node.type == "CA") {
            nodelist[nID] = AddNode(node.text, node.type, '71', 0, nID, xpos, ypos, true, 1);
        } else if (node.type == "RA") {
            nodelist[nID] = AddNode(node.text, node.type, '72', 0, nID, xpos, ypos, true, 1);
        } else if (node.type == "I") {
            nodelist[nID] = AddNode(node.text, node.type, null, 0, nID, xpos, ypos, true, 1);
        } else if (node.type == "MA") {
            nodelist[nID] = AddNode(node.text, node.type, '144', 0, nID, xpos, ypos, true, 1);
        } else if (oplus) {
            if (node.type == "TA") {
                nodelist[nID] = AddNode(node.text, node.type, '82', 0, nID, xpos, ypos, true, 1);
            } else if (node.type == "YA") {
                if (node.text == 'Analysing') { //if an analyst node
                    nodelist[nID] = AddNode(node.text, node.type, '75', 0, nID, 0, 0, false, 1);
                } else {
                    nodelist[nID] = AddNode(node.text, node.type, '168', 0, nID, xpos, ypos, true, 1);
                }
            } else if (node.type == "PA") {
                nodelist[nID] = AddNode(node.text, node.type, '161', 0, nID, xpos, ypos, true, 1);
            } else if (node.type == "L") {
                if (r1.test(node.text) || r2.test(node.text)) { //if an analyst node
                    nodelist[nID] = AddNode(node.text, node.type, null, 0, nID, 0, 0, false, 1);
                } else { //to prevent duplicate analyst nodes
                    pName = getParticipantName(node.text);
                    participant = addParticipant(pName[0], pName[1]);
                    nodelist[nID] = newNode(nID, node.type, null, participant.participantID, node.text, xpos, ypos, true, 1);
                    DrawNode(nID, node.type, node.text, xpos, ypos);
                }
            }
        }
    }

    //load edges
    var e = json['edges'];
    var edgeList = {};
    var from, to, id, indexF, indexT, visible;
    for (var i = 0, l = e.length; i < l; i++) {
        from = ((count + e[i].fromID) + "_" + window.sessionid);
        to = ((count + e[i].toID) + "_" + window.sessionid);
        id = (count + e[i].fromID) + "_" + (count + e[i].toID);
        if (from in nodelist && to in nodelist && !(id in edgeList)) { //if both the nodes the edge connects exist and the edge hasn't already been loaded
            indexF = findNodeIndex(from);
            indexT = findNodeIndex(to);
            visible = nodes[indexF].visible && nodes[indexT].visible ? true : false; //if the edge connects an invisible node it should also be invisible
            edgeList[id] = newEdge(from, to, visible, 1);
            if (visible) {
                DrawEdge(from, to);
                UpdateEdge(edgeList[id]);
            }
        }
    }

    //set any scheme fulfillments
    var sf = json['schemefulfillments'];
    var newID = "";
    if (sf != "undefined") {
        for (var i = 0; i < sf.length; i++) {
            newID = ((count + sf[i].nodeID) + "_" + window.sessionid);
            updateNodeScheme(newID, sf[i].schemeID, 1);
        }
    }

    //set any timestamps
    var l = json['locutions'];
    var r3 = /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/g;
    var timestamp, start, tstamp, tsd, index;
    if (l != "undefined") {
        for (var i = 0; i < l.length; i++) {
            test = r3.test(l[i].start);
            if (test) { //if a valid date time stamp
                start = l[i].start.split(" ", 2); //split date and time
                tstamp = new Date(start[0] + "T" + start[1] + ".000Z"); //ISO string
                tsd = new Date();
                tsd.setTime(tstamp);
                timestamp = tsd.toString();
                newID = ((count + l[i].nodeID) + "_" + window.sessionid);
                updateTimestamp(newID, timestamp, 1);
                if (window.showTimestamps) {
                    index = findNodeIndex(newID);
                    DrawTimestamp(nodes[index].nodeID, nodes[index].timestamp, nodes[index].x, nodes[index].y);
                }
            }
        }
    }
}

/**
 * Loads an analysis map from the database
 * @param {*} nodeSetID - The node set ID of the analysis to load
 * @param {Boolean} multi - Indicates if the loaded analysis should replace the current analysis (false) or be added to it (true)
 * @return {void} Nothing
 */
function loadfromdb(nodeSetID, multi) {
    console.log("called loadfromdb(" + nodeSetID + ")");
    var oplus = false;
    var uplus = "&plus=false";
    if ("plus" in getUrlVars()) {
        oplus = true;
        uplus = "&plus=true";
    }
    $.getJSON("helpers/layout.php?id=" + nodeSetID + uplus, function (ldata) {
        $.getJSON("helpers/getdbnodeset.php?id=" + nodeSetID, function (data) {
            // console.log(ldata);
            // console.log(data);

            // //load participants
            // $.each(data.participants, function (idx, p) {
            //     addParticipant(p.firstname, p.surname);
            // });

            var offset = 0;
            if (multi) {
                offset = calOffset('y');
                // console.log("offset: " + offset);
            } else {
                // console.log("clearing analysis");
                clearAnalysis(); //remove the previous analysis before loading the new analysis
            }

            //load text
            $.get("helpers/gettext.php?id=" + nodeSetID, function (tdata) {
                // console.log(tdata);
                loadText(tdata);
            });

            //load nodes
            var nodelist = {};
            var r1 = /\w+:\s\w+\s\w+:/g;
            var r2 = /\w+:\s\w+\s\w+\s:/g;
            var p = null;
            var pName = [];
            var nID = "";
            var count = window.nodeCounter;
            var id = 0;
            $.each(data.nodes, function (idx, node) {
                id = parseInt(node.nodeID);
                if ((count + id) > window.nodeCounter) {
                    window.nodeCounter = (count + id); //update the node counter
                }
                nID = ((count + id) + "_" + window.sessionid); //new node ID

                if (node.nodeID in ldata) {
                    xpos = parseInt(ldata[node.nodeID]["x"]);
                    xpos = xpos * 0.8;
                    ypos = parseInt(ldata[node.nodeID]["y"]) + offset;
                } else {
                    xpos = 150;
                    ypos = 50 + offset;
                }

                if (node.type == "CA") {
                    nodelist[nID] = AddNode(node.text, node.type, '71', 0, nID, xpos, ypos, true, 1);
                } else if (node.type == "RA") {
                    nodelist[nID] = AddNode(node.text, node.type, '72', 0, nID, xpos, ypos, true, 1);
                } else if (node.type == "I") {
                    nodelist[nID] = AddNode(node.text, node.type, null, 0, nID, xpos, ypos, true, 1);
                } else if (node.type == "MA") {
                    nodelist[nID] = AddNode(node.text, node.type, '144', 0, nID, xpos, ypos, true, 1);
                }
                else if (oplus) {
                    if (node.type == "TA") {
                        nodelist[nID] = AddNode(node.text, node.type, '82', 0, nID, xpos, ypos, true, 1);
                    } else if (node.type == "YA") {
                        if (node.text == 'Analysing') { //if an analyst node
                            nodelist[nID] = AddNode(node.text, node.type, '75', 0, nID, 0, 0, false, 1);
                        } else {
                            nodelist[nID] = AddNode(node.text, node.type, '168', 0, nID, xpos, ypos, true, 1);
                        }
                    } else if (node.type == "PA") {
                        nodelist[nID] = AddNode(node.text, node.type, '161', 0, nID, xpos, ypos, true, 1);
                    } else if (node.type == "L") {
                        if (r1.test(node.text) || r2.test(node.text)) { //if an analyst node
                            nodelist[nID] = AddNode(node.text, node.type, null, 0, nID, 0, 0, false, 1);
                        } else { //to prevent duplicate analyst nodes
                            pName = getParticipantName(node.text);
                            p = addParticipant(pName[0], pName[1]);
                            nodelist[nID] = newNode(nID, node.type, null, p.participantID, node.text, xpos, ypos, true, 1);
                            DrawNode(nID, node.type, node.text, xpos, ypos);
                        }
                    }
                }
            });

            //load edges
            var edgeList = {};
            var from, to, id, indexF, indexT, visible;
            $.each(data.edges, function (idx, edge) {
                from = ((count + parseInt(edge.fromID)) + "_" + window.sessionid);
                to = ((count + parseInt(edge.toID)) + "_" + window.sessionid);
                id = (count + parseInt(edge.fromID)) + "_" + (count + parseInt(edge.toID));
                if (from in nodelist && to in nodelist && !(id in edgeList)) { //if both the nodes the edge connects exist and the edge hasn't already been loaded
                    indexF = findNodeIndex(from);
                    indexT = findNodeIndex(to);
                    visible = nodes[indexF].visible && nodes[indexT].visible ? true : false; //if the edge connects an invisible node it should also be invisible
                    edgeList[id] = newEdge(from, to, visible, 1);
                    if (visible) { //if the edge is visible then draw edge on svg
                        DrawEdge(from, to);
                        UpdateEdge(edgeList[id]);
                    }
                }
            });

            // //set any scheme fulfillments
            // $.each(data.schemefulfillments, function (idx, sf) {
            //     newID = ((count + parseInt(sf.nodeID)) + "_" + window.sessionid);
            //     if (newID in nodelist) {
            //         updateNodeScheme(newID, sf.schemeID, 1);
            //     }
            // });

            //set any timestamps
            var r3 = /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/g;
            var timestamp, start, tstamp, tsd, index;
            $.each(data.locutions, function (idx, l) {
                newID = ((count + parseInt(l.nodeID)) + "_" + window.sessionid);
                if (newID in nodelist) {
                    test = r3.test(l.start);
                    if (test) { //if a valid date time stamp
                        start = l.start.split(" ", 2); //split date and time
                        tstamp = new Date(start[0] + "T" + start[1] + ".000Z"); //ISO string
                        tsd = new Date();
                        tsd.setTime(tstamp);
                        timestamp = tsd.toString();
                        updateTimestamp(newID, timestamp, 1);
                        if (window.showTimestamps) {
                            index = findNodeIndex(newID);
                            DrawTimestamp(nodes[index].nodeID, nodes[index].timestamp, nodes[index].x, nodes[index].y);
                        }
                    }
                }
            });

            if ("aifdb" in getUrlVars()) {
                var currenturl = window.location;
                var newurl = currenturl.replace(/aifdb=[0-9]+/i, "");
                history.pushState(null, null, newurl);
            }

            var list = document.getElementById('list');
            var current = multi ? list.innerHTML.slice(4, -5) : "";
            list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;">Loaded analysis: Node Set ID <strong>' + nodeSetID + '</strong></span><br>' + '</ul>';
            showReplace(true);
        }).fail(function () {
            var list = document.getElementById('list');
            var current = multi ? list.innerHTML.slice(4, -5) : "";
            list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;color:rgba(224, 46, 66, 1);">Failed to load analysis: Node Set ID <strong>' + nodeSetID + '</strong></span><br>' + '</ul>';
        });
    });
}

/**
 * Saves the current analysis to the database in AIF
 * @returns {Boolean}
 */
function save2db() {
    $('#modal-save2db').show();
    $('#m_load').show();
    $('#m_content').hide();

    var json = {}
    var jnodes = [];
    var jschemefulfillments = [];
    var jlocutions = [];
    var jedges = [];

    for (var i = 0, l = nodes.length; i < l; i++) {
        var jnode = {};
        jnode['nodeID'] = nodes[i].nodeID;
        jnode['text'] = nodes[i].text;
        jnode['type'] = nodes[i].type;
        jnodes.push(jnode);

        if (nodes[i].scheme != null) {
            var jschemefulfillment = {};
            jschemefulfillment['nodeID'] = nodes[i].nodeID;
            jschemefulfillment['schemeID'] = nodes[i].scheme;
            jschemefulfillments.push(jschemefulfillment);
        }

        if (nodes[i].participantID != 0) {
            var jlocution = {};
            jlocution['nodeID'] = nodes[i].nodeID;
            jlocution['personID'] = nodes[i].participantID;
            if (nodes[i].timestamp !== "") { jlocution['start'] = Math.round(new Date(nodes[i].timestamp).getTime() / 1000); }
            jlocutions.push(jlocution);
        }
    }

    for (var i = 0, l = edges.length; i < l; i++) {
        var jedge = {};
        jedge['edgeID'] = i + 1;
        jedge['fromID'] = edges[i].fromID;
        jedge['toID'] = edges[i].toID;
        jedges.push(jedge);
    }

    json['nodes'] = jnodes;
    json['edges'] = jedges;
    json['schemefulfillments'] = jschemefulfillments;
    json['participants'] = participants;
    json['locutions'] = jlocutions;

    jstring = JSON.stringify(json);
    console.log(jstring);
    $.post("ul/index.php", { data: JSON.stringify(json) },
        function (reply) {
            console.log(reply);
            var rs = reply.split(" ");
            var nsID = rs[rs.length - 1]
            var dbURL = window.DBurl + "/argview/" + nsID;
            var dbLink = "<a href='" + dbURL + "' target='_blank'>" + dbURL + "</a>";
            $.getJSON("helpers/corporalist.php", function (data) {
                $('#m_load').hide();
                $('#m_content').html("<p style='font-weight:700'>Uploaded to database:</p>" + dbLink + "<br /><p style='font-weight:700'>Add to corpus:</p>");

                var s = $("<select id=\"s_corpus\" name=\"s_corpus\" />");
                $.each(data.corpora, function (idx, c) {
                    if (c.locked == 0) {
                        title = c.title.replace(/&amp;#/g, "&#");
                        $("<option />", { value: c.corpusID, html: title }).appendTo(s);
                    }
                });
                s.appendTo('#m_content');

                $('<p style="text-align:right"><input type="button" value="Add to corpus" onClick="add2corpus(' + nsID + ');" /></p>').appendTo('#m_content');

                if ("aifdb" in getUrlVars()) {
                    olddbid = getUrlVars()["aifdb"];
                    $.getJSON("helpers/incorpora.php?nodesetID=" + olddbid, function (crpdata) {
                        var ncrp = 0;
                        $.each(crpdata.corpora, function (idx, c) {
                            if (ncrp == 0) {
                                $('<p style="font-weight:700">Replace in existing corpora:</p>').appendTo('#m_content');
                            }
                            ncrp = ncrp + 1;
                            title = c.title.replace(/&amp;#/g, "&#");
                            $('<p><input type="checkbox" class="rccb" name="add' + c.id + '" value="' + c.id + '" checked="checked"> ' + title + '</p>').appendTo('#m_content');
                        });
                        if (ncrp > 0) {
                            $('<p style="text-align:right"><input type="button" value="Replace in corpora" onClick="rpl2corpus(' + nsID + ',' + olddbid + ');" /></p>').appendTo('#m_content');
                        }
                        $('#m_content').show();
                    });
                } else {
                    $('#m_content').show();
                }

                $('#m_content').show();
            });

            var url = getUrlVars()["url"];
            if (url == 'local') {
                txt = getAllText();
            } else {
                txt = url;
            }
            var txtdata = {
                "txt": txt,
            };
            $.post("helpers/textpost.php?nsID=" + nsID, txtdata,
                function (reply) {
                    return 0;
                }
            );
            $.post("db/ul.php?ns=" + nsID, { data: genjson() },
                function (reply) {
                    return 0;
                }
            );
        }
    );

    window.unsaved = false;
    return false;
}

/**
 * Adds an analysis to a corpus
 * @param {*} addnsID - The node set ID of the analysis to be added
 * @return {void} Nothing
 */
function add2corpus(addnsID) {
    var cID = $("#s_corpus").val();
    var cName = $("#s_corpus option:selected").text();
    $.get("helpers/corporapost.php?nsID=" + addnsID + "&cID=" + cID, function (data) {
        // $('#modal-save2db').hide();
        // $('#modal-shade').hide();
        $('#m_content').hide();
        $('#m_confirm').html("<p style='font-weight:700'>Added to " + cName + " corpus.</p>" + "<p style='font-weight:700'>Node Set ID: " + addnsID + "</p>");
        $('#m_confirm').show();
    }).fail(function () {
        alert("Unable to add to corpus");
    });
}

/**
 * Replaces an analysis in corpora
 * @param {*} addnsID - The node set ID of the analysis to be added
 * @param {*} rplnsID - The node set ID of the analysis to be replaced
 * @return {void} Nothing
 */
function rpl2corpus(addnsID, rplnsID) {
    $('.rccb:checkbox:checked').each(function () {
        crpID = $(this).val();
        $.get("helpers/corporapost.php?nsID=" + addnsID + "&cID=" + crpID, function () { }).fail(function () {
            alert("Unable to add to corpus");
        });

        $.get("helpers/corporadel.php?nsID=" + rplnsID + "&cID=" + crpID, function () { }).fail(function () {
            alert("Unable to delete from corpus");
        });
    });

    $('#modal-save2db').hide();
    $('#modal-shade').hide();
}

/**
 * Saves the on screen analysis map as a PNG
 * @return {void} Nothing
 */
function svg2canvas2image() {
    var box = SVGRoot.getBBox();
    var x = box.x;
    var y = box.y;
    var w = box.width + x + 150;
    var h = box.height + y + 150;

    var svg = SVGRoot;
    var str = new XMLSerializer().serializeToString(svg);
    var svg64 = btoa(str.replace(/[\u00A0-\u2666]/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    }));
    var image = new Image();
    var image64 = 'data:image/svg+xml;base64,' + svg64;
    image.src = image64;

    image.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, w, h, 0, 0, w, h);
        var imageURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        var anchor = document.getElementById("saveAsImage");
        anchor.download = "analysis.png";
        anchor.href = imageURI;

        window.unsaved = false;
        $(canvas).remove();
    }
}

/**
 * Closes a popup if it's open
 * @param {*} popupName - the name of the popup to close
 * @return {void} Nothing
 */
function closePopupIfOpen(popupName) {
    if (typeof (window[popupName]) != 'undefined' && !window[popupName].closed) {
        window[popupName].close();
    }
}

(function ($) {

    // Creating a jQuery plugin:

    $.generateFile = function (options) {

        options = options || {};

        if (!options.script || !options.filename || !options.content) {
            throw new Error("Please enter all the required config options!");
        }

        // Creating a 1 by 1 px invisible iframe:

        var iframe = $('<iframe>', {
            width: 1,
            height: 1,
            frameborder: 0,
            css: {
                display: 'none'
            }
        }).appendTo('body');

        var formHTML = '<form action="" method="post">' +
            '<input type="hidden" name="filename" />' +
            '<input type="hidden" name="content" />' +
            '</form>';

        // Giving IE a chance to build the DOM in
        // the iframe with a short timeout:

        setTimeout(function () {

            // The body element of the iframe document:

            var body = (iframe.prop('contentDocument') !== undefined) ?
                iframe.prop('contentDocument').body :
                iframe.prop('document').body;	// IE

            body = $(body);

            // Adding the form to the body:
            body.html(formHTML);

            var form = body.find('form');

            form.attr('action', options.script);
            form.find('input[name=filename]').val(options.filename);
            form.find('input[name=content]').val(options.content);

            // Submitting the form to download.php. This will
            // cause the file download dialog box to appear.

            form.submit();
        }, 50);
    };

})(jQuery);
