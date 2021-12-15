<?php
$analysis = 'localtext.html';
$source = $_GET['url'];
if ($source == 'local') {
    $analysis = 'localtext.html';
} elseif (substr($source, -3) == 'pdf') {
    if ($source == 'pdf') {
        $analysis = 'pdfjs/web/viewer.html';
    } else {
        $pdfurl = $source;
        $parts = pathinfo($pdfurl);
        $pdfurl = $parts['dirname'] . '/' . rawurlencode($parts['basename']);
        $fname = hash('md5', $pdfurl);
        file_put_contents('pdfs/' . $fname . '.pdf', fopen($pdfurl, 'r'));
        $analysis = 'pdfjs/web/viewer.html?file=../../pdfs/' . $fname . '.pdf';
    }
    $source = 'pdf';
} elseif (substr($source, 0, 4) != 'http') {
    $rtime = time();
    $salt = 'ovas@lt22';
    $hash = md5($rtime . $salt);
    $analysis = 'browser.php?r=' . $rtime . '&h=' . $hash . '&url=http://' . $_GET['url'];
} else {
    $rtime = time();
    $salt = 'ovas@lt22';
    $hash = md5($rtime . $salt);
    $analysis = 'browser.php?r=' . $rtime . '&h=' . $hash . '&url=' . $_GET['url'];
}

$returnAnalysis = (isset($_GET['returnAnalysis']));
if ($returnAnalysis) {
    $JSON = json_encode($analysis);
    echo '{"analysis":' . $JSON . '}';
}
