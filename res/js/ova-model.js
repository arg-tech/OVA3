var nodes = [];
var edges = [];
var participants = [];
var images = [];


function Node() {
    this.nodeID = 0;
    this.type = '';
    this.scheme = '';
    this.descriptors = {};
    this.participantID = 0;
    this.text = '';
    this.x = 0;
    this.y = 0;
    this.visible = true;
}

function Edge() {
    this.fromID = '';
    this.toID = '';
    this.visible = true;
}

function Participant() {
    this.participantID = 0;
    this.firstname = '';
    this.surname = '';
}

function newParticipant(id, fname, sname) {
    var p = new Participant;
    p.participantID = id;
    p.firstname = fname;
    p.surname = sname;
    $('#p_select').append($("<option/>", {
        value: p.participantID,
        text: firstname + " " + surname
    }));
    participants.push(p);
    return p;
}

function newNode(nodeID, type, scheme, participantID, text, x, y, visible, undone) {
    var n = new Node;
    n.nodeID = nodeID;
    n.type = type;
    n.scheme = scheme;
    n.participantID = participantID;
    n.text = text;
    n.x = x;
    n.y = y;
    n.visible = typeof visible !== 'undefined' ? visible : true;
    nodes.push(n);

    var undone = typeof undone !== 'undefined' ? undone : 0;
    postEdit("node", "add", n, undone, n.nodeID);
    return n;
}

function updateNode(nodeID, x, y, visible, undone, type, scheme, text) {
    var index = findNodeIndex(nodeID);
    n = nodes[index];
    n.x = x;
    n.y = y;
    n.visible = typeof visible !== 'undefined' ? visible : true;
    
    if (type != undefined) { n.type = type; }
    if (scheme != undefined) { n.scheme = scheme; }
    if (text != undefined) { n.text = text; }

    window.groupID++;
    var undone = typeof undone !== 'undefined' ? undone : 0;
    postEdit("node", "edit", n, undone, n.nodeID);
}

function delNode(node) {
    var index = nodes.indexOf(node);
    if (index > -1) {
        nodes.splice(index, 1);
        postEdit("node", "delete", node, 0, node.nodeID);
    }
}

function newEdge(fromID, toID, visible, undone) {
    var e = new Edge;
    e.fromID = fromID;
    e.toID = toID;
    e.visible = typeof visible !== 'undefined' ? visible : true;
    edges.push(e);

    var undone = typeof undone !== 'undefined' ? undone : 0;
    postEdit("edge", "add", e, undone);
    return e;
}

function delEdge(edge) {
    var index = edges.indexOf(edge);
    if (index > -1) {
        postEdit("edge", "delete", edge);
        edges.splice(index, 1);
    }
}

function findParticipantID(firstname, surname) {
    var found = participants.find(p => p.firstname == firstname && p.surname == surname);
    if (typeof found !== "undefined") {
        return found.participantID;
    }
    return 0;
}

function findParticipantIDText(text) {
    var index = text.indexOf(":");
    var str = text.slice(0, index);
    var name = str.split(" ");
    var found = findParticipantID(name[0], name[1]);
    return found;
}
