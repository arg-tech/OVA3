function myKeyDown(e) {
  var keycode = e.keyCode;
  if (keycode == 16 || keycode == 83) {
    edgeMode('on');
  }
  if (keycode == 65) {
    edgeMode('atk');
  }
  if (keycode == 17) {
    editMode = true;
  }
  //if (keycode == 37 || keycode == 38 || keycode == 39 || keycode == 40) {
  if (keycode in NAV_MAP) {
    panZoomMode(keycode);
  }
  if (keycode == 18) {
    multiSel = true;
  }

}

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
}


function panZoomMode(keycode) {
  if (FormOpen == false) {
    nav = NAV_MAP[keycode];
    if (nav.act === 'move') {
      // if((nav.dir === -1 && VB[nav.axis] <= 0) ||
      //    (nav.dir ===  1 && VB[nav.axis] >= DMAX[nav.axis] - VB[2 + nav.axis])) {
      //   return
      // }
      if (nav.axis == 1) {
        tg[nav.axis] = VB[nav.axis] + .1 * nav.dir * VB[1 + nav.axis];
      } else if (nav.axis == 0) {
        tg[nav.axis] = VB[nav.axis] + .1 * nav.dir * VB[2 + nav.axis];
      }
    } else if (nav.act == 'zoom') {
      if ((nav.dir === -1 && VB[2] >= DMAX[0]) ||
        (nav.dir === 1 && VB[2] <= WMIN)) {
        return
      }


      for (let i = 0; i < 2; i++) {
        tg[i + 2] = VB[i + 2] / Math.pow(1.3, nav.dir);
        tg[i] = .00001 * (DMAX[i] - tg[i + 2]);
      }
    }
    updateView();
  }
}

function updateView() {
  let k = ++f / NF, j = 1 - k, cvb = VB.slice();

  if (nav.act === 'zoom') {
    for (let i = 0; i < 4; i++)
      cvb[i] = j * VB[i] + k * tg[i]
  }

  if (nav.act === 'move') {
    cvb[nav.axis] = j * VB[nav.axis] + k * tg[nav.axis];
  }

  SVGRoot.setAttribute('viewBox', cvb.join(' '));


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

function stopAni() {
  cancelAnimationFrame(rID);
  rID = null;
}

function resetPosition() {
  VB = [0, 0, 1000, 12775];
  SVGRoot.setAttribute('viewBox', [0, 0, 1000, 12775]);
}

function edgeMode(status) {
  if (status == 'switch' && window.shiftPress) {
    status = 'atk';
    window.eBtn = true;
  } else if (status == 'switch' && window.altPress) {
    status = 'off';
    window.eBtn = false;
  } else if (status == 'switch') {
    status = 'on';
    window.eBtn = true;
  }

  if (status == 'on') {
    window.altPress = false;
    window.shiftPress = true;
    document.getElementById("right1").style.cursor = 'crosshair';
    $('#eadd').removeClass("active attack support");
    $('#eadd').addClass("active support");
  } else if (status == 'off') {
    window.shiftPress = false;
    window.altPress = false;
    document.getElementById("right1").style.cursor = 'auto';
    $('#eadd').removeClass("active attack support");
  } else if (status == 'atk') {
    window.shiftPress = false;
    window.altPress = true;
    document.getElementById("right1").style.cursor = 'crosshair';
    $('#eadd').removeClass("active attack support");
    $('#eadd').addClass("active attack");
  }
}

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
    if (window.shiftPress || window.altPress) {
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

      // //deselects the add edge icon button after adding an edge
      // if (window.eBtn) {
      //   edgeMode('off');
      //   window.eBtn = false;
      // }
    }
    else if (editMode == true) {
      var index = findNodeIndex(targetElement.id)
      mySel = nodes[index];
      CurrentlyEditing = targetElement.id;
      editpopup(nodes[index]);
      editMode = false;
      return;
    }
    else {
      DragTarget = targetElement;
      // // move this focusElement to the "top" of the display
      DragTarget.parentNode.appendChild(DragTarget);
      DragTarget.setAttributeNS(null, 'pointer-events', 'none');

      DragID = DragTarget.getAttributeNS(null, 'id');
      GetEdges(DragID);

      GrabPoint.x = TrueCoords.x;
      GrabPoint.y = TrueCoords.y;

      Focus(evt, targetElement);
    }
  } else {
    if (window.nodeAddBtn == true) {
      window.nodeCounter = window.nodeCounter + 1;
      newNodeID = window.nodeCounter;
      AddNode("", 'EN', null, 0, newNodeID, TrueCoords.x, TrueCoords.y - 10);
      var index = findNodeIndex(newNodeID)
      mySel = nodes[index];
      CurrentlyEditing = newNodeID;
      editpopup(nodes[index]);
      nodeMode('off');
      return;
    }
    else if (multiSel == true) {
      multiSelRect.startX = TrueCoords.x;
      multiSelRect.startY = TrueCoords.y;
    }
    else {
      t = getSelText();
      if (t != '') {
        if (rIATMode == true) {
          window.nodeCounter = window.nodeCounter + 1;
          newNodeID = window.nodeCounter;
          var xCoord = TrueCoords.x;
          var yCoord = TrueCoords.y;
          AddNode(t, 'I', null, 0, newNodeID, TrueCoords.x, TrueCoords.y - 10);
          var nIndex = findNodeIndex(newNodeID)
          mySel = nodes[nIndex];
          CurrentlyEditing = mySel.nodeID;
          $('#locution_add').show();
          $('#modal-shade').show();
          FormOpen = true;
        } else {
          window.nodeCounter = window.nodeCounter + 1;
          newNodeID = window.nodeCounter;
          AddNode(t, 'I', null, 0, newNodeID, TrueCoords.x, TrueCoords.y - 10);
          var nIndex = findNodeIndex(newNodeID)
          mySel = nodes[nIndex];
        }
      }
    }

  }
}


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
  var newScale = VB[2] / 1000;
  var translationX = VB[0];
  var translationY = VB[1];


  //Calculating new coordinates after panning and zooming
  TrueCoords.x = ((evt.clientX - svgleft) * newScale) + translationX;
  TrueCoords.y = ((evt.clientY - svgtop) * newScale) + translationY;

}

