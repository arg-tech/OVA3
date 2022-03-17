/**
 * Handles the key down event
 * @param {*} e - The key down event to handle
 */
function myKeyDown(e) {
  var keycode = e.keyCode;
  if (keycode == 16 || keycode == 83) {
    var textArea = document.getElementById('analysis_text');
    var nodeText = document.getElementById('n_text');
    if (textArea !== document.activeElement && nodeText !== document.activeElement) {
      edgeMode('on');
    }
  }
  if (keycode == 65) {
    var textArea = document.getElementById('analysis_text');
    var nodeText = document.getElementById('n_text');
    if (textArea !== document.activeElement && nodeText !== document.activeElement) {
      edgeMode('atk');
    }
  }
  if (keycode == 17) {
    editMode = true;
  }
  //if (keycode == 37 || keycode == 38 || keycode == 39 || keycode == 40) {
  if (keycode in NAV_MAP) {
    panZoomMode(keycode);
  }
  if (keycode == 18 && !(window.shiftPress || window.atkPress) && mSel.length == 0) {
    multiSel = true;
  }
}

/**
 * Handles the key up event
 * @param {*} e - The key up event to handle
 */
function myKeyUp(e) {
  var keycode = e.keyCode;
  if (keycode == 16 || keycode == 83) {
    edgeMode('off');
  }
  if (keycode == 65) {
    edgeMode('off');
  }
  if (keycode == 17) {
    editMode = false;
  }
  if (keycode == 18) {
    multiSel = false;
  }
  if (keycode == 90 && e.ctrlKey) { //ctrl + z for undo shortcut
    undo();
  }
}

/**
 * Handles panning and zooming
 * @param {Number} keycode 
 * @returns 
 */
