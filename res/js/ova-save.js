/* autolayout
function genldot() {
    var doto = "digraph odg {";
    var ranks = "";
    if("plus" in getUrlVars()){
        doto = doto + "rankdir=RL;";
    }

    for (var i = 0, l = nodes.length; i < l; i++) {
        dnode = nodes[i];
        doto = doto + dnode.id + ' [label="xxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx\\nxxx xxx xxx xxx xxx"];';

        if(dnode.type != 'I' && dnode.type != 'L'){
            dout = getNodesOut(dnode);
            for (var j = 0, ol = dout.length; j < ol; j++) {
                doto = doto + dnode.id + ' -> ' + dout[j].id;
                if("plus" in getUrlVars() && dnode.type != 'YA' && dout[j].type != 'YA'){
                    doto = doto + " [constraint=false]";
                    if((dnode.type == 'RA' || dnode.type == 'CA') && dout[j].type == 'I'){
                        ranks = ranks + '{ rank = same; ' + dnode.id + '; ' + dout[j].id + '; }';
                    }
                }
                doto = doto + ';';
            }

            din = getNodesIn(dnode);
            for (var j = 0, ol = din.length; j < ol; j++) {
                doto = doto + din[j].id + ' -> ' + dnode.id;
                if("plus" in getUrlVars() && dnode.type != 'YA' && din[j].type != 'YA'){
                    doto = doto + " [constraint=false]";
                    if((din[j].type == 'RA' || din[j].type == 'CA') && dnode.type == 'I'){
                        ranks = ranks + '{ rank = same; ' + din[j].id + '; ' + dnode.id + '; }';
                    }
                }   
                doto = doto + ';';
            }
        }
    }

    doto = doto + ranks;
    doto = doto + '}';

    mwidth = WIDTH;
    mheight = HEIGHT;

    $.post("dot/index.php", { data: doto },
        function(reply) {
            ldata = JSON.parse(reply);
            for(var i = 0, l = nodes.length; i<l; i++) {
                mnode = nodes[i];
                if(mnode.id in ldata){
                    xpos = parseInt(ldata[mnode.id]["x"]);
                    mnode.x = xpos*0.8;
                    if(xpos > mwidth-100){ mwidth = xpos+100; }
                    ypos = parseInt(ldata[mnode.id]["y"]);
                    mnode.y = ypos;
                    if(ypos > mheight-100){ mheight = ypos+100; }
                }
            }

            if(mwidth > WIDTH || mheight > HEIGHT){
                resize_canvas(mwidth, mheight);
            }
        }
    );
}*/

