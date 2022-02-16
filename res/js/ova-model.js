var nodes = [];
var edges = [];
var participants = [];
var images = [];

/**
 * Constructor for a node
 */
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
    this.timestamp = '';
    this.marked = false;
}

/**
 * Creates a node with the given parameter values and adds it to the array of all nodes
 * @param {String} nodeID - A string to identify the node by
 * @param {String} type - The type of node
 * @param {String} scheme - The ID of the scheme it fulfils or null if it doesn't fulfil a scheme
 * @param {Number} participantID - The ID of its participant or zero if it doesn't have a participant
 * @param {String} text - The text the node contains
 * @param {Number} x - The node's x coordinate
 * @param {Number} y - The node's y coordinate
 * @param {Boolean} visible - Optional, indicates if the node should be visible (true) or not (false). The default is true.
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 * @param {String} timestamp - Optional, the node's timestamp value. The default is ''.
 * @param {Boolean} marked - Optional, indicates if the node should be marked (true) or not (false). The default is false.
 * @returns {Node} n - The new node that was created
 */
function newNode(nodeID, type, scheme, participantID, text, x, y, visible, undone, timestamp, marked) {
    var n = new Node;
    n.nodeID = nodeID;
    n.type = type;
    n.scheme = scheme;
    n.participantID = participantID;
    n.text = text;
    n.x = x;
    n.y = y;
    n.visible = typeof visible !== 'undefined' ? visible : true;
    n.timestamp = typeof timestamp !== 'undefined' ? timestamp : '';
    n.marked = typeof marked !== 'undefined' ? marked : false;
    nodes.push(n);

    var undone = typeof undone !== 'undefined' ? undone : 0;
    postEdit("node", "add", n, undone, n.nodeID);
    return n;
}

/**
 * Updates a node's attributes with the given parameter values
 * @param {String} nodeID - The ID of the node to update
 * @param {Number} x - The node's x coordinate
 * @param {Number} y - The node's y coordinate
 * @param {Boolean} visible - Optional, indicates if the node should be visible (true) or not (false). The default is true.
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 * @param {String} type - Optional, the type of node
 * @param {String} scheme - Optional, the ID of the scheme it fulfils or null if it doesn't fulfil a scheme
 * @param {String} text - Optional, the text the node contains
 * @param {String} timestamp - Optional, the node's timestamp value
 * @param {Boolean} marked - Optional, indicates if the node should be marked (true) or not (false). The default is false.
 */
function updateNode(nodeID, x, y, visible, undone, type, scheme, text, timestamp, marked) {
    var index = findNodeIndex(nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.x = x;
        n.y = y;
        n.visible = typeof visible !== 'undefined' ? visible : true;

        if (type != undefined) { n.type = type; }
        if (scheme != undefined) { n.scheme = scheme; }
        if (text != undefined) { n.text = text; }
        if (timestamp != undefined) { n.timestamp = timestamp; }
        if (marked != undefined) { n.marked = marked; }

        var undone = typeof undone !== 'undefined' ? undone : 0;
        postEdit("node", "edit", n, undone, n.nodeID);
    }
}

/**
 * Updates a node's scheme
 * @param {String} nodeID - The ID of the node to update
 * @param {String} scheme - The ID of the scheme it fulfils or null if it doesn't fulfil a scheme
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 */
function updateNodeScheme(nodeID, scheme, undone) {
    var index = findNodeIndex(nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.scheme = scheme;
        postEdit("node", "edit", n, undone, n.nodeID);
    }
}

/**
 * Deletes the given node
 * @param {Node} node - The node to be deleted
 */
function delNode(node) {
    var index = findNodeIndex(node.nodeID);
    if (index > -1) { //if the node exists
        nodes.splice(index, 1);
        postEdit("node", "delete", node, 0, node.nodeID);
    }
}

/**
 * Resets a node's timestamp to the default value of ''
 * @param {String} nodeID - The ID of the node to update
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 */
function delTimestamp(nodeID, undone) {
    var index = findNodeIndex(nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.timestamp = '';
        window.groupID++;
        var undone = typeof undone !== 'undefined' ? undone : 0;
        postEdit("node", "edit", n, undone, n.nodeID);
    }
}

/**
 * Updates the timestamp of a node
 * @param {String} nodeID - The ID of the node to update
 * @param {String} timestamp - The value to set the node's timestamp to
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 */
function updateTimestamp(nodeID, timestamp, undone) {
    var index = findNodeIndex(nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.timestamp = timestamp;
        window.groupID++;
        var undone = typeof undone !== 'undefined' ? undone : 0;
        postEdit("node", "edit", n, undone, n.nodeID);
    }
}

/**
 * Sets if a node is marked or not
 * @param {String} nodeID - The ID of the node to update
 * @param {Boolean} marked - Indicates if the node should be marked (true) or not (false)
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 */
 function setMarked(nodeID, marked, undone) {
    var index = findNodeIndex(nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.marked = marked;
        var undone = typeof undone !== 'undefined' ? undone : 0;
        postEdit("node", "edit", n, undone, n.nodeID);
    }
}

/**
 * Constructor for an edge
 */
function Edge() {
    this.fromID = '';
    this.toID = '';
    this.visible = true;
}

/**
 * Creates an edge with the given parameter values and adds it to the array of all edges
 * @param {String} fromID - The ID of the node the edge connects from
 * @param {String} toID - The ID of the node the edge connects to
 * @param {Boolean} visible - Optional, indicates if the edge should be visible (true) or not (false)
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 * @returns {Edge} e - The new edge that was created
 */
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

/**
 * Deletes the given edge
 * @param {Edge} edge - The edge to be deleted
 */
function delEdge(edge) {
    var index = edges.indexOf(edge);
    if (index > -1) {
        postEdit("edge", "delete", edge);
        edges.splice(index, 1);
    }
}

/**
 * Constructor for a participant
 */
function Participant() {
    this.participantID = 0;
    this.firstname = '';
    this.surname = '';
}

/**
 * Creates a participant with the given parameter values and adds it to the array of participants
 * @param {Number} id - The ID for this participant
 * @param {String} fname - The first name of the participant
 * @param {String} sname - The surname of the participant
 * @returns {Participant} p - The new participant that was created
 */
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

/**
 * Finds a participant's ID based on the first name and surname
 * @param {String} firstname - The first name of the participant
 * @param {String} surname - The surname of the participant
 * @returns {Number} - The participant ID found or zero if no participant ID was found
 */
function findParticipantID(firstname, surname) {
    var found = participants.find(p => p.firstname == firstname && p.surname == surname);
    if (typeof found !== "undefined") {
        return found.participantID;
    }
    return 0;
}

/**
 * Finds a participant's ID
 * @param {String} text - The text containing the participant's name
 * @returns {Number} found - The participant ID found or zero if no participant ID was found
 */
function findParticipantIDText(text) {
    var index = text.indexOf(":");
    var str = text.slice(0, index);
    var name = str.split(" ");
    var found = findParticipantID(name[0], name[1]);
    return found;
}

/**
 * Gets and separates a participant's name from text containing it
 * @param {String} text - The text containing the participant's name
 * @returns {Array} name - The name of the participant
 */
function getParticipantName(text) {
    var index = text.indexOf(":");
    var str = text.slice(0, index);
    var name = str.split(" ");
    return name;
}
