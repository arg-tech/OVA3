var nodes = [];
var edges = [];
var participants = [];
var images = [];


function Node() {
    this.nodeID = 0;
    this.type = '';
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

function newNode(nodeID, type, text, x, y){
    var n = new Node;
    n.nodeID = nodeID;
    n.type = type;
    n.text = text;
    n.x = x;
    n.y = y;
    nodes[nodeID] = n;
}

function updateNode(nodeID, type, text, x, y){
    n = nodes[nodeID];
    n.type = type;
    n.text = text;
    n.x = x;
    n.y = y;
}
