/**
 * Draws a node on the SVG
 * @param {String} nid - The ID of the node to draw
 * @param {String} type - The type of node to draw
 * @param {String} txt - The text to draw
 * @param {Number} nx - The x coordinate to draw at
 * @param {Number} ny - The y coordinate to draw at
 * @param {Boolean} mark - Optional, indicates if the node should be marked (true) or not (false). The default is false.
 */
function DrawNode(nid, type, txt, nx, ny, mark) {
    var phraseArray = [];
    if (txt.length > 36) {
        var wa = txt.split(' ');
        line = "";
        for (var i = 0; i < wa.length; i++) {
            word = wa[i];
            if (line.length == 0) {
                line = word;
            } else if (line.length + word.length <= 36) {
                line = line + ' ' + word;
                if (i == wa.length - 1) {
                    phraseArray.push(line)
                }
            } else {
                phraseArray.push(line);
                line = word;
                if (i == wa.length - 1) {
                    phraseArray.push(line)
                }
            }
        }
    } else {
        phraseArray.push(txt);
    }
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute('id', nid);
    g.setAttribute('focusable', 'true');

    mark = typeof mark !== 'undefined' ? mark : false;
    if (mark) {
        g.classList.add('hl');
    }

    var ntext = document.createElementNS("http://www.w3.org/2000/svg", "text");
    ntext.setAttribute('x', nx);
    ntext.setAttribute('y', ny);
    ntext.setAttribute('style', 'font-family: sans-serif; font-weight: normal; font-style: normal;font-size: 10px;');

    for (var i = 0; i < phraseArray.length; i++) {
        var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute('text-anchor', 'middle');
        tspan.setAttribute('x', nx);
        tspan.setAttribute('dy', 14);
        var myText = document.createTextNode(phraseArray[i]);
        tspan.appendChild(myText);
        ntext.appendChild(tspan);
    }

    g.appendChild(ntext)
    SVGRootG.appendChild(g)

    var textbox = ntext.getBBox();
    var textwidth = textbox.width;
    var textheight = textbox.height;
    var nbox = document.createElementNS("http://www.w3.org/2000/svg", "rect")

    if (type == 'I' || type == 'L' || type == 'EN') {
        nbox.setAttribute('x', nx - (textwidth / 2) - 16);
        nbox.setAttribute('y', ny - 2);
        nbox.setAttribute('width', textwidth + 32);
        nbox.setAttribute('height', textheight + 14);
        nbox.setAttribute('rx', '5');
        nbox.setAttribute('ry', '5');
        nbox.setAttribute('style', 'fill:#ddeef9;stroke:#3498db;stroke-width:1;')
    } else {
        nbox.setAttribute('x', nx - (textwidth / 2) - 16);
        nbox.setAttribute('y', ny - 7);
        nbox.setAttribute('width', textwidth + 32);
        nbox.setAttribute('height', textheight + 24);
        nbox.setAttribute('rx', (textwidth + 32) / 2);
        nbox.setAttribute('ry', (textheight + 24) / 2);
    }
    if (window.bwmode) {
        nbox.classList.add('bw');
    }
    if (type == 'RA') {
        nbox.setAttribute('style', 'fill:#def8e9;stroke:#2ecc71;stroke-width:1;');
    } else if (type == 'CA') {
        nbox.setAttribute('style', 'fill:#fbdedb;stroke:#e74c3c;stroke-width:1;');
    } else if (type == 'YA') {
        nbox.setAttribute('style', 'fill:#fdf6d9;stroke:#f1c40f;stroke-width:1;');
    } else if (type == 'TA') {
        nbox.setAttribute('style', 'fill:#eee3f3;stroke:#9b59b6;stroke-width:1;');
    } else if (type == 'MA') {
        nbox.setAttribute('style', 'fill:#fbeadb;stroke:#e67e22;stroke-width:1;');
    } else if (type == 'EN') {
        nbox.setAttribute('style', 'fill:#dedddc;stroke:#969696;stroke-width:1;');
    } else if (type == 'PA') {
        nbox.setAttribute('style', 'fill:#dde1f9;stroke:#5060ba;stroke-width:1;');
    } else {
        nbox.setAttribute('style', 'fill:#ddeef9;stroke:#3498db;stroke-width:1;');
    }
    g.appendChild(nbox)
    g.appendChild(ntext)
}

