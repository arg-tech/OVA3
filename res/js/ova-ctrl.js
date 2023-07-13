/**
 * Handles the key down event
 * @param {*} e - The key down event to handle
 */
function myKeyDown(e) {
  var key = e.key.toLowerCase();
  if (!window.eBtn && (key == 'shift' || key == 's' || key == 'a' || key == 'c' || key == 'm')) { //add edge
    var analysisText = document.getElementById('analysis_text');
    var input = document.activeElement == analysisText || $(document.activeElement).is('input') || $(document.activeElement).is('textarea');
    if (!input) {
      if (key == 'a' || key == 'c') { edgeMode('atk'); } //add attacking edge
      else if (key == 'm') { edgeMode('ma'); } //add MA edge
      else { edgeMode('on'); } //add supporting edge
    }
  }
  else if (key == 'control') { //edit node on
    editMode = true;
  }
  else if (key in NAV_MAP) {
    panZoomMode(key);
  }
  else if (key == 'alt' && !(window.shiftPress || window.atkPress || window.maPress) && mSel.length == 0) { //multi select on
    multiSel[0] = true;
  }
}

/**
 * Handles the key up event
 * @param {*} e - The key up event to handle
 */
function myKeyUp(e) {
  var key = e.key.toLowerCase();
  if (key == 'shift' || key == 's' || key == 'a' || key == 'c' || key == 'm') { //add edge off
    edgeMode('off');
  }
  else if (key == 'control') { //edit node off
    editMode = false;
  }
  else if (key == 'alt') { //multi select off
    multiSel = [false, false, false];
  }
  else if (key == 'z' && e.ctrlKey) { //ctrl + z for undo shortcut
    undo();
  }
  else {
    var analysisText = document.getElementById('analysis_text');
    var input = document.activeElement == analysisText || $(document.activeElement).is('input') || $(document.activeElement).is('textarea');
    if (!input) {
      if (key == "r") { resetPosition(); } //reset view shortcut
      else if ((key == "backspace" || key == "delete") && typeof mySel !== 'undefined') { //delete node shortcut
        window.groupID++;
        deleteNode(mySel);
      }
    }
  }
}

/**
 * Handles panning and zooming
 * @param {String} key - Indicates if zooming in/out or panning in a direction ('+'/'-' or 'arrowup'/'arrowdown'/'arrowleft'/'arrowright')
 * @param {Boolean} recursive - Optional, indicates if the function should call itself (true) or not (false). The default is false.
 * @returns 
 */
function panZoomMode(key, recursive) {
  var textArea = document.getElementById('analysis_text');
  if (FormOpen == false && textArea !== document.activeElement) {
    nav = NAV_MAP[key];
    if (nav.act === 'move') {
      tg[nav.axis] = parseFloat(VB[nav.axis] + .1 * nav.dir * VB[2]);
    }
    else if (nav.act == 'zoom') {
      //If at maximum 'zoomed out' view or 'zoomed in' view
      if ((nav.dir === -1 && VB[2] >= DMAX[0]) ||
        (nav.dir === 1 && VB[2] <= WMIN)) {
        return
      }

      //for each direction (horizontal and vertical)
      for (let i = 0; i < 2; i++) {
        //setting target size along current axis
        tg[i + 2] = parseFloat(VB[i + 2] / Math.pow(1.3, nav.dir)).toFixed(5);

        tg[i] = VB[i]
      }
    }
    updateView();

    if (recursive) { panZoomID = setTimeout(panZoomMode, 300, key, true); }
  }
}

/**
 * Updates the view box for the SVG
 * @returns 
 */
function updateView() {
  //progress k - frame index updated over total number of frames
  let k = ++f / NF
  j = 1 - k
  //current view box
  cvb = VB.slice();

  if (nav.act === 'zoom') {
    for (let i = 0; i < 4; i++)
      cvb[i] = parseFloat(j * VB[i] + k * tg[i]);
  }
  else if (nav.act === 'move') {
    cvb[nav.axis] = parseFloat(j * VB[nav.axis] + k * tg[nav.axis]);
  }
  SVGRoot.setAttribute('viewBox', cvb.join(' '));

  //if f reaches total number of frames - stop animation
  if (!(f % NF)) {
    f = 0;
    VB.splice(0, 4, ...cvb);
    nav = {};
    tg = Array(4);
    stopAni();
    return;
  }
  rID = requestAnimationFrame(updateView);
}

/**
 * Stops the requested animation
 */
function stopAni() {
  cancelAnimationFrame(rID);
  rID = null;
}

/**
 * Resets the SVG's view box to be centered on the first SVG node or the default position of 0,0 if no nodes are drawn on the SVG
 */
function resetPosition() {
  var mw = $("#mainwrap").width();
  $("#right1").width(mw - $("#left1").width() - 41);

  var allRects = document.getElementsByTagName('rect');
  var lowXY = { "x": 0, "y": 0 };
  if (allRects.length > 1) { //find the SVG node with the lowest y coordinate
    allRects = Array.from(allRects).sort((a, b) => parseInt(a.getAttribute('y')) - parseInt(b.getAttribute('y')));
    lowXY = { "x": allRects[0].getAttribute('x') - 100, "y": allRects[0].getAttribute('y') - 50 };
  }
  //update the view box
  VB = [lowXY.x, lowXY.y, 1500, 1500];
  SVGRoot.setAttribute('viewBox', [lowXY.x, lowXY.y, 1500, 1500]);
}

/**
 * Handles turning the edge mode (for adding edges) on and off
 * @param {String} status - 'on' for adding RAs, 'atk' for adding CAs, 'ma' for adding MAs, 
 * 'switch' for switching to the next type or 'off' for turning it off again
 */
function edgeMode(status) {
  var mw = $("#mainwrap").width();
  $("#right1").width(mw - $("#left1").width() - 41);

  if (status == 'switch') {
    if (window.shiftPress) {
      status = 'atk';
    } else if (window.atkPress) {
      status = 'ma';
    } else if (window.maPress) {
      status = 'off';
    } else {
      status = 'on';
    }
  }

  //reset the defaults
  window.eBtn = true;
  window.shiftPress = false; window.atkPress = false; window.maPress = false;
  $('#eadd').removeClass("attack support rephrase"); $('#eaddX').removeClass("attack support rephrase");
  document.getElementById("right1").style.cursor = 'crosshair';

  if (status == 'off') {
    window.eBtn = false;
    if (window.longEdge[0]) { delSVGTemp(); }
    window.longEdge = [false, false];
    document.getElementById("right1").style.cursor = 'auto';
  } else if (status == 'on') {
    window.shiftPress = true;
    $('#eadd').addClass("support"); $('#eaddX').addClass("support");
  } else if (status == 'atk') {
    window.atkPress = true;
    $('#eadd').addClass("attack"); $('#eaddX').addClass("attack");
  } else if (status == 'ma') {
    window.maPress = true;
    $('#eadd').addClass("rephrase"); $('#eaddX').addClass("rephrase");
  } else if (status == 'long') {
    window.shiftPress = true;
    window.longEdge[0] = true;
    $('#eadd').addClass("support"); $('#eaddX').addClass("support");
  }
}

