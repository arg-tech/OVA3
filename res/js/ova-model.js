var nodes = [];
var edges = [];
var participants = [];
var images = [];

/**
 * Constructor for a node
 */
function Node() {
    this.nodeID = '';
    this.type = '';
    this.scheme = null;
    this.descriptors = [];
    this.cqdesc = [];
    this.participantID = 0;
    this.text = '';
    this.x = 0;
    this.y = 0;
    this.visible = true;
    this.timestamp = '';
    this.marked = false;
    this.wildcardedText = '';
    this.wildcardedType = '';
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
 * @param {Boolean} post - Optional, indicates if the node should be added to the database (true) or not (false). The default is true.
 * @returns {Node} n - The new node that was created
 */
function newNode(nodeID, type, scheme, participantID, text, x, y, visible, undone, timestamp, marked, post) {
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
    n.wildcardedText = text;
    n.wildcardedType = type;
    nodes.push(n);

    var undone = typeof undone !== 'undefined' ? undone : 0;
    var post = typeof post !== 'undefined' ? post : true;
    if (post) { postEdit("node", "add", n, undone, n.nodeID); }
    return n;
}

/**
 * Updates a node's attributes with the given parameter values
 * @param {String} nodeID - The ID of the node to update
 * @param {Number} x - The node's x coordinate
 * @param {Number} y - The node's y coordinate
 * @param {Boolean} visible - Optional, indicates if the node should be visible (true) or not (false). The default is true.
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 * @param {Boolean} post - Optional, indicates if the updated node should be added to the database (true) or not (false). The default is true.
 * @param {String} type - Optional, the type of node
 * @param {String} scheme - Optional, the ID of the scheme it fulfils or null if it doesn't fulfil a scheme
 * @param {String} text - Optional, the text the node contains
 * @param {String} timestamp - Optional, the node's timestamp value
 * @param {Boolean} marked - Optional, indicates if the node should be marked (true) or not (false). The default is false.
 */
function updateNode(nodeID, x, y, visible, undone, post, type, scheme, text, timestamp, marked) {
    var index = findNodeIndex(nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.x = x;
        n.y = y;
        n.visible = typeof visible !== 'undefined' ? visible : true;

        if (typeof type !== 'undefined') { n.type = type; }
        if (typeof scheme !== 'undefined') { n.scheme = scheme; }
        if (typeof text !== 'undefined') { n.text = text; }
        if (typeof timestamp !== 'undefined') { n.timestamp = timestamp; }
        if (typeof marked !== 'undefined') { n.marked = marked; }

        var undone = typeof undone !== 'undefined' ? undone : 0;
        var post = typeof post !== 'undefined' ? post : true;
        if (post) { postEdit("node", "edit", n, undone, n.nodeID); }
    }
}

/**
 * Handles updating wildcarded node properties when loading a file
 * @param {String} nodeID The ID of the node to update
 * @param {String} wildcardedText The wildcarded text of the node
 * @param {String} wildcardedType The wildcarded type of the node
 */
function updateNodeWildcardedProperties(nodeID, wildcardedText, wildcardedType) {
    var index = findNodeIndex(nodeID);
    if (index > -1) {
        n = nodes[index];

        // Fall back to node text/type 
        n.wildcardedText = (typeof wildcardedText !== 'undefined') ? wildcardedText : n.text;
        n.wildcardedType = (typeof wildcardedType !== 'undefined') ? wildcardedType : n.type;

        // Fall back if both wildcarded text/type and node text/type undefined
        if(typeof n.wildcardedText == 'undefined')
            n.wildcardedText = '';
        if(typeof n.wildcardedType == 'undefined')
            n.wildcardedType = '';
    }
}

/**
 * Updates a node's scheme
 * @param {String} nodeID - The ID of the node to update
 * @param {String} scheme - The ID of the scheme it fulfils or null if it doesn't fulfil a scheme
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 * @param {Boolean} post - Optional, indicates if the updated node should be added to the database (true) or not (false). The default is true.
 */
function updateNodeScheme(nodeID, scheme, undone, post) {
    var index = findNodeIndex(nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.scheme = scheme;
        var post = typeof post !== 'undefined' ? post : true;
        if (post) { postEdit("node", "edit", n, undone, n.nodeID); }
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
 * @param {Boolean} post - Optional, indicates if the updated node should be added to the database (true) or not (false). The default is true.
 */
function updateTimestamp(nodeID, timestamp, undone, post) {
    var index = findNodeIndex(nodeID);
    if (index > -1) { //if the node exists
        n = nodes[index];
        n.timestamp = timestamp;
        var undone = typeof undone !== 'undefined' ? undone : 0;
        var post = typeof post !== 'undefined' ? post : true;
        if (post) { postEdit("node", "edit", n, undone, n.nodeID); }
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
 * @param {Boolean} post - Optional, indicates if the edge should be added to the database (true) or not (false). The default is true.
 * @returns {Edge} e - The new edge that was created
 */
function newEdge(fromID, toID, visible, undone, post) {
    var e = new Edge;
    e.fromID = fromID;
    e.toID = toID;
    e.visible = typeof visible !== 'undefined' ? visible : true;
    edges.push(e);

    var undone = typeof undone !== 'undefined' ? undone : 0;
    var post = typeof post !== 'undefined' ? post : true;
    if (post) { postEdit("edge", "add", e, undone); }
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
        text: fname + " " + sname
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
 * @returns {Array<String>} pname - An array containing 2 elements, the first name and the surname of the participant respectively
 */
function getParticipantName(text) {
    var pname = [];
    var index = text.indexOf(":");
    var str = text.slice(0, index);
    var names = str.split(" ");
    pname.push(names[0]);
    names.splice(0, 1);
    pname.push(names.join(" "));
    return pname;
}

/**
 * Constructor for a descriptor
 */
function Descriptor() {
    this.descriptorID = '';
    this.type = '';
    this.selectedID = '';
}

/**
 * Creates a descriptor with the given parameter values
 * @param {String} descriptorID - A string to identify the descriptor by
 * @param {String} type - The type of descriptor
 * @param {String} selectedID - The node ID of the selected text for the descriptor
 * @returns {Descriptor} d - The new descriptor that was created
 */
function newDescriptor(descriptorID, type, selectedID) {
    var d = new Descriptor;
    d.descriptorID = descriptorID;
    d.type = type;
    d.selectedID = selectedID;
    return d;
}

/**
 * Adds a descriptor to a node
 * @param {String} nodeID - The ID of the node to add the descriptor to
 * @param {Boolean} cq - Indicates if the descriptor is a critical question (true) or not (false)
 * @param {String} descriptorID - The ID of the descriptor to add
 * @param {String} scheme - The type of descriptor to add
 * @param {String} selectedID - The node ID of the selected text for the descriptor to add
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 * @param {Boolean} post - Optional, indicates if the updated node should be added to the database (true) or not (false). The default is true.
 */
function addNodeDescriptor(nodeID, cq, descriptorID, type, selectedID, undone, post) {
    var index = findNodeIndex(nodeID);
    if (index > -1) { //if the node exists
        var n = nodes[index];
        var d = newDescriptor(descriptorID, type, selectedID);
        if (cq) { n.cqdesc.push(d); }
        else { n.descriptors.push(d); }
        var post = typeof post !== 'undefined' ? post : true;
        if (post) { postEdit("node", "edit", n, undone, n.nodeID); }
    }
}

/**
 * Finds a node's descriptor's selected ID based on its type
 * @param {Node} node - The node to search the descriptors for
 * @param {String} type - The type of descriptor to search for
 * @returns {Number} - The selected ID found or zero if no selected ID was found
 */
function findSelectedID(node, type) {
    var found = node.descriptors.find(d => d.type == type);
    if (typeof found !== "undefined") {
        return found.selectedID;
    }
    return 0;
}