/**
 * Draws an edge on the SVG
 * @param {String} fromid - The ID of the node the edge connects from
 * @param {String} toid - The ID of the node the edge connects to
 */
function DrawEdge(fromid, toid) {
    var nedge = document.createElementNS("http://www.w3.org/2000/svg", "path");
    nedge.setAttribute('id', 'n' + fromid + '-n' + toid);
    nedge.setAttribute('stroke-width', '1');
    nedge.setAttribute('fill', 'none');
    nedge.setAttribute('stroke', 'black');
    nedge.setAttribute('d', 'M80,30 C200,30 30,380 200,380');
    nedge.setAttribute('marker-end', 'url(#head)');
    SVGRootG.appendChild(nedge);
}

/**
 * Handles the context menu
 * @param {Node} node - The node to open the context menu for
 * @param {*} evt - The event to handle
 */
function cmenu(node, evt) {

    tsvg = document.getElementById('inline').getBoundingClientRect();
    svgleft = tsvg.left;
    svgtop = tsvg.top;

    window.contextNode = node;
    $('#contextmenu').empty();
    $('#contextmenu').css({ top: (evt.clientY + 5), left: evt.clientX - 65 });
    $('#contextmenu').append("<a onClick='editpopup(contextNode);$(\"#contextmenu\").hide();'>Edit Node</a>");
    if (node.marked) { $('#contextmenu').append("<a onClick='window.groupID++;markNode(contextNode, false);$(\"#contextmenu\").hide();'>Unmark Node</a>"); }
    else { $('#contextmenu').append("<a onClick='window.groupID++;markNode(contextNode, true);$(\"#contextmenu\").hide();'>Mark Node</a>"); }
    if (dialogicalMode && node.type == 'I' || node.type == 'L') {
        $('#contextmenu').append("<a onClick='$(\"#locution_add\").show();$(\"#contextmenu\").hide();'>Add Locution</a>");
    }
    $('#contextmenu').append("<a onClick='window.groupID ++;deleteNode(contextNode);$(\"#contextmenu\").hide();'>Delete Node</a>");
    //if(window.msel.length > 0){
    //    $('#contextmenu').append( "<a onClick='dcEdges();$(\"#contextmenu\").hide();'>Delete Edges</a>" );
    //}
    if (node.type == 'L' && window.addTimestamps) {
        $('#contextmenu').append("<a style='font-size:0.86em;' onClick='window.editTimestamp=true;$(\"#delTimestampBtn\").show();$(\"#modal-timestamps\").show();$(\"#contextmenu\").hide();'>Edit Timestamp</a>");
    }

    $('#contextmenu').show();
}

/**
 * Handles the edit node popup 
 * @param {Node} node - The node to edit
 */