/**
 * Handles turning the node mode (for adding nodes) on and off
 * @param {String} status - 'on' for turning it on, 'off' for turning it off or 'switch' to toggle it
 */
function nodeMode(status) {
  if (status == 'switch' && window.nodeAddBtn) {
    status = 'off';
  } else if (status == 'switch') {
    status = 'on';
  }

  if (status == 'on') {
    window.nodeAddBtn = true;
    document.getElementById("right1").style.cursor = 'crosshair';
    $('#nadd').addClass("active"); $('#naddX').addClass("active");
  } else {
    window.nodeAddBtn = false;
    document.getElementById("right1").style.cursor = 'auto';
    $('#nadd').removeClass("active"); $('#naddX').removeClass("active");
  }
}

/**
 * Handles the mouse down event to enable grabbing on the SVG
 * @param {*} evt - The mouse down event to handle
 * @returns 
 */
function Grab(evt) {
  $("#contextmenu").hide();

  if (window.reselectSpan) {
    getSelText();
    window.reselectSpan = false;
    clearSelText();
    if (mySel.marked) { markNode(mySel, false); }
    return;
  }

  if (evt.button != 0 && !longEdge[0]) { //disable right click when in the middle of adding a long distance edge
    myRClick(evt);
    return;
  }

  GetTrueCoords(evt);
  if (evt.target.nodeName == 'rect') {
    var targetElement = evt.target.parentNode;
  } else if (evt.target.nodeName == 'tspan') {
    var targetElement = evt.target.parentNode.parentNode;
  } else {
    var targetElement = evt.target;
  }

  if (targetElement.getAttributeNS(null, 'focusable')) {
    if (window.shiftPress || window.atkPress || window.maPress) { //if adding an edge
      FromNode = targetElement;
      FromID = FromNode.getAttributeNS(null, 'id');
      edge_to = AddPt(TrueCoords.x, TrueCoords.y);
      DragTarget = edge_to;

      var nedge = document.createElementNS("http://www.w3.org/2000/svg", "path");
      nedge.setAttribute('id', 'n' + FromID + '-nedge_to');
      nedge.setAttribute('stroke-width', '1');
      nedge.setAttribute('fill', 'none');
      nedge.setAttribute('stroke', 'black');
      nedge.setAttribute('d', 'M80,30 C200,30 30,380 200,380');
      nedge.setAttribute('marker-end', 'url(#head)');
      SVGRootG.insertBefore(nedge, SVGRootG.childNodes[0]);

      var edge = new Edge;
      edge.fromID = FromID;
      edge.toID = 'edge_to';
      dragEdges.push(edge);
      UpdateEdge(edge);

      GrabPoint.x = TrueCoords.x;
      GrabPoint.y = TrueCoords.y;

      Focus(evt, targetElement);
    }
    else if (window.longEdge[1]) {
      //do nothing
    }
    else if (editMode) {
      var index = findNodeIndex(targetElement.id);
      mySel = nodes[index];
      CurrentlyEditing = targetElement.id;
      editpopup(nodes[index]);
      editMode = false;
      return;
    }
    else {
      DragTarget = targetElement;
      DragTarget.setAttributeNS(null, 'pointer-events', 'none');

      DragID = DragTarget.getAttributeNS(null, 'id');
      GetEdges(DragID);

      // move any connected edges to the "top" of the display
      var e, svgE = null, svgNF = null;
      for (var i = 0; i < dragEdges.length; i++) {
        e = dragEdges[i];
        svgE = document.getElementById("n" + e.fromID + "-n" + e.toID);
        if (svgE) {
          DragTarget.parentNode.appendChild(svgE);
          svgNF = document.getElementById(e.fromID);
          if (svgNF) { DragTarget.parentNode.appendChild(svgNF); } //keep the from node in front of its edge
          else { console.log("No SVG node found for fromID: " + e.fromID); }
        }
      }
      // move this focusElement to the "top" of the display
      DragTarget.parentNode.appendChild(DragTarget);

      GrabPoint.x = TrueCoords.x;
      GrabPoint.y = TrueCoords.y;

      Focus(evt, targetElement);
      var index = findNodeIndex(DragID);
      mySel = nodes[index];
      CurrentlyEditing = DragID;
    }
  }
  else {
    if (window.longEdge[0]) {
      //do nothing
    }
    else if (window.nodeAddBtn) {
      window.groupID++;
      window.nodeCounter++;
      newNodeID = (window.nodeCounter + "_" + window.sessionid);
      AddNode("", 'EN', null, 0, newNodeID, TrueCoords.x, TrueCoords.y - 10);
      var index = findNodeIndex(newNodeID, true);
      mySel = nodes[index];
      CurrentlyEditing = newNodeID;
      editpopup(nodes[index]);
      nodeMode('off');
      return;
    }
    else if (multiSel[0]) { //if multi select is on
      multiSelRect.startX = TrueCoords.x;
      multiSelRect.startY = TrueCoords.y;
      multiSel[1] = true; //indicates the starting coords have been selected
    }
    else {
      t = getSelText();
      if (t != '') {
        window.nodeCounter++;
        var newNodeID = (window.nodeCounter + "_" + window.sessionid);
        var timestamp = '';
        if (window.addTimestamps) {
          timestamp = getTimestamp(newNodeID);
          timestamp = !timestamp ? '' : timestamp;
        }
        if (window.rIATMode) {
          AddNode(t, 'I', null, 0, newNodeID, TrueCoords.x, TrueCoords.y - 10, true, 0, timestamp);
          var nIndex = findNodeIndex(newNodeID, true);
          mySel = nodes[nIndex];
          CurrentlyEditing = mySel.nodeID;
          openModal('#locution_add');
        } else {
          AddNode(t, 'I', null, 0, newNodeID, TrueCoords.x, TrueCoords.y - 10, true, 0, timestamp);
          var nIndex = findNodeIndex(newNodeID, true);
          mySel = nodes[nIndex];
        }
        clearSelText();
      }
      else if (targetElement.id == 'inline') {
        DragPan = true;
        GrabPoint = getCoords(evt);
        $('#inline').css('cursor', 'grabbing');
      }
    }
  }
}

/**
 * Calculates a timestamp for a node
 * @param {String} nodeID - The ID of the node to calculate the timestamp for
 * @returns - The calculated timestamp or false if no timestamp could be calculated
 */
