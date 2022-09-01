<?php
$redirect = false;
$salt = "ovas@lt22";
if(isset($_GET['rere'])){
    $redirect = false;
}elseif(!isset($_GET['r']) || !isset($_GET['h'])){
    $redirect = true;
}elseif(time() - $_GET['r'] > 5){
    $redirect = true;
}elseif(md5($_GET['r'] . $salt) != $_GET['h']){
    $redirect = true;
}
if($redirect){
    header("Location: ./index.php");
    die();
}

$b = new Browser(urldecode($_GET['url']));
echo $b->display();

class Browser {
    private $wgetPath = "/usr/bin/";
    private $wgetExec = "wget";
    private $toReturn;

    private function delTree($dir) {
        $files = glob($dir . '*', GLOB_MARK);
        foreach($files as $file){
            if(substr($file, -1) == '/'){
                $this->delTree($file);
            }else{
                unlink( $file );
            }
        }
        if (is_dir($dir)) rmdir( $dir );
    }


    // Constructor
    public function Browser($url){
        $curDir = getcwd();
        $cacheDir = $curDir.'/browser/';

        chdir($cacheDir);

        $dirName = md5($url);
                
        $refresh = FALSE;

        if (file_exists($dirName) && ((time() - filectime($dirName)) > 10)) {
            $this->delTree($dirName);
            $refresh = TRUE;
        }elseif(!file_exists($dirName)){
            $refresh = TRUE;
        }

        $fullPath = $cacheDir . $dirName;
        $url = str_replace("[q]","?",$url);
        $url = str_replace("[eq]","=",$url);
        $url = str_replace("[amp]","&",$url);

        if($refresh == TRUE){
            mkdir($dirName);
            exec($this->wgetPath . $this->wgetExec . " --secure-protocol=TLSv1 --directory-prefix=$dirName --convert-links \"$url\"");
        }

        $openDir = opendir($fullPath);

        while (false !== ($file = readdir($openDir))){
            if($file!="." && $file!=".."){
                $return = $file;
            }
        }

        $contents = file_get_contents($fullPath . "/" . $return);
        
        if($contents=="")
            $this->toReturn = "404 Page not found";
        else
            $this->toReturn = $contents;

        // rewrite anchor tag href to redirect through browser.php
        $this->toReturn = preg_replace('@\<a ([^>]*)href="([^"]*)"@i', '<a \1href="browser.php?rere=1&url=\2"', $this->toReturn);

        chdir($curDir);
    }
    
    public function display() {
        return $this->toReturn;
    }
    
}

?>
