var SVGRoot = null;

var TrueCoords = null;
var GrabPoint = null;
var DragTarget = null;

var CurrentFocus = null;
var CurrentlyEditing = 0;
var editMode = false;

window.shiftPress = false;
window.nodeCounter = 1;
window.unsaved = false;

window.addEventListener('keydown', myKeyDown, true);
window.addEventListener('keyup', myKeyUp, true);

window.IATMode = false;
if ("plus" in getUrlVars()) {
    window.IATMode = true;
}

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
    TrueCoords = SVGRoot.createSVGPoint();
    GrabPoint = SVGRoot.createSVGPoint();
    Canvas = document.getElementById('Canvas');
    window.sessionid = $.now().toString() + Math.random().toString().substring(3, 8);

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
}

function getSelText() {
    var iframe = document.getElementById('left1');
    var txt = "";
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
            if (IATMode == false) {
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
            //postEdit("text", "edit", $('#ova_arg_area_div').html());
        }
    } else {
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        txt = iframe.contentWindow.getSelection().toString();
    }
    return txt;
}

function hlcurrent(nodeID) {
    span = document.getElementById("node" + nodeID);
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
    }
}

function remhl(nodeID) {
    var span;
    span = document.getElementById("node" + nodeID)
    if (span != null) {
        var text = span.textContent || span.innerText;
        var node = document.createTextNode(text);
        span.parentNode.replaceChild(node, span);
    }
}

function postEdit(type, action, content) {
    if (type == 'text') {
        $.post("helpers/edit.php", { type: type, action: action, cnt: content, akey: window.akey, sessionid: window.sessionid }).done(function (data) {
            dt = JSON.parse(data);
            //lastedit = dt.last;
        });
    } else {
        if (content == null) {
            alert("Error with " + type + " " + action);
        } else {
            $.post("helpers/edit.php", { type: type, action: action, cnt: JSON.stringify(content), akey: window.akey, sessionid: window.sessionid }).done(function (data) {
                dt = JSON.parse(data);
                //lastedit = dt.last;
            });
        }
    }
    window.unsaved = true;
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

    var ltext = (firstname + ' ' + surname + ': ').concat(t);
    var nindex = findNodeIndex(CurrentlyEditing);
    var n = nodes[nindex];
    var yCoord = n.y;
    if (nodes[nindex + 1]) {
        if (nodes[nindex + 1].type == 'L') {
            yCoord += 50;
        }
    }

    AddNode(ltext, 'L', '0', participantID, newLNodeID, (n.x + 450), yCoord);
    var index = findNodeIndex(newLNodeID);


    window.nodeCounter = window.nodeCounter + 1;
    var newYANodeID = window.nodeCounter;
    AddNode('Asserting', 'YA', '74', 0, newYANodeID, (n.x + 225), yCoord);

    var edge = newEdge(newLNodeID, newYANodeID);
    DrawEdge(newLNodeID, newYANodeID)
    UpdateEdge(edge);
    edge = newEdge(newYANodeID, CurrentlyEditing);
    DrawEdge(newYANodeID, CurrentlyEditing);
    UpdateEdge(edge);

    // span = document.getElementById("node"+newLNodeID);
    // span.className="highlighted";

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
        if ($('#p_surname').val() == '') {
            $('#p_surname').css('border-color', '#f00');
            return false;
        } else {
            $('#p_surname').css('border-color', '#bbb');
        }
    }
    addLocution(mySel);
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
            var nID = edges[i].fromID;
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
    showing = 0;

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
        $('#socialusers').show();
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

function iatModeOnOff() {
    if (window.IATMode) {
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