function genjson() {
    var json = {}

    json['nodes'] = nodes;
    json['edges'] = edges;
    json['participants'] = participants;

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

/* for collaberation
function genlink() {
    if($('#sharelink').is(':hidden')) {
        alink = window.location;
        $('#shareinput').val(alink);
    }

    return false;
}*/


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

//todo:
function loadfile(jstr) {
    if (typeof jstr !== 'object') {
        var json = JSON.parse(jstr);
    } else {
        var json = jstr;
    }

    jnodes = json['nodes'];
    //
    nodes = jnodes;
    for (var i = 0, l = nodes.length; i < l; i++) {
        if (nodes[i].nodeID > window.nodeCounter) {
            window.nodeCounter = nodes[i].nodeID;
        }
        //postEdit("node", "add", nodes[i]);
        DrawNode(nodes[i].nodeID, nodes[i].type, nodes[i].text, nodes[i].x, nodes[i].y);
    }
    window.nodeCounter++;

    edges = [];
    var e = json['edges'];
    for (var i = 0, l = e.length; i < l; i++) {
        from = e[i].fromID;
        to = e[i].toID;

        DrawEdge(from, to);
        var edge = newEdge(from, to);
        UpdateEdge(edge);
    }

    $('#p_select').empty();
    particpants = [];
    var p = json['participants'];
    for (var i = 0, l = p.length; i < l; i++) {
        firstname = p[i].firstname;
        surname = p[i].surname;
        addParticipant(firstname, surname)
    }

    setAllText(json['analysis']['txt']);
    //postEdit("text", "edit", json['analysis']['txt']);

}

/*function loaddbjson(json){
    var oplus = false;
    if("plus" in getUrlVars()){
        oplus = true;
    }

    var nodelist = {};

    jnodes = json['nodes'];
    for (var i = 0, l = jnodes.length; i < l; i++) {
        xpos = 10 + (i*10);
        ypos = 10;
        node = jnodes[i];
        if(node.type == "CA"){
            nodelist[node.nodeID] = addNode(xpos, ypos, 'r', 'CA', 'CA', true, 0);
        }else if(node.type == "RA"){
            nodelist[node.nodeID] = addNode(xpos, ypos, 'g', 'RA', 'RA', true, 0);
        }else if(node.type == "TA"){
            if(oplus){
                nodelist[node.nodeID] = addNode(xpos, ypos, 'p', 'TA', 'TA', true, 0);
            }
        }else if(node.type == "YA"){
            if(oplus){
                nodelist[node.nodeID] = addNode(xpos, ypos, 'y', 'YA', 'YA', true, 0);
            }
	}else if(node.type == "MA"){
            if(oplus){
                nodelist[node.nodeID] = addNode(xpos, ypos, 'o', 'MA', 'MA', true, 0);
            }
	}else if(node.type == "PA"){
            if(oplus){
                nodelist[node.nodeID] = addNode(xpos, ypos, 't', 'PA', 'PA', true, 0);
            }
        }else{
            if(node.type == "I" || oplus){
                nodelist[node.nodeID] = addNode(xpos, ypos, 'b', node.text, node.type, true, 0);
            }
        }
    }

    edges = json['edges'];
    for (var i = 0, l = edges.length; i < l; i++) {
        edge = edges[i];
        if(edge.fromID in nodelist && edge.toID in nodelist){
            addEdge(nodelist[edge.fromID], nodelist[edge.toID]);
        }
    }
}

function loadfromdb(nodeSetID) {
    mwidth = WIDTH;
    mheight = HEIGHT;
    var oplus = false;
    var uplus = "&plus=false";
    if("plus" in getUrlVars()){
        oplus = true;
        uplus = "&plus=true";
    }
    $.getJSON( "helpers/layout.php?id="+nodeSetID+uplus, function(ldata) {
        $.getJSON( "helpers/getdbnodeset.php?id="+nodeSetID, function(data) {
            var nodelist = {};

            $.each(data.nodes, function(idx, node) {
                visi = true;
                if(node.type == "YA" && node.text.indexOf('AnalysesAs') >= 0){
                    visi = false;
                    xpos = -10;
                    ypos = -10;
                }else if(node.type == "L" && node.text.indexOf('Annot: ') >= 0){
                    visi = false;
                    xpos = -10;
                    ypos = -10;
                }else if(node.nodeID in ldata){
                    xpos = parseInt(ldata[node.nodeID]["x"]);
                    xpos = xpos*0.8;
                    if(xpos > mwidth-100){ mwidth = xpos+100; }
                    ypos = parseInt(ldata[node.nodeID]["y"]);
                    if(ypos > mheight-100){ mheight = ypos+100; }
                }else{
                    xpos = 10;
                    ypos = 10;
                }

                if(node.type == "CA"){
                    nodelist[node.nodeID] = addNode(xpos, ypos, 'r', 'CA', 'CA', true, 0);
                }else if(node.type == "RA"){
                    nodelist[node.nodeID] = addNode(xpos, ypos, 'g', 'RA', 'RA', true, 0);
                }else if(node.type == "TA"){
                    if(oplus){
                        nodelist[node.nodeID] = addNode(xpos, ypos, 'p', 'TA', 'TA', true, 0);
                    }
		}else if(node.type == "MA"){
		    if(oplus){
			nodelist[node.nodeID] = addNode(xpos, ypos, 'o', 'MA', 'MA', true, 0);
		    }
		}else if(node.type == "PA"){
		    if(oplus){
			nodelist[node.nodeID] = addNode(xpos, ypos, 't', 'PA', 'PA', true, 0);
		    }
                }else if(node.type == "YA"){
                    if(oplus){
                        tt = 'YA';
                        if(node.text != ''){
                            tt = node.text;
                        }
                        nodelist[node.nodeID] = addNode(xpos, ypos, 'y', tt, 'YA', visi, 0);
                    }
                }else{
                    if(node.type == "I" || oplus){
                        nodelist[node.nodeID] = addNode(xpos, ypos, 'b', node.text, node.type, visi, 0);
                    }
                }
            });

            $.each(data.edges, function(idx, edge) {
                if(edge.fromID in nodelist && edge.toID in nodelist){
                    addEdge(nodelist[edge.fromID], nodelist[edge.toID]);
                }
            });

            $.get( "helpers/gettext.php?id="+nodeSetID, function(tdata) {
                setAllText(tdata);
            });

            if(mwidth > WIDTH || mheight > HEIGHT){
                resize_canvas(mwidth, mheight);
            }

            //var currenturl = window.location;
            //var newurl = currenturl.replace(/aifdb=[0-9]+/i, ""); 
            //history.pushState(null, null, newurl);
        });
    });
}

function save2db() {
    $('#modal-save2db').show();
    $('#m_load').show();
    $('#m_content').hide();

    var json = {}
    var jnodes = [];
    var jedges = [];
    var jschemefulfillments = [];
    var jlocutions = [];
    var jparticipants = [];

    for (var i = 0, l = nodes.length; i < l; i++) {
        var jnode = {};
        jnode['nodeID'] = nodes[i].id;
        jnode['text'] = nodes[i].text;
        jnode['type'] = nodes[i].type;
        jnodes.push(jnode);
    
        if(nodes[i].scheme != 0){
            var jschemefulfillment = {};
            jschemefulfillment['nodeID'] = nodes[i].id;
            jschemefulfillment['schemeID'] = nodes[i].scheme;
            jschemefulfillments.push(jschemefulfillment);
        }

        if(nodes[i].participantID != 0){
            var jlocution = {};
            jlocution['nodeID'] = nodes[i].id;
            jlocution['personID'] = nodes[i].participantID;
            jlocutions.push(jlocution);
        }
    }

    for (var i = 0, l = edges.length; i < l; i++) {
        var jedge = {};
        jedge['fromID'] = edges[i].from.id;
        jedge['toID'] = edges[i].to.id;
        jedges.push(jedge);
    }

    for (var i = 0, l = participants.length; i < l; i++) {
        var jparticipant = {};
        jparticipant['participantID'] = participants[i].id;
        jparticipant['firstname'] = participants[i].firstname;
        jparticipant['surname'] = participants[i].surname;
        jparticipants.push(jparticipant);
    }

    json['nodes'] = jnodes;
    json['edges'] = jedges;
    json['schemefulfillments'] = jschemefulfillments;
    json['participants'] = jparticipants;
    json['locutions'] = jlocutions;

    jstring = JSON.stringify(json);
    console.log(jstring);

    $.post("ul/index.php", { data: JSON.stringify(json) },
        function(reply) {
            console.log(reply);
            var rs = reply.split(" ");
            var nsID = rs[rs.length-1]
            var dbURL = window.DBurl+"/argview/"+nsID;
            var dbLink = "<a href='"+dbURL+"' target='_blank'>"+dbURL+"</a>";
            $.getJSON( "helpers/corporalist.php", function(data) {
                $('#m_load').hide();
                $('#m_content').html("<p style='font-weight:700'>Uploaded to database:</p>"+dbLink+"<br /><p style='font-weight:700'>Add to corpus:</p>");

                var s = $("<select id=\"s_corpus\" name=\"s_corpus\" />");
                $.each(data.corpora, function(idx, c) {
                    if(c.locked == 0){
                        title = c.title.replace(/&amp;#/g, "&#");
			$("<option />", {value: c.corpusID, html: title}).appendTo(s);
                    }
                });
                s.appendTo('#m_content');

                $('<p style="text-align:right"><input type="button" value="Add to corpus" onClick="add2corpus('+nsID+');" /></p>').appendTo('#m_content');

                if("aifdb" in getUrlVars()){
                    olddbid = getUrlVars()["aifdb"];
                    $.getJSON( "helpers/incorpora.php?nodesetID="+olddbid, function(crpdata) {
                        var ncrp = 0;
                        $.each(crpdata.corpora, function(idx, c) {
                            if(ncrp == 0){
                                $('<p style="font-weight:700">Replace in existing corpora:</p>').appendTo('#m_content');
                            }
                            ncrp = ncrp+1;
                            title = c.title.replace(/&amp;#/g, "&#");
                            $('<p><input type="checkbox" class="rccb" name="add'+c.id+'" value="'+c.id+'" checked="checked"> '+title+'</p>').appendTo('#m_content');
                        });
                        if(ncrp > 0){
                            $('<p style="text-align:right"><input type="button" value="Replace in corpora" onClick="rpl2corpus('+nsID+','+olddbid+');" /></p>').appendTo('#m_content');
                        }
                        $('#m_content').show();
                    });
                }else{
                    $('#m_content').show();
                }

                $('#m_content').show();
            });

            var url = getUrlVars()["url"];
            if(url == 'local'){
                txt = getAllText();
            }else{
                txt = url;
            }
            var txtdata = {
                "txt" : txt,
            };
            $.post("helpers/textpost.php?nsID="+nsID, txtdata,
                function(reply) {
                    return 0;
                }
            );
            $.post("db/ul.php?ns="+nsID, { data: genjson() },
                function(reply) {
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
    $.get( "helpers/corporapost.php?nsID="+addnsID+"&cID="+cID, function(data) {
        $('#modal-save2db').hide();
        $('#modal-bg').hide();
    }).fail(function() {
        alert( "Unable to add to corpus" );
    });
}

function rpl2corpus(addnsID, rplnsID) {
    $('.rccb:checkbox:checked').each(function () {
        crpID = $(this).val();
        $.get( "helpers/corporapost.php?nsID="+addnsID+"&cID="+crpID, function() {}).fail(function() {
            alert( "Unable to add to corpus" );
        });

        $.get( "helpers/corporadel.php?nsID="+rplnsID+"&cID="+crpID, function() {}).fail(function() {
            alert( "Unable to delete from corpus" );
        });
    });

    $('#modal-save2db').hide();
    $('#modal-bg').hide();
}

function canvas2image() {
    var maxx = 0;
    var maxy = 0;
    var minx = 99999;
    var miny = 99999;
    for (var i = 0; i < nodes.length; i++) {
        n = nodes[i];
        if(n.x < minx){
            minx = n.x;
        }
        if(n.y < miny){
            miny = n.y;
        }
        if((n.x+n.w) > maxx){
            maxx = n.x+n.w;
        }
        if((n.y+n.h) > maxy){
            maxy = n.y+n.h;
        }
    }
    var canvas  = document.getElementById("canvas");
    var tempCanvas = document.createElement("canvas"),
    tw = (maxx - minx) + 140;
    th = (maxy - miny) + 140;
    tCtx = tempCanvas.getContext("2d");

    ratio = PIXEL_RATIO;
    tCtx.scale(1/ratio, 1/ratio);

    tempCanvas.width = tw * ratio;
    tempCanvas.height = th * ratio;
    tCtx.drawImage(canvas,20-minx,20-miny);
    var dataUrl = tempCanvas.toDataURL("image/png");
    window.unsaved = false;
    closePopupIfOpen("Argument Map");
    var amw = window.open("", "Argument Map", "width="+tw+",height="+th+",toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,copyhistory=no,resizable=yes");
    amw.document.write("<img src='"+dataUrl+"' width="+tw+" />");
    amw.focus();
}

function closePopupIfOpen(popupName){
  if(typeof(window[popupName]) != 'undefined' && !window[popupName].closed){
    window[popupName].close();
  }
}
*/
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