function AddNode(txt, type, scheme, pid, nid, nx, ny, visible) {
  var isVisible = typeof visible !== 'undefined' ? visible : true;
  newNode(nid, type, scheme, pid, txt, nx, ny, isVisible);
  if (isVisible) {
    DrawNode(nid, type, txt, nx, ny); //if the node is visible then draw the node on the svg

    //create analyst nodes if they are needed 
    if (type == 'L' && txt != "") {
      var analysisLTxt = window.afirstname + ': ' + txt;
      window.nodeCounter++;
      var analysisYA = newNode(window.nodeCounter, 'YA', '75', 0, 'Analysing', 0, 0, false);
      window.nodeCounter++;
      var analysisL = newNode(window.nodeCounter, 'L', null, 0, analysisLTxt, 0, 0, false);
      newEdge(analysisYA.nodeID, nid, false);
      newEdge(analysisL.nodeID, analysisYA.nodeID, false);
    }
  }
}

function Drag(evt) {
  GetTrueCoords(evt);
  if (DragTarget) {
    var dx = TrueCoords.x - GrabPoint.x;
    var dy = TrueCoords.y - GrabPoint.y;

    GrabPoint.x = TrueCoords.x;
    GrabPoint.y = TrueCoords.y;

    //If moving multiple nodes
    if (mSel.length > 0) {
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
          coldY = cE.getAttributeNS(null, 'y');
          cnewX = parseInt(coldX) + dx;
          cnewY = parseInt(coldY) + dy;
          cE.setAttributeNS(null, 'x', cnewX);
          cE.setAttributeNS(null, 'y', cnewY);
        }
      }
      var xdiff = newX - oldX;
      var ydiff = newY - oldY;
      if (dragEdges.length > 0) {
        //updateNodePosition(DragTarget.id, newX, newY);
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
            oldX = childElement.getAttributeNS(null, 'x');
            oldY = childElement.getAttributeNS(null, 'y');
            newX = parseInt(oldX) + xdiff;
            newY = parseInt(oldY) + ydiff;
            childElement.setAttributeNS(null, 'x', newX);
            childElement.setAttributeNS(null, 'y', newY);
            tchildren = childElement.getElementsByTagName('tspan')
            for (var k = 0; k < tchildren.length; k++) {
              var cE = tchildren[k];
              coldX = cE.getAttributeNS(null, 'x');
              coldY = cE.getAttributeNS(null, 'y');
              cnewX = parseInt(coldX) + xdiff;
              cnewY = parseInt(coldY) + ydiff;
              cE.setAttributeNS(null, 'x', cnewX);
              cE.setAttributeNS(null, 'y', cnewY);
            }
          }
          GetEdges(mSel[i].nodeID);
          if (dragEdges.length > 0) {
            //updateNodePosition(DragTarget.id, newX, newY);
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
          coldY = cE.getAttributeNS(null, 'y');
          cnewX = parseInt(coldX) + dx;
          cnewY = parseInt(coldY) + dy;
          cE.setAttributeNS(null, 'x', cnewX);
          cE.setAttributeNS(null, 'y', cnewY);
        }
      }
      if (dragEdges.length > 0) {
        //updateNodePosition(DragTarget.id, newX, newY);
        for (var j = 0; j < dragEdges.length; j++) {
          UpdateEdge(dragEdges[j]);
        }
      }
    }

  }
  else {
    if (multiSel == true) {
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      var selbox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      g.setAttribute('id', 'multiSelBoxG');
      selbox.setAttribute('id', 'multiSelBox');
      selbox.setAttribute('x', multiSelRect.startX);
      selbox.setAttribute('y', multiSelRect.startY);
      selbox.setAttribute('width', TrueCoords.x - multiSelRect.startX);
      selbox.setAttribute('height', TrueCoords.y - multiSelRect.startY);
      selbox.setAttribute('style', 'fill:none;stroke:#a8a8a8;stroke-width:1;')
      // selbox.setAttribute('style', 'fill:none;stroke:#3498db;stroke-width:1;');
      g.append(selbox);
      updateBox(g);
    }
  }
}