function editpopup(node) {
    $('#n_text').hide(); $('#n_text_label').hide(); $('#l_add_btn').hide();
    $('#s_type').hide(); $('#s_type_label').hide();
    $('#s_ischeme').hide(); $('#s_ischeme_label').hide();
    $('#s_cscheme').hide(); $('#s_cscheme_label').hide();
    $('#s_lscheme').hide(); $('#s_lscheme_label').hide();
    $('#s_mscheme').hide(); $('#s_mscheme_label').hide();
    $('#s_pscheme').hide(); $('#s_pscheme_label').hide();
    $('#s_tscheme').hide(); $('#s_tscheme_label').hide();
    $('#descriptor_selects').hide();
    $('#cq_selects').hide();
    $('#s_sset').hide(); $('#s_sset_label').hide();
    $('#timestamp_info').hide(); $('#edit_timestamp_btn').hide(); $('#delTimestampBtn').hide();
    $('#unmark_node_btn').hide(); $('#mark_node_btn').show();
    editsTab('node_options'); $('#tab-bar-edits').hide();

    var marked = document.getElementById(node.nodeID).classList.contains('hl');
    if (marked) {
        $('#mark_node_btn').hide(); $('#unmark_node_btn').show();
    }

    if (node.type == 'I' || node.type == 'L' || node.type == 'EN') {
        $('#n_text').show(); $('#n_text_label').show(); $('#l_add_btn').show();
        if (node.type == 'L' && window.addTimestamps) {
            if (node.timestamp != "") {
                document.getElementById("timestamp_label").innerHTML = node.timestamp;
            } else {
                document.getElementById("timestamp_label").innerHTML = "No timestamp was added to this locution.";
            }
            $('#timestamp_info').show();
            $('#edit_timestamp_btn').show();
            $('#delTimestampBtn').show();
        }
    } else {
        nodesIn = getNodesIn(node);

        var addRA = true;
        var addCA = true;
        var addMA = true;
        var addYA = false;
        var addTA = false;
        var addPA = false;

        if (dialogicalMode) {
            addTA = true;
            addPA = true;

            for (var i = 0; i < nodesIn.length; i++) {
                if (nodesIn[i].type == 'L' || nodesIn[i].type == 'TA') {
                    addYA = true;
                }
            }
        }

        $('#s_type').empty();
        if (addRA) {
            $('#s_type').append('<option value="RA">RA</option>');
        }
        if (addCA) {
            $('#s_type').append('<option value="CA">CA</option>');
        }
        if (addYA) {
            $('#s_type').append('<option value="YA">YA</option>');
        }
        if (addTA) {
            $('#s_type').append('<option value="TA">TA</option>');
        }
        if (addMA) {
            $('#s_type').append('<option value="MA">MA</option>');
        }
        if (addPA) {
            $('#s_type').append('<option value="PA">PA</option>');
        }

        $('#s_type').show();
        $('#s_type_label').show();
        $('#s_type').val(node.type);

        if (node.scheme != null && node.scheme != '0') {
            setdescriptors(node.scheme, node);
        }

        if (node.type == 'RA') {
            setSelSchemeset('RA'); $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_ischeme').show();
            $('#s_ischeme_label').show();
            $('#s_ischeme').val(node.scheme);
        } else if (node.type == 'CA') {
            setSelSchemeset('CA'); $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_cscheme').show();
            $('#s_cscheme_label').show();
            $('#s_cscheme').val(node.scheme);
        } else if (node.type == 'YA') {
            setSelSchemeset('YA'); $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_lscheme').show();
            $('#s_lscheme_label').show();
            $('#s_lscheme').val(node.scheme);
        } else if (node.type == 'MA') {
            setSelSchemeset('MA'); $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_mscheme').show();
            $('#s_mscheme_label').show();
            $('#s_mscheme').val(node.scheme);
        } else if (node.type == 'PA') {
            setSelSchemeset('PA'); $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_pscheme').show();
            $('#s_pscheme_label').show();
            $('#s_pscheme').val(node.scheme);
        } else if (node.type == 'TA') {
            setSelSchemeset('TA'); $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_tscheme').show();
            $('#s_tscheme_label').show();
            $('#s_tscheme').val(node.scheme);
        }
    }
    filterschemes(document.getElementById('s_sset').value)

    $('#n_text').val(node.text);
    FormOpen = true;
    $('#modal-shade').show();
    $('#node_edit').slideDown(100, function () {
        $('#n_text').focus();
    });
}

/**
 * Handles showing the correct scheme sets
 * @param {String} type - The type of node to show scheme sets for
 */
function showschemes(type) {
    if (type == 'RA') {
        $('#s_ischeme').show();
        $('#s_ischeme_label').show();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
        setSelSchemeset('RA');
    } else if (type == 'CA') {
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').show();
        $('#s_cscheme_label').show();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
        setSelSchemeset('CA');
    } else if (type == 'YA') {
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').show();
        $('#s_lscheme_label').show();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
        setSelSchemeset('YA');
    } else if (type == 'MA') {
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').show();
        $('#s_mscheme_label').show();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
        setSelSchemeset('MA');
    } else if (type == 'PA') {
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').show();
        $('#s_pscheme_label').show();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
        setSelSchemeset('PA');
    } else if (type == 'TA') {
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').show();
        $('#s_tscheme_label').show();
        setSelSchemeset('TA');
    }
}

