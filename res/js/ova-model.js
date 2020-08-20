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
}

function Edge() {
    this.fromID = '';
    this.toID = '';
}

function Participant() {
    this.id;
    this.firstname = '';
    this.surname = '';
}

function newParticipant(id, fname, sname) {
  var p = new Participant;
  p.id = id;
  p.firstname = fname;
  p.surname = sname;
  $('#p_select').append($("<option/>", {
    value: p.id,
    text: firstname+" "+surname
}));
  participants.push(p);
  return p;
}

function newNode(nodeID, type, scheme, participantID, text, x, y){
    var n = new Node;
    n.nodeID = nodeID;
    n.type = type;
    n.scheme = scheme;
    n.participantID = participantID;
    n.text = text;
    n.x = x;
    n.y = y;
    nodes.push(n);
    return n;
}

function updateNode(nodeID, type, scheme, text, x, y){
    var index = findNodeIndex(nodeID);
    n = nodes[index];
    n.type = type;
    n.scheme = scheme;
    n.text = text;
    n.x = x;
    n.y = y;
}

function updateNodePosition(nodeID, x, y){
    var index = findNodeIndex(nodeID);
    n = nodes[index];
    n.x = x;
    n.y = y;
}

function newEdge(fromID, toID) {
  var e = new Edge;
  e.fromID = fromID;
  e.toID = toID;
  edges.push(e);
  return e;
}