function updateBox(g) {
  if (document.getElementById('multiSelBox')) {
    document.getElementById('multiSelBox').remove();
    document.getElementById('multiSelBoxG').remove();
  }
  SVGRootG.append(g);
}

function UpdateEdge(e) {
  if (!e.visible) { return false; } //if the edge is invisible, i.e. it isn't drawn on the svg, do nothing
  edgeID = 'n' + e.fromID + '-n' + e.toID;
  ee = document.getElementById(edgeID);
  nodeFrom = document.getElementById(e.fromID);
  nodeTo = document.getElementById(e.toID);
  if (nodeFrom == null || nodeTo == null) { return false; } //if either of the nodes aren't drawn on the svg, do nothing
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
}


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


function Drop(evt) {
  if (DragTarget) {
    children = DragTarget.children;
    for (var j = 0; j < children.length - 1; j++) {
      var childElement = children[j];
      xCoord = childElement.getAttributeNS(null, 'x');
      yCoord = childElement.getAttributeNS(null, 'y');
      updateNodePosition(DragTarget.id, xCoord, yCoord);
    }

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

        window.nodeCounter = window.nodeCounter + 1;
        newNodeID = window.nodeCounter;
        nx = ((tx - fx) / 2) + fx;
        ny = ((ty - fy) / 2) + fy;
        //AddNode('Default Inference', 'RA', newNodeID, nx, ny);
        var index = findNodeIndex(FromID);
        var nodeFrom = nodes[index].type;

        index = findNodeIndex(targetElement.getAttributeNS(null, 'id'));
        var nodeTo = nodes[index].type;

        if (nodeFrom == "I" && nodeTo == "I" && window.altPress == false) {
          AddNode('Default Inference', 'RA', '72', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "I" && nodeTo == "I" && window.altPress == true) {
          AddNode('Default Conflict', 'CA', '71', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "L" && nodeTo == "I") {
          AddNode('Asserting', 'YA', '74', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "L" && nodeTo == "L") {
          AddNode('Default Transition', 'TA', '82', 0, newNodeID, nx, ny);
        } else if ((nodeFrom == "TA" && nodeTo == "RA") || (nodeFrom == "TA" && nodeTo == "CA") || (nodeFrom == "TA" && nodeTo == "MA")) {
          AddNode('Default Illocuting', 'YA', '168', 0, newNodeID, nx, ny);
        } else if (nodeFrom == "RA" && nodeTo == "I") {

        } else if (nodeFrom == "I" && nodeTo == "RA") {

        }
        else {
          AddNode('Default Inference', 'RA', '72', 0, newNodeID, nx, ny);
        }
        //If linked argument
        if ((nodeFrom == "RA" && nodeTo == "I") || (nodeFrom == "I" && nodeTo == "RA")) {
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
      } else {
        //If edge is drawn to empty space and not to a node
        tempedge = document.getElementById('n' + FromID + '-nedge_to');
        tempnode = document.getElementById("edge_to");
        SVGRootG.removeChild(tempedge);
        SVGRootG.removeChild(tempnode);
      }
    }
    DragTarget.setAttributeNS(null, 'pointer-events', 'all');
    DragTarget = null;
    //deselects the add edge icon button after adding an edge
    if (window.eBtn) {
      edgeMode('off');
      window.eBtn = false;
    }
  }
  if (document.getElementById('multiSelBox')) {
    var box = document.getElementById('multiSelBox');
    var boxWidth = parseInt(box.getAttributeNS(null, 'width'));
    var boxHeight = parseInt(box.getAttributeNS(null, 'height'));
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].x > multiSelRect.startX && nodes[i].x < parseInt(multiSelRect.startX) + boxWidth
        && nodes[i].y > multiSelRect.startY && nodes[i].y < parseInt(multiSelRect.startY) + boxHeight) {
        mSel.push(nodes[i]);
      }
    }
    document.getElementById('multiSelBoxG').remove();
  } else {
    mSel = [];
    multiSel = false;

  }
  dragEdges = [];
}


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

