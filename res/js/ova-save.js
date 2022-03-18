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
 * Sets the checked property of a radio button to true
 * @param {String} id - The ID of the radio button to check
 * @returns {Boolean}
 */
function checkRadio(id) {
    var radio = document.getElementById(id);
    if (radio && !radio.checked) { radio.checked = true; }
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
    var replace = document.getElementById("loadReplace");
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
    $('#list').show();
    return false;
}

/**
 * Handles the load button click event
 */
function loadBtn() {
    var radioValue = $("input[name='loadFrom']:checked").val();
    if (radioValue == "corpus" || radioValue == "nSetID") {
        $('#f_loadfile').hide();
        var current = "";
        var multi = false;
        var cLoading = document.getElementById('loading_name');
        var replace = document.getElementById("loadReplace");
        var list = document.getElementById('list');
        if (!replace.checked) { multi = true; current = list.innerHTML.slice(4, -5); }


        if (radioValue == "corpus") { //if loading in a selected corpus
            var cShortName = $("#corpus_sel").val();
            var cName = $("#corpus_sel option:selected").text();
            cLoading.innerHTML = "Loading Corpus: " + cName;
            list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;">Loading corpus: <strong>' + cName + '</strong></span><br>' + '</ul>';
            $('#c_loading').show(); $('#list').show();
            if (replace.checked) { clearAnalysis(); }

            loadCorpus(cShortName).then(() => { //when finished loading the corpus
                current = list.innerHTML.slice(4, -5);
                list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;">Loaded corpus: <strong>' + cName + '</strong></span><br>' + '</ul>';
                showReplace(true);
                $('#c_loading').hide(); $('#f_loadfile').show();
            }).catch(e => {
                console.log(e);
                $('#c_loading').hide(); $('#f_loadfile').show();
                list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;color:rgba(224, 46, 66, 1);">Failed to load corpus: <strong>' + cName + '</strong></span><br>' + '</ul>';
            });
        }
        else if (radioValue == "nSetID") { //if loading in an analysis by its node set ID
            var nSetID = parseInt($("#nsetID").val());
            if (Number.isInteger(nSetID) && nSetID > 0) { //if a valid node set ID
                cLoading.innerHTML = "Loading Node Set: " + nSetID;
                $('#c_loading').show(); $('#list').show();

                loadNodeSet(nSetID, multi).then((result) => { //when finished loading the analysis
                    if (result) {
                        list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;">Loaded analysis: Node Set ID <strong>' + nSetID + '</strong></span><br>' + '</ul>';
                        showReplace(true);
                    } else {
                        list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;color:rgba(224, 46, 66, 1);">Failed to load analysis: Node Set ID <strong>' + nSetID + '</strong></span><br>' + '</ul>';
                    }
                    $('#c_loading').hide(); $('#f_loadfile').show();
                });
            } else { $('#f_loadfile').show(); }
        }
    }
}

/**
 * Loads an analysis from its node set ID
 * @param {Number} nodeSetID - The node set ID of the analysis to load
 * @param {Boolean} multi - Indicates if the loaded analysis should replace the current analysis (false) or be added to it (true)
 * @returns {Promise<Boolean>} - Indicates if the analysis was successfully loaded (true) or failed to load (false)
 */
async function loadNodeSet(nodeSetID, multi) {
    try { //loading from OVA3
        var json = await $.get('./db/' + nodeSetID);
        console.log("loading from OVA3/db/" + nodeSetID);
        return await loadFile(json, multi);
    } catch (e) {
        try { //loading from OVA2
            var json = await $.getJSON("helpers/getova2nodeset.php?id=" + nodeSetID);
            console.log("loading from OVA2/db/" + nodeSetID);
            return await loadFile(json, multi);
        } catch (e) { //loading from database
            console.log("loading from db: " + nodeSetID);
            return await loadfromdb(nodeSetID, multi);
        }
    }
}

/**
 * Loads all analysis in a corpus
 * @param {String} corpusName - The short name of the corpus to load
 */
