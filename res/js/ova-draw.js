
function DrawNode(nid, type, txt, nx, ny) {
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
    } else {
        nbox.setAttribute('style', 'fill:#ddeef9;stroke:#3498db;stroke-width:1;');
    }
    g.appendChild(nbox)
    g.appendChild(ntext)
}

function DrawEdge(fromid, toid) {
    var nedge = document.createElementNS("http://www.w3.org/2000/svg", "path");
    nedge.setAttribute('id', 'n' + fromid + '-n' + toid);
    nedge.setAttribute('stroke-width', '1');
    nedge.setAttribute('fill', 'none');
    nedge.setAttribute('stroke', 'black');
    nedge.setAttribute('d', 'M80,30 C200,30 30,380 200,380');
    nedge.setAttribute('marker-end', 'url(#head)');
    SVGRootG.insertBefore(nedge, SVGRootG.childNodes[0]);
}

function cmenu(node, evt) {

    tsvg = document.getElementById('inline').getBoundingClientRect();
    svgleft = tsvg.left;
    svgtop = tsvg.top;
    var newScale = VB[2] / 1000;
    var translationX = VB[0];
    var translationY = VB[1];
    //
    //
    // //Calculating new coordinates after panning and zooming
    // var coordx = ((node.x - svgleft) * newScale) + translationX;
    // var coordy = ((node.y  - svgtop)* newScale) + translationY;

    window.contextnode = node;
    $('#contextmenu').empty();
    // $('#contextmenu').css({top: (node.y+85), left: (node.x+210)});
    $('#contextmenu').css({ top: (evt.clientY + 5), left: evt.clientX - 65 });
    $('#contextmenu').append("<a onClick='editpopup(window.contextnode);$(\"#contextmenu\").hide();'>Edit Node</a>");
    if (node.type == 'I' && dialogicalMode) {
        $('#contextmenu').append("<a onClick='$(\"#locution_add\").show();$(\"#contextmenu\").hide();'>Add Locution</a>");
    }
    $('#contextmenu').append("<a onClick='window.groupID ++;deleteNode(window.contextnode);$(\"#contextmenu\").hide();'>Delete Node</a>");
    //if(window.msel.length > 0){
    //    $('#contextmenu').append( "<a onClick='dcEdges();$(\"#contextmenu\").hide();'>Delete Edges</a>" );
    //}

    $('#contextmenu').show();
}

function editpopup(node) {
    $('#n_text').hide(); $('#n_text_label').hide();
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

    if (node.type == 'I' || node.type == 'L' || node.type == 'EN') {
        $('#n_text').show();
        $('#n_text_label').show();
    } else {
        nodesIn = getNodesIn(node);

        var addRA = true;
        var addCA = true;
        var addYA = false;
        var addTA = false;
        var addPA = false;
        var addMA = false;

        if (dialogicalMode) {
            addTA = true;
            addPA = true;
            addMA = true;

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

        if (node.scheme == 0) {
            //$('#node_edit').height(180);
        } else {
            setdescriptors(node.scheme, node);
            //$('#node_edit').height(350);
            $('#descriptor_selects').show();
        }

        if (node.type == 'RA') {
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_ischeme').show();
            $('#s_ischeme_label').show();
            $('#s_ischeme').val(node.scheme);
        } else if (node.type == 'CA') {
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_cscheme').show();
            $('#s_cscheme_label').show();
            $('#s_cscheme').val(node.scheme);
        } else if (node.type == 'YA') {
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_lscheme').show();
            $('#s_lscheme_label').show();
            $('#s_lscheme').val(node.scheme);
        } else if (node.type == 'MA') {
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_mscheme').show();
            $('#s_mscheme_label').show();
            $('#s_mscheme').val(node.scheme);
        } else if (node.type == 'PA') {
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_pscheme').show();
            $('#s_pscheme_label').show();
            $('#s_pscheme').val(node.scheme);
        } else if (node.type == 'TA') {
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_tscheme').show();
            $('#s_tscheme_label').show();
            $('#s_tscheme').val(node.scheme);
        }
    }

    $('#n_text').val(node.text);
    FormOpen = true;
    $('#modal-shade').show();
    $('#node_edit').slideDown(100, function () {
        $('#n_text').focus();
    });
}

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
    }

}

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

function addTimestampsOnOff() {
    if (window.addTimestamps) {
        openModal('#modal-timestamps');
        console.log("add timestamps turned on");
    } else {
        console.log("add timestamps turned off");
    }
}

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

//removes all timestamps drawn on the svg with class name 'timestamp'
function removeTimestamps() {
    var allTimestamps = document.getElementsByClassName('timestamp');
    for (var i = allTimestamps.length - 1; i >= 0; i--) {
        allTimestamps[i].remove();
    }
}