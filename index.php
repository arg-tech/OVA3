<?php
    if(isset($_COOKIE['ovauser'])) {
        $user = explode(";", $_COOKIE['ovauser']);
        $af = $user[0];
        $as = $user[1];
    }
?>
<!doctype html>
<html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <title>OVA from ARG-tech</title>
        <meta name="description" content="">
        <link rel="stylesheet" href="res/css/analysis.css" />
        <link rel="stylesheet" href="res/css/reset.css">
        <link rel="stylesheet" href="res/css/introjs.css">
        <link rel="stylesheet" href="res/css/splash.css">
        <script src="res/js/jquery-1.11.2.min.js"></script>
        <script src="res/js/setup.js"></script>
        <script src="res/js/intro.min.js"></script>
    </head>

    <body>
        <div id="wrap" onclick="$('#aboutmodal').hide();"><div style='width:0;height:0'>&nbsp;</div>
            <div id="content">
                <img src="res/img/logo-small.svg" onerror="this.onerror=null; this.src='res/img/logo-small.png'" id="ova-logo" height="60" />
                <div id="source-sel" class="mdlg">
                    <a href="#" class="helpbtn" onclick="javascript:introJs().setOption('showStepNumbers', false).start(); return false;">?</a>
                    <form method="GET" action="./analyse.php" class="fstyle">
                    <p style="padding: 20px 0px;"> 
                    <label>URL of the page to analyse <span style="color:#999;">(leave blank to analyse your own text)</span>:<br /> 
                    <input type="text" name="url" id="urlinput" class="input" value="" style="font-size: 22px; padding: 3px; width:96%; color: #666;" /></label> 
                    </p>
                    </form>

                    <div class="form-btns">
                        <a href="#" onClick="$('#source-sel').slideUp(400, function() {$('#analyst-details').slideDown()});return false;" data-step="2" data-intro="Click here to analyse using OVA+.<br />OVA+ allows for full IAT analysis of dialogical texts." data-position="bottom-middle-aligned">Analyse with OVA+</a>
                        <a href="#" onClick="ovaReg();return false;" data-step="1" data-intro="Click here to analyse using the original version of OVA" data-position="bottom-middle-aligned">Analyse</a>
                    </div>
                </div>
                <div id="analyst-details" class="mdlg" style="display:none; position:relative;">
                    <div class="mdlg-title">
                        <p>Analyst Details</p>
                    </div>
                    <div id="showfs" style="display:none; position: absolute; top: 130px; left: 20px;"><a onClick="resetform('ep');" style="cursor:pointer;padding:2px 3px;background-color:#e6e6e6;">&laquo;</a></div>
                    <form method="GET" action="./analyse.php" id="fs" class="fstyle" style="width:86%; float: left;">
                        <p style="padding: 20px 0px;"> 
                        <label>First Name:<br /> 
                        <input type="text" name="af" id="afinput" class="input" value="<?php echo $af; ?>" style="font-size: 22px; padding: 3px; width:90%; color: #666;" /></label> 
                        <label>Surname:<br /> 
                        <input type="text" name="as" id="asinput" class="input" value="<?php echo $as; ?>" style="font-size: 22px; padding: 3px; width:90%; color: #666;" /></label> 
                        </p>
                    </form>
                    <!--<div id="adsep" class="vsep" style="float: left;margin-top: 40px; margin-left:50px;"><div>or</div></div>
                    <form method="GET" action="./analyse.php" id="ep" class="fstyle" style="width:30%; float: left;">
                        <p style="padding: 20px 0px;"> 
                        <label>Email:<br /> 
                        <input type="text" name="af" id="afinput" class="input" value="" style="font-size: 22px; padding: 3px; width:90%; color: #666;" onfocus="expandform('ep')" /></label> 
                        <label>Password:<br /> 
                        <input type="password" name="as" id="asinput" class="input" value="" style="font-size: 22px; padding: 3px; width:90%; color: #666;" onfocus="expandform('ep')" /></label>
                        </p>
                    </form>
                    <div id="showep" style="display:none; position: absolute; top: 130px; right: 20px;"><a onClick="resetform('fs');" style="cursor:pointer;padding:2px 3px;background-color:#e6e6e6;">&laquo;</a></div>
                    -->
                    <div style="clear: both; line-height: 0;">&nbsp;</div>

                    <div class="form-btns">
                        <a href="#" onClick="ovaPlus();return false;">Continue &#x27a1;</a>
                        <a href="#" onClick="$('#analyst-details').slideUp(400, function() {$('#source-sel').slideDown()});return false;">&#x2b05; Back</a>
                    </div>
                </div>
            </div>
            <div id="push"></div>
        </div>

        <div id="footer">
            <div class="container">
                <div class="row">
                <p><strong>OVA</strong> by <a href="http://www.arg-tech.org">ARG-tech</a> | <a onclick="$('#aboutmodal').show();return false;" style="text-decoration:underline; cursor: pointer;">About OVA</a></p>
                </div>
            </div>
        </div>
        <!--<div id="aboutmodal"> php"include_once('about.html');" </div>
        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-57244751-1', 'auto');
            ga('send', 'pageview');
        </script> -->

    </body>
</html>