async function loadCorpus(corpusName) {
    var nodeSets = await $.getJSON("helpers/corporanodesets.php?shortname=" + corpusName).then(data => data.nodeSets);
    console.log(nodeSets);

    var loaded, current;
    var list = document.getElementById('list');
    for (var i = 0; i < nodeSets.length; i++) {
        console.log("----------------");
        console.log("count: " + i);
        loaded = await loadNodeSet(nodeSets[i], true); //to load a corpus multi must be set to true
        if (!loaded) {
            current = list.innerHTML.slice(4, -5);
            list.innerHTML = '<ul>' + current + '<span style="font-size:0.8em;color:rgba(224, 46, 66, 1);">Failed to load analysis: Node Set ID <strong>' + nodeSets[i] + '</strong></span><br>' + '</ul>';
        }
    }
}

/**
 * Loads a JSON file
 * @param {*} jstr - The JSON file to load
 * @param {Boolean} multi - Indicates if the loaded analysis should replace the current analysis (false) or be added to it (true)
 * @returns {Promise<Boolean>} - Indicates if the JSON file was successfully loaded (true) or not (false)
 */
async function loadFile(jstr, multi) {
    if (typeof jstr !== 'object') {
        try { var json = JSON.parse(jstr); }
        catch (e) { console.log(e); return false; }
    } else {
        var json = jstr;
    }

    var offset = 0;
    if (multi) {
        offset = calOffset('y', 150);
        // console.log("offset: " + offset);
    } else {
        clearAnalysis(); //remove the previous analysis before loading the new analysis
    }

    var oplus = false;
    if ("plus" in getUrlVars()) {
        oplus = true;
    }

    if (json['OVA']) { //if in OVA3 format
        return await loadOva3Json(json, oplus, offset);
    } else if (json['nodes']) {
        var jnodes = json['nodes'];
        if (jnodes.length > 0 && !(jnodes[0].hasOwnProperty('x'))) { //if in db format
            return await loaddbjson(json, oplus, offset);
        } else if (jnodes.length > 0 && jnodes[0].hasOwnProperty('id')) { //if in OVA2 format
            return await loadOva2Json(json, oplus, offset);
        }
    }
    return false;
}

/**
 * Loads analysis maps from OVA3 formatted JSONs
 * @param {Object} json - The json to be loaded in
 * @param {Boolean} oplus - Indicates if the analysis should be loaded in dialogical (true) or non-dialogical (false) mode
 * @param {Number} offset - The offset to be added to the y coordinates
 * @returns {Promise<Boolean>} - Indicates if the JSON file was successfully loaded (true) or not (false)
 */
async function loadOva3Json(json, oplus, offset) {
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
                nodelist[jnodes[i].nodeID] = newNode(jnodes[i].nodeID, jnodes[i].type, null, pID, jnodes[i].text, 0, 0, false, 1, "", false, false);
            } else {
                nodelist[jnodes[i].nodeID] = newNode(jnodes[i].nodeID, jnodes[i].type, null, 0, jnodes[i].text, 0, 0, false, 1, "", false, false);
            }
        } else if (jnodes[i].type == "I" || jnodes[i].type == "RA" || jnodes[i].type == "CA" || jnodes[i].type == "MA" || jnodes[i].type == "EN") {
            nodelist[jnodes[i].nodeID] = newNode(jnodes[i].nodeID, jnodes[i].type, null, 0, jnodes[i].text, 0, 0, false, 1, "", false, false);
            if (jnodes[i].type == "I" && text) { hlUpdate(jnodes[i].nodeID, jnodes[i].type, jnodes[i].nodeID, false); }
        }
    }

    window.nodeCounter += jnodes.length; //update the node counter
    if (!oplus && text) { postEdit("text", "edit", $('#analysis_text').html(), 1); }

    //set any scheme fulfillments
    var sf = json['AIF']['schemefulfillments'];
    if (sf != undefined) {
        for (var i = 0; i < sf.length; i++) {
            updateNodeScheme(sf[i].nodeID, sf[i].schemeID, 1, false);
        }
    }

    //set the layout of the nodes and draw them on the svg
    var n = json['OVA']['nodes'];
    var newY = 0;
    for (var i = 0, l = n.length; i < l; i++) {
        if (nodelist[n[i].nodeID]) {
            if (n[i].visible) {
                newY = parseInt(n[i].y) + offset;
                updateNode(n[i].nodeID, n[i].x, newY, true, 1, false);
                DrawNode(nodelist[n[i].nodeID].nodeID, nodelist[n[i].nodeID].type, nodelist[n[i].nodeID].text, nodelist[n[i].nodeID].x, nodelist[n[i].nodeID].y);
                if (n[i].timestamp && n[i].timestamp != '') {
                    updateTimestamp(n[i].nodeID, n[i].timestamp, 1, false);
                    if (window.showTimestamps) { DrawTimestamp(n[i].nodeID, n[i].timestamp, nodelist[n[i].nodeID].x, nodelist[n[i].nodeID].y); }
                }
            }
        }
    }

    //create and draw any connecting edges
    var edgeStart = edges.length;
    var e = json['OVA']['edges'];
    var edgeList = {};
    var from, to, id, indexF, indexT, visible;
    for (var i = 0, l = e.length; i < l; i++) {
        from = e[i].fromID;
        to = e[i].toID;
        id = from + "_" + to;
        if (from in nodelist && to in nodelist && !(id in edgeList)) { //if both the nodes the edge connects exist and the edge hasn't already been loaded
            indexF = findNodeIndex(from, true);
            indexT = findNodeIndex(to, true);
            visible = nodes[indexF].visible && nodes[indexT].visible ? true : false; //if the edge connects an invisible node it should also be invisible
            edgeList[id] = newEdge(from, to, visible, 1, false);
            if (visible) {
                DrawEdge(from, to);
                UpdateEdge(edgeList[id]);
            }
        }
    }

    var nodeStart = findNodeIndex(jnodes[0].nodeID, true);
    return await postAddEdits(nodeStart, edgeStart);
}