function getTimestamp(nodeID) {
  var iframe = document.getElementById('analysis_text');
  if (iframe !== null && iframe.getAttribute("style") === "display:none;") { //if url loaded into LHS
    tstamp = Math.round(new Date(window.startdatestmp).getTime());
    var tsd = new Date();
    tsd.setTime(tstamp);
    return tsd.toString().split(" (")[0];
  } else if (iframe.nodeName.toLowerCase() == 'div') {
    htmlContent = iframe.innerHTML

    // GET TIMESTAMPS FROM TEXT
    var r1 = /\[[0-9][0-9]:[0-9][0-9]:[0-9][0-9]\]/;
    var timestamps = [];
    var re = new RegExp(r1, "g");
    while ((match = re.exec(htmlContent)) != null) {
      timestamps.push([match.index + match[0].length, match[0].substring(1, match[0].length - 1)]);
    }

    // GET SPAN POSITION FROM TEXT
    var r2 = "<[^>]*node" + nodeID + "[^0-9][^>]*>[^<]*</span>";
    var re = new RegExp(r2, "g");
    while ((match = re.exec(htmlContent)) != null) {
      var beforei = 0;
      beforet = '00:00:00';
      afteri = htmlContent.length;
      aftert = '';
      for (index = 0; index < timestamps.length; ++index) {
        if (timestamps[index][0] < match.index) {
          beforei = timestamps[index][0];
          beforet = timestamps[index][1];
        } else if (timestamps[index][0] > match.index) {
          afteri = timestamps[index][0];
          aftert = timestamps[index][1];
          break;
        }
      }
      var matchx = match;
      break;
    }

    // TEXT BEFORE/AFTER AND PERCENT THROUGH
    if (typeof matchx == 'undefined') { return false; }
    turnbefore = striphtml(htmlContent.substring(beforei, matchx.index));
    turnafter = striphtml(htmlContent.substring(matchx.index + matchx[0].length, afteri));
    pcthru = turnbefore.length / (turnbefore.length + turnafter.length);

    // TIMESTAMP CALCULATION
    charpermillisec = 0.01;
    if (aftert == '') {
      startut = Math.round(new Date(window.startdatestmp).getTime());
      baseut = Math.round(new Date("2000/01/01 00:00:00").getTime());
      beforeut = Math.round(new Date("2000/01/01 " + beforet).getTime());
      timeinprog = beforeut + (turnbefore.length / charpermillisec);
      timeoffset = timeinprog - baseut;
      tstamp = startut + timeoffset;

      var tsd = new Date();
      tsd.setTime(tstamp);
      return tsd.toString().split(" (")[0];
    } else {
      startut = Math.round(new Date(startdatestmp).getTime());
      baseut = Math.round(new Date("2000/01/01 00:00:00").getTime());
      beforeut = Math.round(new Date("2000/01/01 " + beforet).getTime());
      afterut = Math.round(new Date("2000/01/01 " + aftert).getTime());
      timeinprog = beforeut + ((afterut - beforeut) * pcthru);
      timeoffset = timeinprog - baseut;
      tstamp = startut + timeoffset;

      var tsd = new Date();
      tsd.setTime(tstamp);
      return tsd.toString().split(" (")[0];
    }
  }
  return false;
}

/**
 * Gets the start date and time for the timestamps from the analysis text.
 * Note: only takes the first start date and time found.
 * @returns {Boolean} - Indicates if a start date and time was found (true) or not (false)
 */
function getTimestampStart() {
  if (!window.dialogicalMode) { return false; } //only use timestamps in dialogical mode

  var iframe = document.getElementById('analysis_text');
  if (iframe !== null && iframe.getAttribute("style") === "display:none;") { //if url loaded into LHS
    return false;
  } else if (iframe.nodeName.toLowerCase() == 'div') {
    var toCheck = iframe.innerHTML;
    var datetimestamps = [];

    //start date time format: 'yyyy/mm/dd hh:mm:ss GMT+hhmm' or 'yyyy/mm/dd hh:mm:ss GMT-hhmm'
    var r = /\[(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\sGMT(\+|-)\d{4})\]/;

    var re = new RegExp(r, "g");
    while ((match = re.exec(toCheck)) != null) {
      datetimestamps.push([match.index + match[0].length, match[1]]);
    }

    if (datetimestamps.length > 0) {
      if (!window.addTimestamps) { //turn on adding timestamps if needed
        window.addTimestamps = true;
        $("#timestamptoggle").toggleClass("on off");
      }
      if (!window.showTimestamps) { //turn on showing timestamps if needed
        window.showTimestamps = true;
        $("#showTimestamptoggle").toggleClass("on off");
        showTimestampsOnOff();
      }
      if (window.startdatestmp != datetimestamps[0][1]) {
        setTimestampStart(datetimestamps[0][1]);
        alert("Updated the start date time to '" + datetimestamps[0][1] + "' Turned on adding and showing timestamps.");
      }
      return true;
    }
  }
  return false;
}

/**
 * Calculates and updates the timestamps for all locution nodes selected through the multiselect
 */
function updateTimestamps() {
  window.groupID++;
  var timestamp = '', rect;
  for (var i = 0; i < mSel.length; i++) {
    if (mSel[i].type == "L") {
      timestamp = getTimestamp(mSel[i].nodeID);
      if (!timestamp) { console.log('could not calculate a timestamp for node: ' + mSel[i].nodeID); }
      timestamp = !timestamp ? '' : timestamp;
      updateTimestamp(mSel[i].nodeID, timestamp);
      if (window.showTimestamps) {
        removeTimestamps(mSel[i].nodeID);
        DrawTimestamp(mSel[i].nodeID, mSel[i].timestamp, mSel[i].x, mSel[i].y);
      }
    }
    //deselect the nodes
    rect = document.getElementById(mSel[i].nodeID).getElementsByTagName('rect')[0];
    rect.style.setProperty('stroke-width', 1);
  }
  mSel = [];
  multiSel = [false, false, false];
}

/**
 * Finds all edges that are connected to or from the given node and adds them to the dragEdges array.
 * @param {String} dragID - The nodeID of the node to find all edges connected to/from
 */
function GetEdges(dragID) {
  for (var j = 0; j < edges.length; j++) {
    if (edges[j].fromID == dragID) {
      dragEdges.push(edges[j]);
    }
    if (edges[j].toID == dragID) {
      dragEdges.push(edges[j]);
    }
  }
}

/**
 * Calculates the true coordinates after panning and zooming
 * @param {*} evt - The event to calculate coordinates for
 */
function GetTrueCoords(evt) {
  tsvg = document.getElementById('inline').getBoundingClientRect();
  svgleft = tsvg.left;
  svgtop = tsvg.top;
  var newScale = VB[2] / VB_width;
  var translationX = VB[0];
  var translationY = VB[1];
  var tempCoords = [0, 0];

  //Calculating new coordinates after panning and zooming
  tempCoords.x = (((evt.clientX - svgleft) * newScale) + translationX);
  tempCoords.y = (((evt.clientY - svgtop) * newScale) + translationY);

  TrueCoords.x = Math.round(tempCoords.x);
  TrueCoords.y = Math.round(tempCoords.y);

}

/**
 * Calculates the coordinates for a point on the SVG where a given event occured
 * @param {*} evt - The event to get coordinates for
 * @returns {Object} point - The x and y coordinates for the point on the SVG where the event occured
 */
function getCoords(evt) {
  var point = SVGRoot.createSVGPoint();
  point.x = evt.clientX;
  point.y = evt.clientY;
  var invertedSVGMatrix = SVGRoot.getScreenCTM().inverse();
  return point.matrixTransform(invertedSVGMatrix);
}

/**
 * Rounds a coordinate value to the nearest hundred
 * @param {Number} coord - The original coordinate value 
 * @returns {Number} The new rounded coordinate value
 */
function snapToGrid(coord) {
  coord = Math.round(coord / 100) * 100;
  return coord;
}

