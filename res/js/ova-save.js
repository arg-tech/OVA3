function genjson() {
    var json = {}
    var jschemefulfillments = [];
    var jlocutions = [];

    for (var i = 0, l = nodes.length; i < l; i++) {
        if (nodes[i].scheme != 0) {
            var jschemefulfillment = {};
            jschemefulfillment['nodeID'] = nodes[i].nodeID;
            jschemefulfillment['schemeID'] = nodes[i].scheme;
            jschemefulfillments.push(jschemefulfillment);
        }

        if (nodes[i].participantID != 0) {
            var jlocution = {};
            jlocution['nodeID'] = nodes[i].nodeID;
            jlocution['personID'] = nodes[i].participantID;
            jlocutions.push(jlocution);
        }
    }

    json['nodes'] = nodes;
    json['edges'] = edges;
    json['schemefulfillments'] = jschemefulfillments;
    json['participants'] = participants;
    json['locutions'] = jlocutions;

    var url = getUrlVars()["url"];
    var txt = '';

    if (url == 'local') {
        txt = getAllText();
    }

    a_firstname = '';
    if ($('#a_firstname').val() != '') {
        a_firstname = $('#a_firstname').val();
    }

    a_surname = '';
    if ($('#a_surname').val() != '') {
        a_surname = $('#a_surname').val();
    }


    var analysis = {
        "txt": txt,
        "a_firstname": a_firstname,
        "a_surname": a_surname
    };

    json['analysis'] = analysis;

    jstr = JSON.stringify(json);

    return jstr;
}

function genlink() {
    alink = window.location;
    $('#shareinput').val(alink);
    //console.log(nodes);
    //console.log(edges);
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
    clearAnalysis(); //remove the previous analysis before loading the new analysis
    if (typeof jstr !== 'object') {
        var json = JSON.parse(jstr);
    } else {
        var json = jstr;
    }

    var oplus = false;
    if ("plus" in getUrlVars()) {
        oplus = true;
    }

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

    var jnodes = json['nodes'];
    var nodelist = {};
    if (jnodes.length > 0 && !(jnodes[0].hasOwnProperty('x'))) {
        loaddbjson(json);
        return;
    }
    if (jnodes.length > 0 && jnodes[0].hasOwnProperty('id')) { //if in ova2 format convert to ova3 format
        for (var i = 0, l = jnodes.length; i < l; i++) {
            if (jnodes[i].id > window.nodeCounter) {
                window.nodeCounter = jnodes[i].id;
            }
            if (oplus) {
                if (jnodes[i].type == "L") {
                    pID = findParticipantIDText(jnodes[i].text);
                    nodelist[jnodes[i].id] = newNode(jnodes[i].id, jnodes[i].type, jnodes[i].scheme, pID, jnodes[i].text, jnodes[i].x, jnodes[i].y, jnodes[i].visible);
                    if (jnodes[i].visible) {
                        DrawNode(jnodes[i].id, jnodes[i].type, jnodes[i].text, jnodes[i].x, jnodes[i].y);
                    }
                } else {
                    nodelist[jnodes[i].id] = AddNode(jnodes[i].text, jnodes[i].type, jnodes[i].scheme, 0, jnodes[i].id, jnodes[i].x, jnodes[i].y, jnodes[i].visible);
                }
            } else if (jnodes[i].type == "RA" || jnodes[i].type == "CA" || jnodes[i].type == "I" || jnodes[i].type == "EN") {
                nodelist[jnodes[i].id] = AddNode(jnodes[i].text, jnodes[i].type, jnodes[i].scheme, 0, jnodes[i].id, jnodes[i].x, jnodes[i].y, jnodes[i].visible);
            }
        }
        window.nodeCounter++;

        edges = [];
        var e = json['edges'];
        for (var i = 0, l = e.length; i < l; i++) {
            from = e[i].from.id;
            to = e[i].to.id;
            if (from in nodelist && to in nodelist) { //if both the nodes the edge connects exist
                var edge = newEdge(from, to, e[i].visible);
                if (e[i].visible) {
                    DrawEdge(from, to);
                    UpdateEdge(edge);
                }
            }
        }
    } else {
        for (var i = 0, l = jnodes.length; i < l; i++) {
            if (jnodes[i].nodeID > window.nodeCounter) {
                window.nodeCounter = jnodes[i].nodeID;
            }
            if (oplus) {
                if (jnodes[i].type == "L") {
                    pID = findParticipantIDText(jnodes[i].text);
                    nodelist[jnodes[i].nodeID] = newNode(jnodes[i].nodeID, jnodes[i].type, 0, pID, jnodes[i].text, jnodes[i].x, jnodes[i].y, jnodes[i].visible);
                    if (jnodes[i].visible) {
                        DrawNode(jnodes[i].nodeID, jnodes[i].type, jnodes[i].text, jnodes[i].x, jnodes[i].y);
                    }
                } else {
                    nodelist[jnodes[i].nodeID] = AddNode(jnodes[i].text, jnodes[i].type, jnodes[i].scheme, 0, jnodes[i].nodeID, jnodes[i].x, jnodes[i].y, jnodes[i].visible);
                }
            } else if (jnodes[i].type == "RA" || jnodes[i].type == "CA" || jnodes[i].type == "I" || jnodes[i].type == "EN") {
                nodelist[jnodes[i].nodeID] = AddNode(jnodes[i].text, jnodes[i].type, jnodes[i].scheme, 0, jnodes[i].nodeID, jnodes[i].x, jnodes[i].y, jnodes[i].visible);
            }
        }
        window.nodeCounter++;

        edges = [];
        var e = json['edges'];
        for (var i = 0, l = e.length; i < l; i++) {
            from = e[i].fromID;
            to = e[i].toID;
            if (from in nodelist && to in nodelist) { //if both the nodes the edge connects exist
                var edge = newEdge(from, to, e[i].visible);
                if (e[i].visible) {
                    DrawEdge(from, to);
                    UpdateEdge(edge);
                }
            }
        }
    }

    setAllText(json['analysis']['txt']);
    postEdit("text", "edit", json['analysis']['txt']);
}