/**
 * Loads analysis maps from OVA2 formatted JSONs
 * @param {Object} json - The json to be loaded in
 * @param {Boolean} oplus - Indicates if the analysis should be loaded in dialogical (true) or non-dialogical (false) mode
 * @param {Number} offset - The offset to be added to the y coordinates
 * @returns {Promise<Boolean>} - Indicates if the JSON file was successfully loaded (true) or not (false)
 */
async function loadOva2Json(json, oplus, offset) {
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
    var start;
    for (var i = 0, l = jnodes.length; i < l; i++) {
        if ((count + jnodes[i].id) > window.nodeCounter) {
            window.nodeCounter = (count + jnodes[i].id); //update the node counter
        }
        nID = ((count + jnodes[i].id) + "_" + window.sessionid);
        newY = parseInt(jnodes[i].y) + offset;
        if (oplus) {
            if (jnodes[i].type == "L") {
                pID = findParticipantIDText(jnodes[i].text);
                nodelist[nID] = newNode(nID, jnodes[i].type, jnodes[i].scheme, pID, jnodes[i].text, jnodes[i].x, newY, jnodes[i].visible, 1, jnodes[i].timestamp, false, false);
                if (jnodes[i].visible) {
                    DrawNode(nID, jnodes[i].type, jnodes[i].text, jnodes[i].x, newY);
                    if (text) { hlUpdate(jnodes[i].id, jnodes[i].type, nID, false); }
                    if (window.showTimestamps && jnodes[i].timestamp && jnodes[i].timestamp != '') { DrawTimestamp(nID, jnodes[i].timestamp, jnodes[i].x, newY); }
                }
            } else {
                nodelist[nID] = AddNode(jnodes[i].text, jnodes[i].type, jnodes[i].scheme, 0, nID, jnodes[i].x, newY, jnodes[i].visible, 1, "", false, false);
            }
        } else if (jnodes[i].type == "I" || jnodes[i].type == "RA" || jnodes[i].type == "CA" || jnodes[i].type == "MA" || jnodes[i].type == "EN") {
            nodelist[nID] = AddNode(jnodes[i].text, jnodes[i].type, jnodes[i].scheme, 0, nID, jnodes[i].x, newY, jnodes[i].visible, 1, "", false, false);
            if (jnodes[i].type == "I" && text) { hlUpdate((jnodes[i].id - 2), jnodes[i].type, nID, false); }
        }

        if (i === 0) { start = findNodeIndex(nID, true); }
    }
    window.nodeCounter++; //update the node counter
    if (text) { postEdit("text", "edit", $('#analysis_text').html(), 1); }

    //load edges
    var edgeStart = edges.length;
    console.log(edgeStart);
    var e = json['edges'];
    var edgeList = {};
    var from, to, id, indexF, indexT, visible;
    for (var i = 0, l = e.length; i < l; i++) {
        from = ((count + e[i].from.id) + "_" + window.sessionid);
        to = ((count + e[i].to.id) + "_" + window.sessionid);
        id = (count + e[i].from.id) + "_" + (count + e[i].to.id);
        if (from in nodelist && to in nodelist && !(id in edgeList)) { //if both the nodes the edge connects exist and the edge hasn't already been loaded
            indexF = findNodeIndex(from, true);
            indexT = findNodeIndex(to, true);
            visible = nodes[indexF].visible && nodes[indexT].visible ? true : false; //if the edge connects an invisible node it should also be invisible
            edgeList[id] = newEdge(from, to, visible, 1, false);
            if (edgeList[id].visible) {
                DrawEdge(from, to);
                UpdateEdge(edgeList[id]);
            }
        }
    }

    return await postAddEdits(start, edgeStart);
}

