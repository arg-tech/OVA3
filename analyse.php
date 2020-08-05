<?php
require_once('config.php');

if (isset($_GET['af']) && isset($_GET['as'])) {
  $cookie_value = $_GET['af'] . ";" . $_GET['as'];
  setcookie("ovauser", $cookie_value, time() + (86400 * 180), "/");
}

$source = $_GET['url'];
if ($source == "local") {
  $analysis = "localtext.html";
} elseif (substr($source, 0, 4) != "http") {
  $rtime = time();
  $salt = "ovas@lt22";
  $hash = md5($rtime . $salt);
  $analysis = "browser.php?r=" . $rtime . "&h=" . $hash . "&url=http://" . $_GET['url'];
} else {
  $rtime = time();
  $salt = "ovas@lt22";
  $hash = md5($rtime . $salt);
  $analysis = "browser.php?r=" . $rtime . "&h=" . $hash . "&url=" . $_GET['url'];
}

$pro = false;
$plusval = '';
if (isset($_GET['plus']) && $_GET['plus'] == 'true') {
  $pro = true;
  $plusval = "&plus=true";
}
if (isset($_GET['akey'])) {
  $akey = $_GET['akey'];
} else {
  //require_once('helpers/mysql_connect.php');

  $akey = md5(time());

  /*$sql = "INSERT INTO analyses (analyst, akey) VALUES (1, :akey)";
  $q = $DBH->prepare($sql);
  $q->execute(array(':akey'=>$akey));*/

  $adb = "";
  $aurl = $_GET['url'];
  /*if(isset($_GET['aifdb'])){
      $adb = "&aifdb=" . $_GET['aifdb'];
      $txt = file_get_contents($TXurl . '/nodeset/' . $_GET['aifdb']);
      if (preg_match("/^http[^ ]*$/i", $txt)) {
          $aurl = $txt;
      }
  }*/
  header('Location:analyse.php?url=' . $aurl . $plusval . $adb . '&akey=' . $akey);
}

$anamejs = 'window.afirstname = "Anon";window.asurname = "User";';
if (isset($_COOKIE['ovauser'])) {
  $user = explode(";", $_COOKIE['ovauser']);
  $af = $user[0];
  $as = $user[1];
  $anamejs = 'window.afirstname = "' . $af . '";window.asurname = "' . $as . '";';
}
?>
<!doctype html>
<html class="no-js" lang="">

<head>
  <meta charset="utf-8">
  <title>OVA from ARG-tech</title>
  <meta name="description" content="">
  <script src="http://code.jquery.com/jquery-2.1.3.min.js"></script>
  <link rel="stylesheet"
    href="http://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.0/css/smoothness/jquery-ui-1.10.0.custom.min.css" />
  <link rel="stylesheet" href="res/css/analysis.css" />

  <script src="http://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.0/jquery-ui.js"></script>
  <script src="res/js/ova-fn.js"></script>
  <script src="res/js/svg-pan-zoom.js"></script>
  <script src="res/js/ova-model.js"></script>
  <script src="res/js/ova-analysis.js"></script>
  <script src="res/js/ova-draw.js"></script>
  <script src="res/js/ova-ctrl.js"></script>
  <script src="res/js/ova-save.js"></script>
  <script src="res/js/ova-init.js"></script>
  <script>
    window.DBurl = '<?php echo $DBurl; ?>';
    window.SSurl = '<?php echo $SSurl; ?>';
    window.akey = '<?php echo $akey; ?>';
    <?php echo $anamejs; ?>
  </script>
</head>

