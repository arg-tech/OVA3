<?php
if (isset($_COOKIE['ovauser'])) {
  $user = explode(";", $_COOKIE['ovauser']);
  $af = $user[0];
  $as = $user[1];
}
?>
<!doctype html>
<html lang="en">

<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="res/fonts/icomoon/style.css">
  <link rel="stylesheet" href="res/css/owl.carousel.min.css">
  <link rel="stylesheet" href="res/css/bootstrap.min.css">
  <link rel="stylesheet" href="res/css/landing.css">

  <title>OVA 3</title>
</head>

<body>


  <div class="d-lg-flex half">
    <div class="contents order-1 order-md-1" style="background-color: #333;">
      <div class="container">
        <div class="row align-items-center justify-content-center">
          <div class="col-md-7">
            <div class="mb-4">
              <img src="res/img/beta-logo.svg" style="width:180px; margin-bottom: 22px;" />
              <h3>URL of the page to analyse</h3>
              <p style="color: #777; font-size: 12px; margin-top: -10px; margin-bottom: -18px;">(leave blank to analyse your own text)</p>
            </div>
            <form action="#" method="post">
              <div class="form-group first last">
                <label for="urlinput">URL of the page to analyse</label>
                <input type="text" class="form-control" id="urlinput">
              </div>

              <div class="d-flex mb-5 align-items-center" style="margin-top: 22px;">
                <label class="control control--checkbox mb-0"><span class="caption">Use dialogical mode</span>
                  <input type="checkbox" checked="checked" id="dlgmode" />
                  <div class="control__indicator"></div>
                </label>
              </div>

              <input type="submit" value="Analyse" class="btn btn-block btn-primary" style="margin-top: -18px; background-color: #e67e22; border-color: #222;" onClick="ovaReg();return false;">
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="bg order-2 order-md-2" style="background-color: #fff;">

      <div class="container">
        <div class="row align-items-center justify-content-center">
          <div class="col-md-7">
            <div class="mb-4">
              <h3>Your Details</h3>
            </div>
            <form action="#" method="post">
              <div class="form-group first">
                <label for="afinput">Firstname</label>
                <input type="text" class="form-control" id="afinput">
              </div>

              <div class="form-group last mb-3">
                <label for="asinput">Surname</label>
                <input type="text" class="form-control" id="asinput">
              </div>
              <!--
              <span class="d-block text-center my-4 text-muted" style="color:#999 !important;">&mdash; or &mdash;</span>

              <div class="form-group first">
                <label for="username">Username</label>
                <input type="text" class="form-control" id="username">
              </div>

              <div class="form-group last mb-3">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password">
              </div>

              <input type="submit" value="Log In" class="btn btn-block btn-primary" style="background-color: #888; border-color: #fff;">
              -->

            </form>
          </div>
        </div>
      </div>


    </div>
  </div>

  <script src="res/js/jquery-3.3.1.min.js"></script>
  <script src="res/js/popper.min.js"></script>
  <script src="res/js/bootstrap.min.js"></script>
  <script src="res/js/landing.js"></script>

</body>

</html>