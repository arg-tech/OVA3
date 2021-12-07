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

function genlink() {
    alink = window.location;
    $('#shareinput').val(alink);
    console.log(nodes);
    console.log(edges);
    document.getElementById("edited-by").innerHTML = "Analysis edited by: " + users.toString();
    return false;
}

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

function clearAnalysis() {
    SVGRoot.removeChild(SVGRootG);
    nodes = [];
    edges = [];
    SVGRootG = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    SVGRoot.appendChild(SVGRootG);
    return false;
}

function loadbutton(evt) {
    var files = evt.target.files; // FileList object

    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                loadfile(e.target.result);
            };
        })(f);

        reader.readAsText(f);

        output.push('<span style="font-size:0.8em;">Load file: <strong>', f.name, '</strong> - ',
            f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</span>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    return false;
}

function loadfile(jstr) {
    // clearAnalysis(); //remove the previous analysis before loading the new analysis
    if (typeof jstr !== 'object') {
        var json = JSON.parse(jstr);
    } else {
        var json = jstr;
    }

    var oplus = false;
    if ("plus" in getUrlVars()) {
        oplus = true;
    }

    if (json['OVA']) { //if in ova3 format
        loadOva3Json(json, oplus);
    } else if (json['nodes']) {
        var jnodes = json['nodes'];
        if (jnodes.length > 0 && !(jnodes[0].hasOwnProperty('x'))) { //if in db format
            loaddbjson(json, oplus);
        } else if (jnodes.length > 0 && jnodes[0].hasOwnProperty('id')) { //if in ova2 format
            loadOva2Json(json, oplus);
        }
    }
}