function findNodeIndex(nodeID) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i]) {
      if (nodes[i].nodeID == nodeID) {
        return i;
      }
    }
  }
}
//
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

function saveNodeEdit() {
  var type = mySel.type;
  var xCoord = mySel.x;
  var yCoord = mySel.y;
  if (mySel.type == 'I' || mySel.type == 'L' || mySel.type == 'EN') {
    var ntext = document.getElementById("n_text").value;
    //var edgesToUpdate = findEdges(CurrentlyEditing);
    document.getElementById(CurrentlyEditing).remove();
    DrawNode(CurrentlyEditing, type, ntext, xCoord, yCoord);
    updateNode(CurrentlyEditing, type, 0, ntext, xCoord, yCoord);
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
    DrawNode(CurrentlyEditing, mySel.type, mySel.text, xCoord, yCoord);
    updateNode(CurrentlyEditing, mySel.type, mySel.scheme, mySel.text, xCoord, yCoord);

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


function findEdges(nodeID) {
  var edgesToReturn = []
  for (var i = 0; i < edges.length; i++) {
    if (edges[i].fromID == nodeID || edges[i].toID == nodeID) {
      edgesToReturn.push(edges[i]);
    }
  }
  return edgesToReturn;
}


function deleteNode(node) {
  //remove the node
  if (node.visible) {
    document.getElementById(CurrentlyEditing).remove(); //if the node was drawn on the svg remove it
    if (mySel.type == 'L') {
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

function deleteEdges(edge) {
  edgeID = 'n' + edge.fromID + '-n' + edge.toID;
  edgeFrom = edge.fromID;
  edgeTo = edge.toID;

  if (edge.visible) { //if the edge was drawn on the svg remove it
    tempEdge = document.getElementById(edgeID);
    tempEdge.remove();
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