function panZoomMode(keycode) {
  var textArea = document.getElementById('analysis_text');
  if (FormOpen == false && textArea !== document.activeElement) {
    nav = NAV_MAP[keycode];
    if (nav.act === 'move') {
      // if((nav.dir === -1 && VB[nav.axis] <= 0) ||
      //    (nav.dir ===  1 && VB[nav.axis] >= DMAX[nav.axis] - VB[2 + nav.axis])) {
      //   return
      // }
      if (nav.axis == 1) {
        tg[nav.axis] = parseFloat(VB[nav.axis] + .1 * nav.dir * VB[1 + nav.axis]);
      } else if (nav.axis == 0) {
        tg[nav.axis] = parseFloat(VB[nav.axis] + .1 * nav.dir * VB[2 + nav.axis]);
      }
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
  }
}

/**
 * Updates the view
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
  if (nav.act === 'move') {
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
  rID = requestAnimationFrame(updateView)
}

/**
 * 
 */
function stopAni() {
  cancelAnimationFrame(rID);
  rID = null;
}

/**
 * Resets the SVG's view box to the default position
 */
function resetPosition() {
  var mw = $("#mainwrap").width();
  $("#right1").width(mw - $("#left1").width() - 41);
  VB = [0, 0, 1500, 1500];
  SVGRoot.setAttribute('viewBox', [0, 0, 1500, 1500]);
}

/**
 * Handles turning the edge mode (for adding edges) on and off
 * @param {String} status 
 */
function edgeMode(status) {
  var mw = $("#mainwrap").width();
  $("#right1").width(mw - $("#left1").width() - 41);

  if (status == 'switch' && window.shiftPress) {
    status = 'atk';
    window.eBtn = true;
  } else if (status == 'switch' && window.atkPress) {
    status = 'off';
    window.eBtn = false;
  } else if (status == 'switch') {
    status = 'on';
    window.eBtn = true;
  }

  if (status == 'on') {
    window.atkPress = false;
    window.shiftPress = true;
    document.getElementById("right1").style.cursor = 'crosshair';
    $('#eadd').removeClass("active attack support");
    $('#eadd').addClass("active support");
  } else if (status == 'off') {
    window.shiftPress = false;
    window.atkPress = false;
    window.eBtn = false;
    document.getElementById("right1").style.cursor = 'auto';
    $('#eadd').removeClass("active attack support");
    if (window.longEdge[0]) {
      tempEdge = document.getElementById('n' + FromID + '-nedge_to');
      if (tempEdge) { SVGRootG.removeChild(tempEdge); }
      tempNode = document.getElementById("edge_to");
      if (tempNode) { SVGRootG.removeChild(tempNode); }
    }
    window.longEdge = [false, false];
  } else if (status == 'atk') {
    window.shiftPress = false;
    window.atkPress = true;
    document.getElementById("right1").style.cursor = 'crosshair';
    $('#eadd').removeClass("active attack support");
    $('#eadd').addClass("active attack");
  } else if (status == 'long') {
    window.eBtn = true;
    window.shiftPress = true;
    window.longEdge[0] = true;
    $('#eadd').removeClass("active attack support");
    $('#eadd').addClass("active support");
  }
}

/**
 * Handles turning the node mode (for adding nodes) on and off
 * @param {String} status 
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
    $('#nadd').addClass("active");
  } else {
    window.nodeAddBtn = false;
    document.getElementById("right1").style.cursor = 'auto';
    $('#nadd').removeClass("active");
  }
}

/**
 * Handles the mouse down event to enable grabbing on the SVG
 * @param {*} evt 
 * @returns 
 */
function Grab(evt) {
  $("#contextmenu").hide();

  if (evt.button != 0) {
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
    if (window.shiftPress || window.atkPress) {
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
    else if (editMode) {
      var index = findNodeIndex(targetElement.id)
      mySel = nodes[index];
      CurrentlyEditing = targetElement.id;
      editpopup(nodes[index]);
      editMode = false;
      return;
    } else if (window.longEdge[1]) {
      //
    }
    else {
      DragTarget = targetElement;
      // move this focusElement to the "top" of the display
      DragTarget.parentNode.appendChild(DragTarget);
      DragTarget.setAttributeNS(null, 'pointer-events', 'none');

      DragID = DragTarget.getAttributeNS(null, 'id');
      GetEdges(DragID);

      GrabPoint.x = TrueCoords.x;
      GrabPoint.y = TrueCoords.y;

      Focus(evt, targetElement);
    }
  } else {
    if (window.nodeAddBtn) {
      window.groupID++;
      window.nodeCounter++;
      newNodeID = (window.nodeCounter + "_" + window.sessionid);
      AddNode("", 'EN', null, 0, newNodeID, TrueCoords.x, TrueCoords.y - 10);
      var index = findNodeIndex(newNodeID)
      mySel = nodes[index];
      CurrentlyEditing = newNodeID;
      editpopup(nodes[index]);
      nodeMode('off');
      return;
    }
    else if (multiSel) {
      multiSelRect.startX = TrueCoords.x;
      multiSelRect.startY = TrueCoords.y;
    }
    else {
      t = getSelText();
      if (t != '') {
        window.nodeCounter++;
        var newNodeID = (window.nodeCounter + "_" + window.sessionid);
        var timestamp = '';
        if (window.addTimestamps) {
          timestamp = getTimestamp();
          timestamp = !timestamp ? '' : timestamp;
        }
        if (window.rIATMode) {
          AddNode(t, 'I', null, 0, newNodeID, TrueCoords.x, TrueCoords.y - 10, true, 0, timestamp);
          var nIndex = findNodeIndex(newNodeID)
          mySel = nodes[nIndex];
          CurrentlyEditing = mySel.nodeID;
          $('#locution_add').show();
          $('#modal-shade').show();
          FormOpen = true;
        } else {
          AddNode(t, 'I', null, 0, newNodeID, TrueCoords.x, TrueCoords.y - 10, true, 0, timestamp);
          var nIndex = findNodeIndex(newNodeID)
          mySel = nodes[nIndex];
        }
      }
    }
  }
}

/**
 * Calculates a timestamp
 * @returns - The calculated timestamp or false if no timestamp could be calculated
 */
function getTimestamp() {
  var iframe = document.getElementById('analysis_text');
  if (iframe == null) { //if url loaded into LHS
    tstamp = Math.round(new Date(window.startdatestmp).getTime());
    var tsd = new Date();
    tsd.setTime(tstamp);
    return tsd.toString();
  } else if (iframe.nodeName.toLowerCase() == 'div') {
    htmlContent = iframe.innerHTML

    // GET TIMESTAMPS FROM TEXT
    var r1 = "[0-9]:[0-9][0-9]:[0-9][0-9]";
    var timestamps = [];
    var re = new RegExp(r1, "g");
    while ((match = re.exec(htmlContent)) != null) {
      timestamps.push([match.index + match[0].length, match[0]]);
    }

    // GET SPAN POSITION FROM TEXT
    var r2 = "<[^>]*node" + window.nodeCounter + "[^0-9][^>]*>[^<]*</span>";
    var re = new RegExp(r2, "g");
    while ((match = re.exec(htmlContent)) != null) {
      var beforei = 0;
      beforet = '0:00:00';
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
    turnbefore = striphtml(htmlContent.substring(beforei, matchx.index));
    turnafter = striphtml(htmlContent.substring(matchx.index + matchx[0].length, afteri));
    pcthru = turnbefore.length / (turnbefore.length + turnafter.length);

    // TIMESTAMP CALCULATION
    charpermillisec = 0.01;
    if (aftert == '') {
      startut = Math.round(new Date(window.startdatestmp).getTime());
      baseut = Math.round(new Date("2000/01/01 00:00:00").getTime());
      beforeut = Math.round(new Date("2000/01/01 0" + beforet).getTime());
      timeinprog = beforeut + (turnbefore.length / charpermillisec);
      timeoffset = timeinprog - baseut;
      tstamp = startut + timeoffset;

      var tsd = new Date();
      tsd.setTime(tstamp);
      return tsd.toString();
    } else {
      startut = Math.round(new Date(startdatestmp).getTime());
      baseut = Math.round(new Date("2000/01/01 00:00:00").getTime());
      beforeut = Math.round(new Date("2000/01/01 0" + beforet).getTime());
      afterut = Math.round(new Date("2000/01/01 0" + aftert).getTime());
      timeinprog = beforeut + ((afterut - beforeut) * pcthru);
      timeoffset = timeinprog - baseut;
      tstamp = startut + timeoffset;

      var tsd = new Date();
      tsd.setTime(tstamp);
      return tsd.toString();
    }
  }
  return false;
}

/**
 * 
 * @param {String} dragID 
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
 * Calculates the true coordinates
 * @param {*} evt 
 */
function GetTrueCoords(evt) {
  // tsvg = document.getElementById('inline').getBoundingClientRect();
  // svgleft = tsvg.left;
  // svgtop = tsvg.top;
  // var newScale = SVGRoot.currentScale;
  // var translation = SVGRoot.currentTranslate;
  // TrueCoords.x = (evt.clientX - translation.x) / newScale - svgleft;
  // TrueCoords.y = (evt.clientY - translation.y) / newScale - svgtop;
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
  var isVisible = typeof visible !== 'undefined' ? visible : true;
  var undone = typeof undone !== 'undefined' ? undone : 0;
  var timestamp = typeof timestamp !== 'undefined' ? timestamp : '';
  var mark = typeof mark !== 'undefined' ? mark : false;
  var post = typeof post !== 'undefined' ? post : true;
  newNode(nid, type, scheme, pid, txt, nx, ny, isVisible, undone, timestamp, mark, post); //create the node
  if (isVisible) {
    DrawNode(nid, type, txt, nx, ny); //if the node is visible then draw the node on the svg

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
 * @param {*} evt 
 */
function Drag(evt) {
  GetTrueCoords(evt);
  if (DragTarget && !multiSel) {
    var dx = (TrueCoords.x - GrabPoint.x);
    var dy = (TrueCoords.y - GrabPoint.y);
    GrabPoint.x = TrueCoords.x;
    GrabPoint.y = TrueCoords.y;

    //If moving multiple nodes
    if (mSel.length > 0) {
      children = DragTarget.children;
      for (var j = 0; j < children.length; j++) {
        var childElement = children[j];
        oldX = parseInt(childElement.getAttributeNS(null, 'x'));
        oldY = parseInt(childElement.getAttributeNS(null, 'y'));
        newX = (oldX + dx);
        newY = (oldY + dy);
        childElement.setAttributeNS(null, 'x', newX);
        childElement.setAttributeNS(null, 'y', newY);
        tchildren = childElement.getElementsByTagName('tspan')
        for (var k = 0; k < tchildren.length; k++) {
          var cE = tchildren[k];
          coldX = parseInt(cE.getAttributeNS(null, 'x'));
          cnewX = (coldX + dx);
          cE.setAttributeNS(null, 'x', cnewX);
        }
      }
      var xdiff = (newX - oldX);
      var ydiff = (newY - oldY);
      if (dragEdges.length > 0) {
        for (var j = 0; j < dragEdges.length; j++) {
          UpdateEdge(dragEdges[j]);
        }
      }
      //Moving rest of selected nodes along with active one
      for (var i = 0; i < mSel.length; i++) {
        if (mSel[i].nodeID != DragTarget.id) {
          children = document.getElementById(mSel[i].nodeID).children;

          for (var j = 0; j < children.length; j++) {
            var childElement = children[j];
            oldX = parseInt(childElement.getAttributeNS(null, 'x'));
            oldY = parseInt(childElement.getAttributeNS(null, 'y'));
            newX = (oldX + xdiff);
            newY = (oldY + ydiff);
            childElement.setAttributeNS(null, 'x', newX);
            childElement.setAttributeNS(null, 'y', newY);
            tchildren = childElement.getElementsByTagName('tspan')
            for (var k = 0; k < tchildren.length; k++) {
              var cE = tchildren[k];
              coldX = parseInt(cE.getAttributeNS(null, 'x'));
              cnewX = (coldX + xdiff);
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
      }
    } else {
      // apply a new transform translation to the dragged focusElement, to display
      //    it in its new location
      children = DragTarget.children;
      for (var j = 0; j < children.length; j++) {
        var childElement = children[j];
        oldX = childElement.getAttributeNS(null, 'x');
        oldY = childElement.getAttributeNS(null, 'y');
        newX = parseInt(oldX) + dx;
        newY = parseInt(oldY) + dy;
        childElement.setAttributeNS(null, 'x', newX);
        childElement.setAttributeNS(null, 'y', newY);
        tchildren = childElement.getElementsByTagName('tspan')
        for (var k = 0; k < tchildren.length; k++) {
          var cE = tchildren[k];
          coldX = cE.getAttributeNS(null, 'x');
          cnewX = parseInt(coldX) + dx;
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
  else {
    if (multiSel) {
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
}

/**
 * 
 * @param {*} g 
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
  edgeID = 'n' + e.fromID + '-n' + e.toID;
  ee = document.getElementById(edgeID);
  nodeFrom = document.getElementById(e.fromID);
  nodeTo = document.getElementById(e.toID);
  if (nodeFrom == null || nodeTo == null || ee == null) { return false; } //if either of the nodes aren't drawn on the svg, do nothing
  nf = nodeFrom.getElementsByTagName('rect')[0];
  nt = nodeTo.getElementsByTagName('rect')[0];

  fw = parseInt(nf.getAttributeNS(null, 'width'));
  fh = parseInt(nf.getAttributeNS(null, 'height'));
  tw = parseInt(nt.getAttributeNS(null, 'width'));
  th = parseInt(nt.getAttributeNS(null, 'height'));

  fx = parseInt(nf.getAttributeNS(null, 'x'));
  fy = parseInt(nf.getAttributeNS(null, 'y'));
  tx = parseInt(nt.getAttributeNS(null, 'x'));
  ty = parseInt(nt.getAttributeNS(null, 'y'));

  curve_offset = 80;
  efx = fx + (fw / 2);
  efy = fy + (fh / 2);

  if (Math.abs(fy - ty) > Math.abs(fx - tx)) { // join top to bottom
    if (fy > ty) { // from below to
      if (fy - ty < curve_offset * 2) {
        curve_offset = (fy - ty) / 2;
      }
      //efx = fx + (fw/2);
      //efy = fy;
      etx = tx + (tw / 2);
      ety = ty + th;
      cp1y = efy - curve_offset;
      cp2y = ety + curve_offset;
    } else {
      if (ty - fy < curve_offset * 2) {
        curve_offset = (ty - fy) / 2;
      }
      //efx = fx + (fw/2);
      //efy = fy + fh;
      etx = tx + (tw / 2);
      ety = ty;
      cp1y = efy + curve_offset;
      cp2y = ety - curve_offset;
    }
    cp1x = efx;
    cp2x = etx;
  } else { // join side to side
    if (fx > tx) { // from right of to
      if (fx - tx < curve_offset * 2) {
        curve_offset = (fx - tx) / 2;
      }
      //efx = fx;
      //efy = fy + (fh/2);
      etx = tx + tw;
      ety = ty + (th / 2);
      cp1x = efx - curve_offset;
      cp2x = etx + curve_offset;
    } else {
      if (tx - fx < curve_offset * 2) {
        curve_offset = (tx - fx) / 2;
      }
      //efx = fx + fw;
      //efy = fy + (fh/2);
      etx = tx;
      ety = ty + (th / 2);
      cp1x = efx + curve_offset;
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
 * 
 * @param {*} evt 
 * @param {*} focusElement 
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
  }
}

/**
 * 
 * @param {*} evt 
 * @param {*} unfocusElement 
 */
function UnFocus(evt, unfocusElement) {
  var focusElement = unfocusElement;
  if (!unfocusElement && evt) {
    unfocusElement = evt.target;
  }

  if (unfocusElement) {
    rect = unfocusElement.getElementsByTagName('rect')[0];
    rect.style.setProperty('stroke-width', 1);
  }
}

/**
 * Handles the mouse up event to enable dropping on the SVG
 * @param {*} evt 
 * @returns 
 */
function Drop(evt) {
  if (DragTarget && mSel.length == 0) {
    children = DragTarget.children;
    for (var j = 0; j < children.length - 1; j++) {
      var childElement = children[j];
      xCoord = childElement.getAttributeNS(null, 'x');
      yCoord = childElement.getAttributeNS(null, 'y');
      window.groupID++;
      updateNode(DragTarget.id, xCoord, yCoord);
    }
    //If drawing edge to node
    if (DragTarget.getAttributeNS(null, 'id') == 'edge_to') {
      if (evt.target.nodeName == 'rect') {
        var targetElement = evt.target.parentNode;
      } else if (evt.target.nodeName == 'tspan') {
        var targetElement = evt.target.parentNode.parentNode;
      } else {
        var targetElement = evt.target;
      }
      if (evt.target.nodeName != 'svg') {
        from = document.getElementById(FromID).getElementsByTagName('rect')[0];
        to = targetElement.getElementsByTagName('rect')[0];

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
            tempedge = document.getElementById('n' + FromID + '-nedge_to');
            tempnode = document.getElementById("edge_to");
            SVGRootG.removeChild(tempedge);
            SVGRootG.removeChild(tempnode);
            DragTarget.setAttributeNS(null, 'pointer-events', 'all');
            DragTarget = null;
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
        nx = ((tx - fx) / 2) + fx;
        ny = ((ty - fy) / 2) + fy;

        if (nodeFrom == "I" && nodeTo == "I" && window.atkPress == false) {
          AddNode('Default Inference', 'RA', '72', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "I" && nodeTo == "I" && window.atkPress == true) {
          AddNode('Default Conflict', 'CA', '71', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "L" && nodeTo == "I") {
          AddNode('Asserting', 'YA', '74', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "L" && nodeTo == "L") {
          AddNode('Default Transition', 'TA', '82', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "TA" && nodeTo == "MA") {
          AddNode('Default Illocuting', 'YA', '168', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "TA" && nodeTo == "RA") {
          AddNode('Arguing', 'YA', '80', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "TA" && nodeTo == "CA") {
          AddNode('Disagreeing', 'YA', '78', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "RA" && nodeTo == "I") {

        } else if (nodeFrom == "I" && nodeTo == "RA" || nodeFrom == "I" && nodeTo == "RA" || nodeFrom == "EN" && nodeTo == "RA" || nodeFrom == "RA" && nodeTo == "EN") {

        }
        else {
          AddNode('Default Inference', 'RA', '72', 0, newNodeID, nx, ny);
        }
        //If linked argument
        if ((nodeFrom == "RA" && nodeTo == "I") || (nodeFrom == "I" && nodeTo == "RA") || (nodeFrom == "EN" && nodeTo == "RA")) {
          //only draw edge
          DrawEdge(FromID, targetElement.getAttributeNS(null, 'id'));
          var edge = newEdge(FromID, targetElement.getAttributeNS(null, 'id'));
          UpdateEdge(edge);

          tempedge = document.getElementById('n' + FromID + '-nedge_to');
          tempnode = document.getElementById('edge_to');
          SVGRootG.removeChild(tempedge);
          SVGRootG.removeChild(tempnode);
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

          tempedge = document.getElementById('n' + FromID + '-nedge_to');
          tempnode = document.getElementById('edge_to');
          SVGRootG.removeChild(tempedge);
          SVGRootG.removeChild(tempnode);
        }

        if (window.longEdge[1]) { //if adding a long distance edge
          var displayText = document.getElementById('target_text');
          displayText.innerHTML = '"' + nTo.text + '"';

          //marks the newly added node and its connected edges/nodes if needed
          var radio = document.getElementById("mark_node_check");
          if (radio && radio.checked) {
            var index = findNodeIndex(newNodeID);
            if (index > -1) {
              var n = nodes[index];
              window.groupID++;
              markNode(n, true);
            } else {
              markEdge(nFrom.nodeID, nTo.nodeID, true);
            }
          }

          //center the view on the new edge that was added
          var newx = nx - 250;
          var newy = ny - 400;
          VB = [newx, newy, 1500, 1500];
          SVGRoot.setAttribute('viewBox', [newx, newy, 1500, 1500]);
          if (window.dialogicalMode) {
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
      } else {
        //If edge is drawn to empty space and not to a node
        tempEdge = document.getElementById('n' + FromID + '-nedge_to');
        if (tempEdge) { SVGRootG.removeChild(tempEdge); }
        tempNode = document.getElementById("edge_to");
        if (tempNode) { SVGRootG.removeChild(tempNode); }
      }
    }
    DragTarget.setAttributeNS(null, 'pointer-events', 'all');
    DragTarget = null;

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
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].x > boxX && nodes[i].x < boxX + boxWidth && nodes[i].y > boxY && nodes[i].y < boxY + boxHeight) {
        mSel.push(nodes[i]);
        rect = document.getElementById(nodes[i].nodeID).getElementsByTagName('rect')[0];
        rect.style.setProperty('stroke-width', 2);
      }
    }
    document.getElementById('multiSelBoxG').remove();

    if (window.saveImage) { //if using the multi select to save as an image
      var w = boxWidth;
      w = boxX < 0 ? w - boxX : w;
      var h = boxHeight;
      h = boxY < 0 ? h - boxY : h;

      // console.log("x: " + boxX);
      // console.log("y: " + boxY);
      // console.log("w: " + w);
      // console.log("h: " + h);
      multiSel = false;
      window.saveImage = false;
      svg2canvas2image(boxX, boxY, w, h);
    }
  }
  else if (mSel.length > 0) { //if moving multiple nodes using the multi select
    if (DragTarget) {
      window.groupID++;
      for (var i = 0; i < mSel.length; i++) {
        var childElement = document.getElementById(mSel[i].nodeID);
        var rect = childElement.getElementsByTagName('rect')[0];
        rect.style.setProperty('stroke-width', 1);
        xCoord = rect.getAttribute('x');
        yCoord = rect.getAttribute('y');
        updateNode(mSel[i].nodeID, xCoord, yCoord);
      }
      DragTarget.setAttributeNS(null, 'pointer-events', 'all');
      DragTarget = null;
    } else {
      for (var i = 0; i < mSel.length; i++) {
        var rect = document.getElementById(mSel[i].nodeID).getElementsByTagName('rect')[0];
        rect.style.setProperty('stroke-width', 1);
      }
    }
    mSel = [];
    multiSel = false;
  }
  dragEdges = [];
}

/**
 * Adds a point to the SVG
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
 * @param {*} evt 
 * @returns 
 */
function myRClick(evt) {
  GetTrueCoords(evt);
  if (evt.target.nodeName == 'rect') {
    var targetElement = evt.target.parentNode;
  } else if (evt.target.nodeName == 'tspan') {
    var targetElement = evt.target.parentNode.parentNode;
  } else {
    var targetElement = evt.target;
  }

  if (targetElement.getAttributeNS(null, 'focusable')) {
    n = targetElement;
    nID = n.getAttributeNS(null, 'id');
    CurrentlyEditing = nID;
    //nHeight = n.getAttributeNS(null, 'height');
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

// function editNode(node) {
//   FormOpen = true;
//   console.log(FormOpen);
//   if(mySel.type == 'I' || mySel.type == 'L' || mySel.type == 'EN'){
//     $('#node_edit').show();
//     $('#n_text').val(node.text);
//     //$('#modal-shade').css('display','visible');
//     console.log(FormOpen);
//     document.getElementById("#modal-shade").style.display = "block";
//   }
// }

/**
 * Handles updating nodes to save any edits made from the edit node form
 */
function saveNodeEdit() {
  var type = mySel.type;
  var xCoord = mySel.x;
  var yCoord = mySel.y;
  if (mySel.type == 'I' || mySel.type == 'L' || mySel.type == 'EN') {
    var ntext = document.getElementById("n_text").value;
    //var edgesToUpdate = findEdges(CurrentlyEditing);
    document.getElementById(CurrentlyEditing).remove();
    DrawNode(CurrentlyEditing, type, ntext, xCoord, yCoord, mySel.marked);
    if (mySel.timestamp != "" && window.showTimestamps) {
      DrawTimestamp(mySel.nodeID, mySel.timestamp, mySel.x, mySel.y);
    }
    window.groupID++;
    updateNode(CurrentlyEditing, xCoord, yCoord, true, 0, true, type, null, ntext, mySel.timestamp);
    // for (var i = 0; i < edgesToUpdate.length; i++) {
    //   UpdateEdge(edgesToUpdate[i]);
    // }
  } else {
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
    DrawNode(CurrentlyEditing, mySel.type, mySel.text, xCoord, yCoord, mySel.marked);
    window.groupID++;
    updateNode(CurrentlyEditing, xCoord, yCoord, mySel.visible, 0, true, mySel.type, mySel.scheme, mySel.text);

    $('.dselect').each(function (index) {
      mySel.descriptors[$(this).attr('id')] = $(this).val();
    });

    $('.cqselect').each(function (index) {
      mySel.cqdesc[$(this).attr('id')] = $(this).val();
    });
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
    if (document.getElementById(CurrentlyEditing)) {
      document.getElementById(CurrentlyEditing).remove(); //if the node was drawn on the svg remove it
    }
    if (mySel.type == 'L' || mySel.type == 'I') {
      remhl(node.nodeID);
    }
  }
  delNode(node);

  //remove any edges that were connected to the deleted node
  var edgesToDelete = [];
  lNodeToDelete = null;
  for (var j = 0; j < edges.length; j++) {
    if (edges[j].toID == CurrentlyEditing) {
      edgesToDelete.push(edges[j]);
      if (node.type == 'YA' && !(node.visible)) { //if a YA analyst node then record the connected L analyst node
        index = findNodeIndex(edges[j].fromID);
        lNodeToDelete = nodes[index];
      }
    }
    if (edges[j].fromID == CurrentlyEditing) {
      edgesToDelete.push(edges[j]);
    }
  }
  for (var i = 0; i < edgesToDelete.length; i++) {
    deleteEdges(edgesToDelete[i]);
  }

  if (lNodeToDelete != null) { //if a connected L analyst node was found then also delete it
    CurrentlyEditing = lNodeToDelete.nodeID;
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
        if (nodes[i].nodeID == edgeTo && nodes[i].type != "I" && nodes[i].type != "L" && nodes[i].type != 'EN' && nodes[i].type != 'TA') {
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
