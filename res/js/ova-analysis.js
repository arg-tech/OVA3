$(function () {
  mw = $("#mainwrap").width();
  $("#right1").width(mw - $("#left1").width() - 41);
  $("#left1").height($(window).height() - $("#toolbar").height() - 41);
  $("#right1").height($(window).height() - $("#toolbar").height() - 1);
  $("#spacer").height($(window).height() - $("#toolbar").height() - 1);
  $("#xmenu").height($(window).height() - $("#toolbar").height() - 1);
  $("#modal-shade").height($(window).height() - $("#toolbar").height() - 1);
  $("#spacer").draggable({
    axis: "x",
    containment: [100, 0, mw / 2, 0],
    start: function (event, ui) {
      shiftInitial = ui.position.left;
    },
    drag: function (event, ui) {
      var shift = ui.position.left;
      mw = $("#mainwrap").width();
      $("#left1").width(ui.position.left - 40);
      $("#right1").width(mw - ui.position.left);
    }
  });

  // var beforePan
  //
  // beforePan = function(oldPan, newPan){
  //   var stopHorizontal = false
  //     , stopVertical = false
  //     , gutterWidth = 100
  //     , gutterHeight = 100
  //       // Computed variables
  //     , sizes = this.getSizes()
  //     , leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth
  //     , rightLimit = sizes.width - gutterWidth - (sizes.viewBox.x * sizes.realZoom)
  //     , topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight
  //     , bottomLimit = sizes.height - gutterHeight - (sizes.viewBox.y * sizes.realZoom)
  //
  //   customPan = {}
  //   customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x))
  //   customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y))
  //
  //   return customPan
  // }
  //
  //
  // // Expose to window namespace for testing purposes
  // window.panZoom = svgPanZoom('#inline', {
  //   zoomEnabled: true
  // , controlIconsEnabled: true
  // , minZoom: 0.1
  // , maxZoom: 2
  // , fit: 1
  // , center: 1
  // , beforePan: beforePan
  // });
  // window.panZoom.resize(); // update SVG cached size and controls positions
  // window.panZoom.fit();
  // window.panZoom.center();
});

$(window).on('resize', function () {
  mw = $("#mainwrap").width();
  $("#right1").width(mw - $("#left1").width() - 41);
  $("#left1").height($(window).height() - $("#toolbar").height() - 41);
  $("#right1").height($(window).height() - $("#toolbar").height() - 1);
  $("#spacer").height($(window).height() - $("#toolbar").height() - 1);
  $("#xmenu").height($(window).height() - $("#toolbar").height() - 1);
  $("#modal-shade").height($(window).height() - $("#toolbar").height() - 1);
  updateToolbar();
});

/**
 * Handles opening a modal
 * @param {*} ident - The ID of the modal to open
 * @returns {Boolean}
 */
function openModal(ident) {
  $(".modal-dialog").hide();
  $("#modal-shade").show();
  $(ident).show("slide", { direction: "up" }, 100);
  return false;
}

/**
 * Handles closing a modal
 * @param {*} ident - The ID of the modal to close
 * @returns {Boolean}
 */
function closeModal(ident) {
  $('#modal-shade').hide();
  $(ident).hide("slide", { direction: "up" }, 100);
  return false;
}

/**
 * Updates which buttons are shown along the toolbar depending on the window's width.
 * Equivalent buttons are shown in the extra menu when they are hidden from the toolbar.
 */
function updateToolbar() {
  var w = window.innerWidth;
  // console.log("width: " + w);
  if (w > 880) { //show all buttons on toolbar
    $("#alayX").hide(); $("#alay").show();
    $("#loadaX").hide(); $("#loada").show();
    $("#saveaX").hide(); $("#savea").show();
    $("#newaX").hide(); $("#newa").show();
    $("#eaddX").hide(); $("#eadd").show();
    $("#naddX").hide(); $("#nadd").show();
    $("#resetX").hide(); $("#reset").show();
    $("#undoX").hide(); $("#undo").show();
    $("#tutorialX").hide(); $("#tutorial").show();
  }
  else if (w > 590) { // 590 < w < 880
    $("#alay").hide(); $("#alayX").show();
    if (w < 800) {
      $("#loada").hide(); $("#loadaX").show();
      $("#savea").hide(); $("#saveaX").show();
      $("#newa").hide(); $("#newaX").show();
    }
    else {
      $("#loadaX").hide(); $("#loada").show();
      $("#saveaX").hide(); $("#savea").show();
      $("#newaX").hide(); $("#newa").show();
    }
    $("#resetX").hide(); $("#reset").show();
    $("#undoX").hide(); $("#undo").show();
    $("#tutorialX").hide(); $("#tutorial").show();
    $("#eaddX").hide(); $("#eadd").show();
    $("#naddX").hide(); $("#nadd").show();
  }
  else { // w < 590
    $("#eadd").hide(); $("#eaddX").show();
    $("#nadd").hide(); $("#naddX").show();
    if (w < 450) {
      $("#reset").hide(); $("#resetX").show();
      $("#undo").hide(); $("#undoX").show();
      $("#tutorial").hide(); $("#tutorialX").show();
    }
    else {
      $("#resetX").hide(); $("#reset").show();
      $("#undoX").hide(); $("#undo").show();
      $("#tutorialX").hide(); $("#tutorial").show();
    }
    $("#loada").hide(); $("#loadaX").show();
    $("#savea").hide(); $("#saveaX").show();
    $("#newa").hide(); $("#newaX").show();
    $("#alay").hide(); $("#alayX").show();
  }
}