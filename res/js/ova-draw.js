
function DrawNode(nid, type, txt, nx, ny)
{
  var phraseArray = [];
  if(txt.length > 36){
      var wa = txt.split(' ');
      line = "";
      for (var i=0;i<wa.length;i++) {
          word = wa[i];
          if(line.length == 0){
              line = word;
          }else if(line.length + word.length <= 36){
              line = line + ' ' + word;
              if(i == wa.length-1) {
                phraseArray.push(line)
              }
          }else{
              phraseArray.push(line);
              line = word;
          }
      }
    }else{
        phraseArray.push(txt);
    }

  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute('id', nid);
  g.setAttribute('focusable', 'true');

  var ntext=document.createElementNS("http://www.w3.org/2000/svg", "text");
  ntext.setAttribute('x', nx);
  ntext.setAttribute('y', ny);
  ntext.setAttribute('style', 'font-family: sans-serif; font-weight: normal; font-style: normal;font-size: 10px;');

  for(var i=0;i<phraseArray.length;i++){
    var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan.setAttribute('text-anchor','middle');
    tspan.setAttribute('x', nx);
    tspan.setAttribute('dy', 14);
    var myText = document.createTextNode(phraseArray[i]);
    tspan.appendChild(myText);
    ntext.appendChild(tspan);
  }

  g.appendChild(ntext)
  SVGRoot.appendChild(g)

  var textbox = ntext.getBBox();
  var textwidth = textbox.width;
  var textheight = textbox.height;
  var nbox=document.createElementNS("http://www.w3.org/2000/svg", "rect")

  if(type == 'I' || type == 'L' || type == 'EN'){
      nbox.setAttribute('x', nx-(textwidth/2)-16);
      nbox.setAttribute('y', ny-2);
      nbox.setAttribute('width', textwidth+32);
      nbox.setAttribute('height', textheight+14);
      nbox.setAttribute('rx', '5');
      nbox.setAttribute('ry', '5');
      nbox.setAttribute('style', 'fill:#ddeef9;stroke:#3498db;stroke-width:1;')
  }else{
        nbox.setAttribute('x', nx-(textwidth/2)-16);
        nbox.setAttribute('y', ny-7);
        nbox.setAttribute('width', textwidth+32);
        nbox.setAttribute('height', textheight+24);
        nbox.setAttribute('rx', (textwidth+32)/2);
        nbox.setAttribute('ry', (textheight+24)/2);
    }
  if(window.bwmode){
      nbox.setAttribute('style', 'fill:#ffffff;stroke:#000000;stroke-width:1;');
  }else if(type == 'RA'){
      nbox.setAttribute('style', 'fill:#def8e9;stroke:#2ecc71;stroke-width:1;');
  }else if(type == 'CA'){
      nbox.setAttribute('style', 'fill:#fbdedb;stroke:#e74c3c;stroke-width:1;');
  }else if(type == 'YA'){
      nbox.setAttribute('style', 'fill:#fdf6d9;stroke:#f1c40f;stroke-width:1;');
  }else if(type == 'TA'){
      nbox.setAttribute('style', 'fill:#eee3f3;stroke:#9b59b6;stroke-width:1;');
  }else if(type == 'MA'){
      nbox.setAttribute('style', 'fill:#fbeadb;stroke:#e67e22;stroke-width:1;');
  }else if(type == 'EN'){
      nbox.setAttribute('style', 'fill:#c4c3c2;stroke:#969696;stroke-width:1;');
  }else{
      nbox.setAttribute('style', 'fill:#ddeef9;stroke:#3498db;stroke-width:1;');
  }
  g.appendChild(nbox)
  g.appendChild(ntext)
}

function cmenu(node) {
    window.contextnode = node;
    $('#contextmenu').empty();
    $('#contextmenu').css({top: node.y+85, left: node.x+210});
    $('#contextmenu').append( "<a onClick='editNode(window.contextnode);$(\"#contextmenu\").hide();'>Edit Node</a>" );
    if("plus" in getUrlVars() && node.type == 'I'){
        $('#contextmenu').append( "<a onClick='$(\"#locution_add\").show();$(\"#contextmenu\").hide();'>Add Locution</a>" );
    }
    $('#contextmenu').append( "<a onClick='deleteNode(window.contextnode);$(\"#contextmenu\").hide();'>Delete Node</a>" );
    //if(window.msel.length > 0){
    //    $('#contextmenu').append( "<a onClick='dcEdges();$(\"#contextmenu\").hide();'>Delete Edges</a>" );
    //}

    $('#contextmenu').show();
}