/**
 * Handles adding a node
 * @param {String} txt - The text the node contains
 * @param {String} type - The type of node
 * @param {String} scheme - The ID of the scheme it fulfils or null if it doesn't fulfil a scheme
 * @param {Number} pid - The ID of its participant or zero if it doesn't have a participant
 * @param {String} nid - A string to identify the node by
 * @param {Number} nx - The node's x coordinate
 * @param {Number} ny - The node's y coordinate
 * @param {Boolean} visible - Optional, indicates if the node should be visible (true) or not (false). The default is true.
 * @param {Number} undone - Optional, indicates if this edit can be undone (0) or not (1). The default is zero.
 * @param {String} timestamp - Optional, the node's timestamp value. The default is ''.
 * @param {Boolean} mark - Optional, indicates if the node should be marked (true) or not (false). The default is false.
 * @param {Boolean} post - Optional, indicates if the node should be added to the database (true) or not (false). The default is true.
 */
function AddNode(txt, type, scheme, pid, nid, nx, ny, visible, undone, timestamp, mark, post) {
  if (window.snapMode) {
    nx = snapToGrid(nx);
    ny = snapToGrid(ny);
  }
  var isVisible = typeof visible !== 'undefined' ? visible : true;
  var undone = typeof undone !== 'undefined' ? undone : 0;
  var timestamp = typeof timestamp !== 'undefined' ? timestamp : '';
  var mark = typeof mark !== 'undefined' ? mark : false;
  var post = typeof post !== 'undefined' ? post : true;
  newNode(nid, type, scheme, pid, txt, nx, ny, isVisible, undone, timestamp, mark, post); //create the node
  if (isVisible) {
    DrawNode(nid, type, txt, nx, ny, mark); //if the node is visible then draw the node on the svg

    if (type == 'L' && txt != "") { //create analyst nodes if they are needed
      //create YA analyst node
      window.nodeCounter++;
      var newNodeID = (window.nodeCounter + "_" + window.sessionid);
      var analysisYA = newNode(newNodeID, 'YA', '75', 0, 'Analysing', 0, 0, false);
      //create L analyst node
      window.nodeCounter++;
      newNodeID = (window.nodeCounter + "_" + window.sessionid);
      var analysisLTxt = window.afirstname + ': ' + txt;
      var analysisL = newNode(newNodeID, 'L', null, 0, analysisLTxt, 0, 0, false);
      //create edges to connect the analyst nodes
      newEdge(analysisYA.nodeID, nid, false);
      newEdge(analysisL.nodeID, analysisYA.nodeID, false);

      var username = ' ' + window.afirstname;
      if (users.indexOf(username) == -1) {
        users.push(username);
      }
    }
  }
}

/**
 * Handles the mouse move event to enable dragging on the SVG
 * @param {*} evt - The mouse move event to handle
 */
function Drag(evt) {
  GetTrueCoords(evt);
  if (DragPan) { //if panning the whole SVG
    var currentCoords = getCoords(evt);
    VB[0] -= currentCoords.x - GrabPoint.x;
    VB[1] -= currentCoords.y - GrabPoint.y;
    SVGRoot.setAttribute('viewBox', VB);
  }
  else if (DragTarget && !multiSel[0]) { //if moving nodes on the SVG
    var dx = (TrueCoords.x - GrabPoint.x);
    var dy = (TrueCoords.y - GrabPoint.y);
    GrabPoint.x = TrueCoords.x;
    GrabPoint.y = TrueCoords.y;

    if (mSel.length > 0) { //If moving multiple nodes
      var childElement, tchildren, cE;
      var oldX = 0, oldY = 0, newX = 0, newY = 0, coldX = 0, cnewX = 0;
      for (var i = 0; i < mSel.length; i++) {
        children = document.getElementById(mSel[i].nodeID).children;
        for (var j = 0; j < children.length; j++) {
          childElement = children[j];
          oldX = parseInt(childElement.getAttributeNS(null, 'x'));
          oldY = parseInt(childElement.getAttributeNS(null, 'y'));
          newX = Math.round(oldX + dx);
          newY = Math.round(oldY + dy);
          childElement.setAttributeNS(null, 'x', newX);
          childElement.setAttributeNS(null, 'y', newY);
          tchildren = childElement.getElementsByTagName('tspan')
          for (var k = 0; k < tchildren.length; k++) {
            cE = tchildren[k];
            coldX = parseInt(cE.getAttributeNS(null, 'x'));
            cnewX = Math.round(coldX + dx);
            cE.setAttributeNS(null, 'x', cnewX);
          }
        }
        GetEdges(mSel[i].nodeID);
        if (dragEdges.length > 0) {
          for (var j = 0; j < dragEdges.length; j++) {
            UpdateEdge(dragEdges[j]);
          }
        }
      }
    } else {
      // apply a new transform translation to the dragged focusElement, to display
      //    it in its new location
      var children = DragTarget.children;
      var childElement, tchildren, cE;
      var oldX = 0, oldY = 0, newX = 0, newY = 0, coldX = 0, cnewX = 0;
      for (var j = 0; j < children.length; j++) {
        childElement = children[j];
        oldX = childElement.getAttributeNS(null, 'x');
        oldY = childElement.getAttributeNS(null, 'y');
        newX = Math.round(parseInt(oldX) + dx);
        newY = Math.round(parseInt(oldY) + dy);
        childElement.setAttributeNS(null, 'x', newX);
        childElement.setAttributeNS(null, 'y', newY);
        tchildren = childElement.getElementsByTagName('tspan')
        for (var k = 0; k < tchildren.length; k++) {
          cE = tchildren[k];
          coldX = cE.getAttributeNS(null, 'x');
          cnewX = Math.round(parseInt(coldX) + dx);
          cE.setAttributeNS(null, 'x', cnewX);
        }
      }
      if (dragEdges.length > 0) {
        for (var j = 0; j < dragEdges.length; j++) {
          UpdateEdge(dragEdges[j]);
        }
      }
    }

  }
  else if (multiSel[1]) { //if the starting coords for multi select have already been selected
    var x = parseInt(multiSelRect.startX);
    var y = parseInt(multiSelRect.startY);
    if (!isNaN(x) && !isNaN(y)) {
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      var selbox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      g.setAttribute('id', 'multiSelBoxG');
      selbox.setAttribute('id', 'multiSelBox');
      if (TrueCoords.x > x) {
        selbox.setAttribute('x', x);
        selbox.setAttribute('width', (TrueCoords.x - x));
      } else {
        selbox.setAttribute('x', TrueCoords.x);
        selbox.setAttribute('width', (x - TrueCoords.x));
      }
      if (TrueCoords.y > y) {
        selbox.setAttribute('y', y);
        selbox.setAttribute('height', (TrueCoords.y - y));
      } else {
        selbox.setAttribute('y', TrueCoords.y);
        selbox.setAttribute('height', (y - TrueCoords.y));
      }
      selbox.setAttribute('style', 'fill:none;stroke:#a8a8a8;stroke-width:1;')
      // selbox.setAttribute('style', 'fill:none;stroke:#3498db;stroke-width:1;');
      g.append(selbox);
      updateBox(g);
    }
  }
}

/**
 * Updates the multiSelBox on the SVG by first removing any previous multiSelBox then appending the given element.
 * @param {*} g - The new multiSelBox element to add
 */
function updateBox(g) {
  if (document.getElementById('multiSelBox')) {
    document.getElementById('multiSelBox').remove();
    document.getElementById('multiSelBoxG').remove();
  }
  SVGRootG.append(g);
}

