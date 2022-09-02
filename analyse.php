<?php
require_once('config.php');
require_once('helpers/getsource.php');

if (isset($_GET['af']) && isset($_GET['as'])) {
  $cookie_value = $_GET['af'] . ";" . $_GET['as'];
  setcookie("ovauser", $cookie_value, time() + (86400 * 180), "/");
}

$pro = false;
$plusval = '';
if (isset($_GET['plus']) && $_GET['plus'] == 'true') {
  $pro = true;
  $plusval = "&plus=true";
}

$analysisID = 1;
if (isset($_GET['akey'])) {
  $akey = $_GET['akey'];
  require_once('helpers/mysql_connect.php');
  $sql = "SELECT analysisID FROM analyses WHERE akey = :akey";
  $q = $DBH->prepare($sql);
  $q->execute(array(':akey' => $akey));
  $result = $q->fetch(PDO::FETCH_ASSOC);
  if ($result) { //if an analysis ID was found
    $analysisID = $result['analysisID'];
  }
}

if ($analysisID == 1) { //if the analysis ID needs set
  require_once('helpers/mysql_connect.php');

  $akey = md5(time());

  $sql = "INSERT INTO analyses (akey) VALUES (:akey)";
  $q = $DBH->prepare($sql);
  $q->execute(array(':akey' => $akey));
  $analysisID = $DBH->lastInsertId();

  $adb = "";
  $aurl = $_GET['url'];
  if (isset($_GET['aifdb'])) {
    $adb = "&aifdb=" . $_GET['aifdb'];
    $txt = file_get_contents($TXurl . '/nodeset/' . $_GET['aifdb']);
    if (preg_match("/^http[^ ]*$/i", $txt)) {
      $aurl = $txt;
    }
  }
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
  <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.0/css/smoothness/jquery-ui-1.10.0.custom.min.css" />
  <link rel="stylesheet" href="res/css/analysis.css" />
  <link rel="stylesheet" href="res/css/introjs.css" />

  <script src="http://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.0/jquery-ui.js"></script>
  <!-- <script src="res/js/svg-pan-zoom.js"></script> -->
  <script src="res/js/ova-analysis.js"></script>
  <script src="res/js/ova-fn.js"></script>
  <script src="res/js/ova-model.js"></script>
  <script src="res/js/ova-draw.js"></script>
  <script src="res/js/ova-ctrl.js"></script>
  <script src="res/js/ova-save.js"></script>
  <script>
    window.DBurl = '<?php echo $DBurl; ?>';
    window.SSurl = '<?php echo $SSurl; ?>';
    window.analysisID = '<?php echo $analysisID; ?>';
    window.defaultSettings = '<?php echo json_encode($defaultSettings); ?>';
    <?php echo $anamejs; ?>
  </script>
  <script src="res/js/ova-tutorial.js"></script>
  <script src="res/js/ova-init.js"></script>
  <script src="res/js/intro.min.js"></script>
</head>

<body>
  <div id="modal-shade"></div>

  <div class="modal-dialog" id="modal-save">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Save Analysis</h4>
        <a href="javascript:void(0);" class="helpbtn" onclick="saveTut(); return false;">?</a>
      </div>
      <div class="modal-body">
        <ul class="btnlist" id="saveOptions">
          <li><a href="#" onClick="save2file(); return false;" id="saveFileBtn">
              <div class="btnicn" style="background-image: url('res/img/icon-savefile.svg');">&nbsp;</div> Save to local
              file
            </a></li>
          <li><a href="#" onClick="saveAsImage();$('#saveOptions').hide();$('#imageOptions').show();$('#fullDownloadBtn').show();return false;" id="saveImageBtn">
              <div class="btnicn" style="background-image: url('res/img/icon-saveimg.svg');">&nbsp;</div> Save as image
            </a></li>
          <li><a href="#" onClick="save2db(); $('#modal-save').hide(); return false;" id="saveAIFdbBtn">
              <div class="btnicn" style="background-image: url('res/img/icon-savedb.svg');">&nbsp;</div> Save to AIFdb
            </a></li>
        </ul>
        <form id="imageOptions" class="fstyle" style="display:none;">
          <div style="margin-bottom:2%;">
            <p>Please select to save as an image:</p>
            <div onclick="checkRadio('fullImage');$('#selectBtn').hide();$('#fullDownloadBtn').show();$('#partDownloadBtn').hide();">
              <input type="radio" id="fullImage" name="saveImage" value="full" checked>
              <label for="fullImage" class="radio_label">Save the full analysis</label>
            </div>
            <div onclick="checkRadio('selectImage');$('#selectBtn').show();$('#partDownloadBtn').show();$('#fullDownloadBtn').hide();" style="margin:6% 0;">
              <input type="radio" id="selectImage" name="saveImage" value="select">
              <label for="selectImage" class="radio_label">Select part of the analysis</label>
              <a class="btn" href="#" id="selectBtn" onclick="saveAsImage();" style="display:none;float:none;margin-left:4%;">Select</a>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-btns">
        <a class="save" href="#" id="fullDownloadBtn" style="display:none;" onclick="closeModal('#modal-save');$('#fullDownloadBtn').hide();$('#partDownloadBtn').hide();$('#imageOptions').hide();$('#selectBtn').hide();$('#saveOptions').show();">&#x2714; Download Image</a>
        <a href="#" id="partDownloadBtn" style="display:none;">&#x2714; Download Image</a>
        <a class="cancel" href="#" onClick="closeModal('#modal-save');checkRadio('fullImage');$('#fullDownloadBtn').hide();$('#partDownloadBtn').hide();$('#imageOptions').hide();$('#selectBtn').hide();$('#saveOptions').show();">&#10008; Cancel</a>
      </div>
    </div>
  </div>

  <div class="modal-dialog" id="modal-save2db">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Save to AIFdb</h4>
      </div>
      <div class="modal-body">
        <div id="m_load">Processing<br /><img src="res/img/loading_modal.gif" /></div>
        <div id="m_content"></div>
        <div id="m_confirm"></div>
      </div>
      <div class="modal-btns">
        <a class="cancel" href="#" onClick="$('#m_confirm').hide(); closeModal('#modal-save2db'); return false;">&#10008; Close</a>
      </div>
    </div>
  </div>

  <div class="modal-dialog" id="modal-load">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Load Analysis</h4>
        <a href="javascript:void(0);" class="helpbtn" onclick="loadTut(); return false;">?</a>
      </div>
      <div class="modal-body">
        <form id="f_loadfile" class="fstyle" action="javascript:void(0);">
          <div id="load-replace" style="display:none;">
            <p>Please select where to load the analysis:</p>
            <input type="radio" id="loadReplace" name="load" value="replace">
            <label for="loadReplace" class="radio_label">Replace the current analysis</label>
            <input type="radio" id="loadBelow" name="load" value="below" checked>
            <label for="loadBelow" class="radio_label">Below the current analysis</label>
            <!-- <input type="radio" id="loadBeside" name="load" value="beside">
            <label for="loadBeside" class="radio_label">Beside</label> -->
          </div>
          <div id="load-file" onclick="checkRadio('loadFromFile'); $('#nsetID_valid').hide();" style="margin-top:8%;">
            <input type="radio" id="loadFromFile" name="loadFrom" value="file" checked>
            <label for="n_file" id="n_file_label" class="radio_label">Select a file to load:</label>
            <input type="file" id="n_file" name="files[]" multiple style="width:96%;" />
          </div>
          <div id="load-corpus" onclick="checkRadio('loadFromCorpus'); $('#nsetID_valid').hide();" style="margin-top:4%;">
            <input type="radio" id="loadFromCorpus" name="loadFrom" value="corpus">
            <label for="corpus_sel" id="corpus_sel_label" class="radio_label">Select a corpus to load:</label>
            <select id="corpus_sel" style="width:98%;">
              <option value="0" selected>--No corpus selected--</option>
            </select>
          </div>
          <div id="load-nodeset" onclick="checkRadio('loadFromNSet'); $('#nsetID_valid').show();" style="margin:4% 0;">
            <input type="radio" id="loadFromNSet" name="loadFrom" value="nSetID">
            <label for="nsetID" id="nsetID_label" class="radio_label">Enter the node set ID of an analysis to load:</label>
            <input type="number" id="nsetID" style="width:96%;text-align:center;" placeholder="Enter a node set ID, e.g. 12345" min="1" max="999999999" />
            <span id="nsetID_valid" class="validity" style="display:none;"></span>
          </div>
        </form>
        <div id="c_loading" style="display:none;">
          <p id="loading_name">Loading</p>
          <img src="res/img/loading_modal.gif" style="width:70%;" />
          <p class="caption">The analysis will continue loading even if this modal is closed.</p>
        </div>
        <output id="list" style="display:none;"></output>
      </div>
      <div class="modal-btns">
        <a class="save" href="#" id="loadBtn" onClick="loadBtn()">&#x2714; Load Analysis</a>
        <a class="cancel" href="#" onClick="closeModal('#modal-load');">&#10008; Close</a>
      </div>
    </div>
  </div>

  <div id="toolbar">
    <?php
    $newurl = "analyse.php?url=" . $_GET['url'] . $plusval;
    ?>
    <a href="index.php" class="home"><img src="res/img/logo.svg" /></a>
    <a onClick='$("#xmenu").toggle("slide", {direction: "right"}, "slow");' class="icon" id="xmenutoggle" style="background-position: -126px 50%;"></a>
    <div class="divider"></div>
    <a onClick="mainTut();" class="icon" id="tutorial" style="display:none; background-position: -378px 50%;"><span class="tooltiptext">Tutorial</span></a>
    <div class="divider"></div>
    <a onClick="genldot();" class="icon" id="alay" style="display:none; background-position: -420px 50%;"><span class="tooltiptext">AutoLayout</span></a>
    <div class="divider"></div>
    <a onClick="showReplace(); openModal('#modal-load');" class="icon" id="loada" style="display:none; background-position: -210px 50%;"><span class="tooltiptext">Load&nbsp;Analysis</span></a>
    <a onClick="openModal('#modal-save');" class="icon" id="savea" style="display:none; background-position: -84px 50%;"><span class="tooltiptext">Save&nbsp;Analysis</span></a>
    <a href="<?php echo $newurl; ?>" class="icon" id="newa" style="display:none; background-position: -168px 50%;"><span class="tooltiptext">New&nbsp;Analysis</span></a>
    <div class="divider"></div>
    <a onClick="return false;" class="icon" id="eadd" style="display:none; background-position: -42px 50%;"><span class="tooltiptext">Add&nbsp;Edge</span></a>
    <a onClick="nodeMode('switch'); return false;" class="icon" id="nadd" style="display:none; background-position: -0px 50%;"><span class="tooltiptext">Add&nbsp;Node</span></a>
    <div class="divider"></div>
    <a onClick="undo();" class="icon" id="undo" style="display:none; background-position: -462px 50%;"><span class="tooltiptext">Undo</span></a>
    <div class="divider"></div>
  </div>

  <div id="xmenu">
    <!-- ACCOUNT - Account settings to be possibly implemented -->
    <!-- <a onClick="openModal('#modal-account');" class="xicon">
      <div class="icn" style="background-position: -294px 50%;"></div>
      <div class="txt">Account</div>
    </a> -->
    <a onClick="openModal('#modal-settings');" class="xicon" id="stngs">
      <div class="icn" style="background-position: -252px 50%;"></div>
      <div class="txt">Settings</div>
    </a>
    <a onClick="genlink(); openModal('#modal-share');" class="xicon" id="sharea">
      <div class="icn" style="background-image: url('res/img/icons-pale.svg');background-position: -170px 50%;"></div>
      <div class="txt">Share Analysis</div>
    </a>
    <a onClick="openModal('#modal-help');" class="xicon" id="helpsheet">
      <div class="icn" style="background-image: url('res/img/icons-pale.svg');background-position: -1592px 50%;"></div>
      <div class="txt">Helpsheet</div>
    </a>
    <a onClick="toggleWildcardingMode();" class="xicon" id="wildcarding-mode-toggle">
      <div class="icn" style=""></div>
      <div class="txt">Toggle Wildcarding Mode</div>
    </a>
    <div>
      <a onClick="genldot();" class="xicon" id="alayX" style="display:none;">
        <div class="icn" style="background-position: -420px 50%;"></div>
        <div class="txt">AutoLayout</div>
      </a>
      <a onClick="showReplace(); openModal('#modal-load');" class="xicon" id="loadaX" style="display:none;">
        <div class="icn" style="background-position: -210px 50%;"></div>
        <div class="txt">Load&nbsp;Analysis</div>
      </a>
      <a onClick="openModal('#modal-save');" class="xicon" id="saveaX" style="display:none;">
        <div class="icn" style="background-position: -84px 50%;"></div>
        <div class="txt">Save&nbsp;Analysis</div>
      </a>
      <a href="<?php echo $newurl; ?>" class="xicon" id="newaX" style="display:none;">
        <div class="icn" style="background-position: -168px 50%;"></div>
        <div class="txt">New&nbsp;Analysis</div>
      </a>
      <a onClick="return false;" class="xicon" id="eaddX" style="display:none;">
        <div class="icn" style="background-position: -42px 50%;"></div>
        <div class="txt">Add&nbsp;Edge</div>
      </a>
      <a onClick="nodeMode('switch'); return false;" class="xicon" id="naddX" style="display:none;">
        <div class="icn" style="background-position: -0px 50%;"></div>
        <div class="txt">Add&nbsp;Node</div>
      </a>
      <a onClick="undo();" class="xicon" id="undoX" style="display:none;">
        <div class="icn" style="background-position: -462px 50%;"></div>
        <div class="txt">Undo</div>
      </a>
      <a onClick="mainTut();" class="xicon" id="tutorialX" style="display:none;">
        <div class="icn" style="background-position: -378px 50%;"></div>
        <div class="txt">Tutorial</div>
      </a>
    </div>
  </div>

  <!-- <div class="modal-dialog" id="modal-account">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Account</h4>
      </div>
      <div class="modal-body">
      </div>
      <div class="modal-btns">
        <a class="cancel" href="#" onClick="closeModal('#modal-account'); return false;">&#10008; Close</a>
      </div>
    </div>
  </div> -->

  <div class="modal-dialog" id="modal-edge">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Add Edge</h4>
        <a href="javascript:void(0);" class="helpbtn" onclick="edgeTut(); return false;">?</a>
      </div>
      <div class="modal-body">
        <form id="f_edge" class="fstyle">
          <div id="edge_source" style="margin-bottom:5%;">
            <label id="source_text_label" for="source_text">Source Node</label>
            <textarea id="source_text" name="source_text" readonly placeholder="Please select a source node." style="width:75%;"></textarea>
            <a href="#" id="sourceBtn" class="btn" onClick="edgeMode('off');edgeMode('long');closeModal('#modal-edge');return false;" style="margin-top:2%;">Select Source</a>
            <?php if ($pro) { ?>
              <label id="source_L_label" for="sel_source_L">Source Locution</label>
              <select id="sel_source_L" required>
                <option value="0" selected>--No locution selected--</option>
              </select>
            <?php } ?>
          </div>
          <div id="edge_target" style="margin-bottom:5%;">
            <label id="target_text_label" for="target_text">Target Node</label>
            <textarea id="target_text" name="target_text" readonly placeholder="Please select a target node." style="width:75%;"></textarea>
            <a href="#" id="targetBtn" class="btn" onClick="closeModal('#modal-edge');return false;" style="margin-top:2%;">Select Target</a>
            <?php if ($pro) { ?>
              <label id="target_L_label" for="sel_target_L">Target Locution</label>
              <select id="sel_target_L" required>
                <option value="0" selected>--No locution selected--</option>
              </select>
          </div>
          <input type="checkbox" id="mark_node_check" name="mark_node_check" style="display:inline;">
          <label for="mark_node_check" style="display:inline;font-size:0.9em;">Mark the new edges after adding them</label>
          <p id="edge_message" style="font-size:0.9em;color:rgba(224, 46, 66, 1);"></p>
        <?php } else { ?>
      </div>
    <?php } ?>
    </form>
    </div>
    <div class="modal-btns">
      <?php if ($pro) { ?>
        <a class="save" href="#" id="edgeBtn" onClick="addLongEdge(); return false;">&#x2714; Add Edges</a>
      <?php } ?>
      <a class="cancel" href="#" onClick="cancelLongEdge(); return false;">&#10008; Cancel</a>
    </div>
  </div>
  </div>

  <div class="modal-dialog" id="modal-username">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Analyst Details</h4>
      </div>
      <div class="modal-body">
        <form method="GET" action="./analyse.php" id="fs" class="fstyle" style="width:86%; float: left;">
          <p style="padding: 20px 0px;">
            <label>First Name:<br />
              <input type="text" name="af" id="afinput" class="input" value="<?php echo $af; ?>" style="font-size: 22px; padding: 3px; width:90%; color: #666;" /></label>
            <label>Surname:<br />
              <input type="text" name="as" id="asinput" class="input" value="<?php echo $as; ?>" style="font-size: 22px; padding: 3px; width:90%; color: #666;" /></label>
          </p>
        </form>
      </div>
      <div class="modal-btns">
        <a class="save" href="#" onClick="closeModal('#modal-username'); dialogicalModeOnOff(); return false;">&#x2714; Continue</a>
        <a class="cancel" href="#" onClick="closeModal('#modal-username'); return false;">&#10008; Cancel</a>
      </div>
    </div>
  </div>

  <!-- Settings Form Starts Here -->
  <div class="modal-dialog" id="modal-settings">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Settings</h4>
        <a href="javascript:void(0);" class="helpbtn" onclick="setTut(); return false;">?</a>
      </div>
      <div class="modal-body">
        <div id="tab-bar-stg" class="tab-bar">
          <a href="#" id="tab-display" class="btn tab stg selected" onclick="settingsTab(event, 'displaystg')">Display</a>
          <a href="#" id="tab-analysis" class="btn tab stg" onclick="settingsTab(event, 'anastg')">Analysis</a>
          <a href="#" id="tab-schemes" class="btn tab stg" onclick="settingsTab(event, 'schemestg')">Scheme Sets</a>
          <a href="#" id="tab-timestamps" class="btn tab stg" onclick="settingsTab(event, 'timestg')">Timestamps</a>
        </div>
        <form id="settings_form" class="fstyle">
          <div id="displaystg">
            <?php if ($source == "local") { ?>
              <!-- Text Settings  -->
              <div id="txtstg">
                <p id="font-size" style="color: #444; line-height: 36px;">Font Size
                  <a href="#" class="itl" style="background-image: url('res/img/txt-lrg.png');" onClick='setFontSize("tl");'></a>
                  <a href="#" class="itm" style="background-image: url('res/img/txt-med.png');" onClick='setFontSize("tm");'></a>
                  <a href="#" class="its" style="background-image: url('res/img/txt-sml.png');" onClick='setFontSize("ts");'></a>
                </p>
              </div>
            <?php } ?>
            <!-- Black & White Toggle  -->
            <p style="color: #444; line-height: 22px;">Black &amp; White Diagram
              <?php if ($defaultSettings["display"]["black_white"]) { ?>
                <a href="#" id="bwtoggle" class="togglesw on" onClick='$(this).toggleClass("on off"); window.bwmode=!window.bwmode; bwModeOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } else { ?>
                <a href="#" id="bwtoggle" class="togglesw off" onClick='$(this).toggleClass("on off"); window.bwmode=!window.bwmode; bwModeOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } ?>
            </p>
            <!-- Pan Buttons Toggle  -->
            <p style="color: #444; line-height: 22px;">Show Pan &amp; Zoom Buttons
              <?php if (isset($defaultSettings["display"]["panBtns"]) && !$defaultSettings["display"]["panBtns"]) { ?>
                <a href="#" id="panToggle" class="togglesw off" onClick='$(this).toggleClass("on off"); window.panMode=!window.panMode; panModeOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } else { ?>
                <a href="#" id="panToggle" class="togglesw on" onClick='$(this).toggleClass("on off"); window.panMode=!window.panMode; panModeOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } ?>
            </p>
            <!-- Inverse Toggle  -->
            <p style="color: #444; line-height: 22px;">Scroll Direction: Natural
              <?php if ($defaultSettings["display"]["inverse"]) { ?>
                <a href="#" id="inverseToggle" class="togglesw on" onClick='$(this).toggleClass("on off"); window.inverse=!window.inverse; return false;'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } else { ?>
                <a href="#" id="inverseToggle" class="togglesw off" onClick='$(this).toggleClass("on off"); window.inverse=!window.inverse; return false;'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } ?>
            </p>
          </div>
          <div id="anastg" style="display:none;">
            <!-- Dialogical Mode Toggle  -->
            <p style="color: #444; line-height: 22px;">Dialogical Mode
              <?php if ($pro) { ?>
                <a href="#" id="dialogicaltoggle" class="togglesw on" onClick='$(this).toggleClass("on off"); window.dialogicalMode=!window.dialogicalMode; dialogicalModeOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } else { ?>
                <a href="#" id="dialogicaltoggle" class="togglesw off" onClick='$(this).toggleClass("on off"); window.dialogicalMode=!window.dialogicalMode; dialogicalModeOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } ?>
            </p>
            <?php if ($pro) { ?>
              <!-- only if Dialogical Mode is on then show the options for Rapid IAT Mode -->
              <!-- Rapid IAT Mode Toggle -->
              <p style="color: #444; line-height: 22px;">Rapid IAT Mode
                <?php if (isset($_GET['plus']) && $_GET['plus'] == 'true') { ?>
                  <a href="#" id="riattoggle" class="togglesw on" onClick='$(this).toggleClass("on off"); window.rIATMode=!window.rIATMode; return false;'><span class="tson">On</span><span class="tsoff">Off</span></a>
                <?php } else { ?>
                  <a href="#" id="riattoggle" class="togglesw off" onClick='$(this).toggleClass("on off"); window.rIATMode=!window.rIATMode; return false;'><span class="tson">On</span><span class="tsoff">Off</span></a>
                <?php } ?>
              </p>
            <?php } ?>

            <!-- Sticky Add Edge Toggle -->
            <p style="color: #444; line-height: 22px;">Sticky Add Edge
              <?php if ($defaultSettings["analysis"]["eAdd"]) { ?>
                <a href="#" id="eAddtoggle" class="togglesw on" onClick='$("#eAddtoggle").toggleClass("on off"); window.eAddMode=!window.eAddMode; eAddModeOnOff(); return false;'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } else { ?>
                <a href="#" id="eAddtoggle" class="togglesw off" onClick='$("#eAddtoggle").toggleClass("on off"); window.eAddMode=!window.eAddMode; eAddModeOnOff(); return false;'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } ?>
            </p>

            <!-- Critical Questions Toggle -->
            <p style="color: #444; line-height: 22px;">Critical Questions
              <?php if ($defaultSettings["analysis"]["cq"]) { ?>
                <a href="#" id="cqtoggle" class="togglesw on" onClick='$("#cqtoggle").toggleClass("on off"); window.cqmode=!window.cqmode; return false;'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } else { ?>
                <a href="#" id="cqtoggle" class="togglesw off" onClick='$("#cqtoggle").toggleClass("on off"); window.cqmode=!window.cqmode; return false;'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } ?>
            </p>
          </div>
          <div id="timestg" style="display:none;">
            <p style="color: #444; line-height: 22px;"> Timestamp Format:
              <label id="timestampRegExp"> [hh:mm:ss]
                <!-- <a href="#" class="btn" onClick="console.log('change timestamp RegExp'); return false;">Change</a> -->
              </label>
            </p>
            <p id="startTimestamp" style="color: #444; line-height: 22px;"> Start Date and Time:
              <label for="startTimestampBtn" id="startTimestampLabel"> <?php echo $defaultSettings["timestamp"]["startdatestmp"] ?></label>
              <a href="#" id="startTimestampBtn" class="btn" onClick="$('#delTimestampBtn').hide();openModal('#modal-timestamps'); return false;">Change Start Date and Time</a>
            </p>
            <!-- Add Timestamps Toggle -->
            <p style="color: #444; line-height: 22px;">Add Timestamps
              <?php if ($pro && $defaultSettings["timestamp"]["addTimestamps"]) { ?>
                <a href="#" id="timestamptoggle" class="togglesw on" onClick='$(this).toggleClass("on off"); window.addTimestamps=!window.addTimestamps; addTimestampsOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } else { ?>
                <a href="#" id="timestamptoggle" class="togglesw off" onClick='$(this).toggleClass("on off"); window.addTimestamps=!window.addTimestamps; addTimestampsOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } ?>
            </p>
            <!-- Show Timestamps Toggle  -->
            <p style="color: #444; line-height: 22px;">Show Timestamps
              <?php if ($pro && $defaultSettings["timestamp"]["showTimestamps"]) { ?>
                <a href="#" id="showTimestamptoggle" class="togglesw on" onClick='$(this).toggleClass("on off"); window.showTimestamps=!window.showTimestamps; showTimestampsOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } else { ?>
                <a href="#" id="showTimestamptoggle" class="togglesw off" onClick='$(this).toggleClass("on off"); window.showTimestamps=!window.showTimestamps; showTimestampsOnOff();'><span class="tson">On</span><span class="tsoff">Off</span></a>
              <?php } ?>
            </p>
          </div>
          <div id="schemestg" style="display:none;">
            <p style="color: #444; line-height: 22px;">Select Default Scheme Sets:
              <label for="ra_sset" id="ra_sset_label">RA:</label>
              <select id="ra_sset" onChange="setDefaultSchemeset('RA', this.value);">
                <option value="0">All Schemes</option>
              </select>
              <label for="ca_sset" id="ca_sset_label">CA:</label>
              <select id="ca_sset" onChange="setDefaultSchemeset('CA', this.value);">
                <option value="0">All Schemes</option>
              </select>
              <label for="ma_sset" id="ma_sset_label">MA:</label>
              <select id="ma_sset" onChange="setDefaultSchemeset('MA', this.value);">
                <option value="0">All Schemes</option>
              </select>
              <?php if ($pro) { ?>
                <!-- only if Dialogical Mode is on then show the options for YAs, TAs and PAs -->
                <label for="ya_sset" id="ya_sset_label">YA:</label>
                <select id="ya_sset" onChange="setDefaultSchemeset('YA', this.value);">
                  <option value="0">All Schemes</option>
                </select>
                <label for="ta_sset" id="ta_sset_label">TA:</label>
                <select id="ta_sset" onChange="setDefaultSchemeset('TA', this.value);">
                  <option value="0">All Schemes</option>
                </select>
                <label for="pa_sset" id="pa_sset_label">PA:</label>
                <select id="pa_sset" onChange="setDefaultSchemeset('PA', this.value);">
                  <option value="0">All Schemes</option>
                </select>
              <?php } ?>
            </p>
          </div>
        </form>
      </div>
      <div class="modal-btns">
        <a class="cancel" href="#" onClick="closeModal('#modal-settings'); return false;">&#10008; Close</a>
      </div>
    </div>
  </div>
  <!-- Settings Form Ends Here -->

  <!-- Share analysis Form starts here -->
  <div class="modal-dialog" id="modal-share">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Share Analysis</h4>
      </div>
      <div class="modal-body">
        <form id="share_form" class="fstyle" action="javascript:void(0);">
          <label> Share this analysis: </label>
          <input type="text" id="shareinput" value="Generating link" onClick="this.select();" style="font-size: 16px; padding: 3px; width:90%;" />
          <p id="edited-by" style="color: #444; font-size: 12px;"></p>
        </form>
      </div>
      <div class="modal-btns">
        <a class="cancel" href="#" onClick="closeModal('#modal-share'); FormOpen = false; return false;">&#10008; Close</a>
      </div>
    </div>
  </div>
  <!-- Share analysis form ends here -->

  <!-- Timestamp modal starts here -->
  <div class="modal-dialog" id="modal-timestamps">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Set Date and Time</h4>
      </div>
      <div class="modal-body" style="margin:0 20%;">
        <form id="timestamps_form" class="fstyle">
          <?php $timestamp = explode(" ", $defaultSettings["timestamp"]["startdatestmp"]); ?>
          <label for="dateInput"> Start Date: (dd/mm/yyyy) </label>
          <input type="date" id="dateInput" style="font-size: 16px; padding: 3px; width:70%; text-align:center;" required pattern="\d{4}/\d{2}/\d{2}" />
          <span class="validity"></span>

          <label for="timeInput"> Start Time: (hh:mm:ss) </label>
          <input type="time" id="timeInput" value="<?php echo $timestamp[1] ?>" style="font-size: 16px; padding: 3px; width:70%; text-align:center;" step="1" min="00:00:01" max="23:59:59" required />
          <span class="validity"></span>

          <label for="timezoneInput"> Timezone: (+/- hh:mm) <br> GMT
            <select id="timezoneSelect" style="font-size: 16px; padding: 3px; width:auto;">
              <option value="-">-</option>
              <option value="+" selected>+</option>
            </select>
            <input type="time" id="timezoneInput" value="00:00" style="font-size: 16px; padding: 3px; width:40%; text-align:center;" required min="00:00" max="14:00" />
            <span class="validity"></span>
          </label>
        </form>
      </div>
      <ul class="btnlist">
        <li><a href="#" id="delTimestampBtn" style="display:none;margin:0 17%;" onClick="deleteTimestamp(); return false;" class="bgred">
            <div class="btnicn" style="background-image: url('res/img/icon-delnode.png');">&nbsp;</div> Delete Timestamp
          </a></li>
      </ul>
      <div class="modal-btns">
        <a class="save" href="#" onClick="setTimestampStart(); return false;">&#x2714; Save</a>
        <a class="cancel" href="#" onClick="$('#delTimestampBtn').hide();closeModal('#modal-timestamps'); FormOpen = false; return false;">&#10008; Cancel</a>
      </div>
    </div>
  </div>
  <!-- Timestamp modal ends here -->

  <!-- Helpsheet modal starts here -->
  <div class="modal-dialog" id="modal-help">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Helpsheet</h4>
        <!-- <a href="javascript:void(0);" class="helpbtn" onclick="setTut(); return false;">?</a> -->
      </div>
      <div class="modal-body">
        <div id="tab-bar-help" class="tab-bar">
          <a href="#" id="tab-shortcuts" class="btn tab helpsheet selected" onclick="helpTab(event, 'shortcuts-help')">Keyboard Shortcuts</a>
          <a href="#" id="tab-nodes" class="btn tab helpsheet" onclick="helpTab(event, 'node-help')">Nodes</a>
          <a href="#" id="tab-edges" class="btn tab helpsheet" onclick="helpTab(event, 'edge-help')">Edges</a>
          <a href="#" id="tab-timestamps-help" class="btn tab helpsheet" onclick="helpTab(event, 'timestamp-help')">Timestamps</a>
        </div>
        <form id="help-form" class="fstyle">
          <div id="shortcuts-help">
            <strong>Keyboard Shortcuts:</strong>
            <p style="color: #444; font-size: 12px;">
            <pre>
<strong>shift+drag</strong> from one node to another: add RA (inference) edge
<strong>c+drag</strong> from one node to another: add CA (conflict) edge
<strong>m+drag</strong> from one node to another: add MA (rephrase) edge
<br>
<strong>ctrl+click</strong> on node: open edit node menu
<strong>click+delete</strong> on node: delete the selected node
<strong>enter</strong> editing node's text: save your edit to the node
<strong>shift+enter</strong> editing node's text: add a new line to the node's text
<strong>dblclick</strong> on highlighted text: move canvas to the node for the text
<br>
<strong>ctrl+z</strong> on canvas: undo changes you made to an analysis
<strong>alt+click</strong> on canvas: draw a box to multi select
<strong>r</strong> on canvas: reset view
<strong>click+drag</strong> on canvas: move canvas
<strong>arrow keys: </strong> move canvas
<strong>+/- : </strong> zoom in/out
</pre>
            </p>
          </div>
          <div id="node-help" style="display:none;">
            <strong>Adding Nodes to the Canvas</strong>
            <p style="color: #444; font-size: 12px;">To add a node, enter the text you would like to use into the left hand side panel. Then, highlight the text and click on the canvas, the highlighted text will be added to a node.</p>
            <strong>Adding Nodes for Interposed Material</strong>
            <p style="color: #444; font-size: 12px;">First, highlight the text including the interposed material and click on the canvas, the highlighted text will be added to a node. The interposed material can then be removed by editing the node's text. Then highlight only the interposed material within the previously highlighted text and click on the canvas, the interposed text will be added to a separate node.</p>
            <strong>Editing Nodes</strong>
            <p style="color: #444; font-size: 12px;">To access the edit node menu, either right click on a node and select 'Edit Node' from the menu or ctrl+click on the node you would like to edit.</p>
            <strong>Deleting Nodes</strong>
            <p style="color: #444; font-size: 12px;">To delete a node, either right click on a node and select 'Delete Node' from the menu or click+delete on the node you would like to delete.</p>
          </div>
          <div id="edge-help" style="display:none;">
            <strong>Adding Edges Between Nodes</strong>
            <?php if ($pro) { ?>
              <p style="color: #444; font-size: 12px;">To add an edge, click on the add edge button in the top toolbar which will open the add edge menu.
                A source node and a target node for the new edge to connect from/to will need to be selected. A source locution and a target locution will also need to be selected when in Rapid IAT mode. <br><br>
                First select a source node by clicking the 'Select Source' button then clicking on the node to select when the menu closes. The menu will then reopen with the selected source node's text displayed in the textbox. To change the selected source node click the 'Select Source' button again and select a different node.
                When in Rapid IAT mode a source locution may have been selected automatically. This should be the locution for the selected source node but can be changed by clicking and selecting a different locution from the drop down options.
                A target node and locution can then be selected in the same way by clicking the 'Select Target' button and the select box under 'Target Locution' respectively. <br><br>
                The checkbox at the bottom of the menu can be ticked to automatically mark the new edges when they are added.
                Finally, click the 'Add Edges' button and an edge will then be added connecting the selected source and target nodes. An edge connecting the source and target locutions will also be added if they were selected.
              </p>
            <?php } else { ?>
              <p style="color: #444; font-size: 12px;">To add an edge, click on the add edge button in the top toolbar which will open the add edge menu. <br><br>A source node and a target node for the new edge to connect from/to will need to be selected. The source node can be selected by clicking the 'Select Source' button then clicking on the node to select when the menu closes. The menu will then reopen with the selected source node's text displayed in the textbox. After selecting a source node, click the 'Select Target' button then click on the node to select when the menu closes again. An edge will then be added connecting the selected source and target nodes.</p>
            <?php } ?>
            <strong>Adding Edges using Sticky Add Edge</strong>
            <p style="color: #444; font-size: 12px;">To add an edge, click on the add edge button in the top toolbar and then click and drag between the two nodes you would like to connect. <br><br>Click the add edge button once for an inference relation, the button will turn green. Or twice for a conflict, the button will turn red. Or three times for a rephrase, the button will turn orange. Click the add edge button again to cancel adding an edge. This can be turned on/off by clicking the 'Sticky Add Edge' toggle in the analysis settings.</p>
            <strong>Adding Edges using Keyboard Shortcuts</strong>
            <p style="color: #444; font-size: 12px;">To add an edge, click and drag from one node to another while pressing shift for an inference relation or the 'c' key for a conflict or the 'm' key for a rephrase. The add edge button will turn green, red or orange respectively.</p>
          </div>
          <div id="timestamp-help" style="display:none;">
            <strong>Timestamp Format</strong>
            <p style="color: #444; font-size: 12px;">The format of '[hh:mm:ss]' can be used to offset the start date and time by a number of hours, minutes or seconds when adding timestamps. It should be included within the text being analysed wherever the offset should start, e.g. including '[00:30:15]' at the start of the text being analysed would offset the first timestamp by 30 minutes and 15 seconds from the start time. This can only be used when analysing your own text, when analysing a URL the start date and time will be used for all timestamps instead.</p>
            <strong>Start Date and Time</strong>
            <p style="color: #444; font-size: 12px;">The start date and time is when the text being analsyed began. All timestamps are calculated based off of it. It should be updated before adding any timestamps to an analysis by clicking the 'Change Start Date and Time' button in the timestamp settings.</p>
            <strong>Adding Timestamps</strong>
            <p style="color: #444; font-size: 12px;">Timestamps can be added to locution nodes when using dialogical mode. They can be added automatically by turning on the 'Add Timestamps' toggle in the timestamp settings or manually added by editing a locution node.</p>
            <strong>Editing Timestamps</strong>
            <p style="color: #444; font-size: 12px;">To edit a timestamp, either right click on its locution node and select 'Edit Timestamp' from the menu or ctrl+click on its locution node to access the edit node menu and click the 'Edit Timestamp' button. This will open a menu where a new date, time and timezone can be selected or the timestamp can be deleted.</p>
            <strong>Viewing Timestamps</strong>
            <p style="color: #444; font-size: 12px;">Turning on the 'Show Timestamps' toggle in timestamp settings will display above locution nodes any timestamps that have been added to them, while turning it off will hide all timestamps on locution nodes.</p>
          </div>
      </div>
      </form>
    </div>
    <div class="modal-btns">
      <a class="cancel" href="#" onClick="closeModal('#modal-help'); return false;">&#10008; Close</a>
    </div>
  </div>
  </div>
  <!-- Helpsheet Modal ends here -->

  <div id="contextmenu"></div>

  <!-- Add Locution Form Starts here -->
  <div id="locution_add" class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h4>Locution Details</h4>
        <a href="javascript:void(0);" class="helpbtn" onclick="locTut(); return false;">?</a>
      </div>
      <div class="modal-body">
        <form id="f_node_edit" class="fstyle">
          <div id="p_sel_wrap">
            <p style="font-weight: bold; color: #999;">Existing Participants</p>
            <label for="p_select" id="p_select_label">Participant</label>
            <select id="p_select">
              <option value="-">-</option>
            </select>
            <br />
            <br />
          </div>

          <div id="prt_name">
            <p style="font-weight: bold; color: #999;">New Participant</p>
            <label for="p_name" id="p_name_label">Name</label>
            <input id="p_name" name="p_name" value="" class="itext" onkeyup="pfilter(this);" />
          </div>

          <div id="new_participant" style="display:none;">
            <label for="p_firstname" id="p_firstname_label">Firstname</label>
            <input id="p_firstname" name="p_firstname" />
            <label for="p_surname" id="p_surname_label">Surname</label>
            <input id="p_surname" name="p_surname" />
          </div>
          <!-- <button type="button" onClick="addLocution(mySel);this.parentNode.parentNode.style.display='none';">Add Locution</button> -->
        </form>
      </div>
      <div id="socialusers" style="display:none;"></div>
      <div class="modal-btns">
        <a class="save" href="#" onClick="addlclick(false); $('#modal-shade').hide(); FormOpen = false;  return false;">&#x2714; Add</a>
        <a class="cancel" href="#" onClick="addlcancel(); $('#modal-shade').hide();FormOpen = false; return false;">&#10008; Cancel</a>
      </div>
    </div>
  </div>
  <!-- Add Locution Form Ends here -->

  <!-- Edit Node Form Starts here -->
  <div id="node_edit" class="modal-dialog">
    <div class="modal-header">
      <h4>Edit Node</h4>
      <!-- This is the instruction button: -->
      <a href="javascript:void(0);" class="helpbtn" onclick="nodeTut(); return false;">?</a>
    </div>
    <div class="modal-content">
      <div id="tab-bar-edits" class="tab-bar">
        <a href="#" id="tab_node_options" class="btn tab nEdit selected" onclick="editsTab('node_options')">Node</a>
        <a href="#" id="tab_descriptor_selects" class="btn tab nEdit" onclick="editsTab('descriptor_selects')">Descriptors</a>
        <a href="#" id="tab_cq_selects" class="btn tab nEdit" onclick="editsTab('cq_selects')" style="display:none;">Critical Questions</a>
      </div>

      <form id="node_edit_form" class="fstyle" style="width: 78%;">
        <div id="node_options">
          <p id="timestamp_info">Timestamp:
            <label id="timestamp_label"></label>
            <!-- <a href="#" id="edit_timestamp_btn" class="btn" onClick="FormOpen = false;window.editTimestamp=true;openModal('#modal-timestamps');return false;" style="padding:0.6em;">Edit Timestamp</a> -->
          </p>

          <label for="n_text" id="n_text_label">Text</label>
          <textarea id="n_text" name="n_text"></textarea>

          <label for="s_type" id="s_type_label">Type</label>
          <select id="s_type" onChange="showschemes(this.value);">
            <option value="RA">RA</option>
            <option value="CA">CA</option>
          </select>

          <label for="s_sset" id="s_sset_label">Scheme Set</label>
          <select id="s_sset" onChange="filterschemes(this.value);">
            <option value="0">All Schemes</option>
          </select>

          <label for="s_cscheme" id="s_cscheme_label">Scheme</label>
          <select id="s_cscheme" onChange="setdescriptors(this.value, mySel);">
            <option value="0">-</option>
          </select>

          <label for="s_ischeme" id="s_ischeme_label">Scheme</label>
          <select id="s_ischeme" onChange="setdescriptors(this.value, mySel);">
            <option value="0">-</option>
          </select>

          <label for="s_lscheme" id="s_lscheme_label">Scheme</label>
          <select id="s_lscheme" onChange="setdescriptors(this.value, mySel);">
            <option value="0">-</option>
          </select>

          <label for="s_mscheme" id="s_mscheme_label">Scheme</label>
          <select id="s_mscheme" onChange="setdescriptors(this.value, mySel);">
            <option value="0">-</option>
          </select>

          <label for="s_pscheme" id="s_pscheme_label">Scheme</label>
          <select id="s_pscheme" onChange="setdescriptors(this.value, mySel);">
            <option value="0">-</option>
          </select>

          <label for="s_tscheme" id="s_tscheme_label">Scheme</label>
          <select id="s_tscheme" onChange="setdescriptors(this.value, mySel);">
            <option value="0">-</option>
          </select>
        </div>

        <div id="descriptor_selects" style="display:none;"></div>


        <div id="cq_selects" style="display:none;"></div>
      </form>
    </div>
    <ul class="btnlist">
      <li><a href="#" id="mark_node_btn" onClick="closeModal('#node_edit');FormOpen=false;window.groupID++;markNode(mySel, true);return false;">
          <div class="btnicn" style="background-position: -1018px 50%;">&nbsp;</div> Mark Node
        </a></li>
      <li><a href="#" id="unmark_node_btn" style="display:none;" onClick="closeModal('#node_edit');FormOpen=false;window.groupID++;markNode(mySel, false);return false;">
          <div class="btnicn" style="background-position: -979px 50%;">&nbsp;</div> Unmark Node
        </a></li>
      <li><a href="#" id="del_node_btn" onClick="closeModal('#node_edit'); FormOpen = false; window.groupID ++; deleteNode(mySel); return false;" class="bgred">
          <div class="btnicn" style="background-image: url('res/img/icon-delnode.png');">&nbsp;</div> Delete Node
        </a></li>
      <?php if ($pro) { ?>
        <li><a href="#" id="l_add_btn" onClick="saveNodeEdit();$('#node_edit').hide(); FormOpen = false;$('#locution_add').show();return false;">
            <div class="btnicn" style="background-image: url('res/img/icon_ladd.png');">&nbsp;</div> Add Locution
          </a></li>
        <li><a href="#" id="edit_timestamp_btn" onClick="closeModal('#node_edit');FormOpen = false; window.editTimestamp=true; $('#modal-timestamps').show();return false;">
            <div class="btnicn" style="background-position: -517px 50%;">&nbsp;</div> Edit Timestamp
          </a></li>
      <?php } ?>
    </ul>
    <div class="modal-btns">
      <a class="save" href="#" onClick="saveNodeEdit();closeModal('#node_edit'); FormOpen = false; return false;">&#x2714; Save</a>
      <a class="cancel" href="#" onClick="closeModal('#node_edit'); FormOpen = false; return false;">&#10008; Cancel</a>
    </div>
  </div>
  <!-- Edit Node Form Ends here -->

  <!--  <a href="http://www.arg.tech" target="_blank" id="devby"><img src="res/img/arg-tech.svg" /></a> -->
  <div id="mainwrap">
    <div id="spacer"></div>
    <div id="left1">
      <?php if ($source == "local") { ?>
        <div id="analysis_text" contenteditable="true" spellcheck="false">Enter your text here...</div>
        <!-- data-step="1" data-intro="<p>Enter the text that you want to analyse here.</p><p>Select sections of text to create a node.</p> -->
        <iframe id="extside" name="extsite" style="display:none;"></iframe>
      <?php } else { ?>
        <!-- if url was added to be loaded into LHS -->
        <iframe src="<?php echo $analysis; ?>" id="extside" name="extsite" style="width:100%;height:100%;border-right:1px solid #666;"></iframe> <!-- data-step="1" data-intro="<p>Highlight sections of text from the webpage to create a node.</p>" data-position="right" -->
        <div id="analysis_text" contenteditable="true" spellcheck="false" style="display:none;"></div>
      <?php } ?>
    </div>

    <script>
      var w = window.innerWidth;
      var h = window.innerHeight;
      console.log("width: " + w + " height:" + h)
    </script>
    <div id="right1">
      <div id="wildcarding-toolbar">
        <div id="wildcarding-text-section">
          <span>Text:</span>
          <!-- <select name="" id=""></select> -->
        </div>
        <div id="wildcarding-type-section">
          <span>Type:</span>
          <select name="wildcarded-type-1" id="wildcarded-type-1"></select>
        </div>
      </div>
      <div id="panBtns">
        <div id="zoomBtns">
          <button id="zoomIn" type="button" name="+" style="right:6%;" class="noSelect">+<span>Zoom&nbsp;In</span></button>
          <button id="zoomOut" type="button" name="-" style="left:4%;" class="noSelect">-<span>Zoom&nbsp;Out</span></button>
          <button id="resetView" type="button" name="reset" onClick="resetPosition();"><span>Reset&nbsp;View</span></button>
        </div>
        <button id="panUp" name="up" type="button" class="arrow up"><span>Move&nbsp;Up</span></button>
        <button id="panLeft" name="left" type="button" class="arrow left"><span>Move&nbsp;Left</span></button>
        <button id="panRight" name="right" type="button" class="arrow right"><span>Move&nbsp;Right</span></button>
        <button id="panDown" name="down" type="button" class="arrow down"><span>Move&nbsp;Down</span></button>
      </div>

      <svg viewBox='0 0 1500 1500' xmlns="http://www.w3.org/2000/svg" version="1.1" width="1500" height="1500" style="z-index:999; background-color:#fff;" onmousedown='Grab(evt);' onmousemove='Drag(evt);' onmouseup='Drop(evt);' onload='Init(evt);' id='inline'>
        <defs>

          <marker id='head' orient="auto" markerWidth='12' markerHeight='10' refX='12' refY='5'>
            <!-- triangle pointing right (+x) -->
            <path d='M0,0 V10 L12,5 Z' fill="black" />
          </marker>
          <marker id='head2' orient="auto" markerWidth='12' markerHeight='10' refX='12' refY='5' markerUnits='userSpaceOnUse'>
            <!-- triangle pointing right (+x) -->
            <path d='M0,0 V10 L12,5 Z' fill="red" />
          </marker>
        </defs>
      </svg>
    </div>
  </div>
</body>

</html>