function loadOva3Json(json, oplus) {
    // console.log("loading OVA3 json");
    var text = false;
    if (json['text']['txt'] != "") {
        text = loadText(json['text']['txt']);
    }
    if (!text && json['text'].hasOwnProperty("url")) {
        loadUrl(json['text']['url']);
    }

    //load participants
    var p = json['AIF']['participants'];
    if (p != undefined) {
        for (var i = 0, l = p.length; i < l; i++) {
            firstname = p[i].firstname;
            surname = p[i].surname;
            addParticipant(firstname, surname)
        }
    }

    var yOffset = calOffset('y');
    console.log("yOffset: " + yOffset);

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
        } else if (jnodes[i].type == "I" || jnodes[i].type == "RA" || jnodes[i].type == "CA" || jnodes[i].type == "EN") {
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
                newY = parseInt(n[i].y) + yOffset;
                updateNode(n[i].nodeID, n[i].x, newY, n[i].visible, 1);
                DrawNode(nodelist[n[i].nodeID].nodeID, nodelist[n[i].nodeID].type, nodelist[n[i].nodeID].text, nodelist[n[i].nodeID].x, nodelist[n[i].nodeID].y);
                if (n[i].timestamp) {
                    updateTimestamp(n[i].nodeID, n[i].timestamp);
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

function loadOva2Json(json, oplus) {
    // console.log("loading OVA2 json");
    var text = loadText(json['analysis']['txt']); //load text on LHS

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

    var yOffset = calOffset('y');
    console.log("yOffset: " + yOffset);

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
        newY = parseInt(jnodes[i].y) + yOffset;
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
        } else if (jnodes[i].type == "I" || jnodes[i].type == "RA" || jnodes[i].type == "CA" || jnodes[i].type == "EN") {
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

//function to calculate the offset from the top left of the svg box required to place another analysis map to the right (x offset)
//or under (y offset) the current analysis map drawn on the svg
//it takes one parameter called type which should be either 'x' or 'y' to represent offsetting from the x or y coordinates
//it returns the calculated offset or zero if an offset can't be calculated
function calOffset(type) {
    var offset = 0;
    if (nodes.length >= 1 && (type == 'x' || type == 'y')) { //if the current analysis contains any nodes and the type is x or y
        nodes.sort((a, b) => type == 'x' ? b.x - a.x : b.y - a.y); //sort the nodes from largest to smallest x or y coordinates
        offset = (type == 'x' ? parseInt(nodes[0].x) : parseInt(nodes[0].y)) + 40; //offset by the largest x or y coordinate plus 40
    }
    return offset;
}

//function to load and display the text passed as a parameter
//returns true if the text was successfully loaded and false if not
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

//function to load and display the pdf or website at the url passed as a parameter
//returns true if the url was successfully loaded and false if not
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

function loaddbjson(json, oplus) {
    // console.log("loading DB json");
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

    //load nodes
    var nodelist = {};
    var xpos = 0;
    var ypos = 0;
    var jnodes = json['nodes'];

    for (var i = 0, l = jnodes.length; i < l; i++) {
        node = jnodes[i];
        xpos = 10 + (i * 10);
        ypos = 10;

        if (node.type == "CA") {
            nodelist[node.nodeID] = AddNode(node.text, node.type, '71', 0, node.nodeID, xpos, ypos);
        } else if (node.type == "RA") {
            nodelist[node.nodeID] = AddNode(node.text, node.type, '72', 0, node.nodeID, xpos, ypos);
        } else if (node.type == "I") {
            nodelist[node.nodeID] = AddNode(node.text, node.type, null, 0, node.nodeID, xpos, ypos);
        }
        else if (oplus) {
            if (node.type == "TA") {
                nodelist[node.nodeID] = AddNode(node.text, node.type, '82', 0, node.nodeID, xpos, ypos);
            } else if (node.type == "YA") {
                if (node.text == 'Analysing') { //if an analyst node
                    nodelist[node.nodeID] = AddNode(node.text, node.type, '75', 0, node.nodeID, 0, 0, false);
                } else {
                    nodelist[node.nodeID] = AddNode(node.text, node.type, '168', 0, node.nodeID, xpos, ypos);
                }
            } else if (node.type == "MA") {
                nodelist[node.nodeID] = AddNode(node.text, node.type, '144', 0, node.nodeID, xpos, ypos);
            } else if (node.type == "PA") {
                nodelist[node.nodeID] = AddNode(node.text, node.type, '161', 0, node.nodeID, xpos, ypos);
            } else if (node.type == "L") {
                pID = findParticipantIDText(node.text);
                if (pID == 0) { //if an analyst node
                    nodelist[node.nodeID] = AddNode(node.text, node.type, null, 0, node.nodeID, 0, 0, false);
                } else { //to prevent duplicate analyst nodes
                    nodelist[node.nodeID] = newNode(node.nodeID, node.type, null, pID, node.text, xpos, ypos);
                    DrawNode(node.nodeID, node.type, node.text, xpos, ypos);
                }
            }
        }
    }

    //load edges
    var jedges = json['edges'];
    var visible = true;
    var index = 0;
    for (var i = 0, l = jedges.length; i < l; i++) {
        if (jedges[i].fromID in nodelist && jedges[i].toID in nodelist) { //if both nodes the edge connects exist
            index = findNodeIndex(jedges[i].fromID);
            visible = nodes[index].visible; //if the edge connects an invisible node it should also be invisible
            edge = newEdge(jedges[i].fromID, jedges[i].toID, visible);
            if (visible) { //if the edge is visible then draw edge on svg
                DrawEdge(edge.fromID, edge.toID);
                UpdateEdge(edge);
            }
        }
    }

    //set any scheme fulfillments
    var sf = json['schemefulfillments'];
    if (sf != undefined) {
        for (var i = 0; i < sf.length; i++) {
            updateNodeScheme(sf[i].nodeID, sf[i].schemeID, 1);
        }
    }
}

function loadfromdb(nodeSetID) {
    //console.log("loadfromdb");
    var oplus = false;
    var uplus = "&plus=false";
    if ("plus" in getUrlVars()) {
        oplus = true;
        uplus = "&plus=true";
    }
    $.getJSON("helpers/layout.php?id=" + nodeSetID + uplus, function (ldata) {
        $.getJSON("helpers/getdbnodeset.php?id=" + nodeSetID, function (data) {

            $.each(data.participants, function (idx, p) {
                addParticipant(p.firstname, p.surname);
            });

            var nodelist = {};
            $.each(data.nodes, function (idx, node) {

                if (node.nodeID in ldata) {
                    xpos = parseInt(ldata[node.nodeID]["x"]);
                    xpos = xpos * 0.8;
                    if (xpos > mwidth - 100) { mwidth = xpos + 100; }
                    ypos = parseInt(ldata[node.nodeID]["y"]);
                    if (ypos > mheight - 100) { mheight = ypos + 100; }
                } else {
                    xpos = 10;
                    ypos = 10;
                }

                if (node.type == "CA") {
                    nodelist[node.nodeID] = AddNode(node.text, node.type, '71', 0, node.nodeID, xpos, ypos);
                } else if (node.type == "RA") {
                    nodelist[node.nodeID] = AddNode(node.text, node.type, '72', 0, node.nodeID, xpos, ypos);
                } else if (node.type == "I") {
                    nodelist[node.nodeID] = AddNode(node.text, node.type, null, 0, node.nodeID, xpos, ypos);
                }
                else if (oplus) {
                    if (node.type == "TA") {
                        nodelist[node.nodeID] = AddNode(node.text, node.type, '82', 0, node.nodeID, xpos, ypos);
                    } else if (node.type == "YA") {
                        if (node.text == 'Analysing') { //if an analyst node
                            nodelist[node.nodeID] = AddNode(node.text, node.type, '75', 0, node.nodeID, 0, 0, false);
                        } else {
                            nodelist[node.nodeID] = AddNode(node.text, node.type, '168', 0, node.nodeID, xpos, ypos);
                        }
                    } else if (node.type == "MA") {
                        nodelist[node.nodeID] = AddNode(node.text, node.type, '144', 0, node.nodeID, xpos, ypos);
                    } else if (node.type == "PA") {
                        nodelist[node.nodeID] = AddNode(node.text, node.type, '161', 0, node.nodeID, xpos, ypos);
                    } else if (node.type == "L") {
                        pID = findParticipantIDText(node.text);
                        if (pID == 0) { //if an analyst node
                            nodelist[node.nodeID] = AddNode(node.text, node.type, null, 0, node.nodeID, 0, 0, false);
                        } else { //to prevent duplicate analyst nodes
                            nodelist[node.nodeID] = newNode(node.nodeID, node.type, null, pID, node.text, xpos, ypos);
                            DrawNode(node.nodeID, node.type, node.text, xpos, ypos);
                        }
                    }
                }
            });

            $.each(data.edges, function (idx, edge) {
                if (edge.fromID in nodelist && edge.toID in nodelist) {
                    index = findNodeIndex(edge.fromID);
                    visible = nodes[index].visible; //if the edge connects an invisible node it should also be invisible
                    var e = newEdge(edge.fromID, edge.toID, visible);
                    if (visible) { //if the edge is visible then draw edge on svg
                        DrawEdge(e.fromID, e.toID);
                        UpdateEdge(e);
                    }
                }
            });

            $.get("helpers/gettext.php?id=" + nodeSetID, function (tdata) {
                setAllText(tdata);
            });

            $.each(data.schemefulfillments, function (idx, sf) {
                if (sf.nodeID in nodelist) {
                    index = findNodeIndex(sf.nodeID);
                    nodes[index].scheme = sf.schemeID;
                }
            });

            var currenturl = window.location;
            var newurl = currenturl.replace(/aifdb=[0-9]+/i, "");
            history.pushState(null, null, newurl);
        });
    });
}

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

function add2corpus(addnsID) {
    var cID = $("#s_corpus").val();
    $.get("helpers/corporapost.php?nsID=" + addnsID + "&cID=" + cID, function (data) {
        $('#modal-save2db').hide();
        $('#modal-shade').hide();
    }).fail(function () {
        alert("Unable to add to corpus");
    });
}

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
