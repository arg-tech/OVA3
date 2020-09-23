

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
              if(i == wa.length-1) {
                phraseArray.push(line)
              }
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
  SVGRootG.appendChild(g)

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
      nbox.setAttribute('style', 'fill:#dedddc;stroke:#969696;stroke-width:1;');
  }else{
      nbox.setAttribute('style', 'fill:#ddeef9;stroke:#3498db;stroke-width:1;');
  }
  g.appendChild(nbox)
  g.appendChild(ntext)
}

function DrawEdge(fromid, toid) {
  var nedge = document.createElementNS("http://www.w3.org/2000/svg", "path");
  nedge.setAttribute('id', 'n' + fromid + '-n' + toid);
  nedge.setAttribute('stroke-width', '1');
  nedge.setAttribute('fill', 'none');
  nedge.setAttribute('stroke', 'black');
  nedge.setAttribute('d', 'M80,30 C200,30 30,380 200,380');
  nedge.setAttribute('marker-end', 'url(#head)');
  SVGRootG.insertBefore(nedge, SVGRootG.childNodes[0]);
}

function cmenu(node, evt) {

  tsvg = document.getElementById('inline').getBoundingClientRect();
  svgleft = tsvg.left;
  svgtop = tsvg.top;
  var newScale = VB[2]/1000;
  var translationX = VB[0];
  var translationY = VB[1];
  //
  //
  // //Calculating new coordinates after panning and zooming
  // var coordx = ((node.x - svgleft) * newScale) + translationX;
  // var coordy = ((node.y  - svgtop)* newScale) + translationY;

    window.contextnode = node;
    $('#contextmenu').empty();
    // $('#contextmenu').css({top: (node.y+85), left: (node.x+210)});
    $('#contextmenu').css({top:(evt.clientY+5), left:evt.clientX-65});
    $('#contextmenu').append( "<a onClick='editpopup(window.contextnode);$(\"#contextmenu\").hide();'>Edit Node</a>" );
    if(node.type == 'I'){
        $('#contextmenu').append( "<a onClick='$(\"#locution_add\").show();$(\"#contextmenu\").hide();'>Add Locution</a>" );
    }
    $('#contextmenu').append( "<a onClick='deleteNode(window.contextnode);$(\"#contextmenu\").hide();'>Delete Node</a>" );
    //if(window.msel.length > 0){
    //    $('#contextmenu').append( "<a onClick='dcEdges();$(\"#contextmenu\").hide();'>Delete Edges</a>" );
    //}

    $('#contextmenu').show();
}

function editpopup(node) {
    $('#n_text').hide(); $('#n_text_label').hide();
    $('#s_type').hide(); $('#s_type_label').hide();
    $('#s_ischeme').hide(); $('#s_ischeme_label').hide();
    $('#s_cscheme').hide(); $('#s_cscheme_label').hide();
    $('#s_lscheme').hide(); $('#s_lscheme_label').hide();
    $('#s_mscheme').hide(); $('#s_mscheme_label').hide();
    $('#s_pscheme').hide(); $('#s_pscheme_label').hide();
    $('#s_tscheme').hide(); $('#s_tscheme_label').hide();
    $('#descriptor_selects').hide();
    $('#cq_selects').hide();
    $('#s_sset').hide(); $('#s_sset_label').hide();

    if(node.type == 'I' || node.type == 'L' || node.type == 'EN'){
        $('#n_text').show();
        $('#n_text_label').show();
    }else{
        nodesIn = getNodesIn(node);

        var addRA = true;
        var addCA = true;
        var addYA = false;
        var addTA = true;
        var addPA = true;
        var addMA = true;

        for(var i = 0; i < nodesIn.length; i++){
            if(nodesIn[i].type == 'L' || nodesIn[i].type == 'TA'){
                addYA = true;
            }
        }

        $('#s_type').empty();
        if(addRA){
            $('#s_type').append('<option value="RA">RA</option>');
        }
        if(addCA){
            $('#s_type').append('<option value="CA">CA</option>');
        }
        if(addYA){
            $('#s_type').append('<option value="YA">YA</option>');
            }
        if(addTA){
            $('#s_type').append('<option value="TA">TA</option>');
        }
        if(addMA){
            $('#s_type').append('<option value="MA">MA</option>');
            }
        if(addPA){
            $('#s_type').append('<option value="PA">PA</option>');
        }

        $('#s_type').show();
        $('#s_type_label').show();
        $('#s_type').val(node.type);

        if(node.scheme == 0){
            //$('#node_edit').height(180);
        }else{
            setdescriptors(node.scheme, node);
            //$('#node_edit').height(350);
            $('#descriptor_selects').show();
        }

        if(node.type == 'RA'){
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_ischeme').show();
            $('#s_ischeme_label').show();
            $('#s_ischeme').val(node.scheme);
        }else if(node.type == 'CA'){
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_cscheme').show();
            $('#s_cscheme_label').show();
            $('#s_cscheme').val(node.scheme);
        }else if(node.type == 'YA'){
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_lscheme').show();
            $('#s_lscheme_label').show();
            $('#s_lscheme').val(node.scheme);
        }else if(node.type == 'MA'){
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_mscheme').show();
            $('#s_mscheme_label').show();
            $('#s_mscheme').val(node.scheme);
        }else if(node.type == 'PA'){
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_pscheme').show();
            $('#s_pscheme_label').show();
            $('#s_pscheme').val(node.scheme);
        }else if(node.type == 'TA'){
            $('#s_sset').show(); $('#s_sset_label').show();
            $('#s_tscheme').show();
            $('#s_tscheme_label').show();
            $('#s_tscheme').val(node.scheme);
        }
    }

    $('#n_text').val(node.text);
    FormOpen = true;
    console.log(FormOpen);
    $('#modal-shade').show();
    $('#node_edit').slideDown(100, function() {
        $('#n_text').focus();
    });
}