/**
 * Calculates the offset from the top left of the svg box required to place another analysis map to the right (x offset) 
 * or under (y offset) the current analysis map drawn on the svg
 * @param {String} type - Represents offsetting from the x or y coordinates, must be either 'x' or 'y'
 * @param {Number} space - The amount of space to add around the map
 * @returns {Number} - The calculated offset or zero if an offset can't be calculated
 */
function calOffset(type, space) {
    var offset = 0;
    if (nodes.length >= 1 && (type == 'x' || type == 'y')) { //if the current analysis contains any nodes and the type is x or y
        nodes.sort((a, b) => type == 'x' ? parseInt(b.x) - parseInt(a.x) : parseInt(b.y) - parseInt(a.y)); //sort the nodes from largest to smallest x or y coordinates
        offset = type == 'x' ? parseInt(nodes[0].x) : parseInt(nodes[0].y); //the largest x or y coordinate
        offset += space; //to add space around the map
        var g = document.getElementById(nodes[0].nodeID);
        if (g) { //if drawn on the svg then add the width or height
            var rect = g.getElementsByTagName('rect')[0];
            var w = rect.getAttribute('width') * 1;
            var h = rect.getAttribute('height') * 1;
            offset += type == 'x' ? w : h; //plus the width or height
        }
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
        postEdit("text", "edit", allTxt);
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
 * Adds multiple nodes and edges to the database through two post requests
 * @param {Number} nodeStart - The index of the nodes array to start adding nodes from
 * @param {Number} edgeStart - The index of the edges array to start adding edges from
 * @returns {Promise<Boolean>} - Indicates if the nodes and edges were successfully added (true) or not (false)
 */
async function postAddEdits(nodeStart, edgeStart) {
    try {
        //add the nodes to the database
        var nodesContent = [];
        var nodesToAdd = nodes.slice(nodeStart);
        for (var i = 0; i < nodesToAdd.length; i++) {
            nodesContent.push([nodesToAdd[i].nodeID, JSON.stringify(nodesToAdd[i])]);
        }
        lastedit = await $.post("helpers/load.php", { analysisID: window.analysisID, sessionid: window.sessionid, type: "node", action: "add", cnt: JSON.stringify(nodesContent), groupID: window.groupID, undone: 1, counter: window.nodeCounter }).then(data => JSON.parse(data).last);
        // console.log("last edit id: " + lastedit);

        //add the edges to the database
        var edgesContent = [];
        var edgesToAdd = edges.slice(edgeStart);
        for (var i = 0; i < edgesToAdd.length; i++) {
            window.edgeCounter++;
            var contentID = window.edgeCounter + "_" + window.sessionid;
            edgesContent.push([contentID, JSON.stringify(edgesToAdd[i])]);
        }
        lastedit = await $.post("helpers/load.php", { analysisID: window.analysisID, sessionid: window.sessionid, type: "edge", action: "add", cnt: JSON.stringify(edgesContent), groupID: window.groupID, undone: 1, counter: window.edgeCounter }).then(data => JSON.parse(data).last);
        // console.log("last edit id: " + lastedit);
    } catch (e) { alert("Unable to add to the database"); return false; }

    return true;
}

/**
 * Loads analysis maps from AIF formatted JSONs
 * @param {Object} json - The json to be loaded in
 * @param {Boolean} oplus - Indicates if the analysis should be loaded in dialogical (true) or non-dialogical (false) mode
 * @param {Number} offset - The offset to be added to the y coordinates
 * @return {Promise<Boolean>} - Indicates if the JSON file was successfully loaded (true) or not (false)
 */
async function loaddbjson(json, oplus, offset) {
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
    var r1 = /\b\w+:\s\w+\s\w+:/g; //e.g. "annotator: firstname surname:"
    var r2 = /\b\w+:\s\w+\s\w+\s:/g; //e.g. "annotator: firstname surname :"
    var participant = null;
    var pName = [];
    var nID = "";
    var count = window.nodeCounter;
    var start;

    for (var i = 0, l = jnodes.length; i < l; i++) {
        node = jnodes[i];
        xpos = 50 + (i * 10);
        ypos = 50 + offset;

        if ((count + node.nodeID) > window.nodeCounter) {
            window.nodeCounter = (count + node.nodeID); //update the node counter
        }
        nID = ((count + node.nodeID) + "_" + window.sessionid);

        if (node.type == "CA") {
            nodelist[nID] = AddNode(node.text, node.type, '71', 0, nID, xpos, ypos, true, 1, "", false, false);
        } else if (node.type == "RA") {
            nodelist[nID] = AddNode(node.text, node.type, '72', 0, nID, xpos, ypos, true, 1, "", false, false);
        } else if (node.type == "I") {
            nodelist[nID] = AddNode(node.text, node.type, null, 0, nID, xpos, ypos, true, 1, "", false, false);
        } else if (node.type == "MA") {
            nodelist[nID] = AddNode(node.text, node.type, '144', 0, nID, xpos, ypos, true, 1, "", false, false);
        } else if (oplus) {
            if (node.type == "TA") {
                nodelist[nID] = AddNode(node.text, node.type, '82', 0, nID, xpos, ypos, true, 1, "", false, false);
            } else if (node.type == "YA") {
                if (node.text == 'Analysing') { //if an analyst node
                    nodelist[nID] = AddNode(node.text, node.type, '75', 0, nID, 0, 0, false, 1, "", false, false);
                } else {
                    nodelist[nID] = AddNode(node.text, node.type, '168', 0, nID, xpos, ypos, true, 1, "", false, false);
                }
            } else if (node.type == "PA") {
                nodelist[nID] = AddNode(node.text, node.type, '161', 0, nID, xpos, ypos, true, 1, "", false, false);
            } else if (node.type == "L") {
                if (r1.test(node.text) || r2.test(node.text)) { //if an analyst node
                    nodelist[nID] = AddNode(node.text, node.type, null, 0, nID, 0, 0, false, 1, "", false, false);
                } else { //to prevent duplicate analyst nodes
                    pName = getParticipantName(node.text);
                    participant = addParticipant(pName[0], pName[1]);
                    nodelist[nID] = newNode(nID, node.type, null, participant.participantID, node.text, xpos, ypos, true, 1, "", false, false);
                    DrawNode(nID, node.type, node.text, xpos, ypos);
                }
            }
        }

        if (i === 0) { start = findNodeIndex(nID, true); }
    }

    //load edges
    var edgeStart = edges.length;
    var e = json['edges'];
    var edgeList = {};
    var from, to, id, indexF, indexT, visible;
    for (var i = 0, l = e.length; i < l; i++) {
        from = ((count + e[i].fromID) + "_" + window.sessionid);
        to = ((count + e[i].toID) + "_" + window.sessionid);
        id = (count + e[i].fromID) + "_" + (count + e[i].toID);
        if (from in nodelist && to in nodelist && !(id in edgeList)) { //if both the nodes the edge connects exist and the edge hasn't already been loaded
            indexF = findNodeIndex(from, true);
            indexT = findNodeIndex(to, true);
            visible = nodes[indexF].visible && nodes[indexT].visible ? true : false; //if the edge connects an invisible node it should also be invisible
            edgeList[id] = newEdge(from, to, visible, 1, false);
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
            updateNodeScheme(newID, sf[i].schemeID, 1, false);
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
                window.groupID++;
                updateTimestamp(newID, timestamp, 1, false);
                window.groupID++;
                if (window.showTimestamps) {
                    index = findNodeIndex(newID);
                    DrawTimestamp(nodes[index].nodeID, nodes[index].timestamp, nodes[index].x, nodes[index].y);
                }
            }
        }
    }

    return await postAddEdits(start, edgeStart);
}

/**
 * Loads an analysis map from the database
 * @param {Number} nodeSetID - The node set ID of the analysis to load
 * @param {Boolean} multi - Indicates if the loaded analysis should replace the current analysis (false) or be added to it (true)
 * @return {Promise<Boolean>} - Indicates if the node set was successfully loaded (true) or not (false)
 */
function loadfromdb(nodeSetID, multi) {
    console.log("called loadfromdb(" + nodeSetID + ")");
    var oplus = false;
    var uplus = "&plus=false";
    if ("plus" in getUrlVars()) {
        oplus = true;
        uplus = "&plus=true";
    }

    return new Promise(resolve => {
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
                    offset = calOffset('y', 150);
                    // console.log("offset: " + offset);
                } else {
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
                            window.groupID++;
                            updateTimestamp(newID, timestamp, 1);
                            window.groupID++;
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

                resolve(true); //the analysis has finished loading

            }).fail(function () {
                console.log("failed to get json db nodeset");
                resolve(false); //the analysis failed to load
            });
        }).fail(function () {
            console.log("failed to get json layout");
            resolve(false); //the analysis failed to load
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
 * @param {Number} addnsID - The node set ID of the analysis to be added
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
 * @param {Number} addnsID - The node set ID of the analysis to be added
 * @param {Number} rplnsID - The node set ID of the analysis to be replaced
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
 * Converts part of a SVG to a canvas to a PNG image which can then be downloaded
 * @param {Number} x - The lowest x coordinate for the selected part of the SVG
 * @param {Number} y - The lowest y coordinate for the selected part of the SVG
 * @param {Number} w - The width of the selected part of the SVG
 * @param {Number} h - The height of the selected part of the SVG
 */
function svg2canvas2image(x, y, w, h) {
    var canvas = document.createElement("canvas");
    var space = 60; //the size of the margins
    canvas.width = w + space;
    canvas.height = h + space;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white'; // background colour for the canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height); // fill the colour on the canvas

    var svg = document.getElementById("inline");
    var size = h > w ? h : w; //the width to height ratio of 1:1 must be kept for chrome
    VB = [x, y, size, size];
    svg.setAttribute('viewBox', [x, y, size, size]);
    var str = new XMLSerializer().serializeToString(svg);
    var svg64 = btoa(str.replace(/[\u00A0-\u2666]/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    }));

    var image = new Image();
    var image64 = 'data:image/svg+xml;base64,' + svg64;
    image.src = image64;

    image.onload = function () {
        ctx.drawImage(image, space, space, size, size);
        var imageURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        var anchor = document.getElementById("downloadBtn");
        anchor.download = "analysis.png";
        anchor.href = imageURI;

        window.unsaved = false;
        $(canvas).remove();
        $('#downloadBtn').show();
        openModal('#modal-save');
        VB = [0, 0, 1500, 1500];
        SVGRoot.setAttribute('viewBox', [0, 0, 1500, 1500]);
    }
}

/**
 * Handles saving the analysis map as an image
 */
function saveAsImage() {
    var radioValue = $("input[name='saveImage']:checked").val();
    if (radioValue == "select") {
        // console.log("save selected image");
        $('#confirmBtn').hide();
        closeModal('#modal-save');
        multiSel = true;
        window.saveImage = true;

    } else if (radioValue == "full") {
        // console.log("save full image");
        $('#confirmBtn').hide();

        var index = nodes.length - 1;
        //find the smallest and largest y coordinates 
        var h = calOffset("y", 60);
        var y = parseInt(nodes[index].y);
        h = y < 0 ? h - y : h;

        //find the smallest and largest x coordinates 
        var w = calOffset("x", 60);
        var x = parseInt(nodes[index].x);
        w = x < 0 ? w - x : w;

        svg2canvas2image(x, y, w, h);
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