function loaddbjson(json) {
    //console.log("loaddbjson");
    var oplus = false;
    if ("plus" in getUrlVars()) {
        oplus = true;
    }

    //load nodes
    var nodelist = {};
    var pID = 0;
    var xpos = 0;
    var ypos = 0;
    jnodes = json['nodes'];

    for (var i = 0, l = jnodes.length; i < l; i++) {
        node = jnodes[i];
        xpos = 10 + (i * 10);
        ypos = 10;

        if (node.type == "CA") {
            nodelist[node.nodeID] = AddNode(node.text, node.type, '71', 0, node.nodeID, xpos, ypos);
        } else if (node.type == "RA") {
            nodelist[node.nodeID] = AddNode(node.text, node.type, '72', 0, node.nodeID, xpos, ypos);
        } else if (node.type == "I") {
            nodelist[node.nodeID] = AddNode(node.text, node.type, '0', 0, node.nodeID, xpos, ypos);
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
                    nodelist[node.nodeID] = AddNode(node.text, node.type, '0', 0, node.nodeID, 0, 0, false);
                } else { //to prevent duplicate analyst nodes
                    nodelist[node.nodeID] = newNode(node.nodeID, node.type, '0', pID, node.text, xpos, ypos);
                    DrawNode(node.nodeID, node.type, node.text, xpos, ypos);
                }
            }
        }
    }

    //load edges
    jedges = json['edges'];
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
            index = findNodeIndex(sf[i].nodeID);
            nodes[index].scheme = sf[i].schemeID;
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
                /*visible = true;
                if (node.type == "YA" && node.text.indexOf('AnalysesAs') >= 0) {
                    visible = false;
                    xpos = 0;
                    ypos = 0;
                } else if (node.type == "L" && node.text.indexOf('Annot: ') >= 0) {
                    visible = false;
                    xpos = 0;
                    ypos = 0;
                }*/

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
                    nodelist[node.nodeID] = AddNode(node.text, node.type, '0', 0, node.nodeID, xpos, ypos);
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
                            nodelist[node.nodeID] = AddNode(node.text, node.type, '0', 0, node.nodeID, 0, 0, false);
                        } else { //to prevent duplicate analyst nodes
                            nodelist[node.nodeID] = newNode(node.nodeID, node.type, '0', pID, node.text, xpos, ypos);
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

            /*if(mwidth > WIDTH || mheight > HEIGHT){
                resize_canvas(mwidth, mheight);
            }*/

            //var currenturl = window.location;
            //var newurl = currenturl.replace(/aifdb=[0-9]+/i, ""); 
            //history.pushState(null, null, newurl);
        });
    });
}

//todo: add error check & message and check that saves in aif
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

        if (nodes[i].scheme != 0) {
            var jschemefulfillment = {};
            jschemefulfillment['nodeID'] = nodes[i].nodeID;
            jschemefulfillment['schemeID'] = nodes[i].scheme;
            jschemefulfillments.push(jschemefulfillment);
        }

        if (nodes[i].participantID != 0) {
            var jlocution = {};
            jlocution['nodeID'] = nodes[i].nodeID;
            jlocution['personID'] = nodes[i].participantID;
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
    json['participants'] = participants; //todo: check if should be 'people' or 'participants'
    json['locutions'] = jlocutions;

    jstring = JSON.stringify(json);
    //console.log(jstring);
    //todo: uncomment code below
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
        $('#modal-bg').hide();
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
    $('#modal-bg').hide();
}

function svg2canvas2image() {
    var box = SVGRoot.getBBox();
    var x = box.x;
    var y = box.y;
    var w = box.width + x + 100;
    var h = box.height + y + 150;

    var svg = SVGRoot;
    var svg64 = btoa(new XMLSerializer().serializeToString(svg));
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