/**
 * Handles displaying the default scheme set for each type
 * @param {String} type - The type to show the default scheme set for
 */
function setSelSchemeset(type) {
    var index = window.defaultSchemesets.findIndex(s => s.includes(type));
    if (index > -1) {
        document.getElementById('s_sset').value = window.defaultSchemesets[index][1];
    }
}

/**
 * Fills the list of scheme sets in the wildcarding popup
 */
function showWildcardingSchemeSets() {
    // Empty the select box
    $('#wildcarding_schemes_set option').remove();
    $('#wildcarding_schemes_set').append('<option value="any-scheme-set">--</option>');
    
    schemesets.forEach(function(schemeset) {
        $('#wildcarding_schemes_set').append('<option value="' + schemeset.id + '">' + schemeset.name + '</option>');
    });
}

/**
 * Handles showing the correct scheme sets in wildcarding popup, filtered by selected type and scheme set
 */
 function filterWildcardingSchemes() {

    // Clear the current list of schemes
    $('#wildcarding_scheme_select option').remove();

    var type = $('#wildcarding_schemes_type').find(":selected").val();
    var schemeSet = $('#wildcarding_schemes_set').find(":selected").val();

    console.log(type);
    console.log(schemeSet);

    // Create a map of types to corresponding schemes
    var typeToSchemeMappings = {
        'RA': ['1','2','3','9'],
        'CA': ['4','5'],
        'YA': ['7','12'],
        'MA': ['11'],
        'PA': ['6'],
        'TA': ['8']
    };

    // Load all schemes by default
    var filteredSchemes = schemes;

    // Filter schemes by type
    if(type != 'any-type') {
        // Create array containing only schemes which correspond to selected type
        filteredSchemes = schemes.filter(function (scheme) {
            return typeToSchemeMappings[type].includes(scheme.schemeTypeID);
        });
    }
    
    // Filter schemes by scheme set
    if(schemeSet != 'any-scheme-set') {
        console.log('scheme set is set');
    }

    // Append each scheme in filtered array to the select box
    filteredSchemes.forEach(function(scheme) {
        scheme_name = scheme.name.replace(/([a-z])([A-Z])/g, "$1 $2");
        scheme_type = scheme.schemeTypeID;

        $('#wildcarding_scheme_select').append('<option value="' + scheme.schemeID + '">' + scheme_name + '</option>');
    });
}

/**
 * Handles turning black and white mode on and off
 */
function bwModeOnOff() {
    var allRects = document.getElementsByTagName('rect');
    if (window.bwmode) {
        for (rect of allRects) {
            rect.classList.add('bw');
        }
    }
    else {
        for (rect of allRects) {
            rect.classList.remove('bw');
        }
    }
}

/**
 * Draws a timestamp on the SVG
 * @param {String} nodeID - The ID of the node to draw a timestamp for
 * @param {String} timestamp - The timestamp to draw
 * @param {Number} xpos - The x coordinate to draw at
 * @param {Number} ypos - The y coordinate to draw at
 */
function DrawTimestamp(nodeID, timestamp, xpos, ypos) {
    var g = document.getElementById(nodeID);
    if (g) {
        var ntext = document.createElementNS("http://www.w3.org/2000/svg", "text");
        ntext.setAttribute('class', 'timestamp');
        ntext.setAttribute('x', xpos);
        ntext.setAttribute('y', ypos);
        ntext.setAttribute('style', 'font-family: sans-serif; font-weight: normal; font-style: normal;font-size: 8px;');
        var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute('text-anchor', 'middle');
        tspan.setAttribute('x', xpos);
        tspan.setAttribute('dy', -5);
        var myText = document.createTextNode(timestamp);
        tspan.appendChild(myText);
        ntext.appendChild(tspan);
        g.appendChild(ntext);
    }
}