/**
 * Handles updating an edge drawn on the SVG
 * @param {Edge} e - The edge to update
 * @returns {Boolean} - Indicates if the edge was successfully updated (true) or not (false)
 */
function UpdateEdge(e) {
  if (!e.visible || e == null) { return false; } //if the edge is null or invisible, i.e. it isn't drawn on the svg, do nothing
  var edgeID = 'n' + e.fromID + '-n' + e.toID;
  var ee = document.getElementById(edgeID);
  var nodeFrom = document.getElementById(e.fromID);
  var nodeTo = document.getElementById(e.toID);
  if (nodeFrom == null || nodeTo == null || ee == null) { return false; } //if either of the nodes aren't drawn on the svg, do nothing
  var nf = nodeFrom.getElementsByTagName('rect')[0];
  var nt = nodeTo.getElementsByTagName('rect')[0];

  var fw = parseInt(nf.getAttributeNS(null, 'width'));
  var fh = parseInt(nf.getAttributeNS(null, 'height'));
  var tw = parseInt(nt.getAttributeNS(null, 'width'));
  var th = parseInt(nt.getAttributeNS(null, 'height'));

  var fx = parseInt(nf.getAttributeNS(null, 'x'));
  var fy = parseInt(nf.getAttributeNS(null, 'y'));
  var tx = parseInt(nt.getAttributeNS(null, 'x'));
  var ty = parseInt(nt.getAttributeNS(null, 'y'));

  var curve_offset = 80;
  var efx = fx + (fw / 2);
  var efy = fy + (fh / 2);
  var etx, ety, cp1x, cp1y, cp2x, cp2y;

  if (Math.abs(fy - ty) > Math.abs(fx - tx)) { // join top to bottom
    if (fy > ty) { // from below to
      if (fy - ty < curve_offset * 2) {
        curve_offset = (fy - ty) / 2;
      }
      // efx = fx + (fw/2);
      efy = fy;
      etx = tx + (tw / 2);
      ety = ty + th;
      cp1y = fy + (fh / 2) - curve_offset;
      cp2y = ety + curve_offset;
    } else {
      if (ty - fy < curve_offset * 2) {
        curve_offset = (ty - fy) / 2;
      }
      // efx = fx + (fw/2);
      efy = fy + fh;
      etx = tx + (tw / 2);
      ety = ty;
      cp1y = fy + (fh / 2) + curve_offset;
      cp2y = ety - curve_offset;
    }
    cp1x = efx;
    cp2x = etx;
  } else { // join side to side
    if (fx > tx) { // from right of to
      if (fx - tx < curve_offset * 2) {
        curve_offset = (fx - tx) / 2;
      }
      efx = fx;
      // efy = fy + (fh/2);
      etx = tx + tw;
      ety = ty + (th / 2);
      cp1x = fx + (fw / 2) - curve_offset;
      cp2x = etx + curve_offset;
    } else {
      if (tx - fx < curve_offset * 2) {
        curve_offset = (tx - fx) / 2;
      }
      efx = fx + fw;
      // efy = fy + (fh/2);
      etx = tx;
      ety = ty + (th / 2);
      cp1x = fx + (fw / 2) + curve_offset;
      cp2x = etx - curve_offset;
    }
    cp1y = efy;
    cp2y = ety;
  }

  pd = 'M' + efx + ',' + efy + ' C' + cp1x + ',' + cp1y + ' ' + cp2x + ',' + cp2y + ' ' + etx + ',' + ety;
  ee.setAttributeNS(null, 'd', pd);
  return true;
}

/**
 * Focuses on a given element
 * @param {*} evt - The event to handle
 * @param {*} focusElement - The element to focus on
 */
function Focus(evt, focusElement) {
  UnFocus(null, CurrentFocus);
  CurrentFocus = focusElement;
  currentIndex = CurrentFocus.getAttributeNS(null, 'nav-index');

  if (!CurrentFocus && evt) {
    CurrentFocus = evt.target;
  }

  if (CurrentFocus) {
    rect = focusElement.getElementsByTagName('rect')[0];
    rect.style.setProperty('stroke-width', 2);
    $('#node' + focusElement.id).addClass("hlcurrent"); //highlight any associated analysis text
  }
}

/**
 * Removes focus from a given element
 * @param {*} evt - The event to handle
 * @param {*} unfocusElement - The element to remove focus from
 */
function UnFocus(evt, unfocusElement) {
  var focusElement = unfocusElement;
  if (!unfocusElement && evt) {
    unfocusElement = evt.target;
  }

  if (unfocusElement) {
    rect = unfocusElement.getElementsByTagName('rect')[0];
    rect.style.setProperty('stroke-width', 1);
    $('#node' + focusElement.id).removeClass("hlcurrent"); //remove highlight from any associated analysis text
  }
}

/**
 * Deletes the temporary edge and temporary node, used for drawing edges, from the SVG
 * and resets the drag target
 */
function delSVGTemp() {
  if (FromID) { //delete the temp edge if it exists
    var tempEdge = document.getElementById('n' + FromID + '-nedge_to');
    if (tempEdge) { SVGRootG.removeChild(tempEdge); }
  }
  //delete the temp node if it exists
  var tempNode = document.getElementById("edge_to");
  if (tempNode) { SVGRootG.removeChild(tempNode); }
  //reset the drag target if needed
  if (DragTarget) {
    DragTarget.setAttributeNS(null, 'pointer-events', 'all');
    DragTarget = null;
  }
}

/**
 * Handles the mouse up event to enable dropping on the SVG
 * @param {*} evt - The mouse up event to handle
 * @returns 
 */