function showschemes(type) {
    if(type == 'RA'){
        $('#s_ischeme').show();
        $('#s_ischeme_label').show();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
    }else if(type == 'CA'){
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').show();
        $('#s_cscheme_label').show();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
    }else if(type == 'YA'){
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').show();
        $('#s_lscheme_label').show();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
    }else if(type == 'MA'){
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').show();
        $('#s_mscheme_label').show();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
    }else if(type == 'PA'){
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').show();
        $('#s_pscheme_label').show();
        $('#s_tscheme').hide();
        $('#s_tscheme_label').hide();
    }else if(type == 'TA'){
        $('#s_ischeme').hide();
        $('#s_ischeme_label').hide();
        $('#s_cscheme').hide();
        $('#s_cscheme_label').hide();
        $('#s_lscheme').hide();
        $('#s_lscheme_label').hide();
        $('#s_mscheme').hide();
        $('#s_mscheme_label').hide();
        $('#s_pscheme').hide();
        $('#s_pscheme_label').hide();
        $('#s_tscheme').show();
        $('#s_tscheme_label').show();
    }

}

function drawResetButton() {
   //var defs = instance.svg.querySelector('defs');
   // var style = document.createElementNS("http://www.w3.org/2000/svg", 'style');
   // style.setAttribute('id', 'svg-pan-zoom-controls-styles');
   // style.setAttribute('type', 'text/css');
   //style.textContent = '.svg-pan-zoom-control { cursor: pointer; fill: black; fill-opacity: 0.333; } .svg-pan-zoom-control:hover { fill-opacity: 0.8; } .svg-pan-zoom-control-background { fill: white; fill-opacity: 0.5; } .svg-pan-zoom-control-background { fill-opacity: 0.8; }';
   // reset
   var resetPanZoomControl = document.createElementNS("http://www.w3.org/2000/svg", 'g');
   resetPanZoomControl.setAttribute('id', 'svg-pan-zoom-reset-pan-zoom');
   resetPanZoomControl.setAttribute('transform', 'translate(850 650) scale(0.4)');
   //resetPanZoomControl.setAttribute('class', 'svg-pan-zoom-control');
   resetPanZoomControl.setAttribute('cursor', 'pointer');
   resetPanZoomControl.setAttribute('fill', 'black');
   resetPanZoomControl.setAttribute('fill-opacity', 0.333);
   //resetPanZoomControl.addEventListener('click', function() {instance.getPublicInstance().reset()}, false);
   //resetPanZoomControl.addEventListener('touchstart', function() {instance.getPublicInstance().reset()}, false);

   var resetPanZoomControlBackground = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); // TODO change these background space fillers to rounded rectangles so they look prettier
   // resetPanZoomControlBackground.setAttribute('width', '182'); // larger than expected because the whole group is transformed to scale down
   // resetPanZoomControlBackground.setAttribute('height', '58');
   resetPanZoomControlBackground.setAttribute('fill', 'white');
   resetPanZoomControlBackground.setAttribute('fill-opacity', 0.5);
   //resetPanZoomControlBackground.setAttribute('class', 'svg-pan-zoom-control-background');
   resetPanZoomControl.appendChild(resetPanZoomControlBackground);

   var resetPanZoomControlShape1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
   resetPanZoomControlShape1.setAttribute('d', 'M33.051,20.632c-0.742-0.406-1.854-0.609-3.338-0.609h-7.969v9.281h7.769c1.543,0,2.701-0.188,3.473-0.562c1.365-0.656,2.048-1.953,2.048-3.891C35.032,22.757,34.372,21.351,33.051,20.632z');
   //resetPanZoomControlShape1.setAttribute('class', 'svg-pan-zoom-control-element');
   resetPanZoomControl.appendChild(resetPanZoomControlShape1);

   var resetPanZoomControlShape2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
   resetPanZoomControlShape2.setAttribute('d', 'M170.231,0.5H15.847C7.102,0.5,0.5,5.708,0.5,11.84v38.861C0.5,56.833,7.102,61.5,15.847,61.5h154.384c8.745,0,15.269-4.667,15.269-10.798V11.84C185.5,5.708,178.976,0.5,170.231,0.5z M42.837,48.569h-7.969c-0.219-0.766-0.375-1.383-0.469-1.852c-0.188-0.969-0.289-1.961-0.305-2.977l-0.047-3.211c-0.03-2.203-0.41-3.672-1.142-4.406c-0.732-0.734-2.103-1.102-4.113-1.102h-7.05v13.547h-7.055V14.022h16.524c2.361,0.047,4.178,0.344,5.45,0.891c1.272,0.547,2.351,1.352,3.234,2.414c0.731,0.875,1.31,1.844,1.737,2.906s0.64,2.273,0.64,3.633c0,1.641-0.414,3.254-1.242,4.84s-2.195,2.707-4.102,3.363c1.594,0.641,2.723,1.551,3.387,2.73s0.996,2.98,0.996,5.402v2.32c0,1.578,0.063,2.648,0.19,3.211c0.19,0.891,0.635,1.547,1.333,1.969V48.569z M75.579,48.569h-26.18V14.022h25.336v6.117H56.454v7.336h16.781v6H56.454v8.883h19.125V48.569z M104.497,46.331c-2.44,2.086-5.887,3.129-10.34,3.129c-4.548,0-8.125-1.027-10.731-3.082s-3.909-4.879-3.909-8.473h6.891c0.224,1.578,0.662,2.758,1.316,3.539c1.196,1.422,3.246,2.133,6.15,2.133c1.739,0,3.151-0.188,4.236-0.562c2.058-0.719,3.087-2.055,3.087-4.008c0-1.141-0.504-2.023-1.512-2.648c-1.008-0.609-2.607-1.148-4.796-1.617l-3.74-0.82c-3.676-0.812-6.201-1.695-7.576-2.648c-2.328-1.594-3.492-4.086-3.492-7.477c0-3.094,1.139-5.664,3.417-7.711s5.623-3.07,10.036-3.07c3.685,0,6.829,0.965,9.431,2.895c2.602,1.93,3.966,4.73,4.093,8.402h-6.938c-0.128-2.078-1.057-3.555-2.787-4.43c-1.154-0.578-2.587-0.867-4.301-0.867c-1.907,0-3.428,0.375-4.565,1.125c-1.138,0.75-1.706,1.797-1.706,3.141c0,1.234,0.561,2.156,1.682,2.766c0.721,0.406,2.25,0.883,4.589,1.43l6.063,1.43c2.657,0.625,4.648,1.461,5.975,2.508c2.059,1.625,3.089,3.977,3.089,7.055C108.157,41.624,106.937,44.245,104.497,46.331z M139.61,48.569h-26.18V14.022h25.336v6.117h-18.281v7.336h16.781v6h-16.781v8.883h19.125V48.569z M170.337,20.14h-10.336v28.43h-7.266V20.14h-10.383v-6.117h27.984V20.14z');
   //resetPanZoomControlShape2.setAttribute('class', 'svg-pan-zoom-control-element');
   resetPanZoomControl.appendChild(resetPanZoomControlShape2);

   return resetPanZoomControl
 }