/**
 * Handles turning 'Add Timestamp' mode on and off
 */
function addTimestampsOnOff() {
    if (window.addTimestamps) {
        if (!window.dialogicalMode) {
            window.addTimestamps = false;
            $("#timestamptoggle").toggleClass("on off");
            alert("Timestamps can only be added in dialogical mode.");
        }
    }
}

/**
 * Handles turning 'Show Timestamp' mode on and off
 */
function showTimestampsOnOff() {
    if (window.showTimestamps) {
        // console.log("drawing timestamps");
        var count = 0;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].timestamp != '' && nodes[i].type == 'L' && nodes[i].visible) {
                DrawTimestamp(nodes[i].nodeID, nodes[i].timestamp, nodes[i].x, nodes[i].y);
                count++;
            }
        }
        if (count == 0) {
            alert("No timestamps were found.");
        }
    } else {
        // console.log("hiding timestamps");
        removeTimestamps();
    }
}

/**
 * Removes timestamps drawn on the SVG
 * @param {String} nodeID - Optional, the ID of the node to remove the drawn timestamp for. Leave empty to remove all timestamps drawn on the SVG.
 */
function removeTimestamps(nodeID) {
    var all = typeof nodeID == 'undefined' ? true : false; //if all timestamps should be removed or only one timestamp
    if (all) { //removes all timestamps drawn on the svg with class name 'timestamp'
        var allTimestamps = document.getElementsByClassName('timestamp');
        for (var i = allTimestamps.length - 1; i >= 0; i--) {
            allTimestamps[i].remove();
        }
    } else { //removes the timestamp drawn on the svg for the given nodeID
        var g = document.getElementById(nodeID);
        var tstamp = g.getElementsByClassName('timestamp')[0];
        tstamp.remove();
    }
}

/**
 * Edits timestamps drawn on the SVG
 * @param {String} nodeID - The ID of the node to edit the timestamp for
 * @param {String} timestamp - The new timestamp value
 * @returns {Boolean} - Indicates if the timestamp was found and edited (true) or not (false)
 */
function editTimestampSVG(nodeID, timestamp) {
    var g = document.getElementById(nodeID);
    if (g) {
        var tstamp = g.getElementsByClassName('timestamp')[0];
        if (tstamp) {
            var tspan = tstamp.getElementsByTagName('tspan');
            $(tspan).text(timestamp);
            return true;
        }
    }
    return false;
}

/**
 * Marks a node and its connected edges drawn on the SVG
 * @param {Node} node - The node to be marked or unmarked
 * @param {Boolean} mark - Indicates if the node should be marked (true) or not (false)
 * @returns {Boolean} Indicates if the node was sucessfully marked/unmarked (true) or not (false)
 */
function markNode(node, mark) {
    var g = document.getElementById(node.nodeID);
    if (g) { //if the node is drawn on the SVG
        if (mark) { g.classList.add('hl'); } else { g.classList.remove('hl'); } //mark or unmark the node
        setMarked(node.nodeID, mark);

        if (node.type != 'I' && node.type != 'L' && node.type != 'EN') {
            var nIn = getNodesIn(node);
            for (n of nIn) {
                g = document.getElementById(n.nodeID);
                if (g) { //if the node is drawn on the SVG
                    if (mark) { g.classList.add('hl'); } else { g.classList.remove('hl'); } //mark or unmark the node
                    setMarked(n.nodeID, mark);
                    markEdge(n.nodeID, node.nodeID, mark);
                }
            }
            var nOut = getNodesOut(node);
            for (n of nOut) {
                g = document.getElementById(n.nodeID);
                if (g) { //if the node is drawn on the SVG
                    if (mark) { g.classList.add('hl'); } else { g.classList.remove('hl'); } //mark or unmark the node
                    setMarked(n.nodeID, mark);
                    markEdge(node.nodeID, n.nodeID, mark);
                }
            }
        }
        return true;
    }
    return false;
}