function Drop(evt) {
  if (DragPan) {
    DragPan = false;
    $('#inline').css('cursor', 'default');
    return;
  }
  if (DragTarget && mSel.length == 0) { //if a drag target has been set and not using multiselect
    var txt = DragTarget.children[1];
    if (typeof txt !== 'undefined') { //if a node was set as the drag target
      var xCoord = Math.round(txt.getAttributeNS(null, 'x'));
      var yCoord = Math.round(txt.getAttributeNS(null, 'y'));
      var index = findNodeIndex(DragTarget.id);
      if (nodes[index].x !== xCoord || nodes[index].y !== yCoord) { //if the node was moved
        if (window.snapMode) {
          xCoord = snapToGrid(xCoord);
          yCoord = snapToGrid(yCoord);
          DragTarget.remove();
          DrawNode(nodes[index].nodeID, nodes[index].type, nodes[index].text, xCoord, yCoord, nodes[index].marked);
          if (nodes[index].timestamp != "" && window.showTimestamps) {
            DrawTimestamp(nodes[index].nodeID, nodes[index].timestamp, xCoord, yCoord);
          }
          var edgesToUpdate = findEdges(nodes[index].nodeID);
          for (var i = 0; i < edgesToUpdate.length; i++) {
            UpdateEdge(edgesToUpdate[i]);
          }
        }
        window.groupID++;
        updateNode(DragTarget.id, xCoord, yCoord);
      }
    }

    //If drawing edge to node
    var targetElement;
    if (DragTarget.getAttributeNS(null, 'id') == 'edge_to') {
      if (evt.target.nodeName == 'rect') {
        targetElement = evt.target.parentNode;
      } else if (evt.target.nodeName == 'tspan') {
        targetElement = evt.target.parentNode.parentNode;
      } else if (evt.target.nodeName == 'path') { //if edge is drawn to an edge
        delSVGTemp(); return false;
      } else {
        targetElement = evt.target; console.log(targetElement);
      }

      if (evt.target.nodeName != 'svg') {
        var from = document.getElementById(FromID).getElementsByTagName('rect')[0];
        var to = targetElement.getElementsByTagName('rect')[0];

        var index = findNodeIndex(FromID);
        var nodeFrom = nodes[index].type;
        var nFrom = nodes[index];
        index = findNodeIndex(targetElement.getAttributeNS(null, 'id'));
        var nodeTo = nodes[index].type;
        var nTo = nodes[index];

        if (from == to) { //if the same node 
          if (window.longEdge[0]) { //if adding a long distance edge
            window.longEdge[1] = true;
            window.shiftPress = false;
            var displayText = document.getElementById('source_text');
            displayText.innerHTML = '"' + nFrom.text + '"';

            if (window.rIATMode) { //select suggested L source
              var id = nFrom.nodeID.split("_");
              var guessL = (parseInt(id[0]) + 1) + "_" + id[1]; //for OVA3 maps
              var guessL2 = (parseInt(id[0]) - 2) + "_" + id[1]; //for OVA2 maps loaded into OVA3
              if ($("#sel_source_L option[value='" + guessL + "']").length > 0) {
                $("#sel_source_L").val(guessL); //select it if it exists
              } else if ($("#sel_source_L option[value='" + guessL2 + "']").length > 0) {
                $("#sel_source_L").val(guessL2); //select it if it exists
              }
            }
            openModal('#modal-edge');

          } else {
            delSVGTemp();
          }
          return false;
        }

        fx = from.getAttributeNS(null, 'x');
        fy = from.getAttributeNS(null, 'y');
        fw = from.getAttributeNS(null, 'width');
        fh = from.getAttributeNS(null, 'height');
        tx = to.getAttributeNS(null, 'x');
        ty = to.getAttributeNS(null, 'y');
        tw = to.getAttributeNS(null, 'width');
        th = to.getAttributeNS(null, 'height');
        fx = parseInt(fx) + (parseInt(fw) / 2);
        fy = parseInt(fy) + (parseInt(fh) / 2);
        tx = parseInt(tx) + (parseInt(tw) / 2);
        ty = parseInt(ty) + (parseInt(th) / 2);

        window.groupID++;
        window.nodeCounter++;
        newNodeID = (window.nodeCounter + "_" + window.sessionid);
        nx = Math.round(((tx - fx) / 2) + fx);
        ny = Math.round(((ty - fy) / 2) + fy);

        if (window.atkPress && (nodeFrom == "I" || nodeFrom == "EN") && (nodeTo == "I" || nodeTo == "EN" || nodeTo == "L" || nodeTo == "RA")) { //incl. reported speech & undercutting
          AddNode('Default Conflict', 'CA', '71', 0, newNodeID, nx, ny);
        } else if (window.maPress && (nodeFrom == "I" || nodeFrom == "EN") && (nodeTo == "I" || nodeTo == "EN")) {
          AddNode('Default Rephrase', 'MA', '144', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "I" && nodeTo == "I") {
          AddNode('Default Inference', 'RA', '72', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "L" && nodeTo == "I") {
          AddNode('Asserting', 'YA', '74', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "L" && nodeTo == "L") {
          AddNode('Default Transition', 'TA', '82', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "TA" && nodeTo == "MA") {
          AddNode('Restating', 'YA', '101', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "TA" && nodeTo == "RA") {
          AddNode('Arguing', 'YA', '80', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "TA" && nodeTo == "CA") {
          AddNode('Disagreeing', 'YA', '78', 0, newNodeID, nx, ny);
        } else if ((nodeFrom == "I" && nodeTo == "RA") || (nodeFrom == "RA" && nodeTo == "I") || (nodeFrom == "EN" && nodeTo == "RA") || (nodeFrom == "RA" && nodeTo == "EN") || (nodeFrom == "L" && nodeTo == "TA") || (nodeFrom == "TA" && nodeTo == "L")) {
          //if linked argument don't add a node
          newNodeID = 'n' + nFrom.nodeID + '-n' + nTo.nodeID; //the new edge ID instead
        }
        else {
          AddNode('Default Inference', 'RA', '72', 0, newNodeID, nx, ny);
        }

        //If linked argument
        if ((nodeFrom == "RA" && nodeTo == "I") || (!window.atkPress && nodeFrom == "I" && nodeTo == "RA") || (!window.atkPress && nodeFrom == "EN" && nodeTo == "RA") || (nodeFrom == "RA" && nodeTo == "EN") || (nodeFrom == "L" && nodeTo == "TA") || (nodeFrom == "TA" && nodeTo == "L")) {
          //only draw edge
          DrawEdge(FromID, targetElement.getAttributeNS(null, 'id'));
          var edge = newEdge(FromID, targetElement.getAttributeNS(null, 'id'));
          UpdateEdge(edge);

          delSVGTemp();
        }
        else {
          //from -> S
          DrawEdge(FromID, newNodeID);
          var edge = newEdge(FromID, newNodeID);
          UpdateEdge(edge);

          //S -> to
          DrawEdge(newNodeID, targetElement.getAttributeNS(null, 'id'));
          var edge = newEdge(newNodeID, targetElement.getAttributeNS(null, 'id'));
          UpdateEdge(edge);

          delSVGTemp();
        }

        if (window.longEdge[1]) { //if adding a long distance edge
          var displayText = document.getElementById('target_text');
          displayText.innerHTML = '"' + nTo.text + '"';
          CurrentlyEditing = newNodeID;

          //center the view on the new edge that was added
          var newx = nx - 250;
          var newy = ny - 400;
          VB = [newx, newy, 1500, 1500];
          SVGRoot.setAttribute('viewBox', [newx, newy, 1500, 1500]);

          if (window.dialogicalMode && !(nodeFrom == "L" && nodeTo == "L")) {
            if (window.rIATMode) { //select suggested L target
              var id = nTo.nodeID.split("_");
              var guessL = (parseInt(id[0]) + 1) + "_" + id[1]; //for OVA3 maps
              var guessL2 = (parseInt(id[0]) - 2) + "_" + id[1]; //for OVA2 maps loaded into OVA3
              if ($("#sel_target_L option[value='" + guessL + "']").length > 0) {
                $("#sel_target_L").val(guessL); //select it if it exists
              } else if ($("#sel_target_L option[value='" + guessL2 + "']").length > 0) {
                $("#sel_target_L").val(guessL2); //select it if it exists
              }
            }
            $('#sourceBtn').hide(); $('#targetBtn').hide();
            openModal('#modal-edge');
          }
        }
      } else { //If edge is drawn to empty space and not to a node
        delSVGTemp();
      }
    } else {
      DragTarget.setAttributeNS(null, 'pointer-events', 'all');
      DragTarget = null;
    }

    if (window.eBtn) { //deselects the add edge icon button after adding an edge
      edgeMode('off');
    }
  }
  if (document.getElementById('multiSelBox')) {
    var box = document.getElementById('multiSelBox');
    var boxWidth = parseInt(box.getAttributeNS(null, 'width'));
    var boxHeight = parseInt(box.getAttributeNS(null, 'height'));
    var boxX = parseInt(box.getAttributeNS(null, 'x'));
    var boxY = parseInt(box.getAttributeNS(null, 'y'));
    var svgNode = null;
    for (var i = 0; i < nodes.length; i++) {
      if (!mSel.includes(nodes[i]) && nodes[i].x > boxX && nodes[i].x < boxX + boxWidth && nodes[i].y > boxY && nodes[i].y < boxY + boxHeight) {
        svgNode = document.getElementById(nodes[i].nodeID);
        if (svgNode != null && typeof svgNode != 'undefined') { //if the node is drawn on the svg
          mSel.push(nodes[i]);
          rect = svgNode.getElementsByTagName('rect')[0];
          rect.style.setProperty('stroke-width', 2);
        }
      }
    }
    document.getElementById('multiSelBoxG').remove();

    if (window.saveImage) { //if using the multi select to save as an image
      //calculate the width and height for the image
      var w = boxWidth;
      w = boxX < 0 ? w - boxX : w;
      var h = boxHeight;
      h = boxY < 0 ? h - boxY : h;

      //deselect the nodes
      multiSel = [false, false, false];
      for (var i = 0; i < mSel.length; i++) {
        var rect = document.getElementById(mSel[i].nodeID).getElementsByTagName('rect')[0];
        rect.style.setProperty('stroke-width', 1);
      }
      mSel = [];

      window.saveImage = false;
      svg2canvas2image(boxX, boxY, w, h, true); //create the image
    }
  }
  else if (mSel.length > 0 && !multiSel[2]) { //if moving multiple nodes using the multi select
    if (DragTarget) { //if moved then update each node
      window.groupID++;
      var childElement = null, text = null, xCoord = 0, yCoord = 0;
      for (var i = 0; i < mSel.length; i++) {
        childElement = document.getElementById(mSel[i].nodeID);
        childElement.getElementsByTagName('rect')[0].style.setProperty('stroke-width', 1);
        text = childElement.getElementsByTagName('text')[0];
        xCoord = Math.round(text.getAttribute('x'));
        yCoord = Math.round(text.getAttribute('y'));
        if (window.snapMode) {
          xCoord = snapToGrid(xCoord);
          yCoord = snapToGrid(yCoord);
          childElement.remove();
          DrawNode(mSel[i].nodeID, mSel[i].type, mSel[i].text, xCoord, yCoord, mSel[i].marked);
          if (mSel[i].timestamp != "" && window.showTimestamps) {
            DrawTimestamp(mSel[i].nodeID, mSel[i].timestamp, xCoord, yCoord);
          }
          var edgesToUpdate = findEdges(mSel[i].nodeID);
          for (var j = 0; j < edgesToUpdate.length; j++) {
            UpdateEdge(edgesToUpdate[j]);
          }
        }
        updateNode(mSel[i].nodeID, xCoord, yCoord);
      }
      DragTarget.setAttributeNS(null, 'pointer-events', 'all');
      DragTarget = null;
    } else { //deselect each node
      for (var i = 0; i < mSel.length; i++) {
        var rect = document.getElementById(mSel[i].nodeID).getElementsByTagName('rect')[0];
        rect.style.setProperty('stroke-width', 1);
      }
    }

    mSel = [];
    multiSel = [false, false, false];
  }
  dragEdges = [];
}

/**
 * Adds a point to the SVG for drawing edges to
 * @param {Number} nx - The x coordinate to draw the point at
 * @param {Number} ny - The y coordinate to draw the point at
 * @returns 
 */
function AddPt(nx, ny) {
  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute('id', 'edge_to');
  g.setAttribute('focusable', 'true');
  var nbox = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  nbox.setAttribute('x', nx + 1);
  nbox.setAttribute('y', ny + 1);
  nbox.setAttribute('width', 1);
  nbox.setAttribute('height', 1);
  g.appendChild(nbox)
  SVGRootG.appendChild(g);

  return g;
}

/**
 * Handles the right click event
 * @param {*} evt - The event to handle
 * @returns 
 */
function myRClick(evt) {
  if (mSel.length > 0 && window.addTimestamps) { multiSel[2] = true; } //if multiple nodes were selected

  GetTrueCoords(evt);
  if (evt.target.nodeName == 'rect') {
    var targetElement = evt.target.parentNode;
  } else if (evt.target.nodeName == 'tspan') {
    var targetElement = evt.target.parentNode.parentNode;
  } else {
    var targetElement = evt.target;
  }

  if (targetElement.getAttributeNS(null, 'focusable')) {
    Focus(evt, targetElement);
    n = targetElement;
    nID = n.getAttributeNS(null, 'id');
    CurrentlyEditing = nID;
    var index = findNodeIndex(nID);
    mySel = nodes[index];
    cmenu(mySel, evt);
    return false;
  }
}

/**
 * Finds the index of a node in the nodes array
 * @param {String} nodeID - The ID of the node to search for
 * @param {Boolean} last - Optional, indicates if the search should start at the end of the nodes array
 * @returns {Number} - The index or -1 if no node with the given nodeID can be found in the array
 */
function findNodeIndex(nodeID, last) {
  var last = typeof last !== 'undefined' ? last : false;
  if (last) {
    for (var i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i]) {
        if (nodes[i].nodeID == nodeID) {
          return i;
        }
      }
    }
  } else {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i]) {
        if (nodes[i].nodeID == nodeID) {
          return i;
        }
      }
    }
  }
  return -1;
}

/**
 * Handles updating nodes to save any edits made from the edit node form
 */
function saveNodeEdit() {
  if (mySel.type == 'I' || mySel.type == 'L' || mySel.type == 'EN') {
    var ntext = document.getElementById("n_text").value;
    document.getElementById(CurrentlyEditing).remove();
    DrawNode(CurrentlyEditing, mySel.type, ntext, mySel.x, mySel.y, mySel.marked);
    if (mySel.timestamp != "" && window.showTimestamps) {
      DrawTimestamp(mySel.nodeID, mySel.timestamp, mySel.x, mySel.y);
    }
    window.groupID++;
    updateNode(CurrentlyEditing, mySel.x, mySel.y, true, 0, true, mySel.type, null, ntext, mySel.timestamp);
  }
  else {
    mySel.type = document.getElementById("s_type").value;
    if (mySel.type == 'RA') {
      var ssel = document.getElementById("s_ischeme");
      mySel.scheme = ssel.value;
      if (ssel.selectedIndex == 0) {
        mySel.text = 'Default Inference';
        mySel.scheme = '72';
      } else {
        mySel.text = ssel.options[ssel.selectedIndex].text;
      }
    } else if (mySel.type == 'CA') {
      var ssel = document.getElementById("s_cscheme");
      mySel.scheme = ssel.value;
      if (ssel.selectedIndex == 0) {
        mySel.text = 'Default Conflict';
        mySel.scheme = '71';
      } else {
        mySel.text = ssel.options[ssel.selectedIndex].text;
      }
    } else if (mySel.type == 'YA') {
      var ssel = document.getElementById("s_lscheme");
      mySel.scheme = ssel.value;
      if (ssel.selectedIndex == 0) {
        mySel.text = 'Default Illocuting';
        mySel.scheme = '168';
      } else {
        mySel.text = ssel.options[ssel.selectedIndex].text;
      }
    } else if (mySel.type == 'MA') {
      var ssel = document.getElementById("s_mscheme");
      mySel.scheme = ssel.value;
      if (ssel.selectedIndex == 0) {
        mySel.text = 'Default Rephrase';
        mySel.scheme = '144';
      } else {
        mySel.text = ssel.options[ssel.selectedIndex].text;
      }
    } else if (mySel.type == 'PA') {
      var ssel = document.getElementById("s_pscheme");
      mySel.scheme = ssel.value;
      if (ssel.selectedIndex == 0) {
        mySel.text = 'Default Preference';
        mySel.scheme = '161';
      } else {
        mySel.text = ssel.options[ssel.selectedIndex].text;
      }
    } else if (mySel.type == 'TA') {
      var ssel = document.getElementById("s_tscheme");
      mySel.scheme = ssel.value;
      if (ssel.selectedIndex == 0) {
        mySel.text = 'Default Transition';
        mySel.scheme = '82';
      } else {
        mySel.text = ssel.options[ssel.selectedIndex].text;
      }
    } else {
      mySel.text = mySel.type
    }

    document.getElementById(CurrentlyEditing).remove();
    DrawNode(CurrentlyEditing, mySel.type, mySel.text, mySel.x, mySel.y, mySel.marked); //update the SVG

    //create the descriptors if needed
    var descriptors = [];
    $('.dselect').each(function () {
      var dName = $(this).attr('id').slice(2);
      var text = $(this).val();
      if (text != "-") {
        var d = newDescriptor($(this).attr('name'), dName, text);
        descriptors.push(d);
      }
      $("#l_" + dName).remove();
      $("#s_" + dName).remove();
    });

    mySel.descriptors = descriptors; //update the node's descriptors

    //create the cq descriptors if needed
    var cqs = [];
    $('.cqselect').each(function (index) {
      var dName = $(this).attr('id').slice(2);
      var text = $(this).val();
      if (text != "-") {
        var d = newDescriptor($(this).attr('name'), dName, text);
        cqs.push(d);
      }
    });

    mySel.cqdesc = cqs; //update the node's cq descriptors

    window.groupID++;
    updateNode(CurrentlyEditing, mySel.x, mySel.y);
  }

  var edgesToUpdate = findEdges(CurrentlyEditing);
  for (var i = 0; i < edgesToUpdate.length; i++) {
    UpdateEdge(edgesToUpdate[i]);
  }
}

/**
 * Finds all edges connected to a given node
 * @param {String} nodeID - The ID of the node to find edges connected to
 * @returns 
 */
function findEdges(nodeID) {
  var edgesToReturn = []
  for (var i = 0; i < edges.length; i++) {
    if (edges[i].fromID == nodeID || edges[i].toID == nodeID) {
      edgesToReturn.push(edges[i]);
    }
  }
  return edgesToReturn;
}

/**
 * Handles deleting a node and its connected edges
 * @param {Node} node - The node to delete
 */
function deleteNode(node) {
  //remove the node
  if (node.visible) {
    if (document.getElementById(node.nodeID)) {
      document.getElementById(node.nodeID).remove(); //if the node was drawn on the svg remove it
    }
    if (node.type == 'L' || node.type == 'I') {
      remhl(node.nodeID);
    }
  }
  delNode(node);

  //remove any edges that were connected to the deleted node
  var edgesToDelete = [];
  lNodeToDelete = null;
  for (var j = 0; j < edges.length; j++) {
    if (edges[j].toID == node.nodeID) {
      edgesToDelete.push(edges[j]);
      if (node.type == 'YA' && !(node.visible)) { //if a YA analyst node then record the connected L analyst node
        index = findNodeIndex(edges[j].fromID);
        lNodeToDelete = nodes[index];
      }
    }
    if (edges[j].fromID == node.nodeID) {
      edgesToDelete.push(edges[j]);
    }
  }
  for (var i = 0; i < edgesToDelete.length; i++) {
    deleteEdges(edgesToDelete[i]);
  }

  if (lNodeToDelete != null) { //if a connected L analyst node was found then also delete it
    deleteNode(lNodeToDelete);
  }

  $("#contextmenu").hide();
}

/**
 * Handles deleting an edge and its connected nodes
 * @param {Edge} edge - The edge to delete
 */
function deleteEdges(edge) {
  edgeID = 'n' + edge.fromID + '-n' + edge.toID;
  edgeFrom = edge.fromID;
  edgeTo = edge.toID;

  if (edge.visible) { //if the edge was drawn on the svg remove it
    tempEdge = document.getElementById(edgeID);
    if (tempEdge != null) { tempEdge.remove(); }
  }
  delEdge(edge);

  if (mySel.type == "I" || mySel.type == "EN") {
    for (var i = 1; i < nodes.length; i++) {
      if (nodes[i]) {
        if (nodes[i].nodeID == edgeFrom && nodes[i].type != "I" && nodes[i].type != "L" && nodes[i].type != 'EN' && nodes[i].type != 'TA') {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
        if (typeof nodes[i] != "undefined" && nodes[i].nodeID == edgeTo && nodes[i].type != "I" && nodes[i].type != "L" && nodes[i].type != 'EN' && nodes[i].type != 'TA') {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
      }
    }
  } else if (mySel.type == "L") {
    for (var i = 1; i < nodes.length; i++) {
      if (nodes[i]) {
        // if(nodes[i].nodeID == edgeFrom && nodes[i].type != "I" && nodes[i].type != "L" && nodes[i].type != 'EN') {
        if ((nodes[i].nodeID == edgeFrom && nodes[i].type == "TA") || (nodes[i].nodeID == edgeFrom && nodes[i].type == "YA")) {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
        else if ((nodes[i].nodeID == edgeTo && nodes[i].type == "TA") || (nodes[i].nodeID == edgeTo && nodes[i].type == "YA")) {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
      }
    }
  } else if (mySel.type == "YA") {
  } else if (mySel.type == "TA") {
    for (var i = 1; i < nodes.length; i++) {
      if (nodes[i]) {
        if (nodes[i].nodeID == edgeFrom && nodes[i].type != "I" && nodes[i].type != "L" && nodes[i].type != 'EN') {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
        else if ((nodes[i].nodeID == edgeTo && nodes[i].type == "TA") || (nodes[i].nodeID == edgeTo && nodes[i].type == "YA")) {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
      }
    }
  } else {
    for (var i = 1; i < nodes.length; i++) {
      if (nodes[i]) {
        // if(nodes[i].nodeID == edgeFrom && nodes[i].type != "I" && nodes[i].type != "L" && nodes[i].type != 'EN') {
        if (nodes[i].nodeID == edgeFrom && nodes[i].type != "I" && nodes[i].type != "L" && nodes[i].type != 'EN' && nodes[i].type != 'TA') {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
        else if (nodes[i].nodeID == edgeTo && nodes[i].type != "I" && nodes[i].type != "L" && nodes[i].type != 'EN' && nodes[i].type != 'TA') {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
      }
    }
  }
}