<body>
  <div id="modal-shade"></div>
  <div class="modal-dialog" id="modal-save">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Save Analysis</h4>
      </div>
      <div class="modal-body">
        <!--todo fix and test all save functions-->
        <ul class="btnlist">
          <li><a href="#" onClick="console.log('save to file clicked'); save2file(); return false;">
              <div class="btnicn" style="background-image: url('res/img/icon-savefile.svg');">&nbsp;</div> Save to local
              file
            </a></li>
          <li><a href="#" onClick="console.log('save as image clicked');">
              <!-- todo: onClick="canvas2image(); return false;"> -->
              <div class="btnicn" style="background-image: url('res/img/icon-saveimg.svg');">&nbsp;</div> Save as image
            </a></li>
          <li><a href="#" onClick="console.log('save to db clicked');">
              <!-- todo: onClick="save2db(); $('#save_analysis').hide(); return false;"-->
              <div class="btnicn" style="background-image: url('res/img/icon-savedb.svg');">&nbsp;</div> Save to AIFdb
            </a></li>
        </ul>
      </div>
      <div class="modal-btns">
        <a class="cancel" href="#" onClick="$('#modal-save').hide();$('#modal-shade').hide(); return false;">&#10008; Cancel</a>
      </div>
    </div>
  </div>

  <div id="modal-shade"></div>
  <div class="modal-dialog" id="modal-load">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Load Analysis</h4>
      </div>
      <div class="modal-body">
        <!-- todo: load file into ova once selected, change styling-->
        <form id="f_loadfile" class="fstyle">
          <label for="n_file" id="n_file_label">Select a file to load</label>
          <input type="file" id="n_file" name="files[]" multiple />
        </form>
        <output id="list"></output>
      </div>
      <div class="modal-btns">
        <a class="cancel" href="#" onClick="$('#modal-load').hide();$('#modal-shade').hide(); return false;">&#10008; Close</a>
      </div>
    </div>
  </div>
  </div>

  <div id="toolbar">
    <?php
    $newurl = "analyse.php?url=" . $_GET['url'] . $plusval;
    ?>
    <a href="http://arg.tech/~nicole/index.php" class="home"><img src="res/img/logo.svg" /></a> <!--todo: change link to homepage after testing-->
    <a onClick='$("#xmenu").toggle("slide", {direction: "right"}, "slow");' class="icon" style="background-position: -126px 50%;"></a>
    <div class="divider"></div>
    <a onClick="$('#modal-load').show(); $('#modal-shade').show();" class="icon" style="background-position: -210px 50%;"><span class="tooltiptext">Load&nbsp;Analysis</span></a>
    <a onClick="$('#modal-save').show(); $('#modal-shade').show();" class="icon" style="background-position: -84px 50%;"><span class="tooltiptext">Save&nbsp;Analysis</span></a>
    <a href="<?php echo $newurl; ?>" class="icon" style="background-position: -168px 50%;"><span class="tooltiptext">New&nbsp;Analysis</span></a>
    <div class="divider"></div>
    <a onClick="console.log('add edge btn clicked'); edgeMode('switch'); return false;" class="icon" id="eadd" style="background-position: -42px 50%;"><span class="tooltiptext">Add&nbsp;Edge</span></a> <!-- todo: add a CA when atk selected instead of RA -->
    <a onClick="console.log('add node btn clicked'); nodeMode('switch'); return false;" class="icon" id="nadd" style="background-position: -0px 50%;"><span class="tooltiptext">Add&nbsp;Node</span></a> <!-- todo: add node where selected, deselect btn once node added-->
  </div>

  <div id="xmenu">
    <a class="xicon">
      <div class="icn" style="background-position: -294px 50%;"></div>
      <div class="txt">Account</div>
    </a>
    <a class="xicon">
      <div class="icn" style="background-position: -252px 50%;"></div>
      <div class="txt">Settings</div>
    </a>
  </div>

  <div id="contextmenu"></div>

  <div id="node_edit" class="modal-box">
    <div class="modal-header">
      <h4>Edit Node</h4>
      <!-- This is the instruction button: -->
      <!-- <a href="javascript:void(0);" class="helpbtn" onclick="nodeTut(); return false;">?</a> -->
    </div>
    <form id="node_edit_form" class="fstyle" style="width: 78%;">
      <!-- TODO: id and class names to be changed -->
      <label for="n_text" id="n_text_label">Text</label>
      <textarea id="n_text" name="n_text"></textarea>
    </form>
    <div class="modal-btns">
      <a class="save" href="#" onClick="saveNodeEdit();this.parentNode.parentNode.style.display='none';$('#modal-shade').hide(); return false;">&#x2714; Save</a>
      <a class="cancel" href="#" onClick="this.parentNode.parentNode.style.display='none';$('#modal-shade').hide(); return false;">&#10008; Cancel</a>
    </div>
  </div>

  <div id="modal-save2db" class="modal-box">
    <div id="m_load">Processing<br /><img src="res/img/loading_modal.gif" /></div>
    <div id="m_content" style="text-align: left; font-size: 0.8em; padding: 0px 20px;"></div>
    <div class="modal-btns">
      <a class="cancel" href="#" onClick="$('#modal-save2db').hide();$('#modal-shade').hide(); return false;">&#10008; Close</a>
    </div>
  </div>

  <!--  <a href="http://www.arg.tech" target="_blank" id="devby"><img src="res/img/arg-tech.svg" /></a> -->
  <div id="mainwrap">
    <?php if ($source == "local") { ?>
      <div id="left1">
        <div id="analysis_text" contenteditable="true" spellcheck="false">Enter your text here...</div>
        <!-- data-step="1" data-intro="<p>Enter the text that you want to analyse here.</p><p>Select sections of text to create a node.</p> -->
      </div>
    <?php } else { ?>
      <iframe src="<?php echo $analysis; ?>" id="left1" name="left1" style="width:35%;border-right:1px solid #666;"></iframe> <!-- data-step="1" data-intro="<p>Highlight sections of text from the webpage to create a node.</p>" data-position="right" -->
    <?php } ?>

    <div id="spacer"></div>
    <div id="right1">

      <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
        style="width:80%; height:100%; position:absolute;  right:0; z-index:999; background-color:#fff;"
        onmousedown='Grab(evt);' onmousemove='Drag(evt)' onmouseup='Drop(evt)' onload='Init(evt)' id='inline'>
        <defs>
          <marker id='head' orient="auto" markerWidth='12' markerHeight='10' refX='12' refY='5'>
            <!-- triangle pointing right (+x) -->
            <path d='M0,0 V10 L12,5 Z' fill="black" />
          </marker>
        </defs>
      </svg>
    </div>
  </div>
</body>

</html>