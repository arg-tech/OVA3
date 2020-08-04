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
  if(status == 'switch' && window.nodeAddBtn){
      status = 'off';
  }else if(status == 'switch'){
      status = 'on';
  }

  if(status == 'on'){
      window.nodeAddBtn = true;
      document.getElementById("right1").style.cursor = 'crosshair';
      $('#nadd').addClass("active");
  }else{
      window.nodeAddBtn = false;
      document.getElementById("right1").style.cursor = 'auto';
      $('#nadd').removeClass("active");
  }
}


function Grab(evt) {
  $("#contextmenu").hide();

  if(evt.button != 0){
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
      SVGRoot.insertBefore(nedge, SVGRoot.childNodes[0]);

      var edge = new Edge;
      edge.fromID = FromID;
      edge.toID = 'edge_to';
      dragEdges.push(edge);
      UpdateEdge(edge);

      GrabPoint.x = TrueCoords.x;
      GrabPoint.y = TrueCoords.y;

      Focus(evt, targetElement);

      //deselects the add edge icon button after adding an edge
      if (window.eBtn) {
        edgeMode('off');
        window.eBtn = false;
      }
    }
    else if (editMode == true) {
      var index = findNodeIndex(targetElement.id)
      mySel = nodes[index];
      CurrentlyEditing = targetElement.id;
      editNode(nodes[index]);
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
      AddNode("", 'EN', newNodeID, TrueCoords.x, TrueCoords.y - 10 );
      var index = findNodeIndex(newNodeID)
      mySel = nodes[index];
      CurrentlyEditing = newNodeID;
      editNode(nodes[index]);
      nodeMode('off');
      return;
    }
    else {
      t = getSelText();
      if (t != '') {
        window.nodeCounter = window.nodeCounter + 1;
        newNodeID = window.nodeCounter;
        AddNode(t, 'I', newNodeID, TrueCoords.x, TrueCoords.y - 10);
      }
      else {
        {
          t = "dummy text";
          window.nodeCounter = window.nodeCounter + 1;
          newNodeID = window.nodeCounter;
          AddNode(t, 'I', newNodeID, TrueCoords.x, TrueCoords.y - 10);
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
  tsvg = document.getElementById('inline').getBoundingClientRect();
  svgleft = tsvg.left;
  svgtop = tsvg.top;
  var newScale = SVGRoot.currentScale;
  var translation = SVGRoot.currentTranslate;
  TrueCoords.x = (evt.clientX - translation.x) / newScale - svgleft;
  TrueCoords.y = (evt.clientY - translation.y) / newScale - svgtop;
}


function AddNode(txt, type, nid, nx, ny) {
  newNode(nid, type, txt, nx, ny);
  DrawNode(nid, type, txt, nx, ny);
}

function Drag(evt) {
  GetTrueCoords(evt);

  if (DragTarget) {
    var dx = TrueCoords.x - GrabPoint.x;
    var dy = TrueCoords.y - GrabPoint.y;

    GrabPoint.x = TrueCoords.x;
    GrabPoint.y = TrueCoords.y;

    // apply a new tranform translation to the dragged focusElement, to display
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
    for (var j = 0; j < dragEdges.length; j++) {
      UpdateEdge(dragEdges[j]);
    }
  }
}

function UpdateEdge(e) {
  edgeID = 'n' + e.fromID + '-n' + e.toID;
  ee = document.getElementById(edgeID);
  nf = document.getElementById(e.fromID).getElementsByTagName('rect')[0];
  nt = document.getElementById(e.toID).getElementsByTagName('rect')[0];
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
    if (DragTarget.getAttributeNS(null, 'id') == 'edge_to') {
      if (evt.target.nodeName == 'rect') {
        var targetElement = evt.target.parentNode;
      } else if (evt.target.nodeName == 'tspan') {
        var targetElement = evt.target.parentNode.parentNode;
      } else {
        var targetElement = evt.target;
      }

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
      AddNode('Default Inference', 'RA', newNodeID, nx, ny);

      //from -> S
      var nedge = document.createElementNS("http://www.w3.org/2000/svg", "path");
      nedge.setAttribute('id', 'n' + FromID + '-n' + newNodeID);
      nedge.setAttribute('stroke-width', '1');
      nedge.setAttribute('fill', 'none');
      nedge.setAttribute('stroke', 'black');
      nedge.setAttribute('d', 'M80,30 C200,30 30,380 200,380');
      nedge.setAttribute('marker-end', 'url(#head)');
      SVGRoot.insertBefore(nedge, SVGRoot.childNodes[0]);
      var edge = new Edge;
      edge.fromID = FromID;
      edge.toID = newNodeID;
      edges.push(edge);
      UpdateEdge(edge);

      //S -> to
      var nedge = document.createElementNS("http://www.w3.org/2000/svg", "path");
      nedge.setAttribute('id', 'n' + newNodeID + '-n' + targetElement.getAttributeNS(null, 'id'));
      nedge.setAttribute('stroke-width', '1');
      nedge.setAttribute('fill', 'none');
      nedge.setAttribute('stroke', 'black');
      nedge.setAttribute('d', 'M80,30 C200,30 30,380 200,380');
      nedge.setAttribute('marker-end', 'url(#head)');
      SVGRoot.insertBefore(nedge, SVGRoot.childNodes[0]);
      var edge = new Edge;
      edge.fromID = newNodeID;
      edge.toID = targetElement.getAttributeNS(null, 'id');
      edges.push(edge);
      UpdateEdge(edge);

      tempedge = document.getElementById('n' + FromID + '-nedge_to');
      tempnode = document.getElementById('edge_to');
      SVGRoot.removeChild(tempedge);
      SVGRoot.removeChild(tempnode);
    }
    DragTarget.setAttributeNS(null, 'pointer-events', 'all');
    DragTarget = null;
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
  SVGRoot.appendChild(g);

  return g;
}

function myRClick(evt) {
    GetTrueCoords(evt);
    if(evt.target.nodeName == 'rect'){
        var targetElement = evt.target.parentNode;
    }else if(evt.target.nodeName == 'tspan'){
        var targetElement = evt.target.parentNode.parentNode;
    }else{
        var targetElement = evt.target;
    }

    if ( targetElement.getAttributeNS(null, 'focusable') ){
        n = targetElement;
        nID = n.getAttributeNS(null, 'id');
        CurrentlyEditing = nID;
        //nHeight = n.getAttributeNS(null, 'height');
        var index = findNodeIndex(nID);
        mySel = nodes[index];
        cmenu(mySel);
        return false;
    }
}

function findNodeIndex(nodeID) {
  for(var i=0; i < nodes.length; i++) {
    if (nodes[i]) {
      if (nodes[i].nodeID == nodeID) {
        return i;
      }
    }
  }
}

function editNode(node) {
  if(mySel.type == 'I' || mySel.type == 'L' || mySel.type == 'EN'){
    $('#node_edit').show();
    $('#modal-shade').show();
    $('#n_text').val(node.text);
  }
}

  function saveNodeEdit() {
    if(mySel.type == 'I' || mySel.type == 'L' || mySel.type == 'EN'){
      var ntext = document.getElementById("n_text").value;
      var type = mySel.type;
      var xCoord = mySel.x;
      var yCoord = mySel.y;
      document.getElementById(CurrentlyEditing).remove();
      DrawNode(CurrentlyEditing, type, ntext, xCoord, yCoord);
      updateNode(CurrentlyEditing, type, ntext, xCoord, yCoord);
    }
  }

  function deleteNode(node) {
    if(mySel.type == 'I' || mySel.type == 'L' || mySel.type == 'EN'){
      //remhl(node.nodeID);
      document.getElementById(CurrentlyEditing).remove();
      const index = nodes.indexOf(node);
      if (index > -1) { nodes.splice(index, 1); }
      var edgesToDelete = [];

      for (var j = 0; j < edges.length; j++) {
        if(edges[j].toID == CurrentlyEditing) {
          edgesToDelete.push(edges[j]);
        }
        else if(edges[j].fromID == CurrentlyEditing) {
          edgesToDelete.push(edges[j]);
        }
      }

      for (var i=0; i<edgesToDelete.length; i++) {
        deleteEdges(edgesToDelete[i]);
      }
      $("#contextmenu").hide();
    }
  }

//   function remhl(nodeID) {
//     var span;
//     console.log("removing");
//     console.log(nodeID);
//     console.log(span);
//     if(span = document.getElementById("node"+nodeID)){
//         console.log("in if");
//         var text = span.textContent || span.innerText;
//         var node = document.createTextNode(text);
//         span.parentNode.replaceChild(node, span);
//     }
// }


  function deleteEdges(edge) {

    edgeID = 'n' + edge.fromID + '-n' + edge.toID;
    edgeFrom = edge.fromID;
    edgeTo = edge.toID;
    tempEdge = document.getElementById(edgeID);
    tempEdge.remove();
    const index = edges.indexOf(edge);
    if (index > -1) { edges.splice(index, 1); }

    for(var i=1; i<nodes.length; i++) {
      if(nodes[i]) {
        if(nodes[i].nodeID == edgeFrom && nodes[i].type != "I" && nodes[i].type != "L" && nodes[i].type != 'EN') {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
        if(nodes[i].nodeID == edgeTo && nodes[i].type != "I" && nodes[i].type != "L" &&  nodes[i].type != 'EN') {
          CurrentlyEditing = nodes[i].nodeID;
          deleteNode(nodes[i]);
        }
      }
    }
  }