/**
 * Marks an edge drawn on the SVG
 * @param {String} fromID - The ID of the node the edge connects from
 * @param {String} toID - The ID of the node the edge connects to
 * @param {Boolean} mark - Indicates if the edge should be marked (true) or not (false)
 * @returns {Boolean} Indicates if the edge was sucessfully marked/unmarked (true) or not (false)
 */
function markEdge(fromID, toID, mark) {
    edgeID = 'n' + fromID + '-n' + toID;
    p = document.getElementById(edgeID);
    if (p) { //if the edge is drawn on the SVG
        if (mark) { p.classList.add('hl'); p.setAttribute('marker-end', 'url(#head2)'); } //mark the edge
        else { p.classList.remove('hl'); p.setAttribute('marker-end', 'url(#head)'); } //unmark the edge
        return true;
    }
    return false;
}

/**
 * Draws wildcarded text on the SVG, below each visible node
 * @param {String} nodeID - The ID of the node to draw wildcarded text for
 * @param {String} wildcardedText - The wildcarded text to draw
 * @param {String} wildcardedType - The wildcarded type to draw
 * @param {Number} xpos - The x coordinate of the node
 * @param {Number} ypos - The y coordinate of the node
 */
 function DrawWildcardedProperties(nodeID, wildcardedText, wildcardedType, xpos, ypos) {
    var g = document.getElementById(nodeID);
    if (g) {
        var ntext = document.createElementNS("http://www.w3.org/2000/svg", "text");
        ntext.setAttribute('class', 'wildcarded-properties');
        ntext.setAttribute('x', xpos);
        ntext.setAttribute('y', ypos);
        ntext.setAttribute('style', 'font-family: sans-serif; font-weight: normal; font-style: normal;font-size: 8px;');
        var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute('text-anchor', 'middle');
        tspan.setAttribute('x', xpos);
        tspan.setAttribute('dy', 40);

        var wildcardedProperties = `Text: ${wildcardedText} Type: ${wildcardedType}`;

        var myText = document.createTextNode(wildcardedProperties);
        tspan.appendChild(myText);
        ntext.appendChild(tspan);
        g.appendChild(ntext);
    }
}

/**
 * Handles turning 'Add Timestamp' mode on and off
 */
// function addTimestampsOnOff() {
//     if (window.addTimestamps) {
//         if (!window.dialogicalMode) {
//             window.addTimestamps = false;
//             $("#timestamptoggle").toggleClass("on off");
//             alert("Timestamps can only be added in dialogical mode.");
//         }
//     }
// }

/**
 * Handles turning wildcarding mode on and off
 */
function showWildcardedPropertiesOnOff() {
    if (window.wildcardingMode) {
        nodes.forEach((node) => {
            if (node.visible) {
                // If node hasn't been wildcarded
                if(node.wildcardedText === '' && node.wildcardedType === '') {
                    node.wildcardedText = node.text;
                    node.wildcardedType = node.type;
                }

                DrawWildcardedProperties(node.nodeID, node.wildcardedText, node.wildcardedType, node.x, node.y);
            }
        })
    } else {
        removeWildcardedProperties();
    }
}

/**
 * Removes all wildcarded properties drawn on the SVG
 */
function removeWildcardedProperties() {
        $('.wildcarded-properties').each(function() {
            $(this).remove();
        });
}

/**
 * Edits timestamps drawn on the SVG
 * @param {String} nodeID - The ID of the node to edit the timestamp for
 * @param {String} timestamp - The new timestamp value
 * @returns {Boolean} - Indicates if the timestamp was found and edited (true) or not (false)
 */
// function editTimestampSVG(nodeID, timestamp) {
//     var g = document.getElementById(nodeID);
//     if (g) {
//         var tstamp = g.getElementsByClassName('timestamp')[0];
//         if (tstamp) {
//             var tspan = tstamp.getElementsByTagName('tspan');
//             $(tspan).text(timestamp);
//             return true;
//         }
//     }
//     return false;
// }