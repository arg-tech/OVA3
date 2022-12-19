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
  if (w > 790) { //show all buttons on toolbar
    $("#alayX").hide(); $("#alay").show();
    $("#loadaX").hide(); $("#loada").show();
    $("#saveaX").hide(); $("#savea").show();
    $("#newaX").hide(); $("#newa").show();
    $("#eaddX").hide(); $("#eadd").show();
    $("#naddX").hide(); $("#nadd").show();
    $("#undoX").hide(); $("#undo").show();
    $("#tutorialX").hide(); $("#tutorial").show();
  }
  else if (w > 520) { // 520 < w < 790
    $("#alay").hide(); $("#alayX").show();
    if (w < 720) {
      $("#loada").hide(); $("#loadaX").show();
      $("#savea").hide(); $("#saveaX").show();
      $("#newa").hide(); $("#newaX").show();
    }
    else {
      $("#loadaX").hide(); $("#loada").show();
      $("#saveaX").hide(); $("#savea").show();
      $("#newaX").hide(); $("#newa").show();
    }
    $("#undoX").hide(); $("#undo").show();
    $("#tutorialX").hide(); $("#tutorial").show();
    $("#eaddX").hide(); $("#eadd").show();
    $("#naddX").hide(); $("#nadd").show();
  }
  else { // w < 520
    $("#eadd").hide(); $("#eaddX").show();
    $("#nadd").hide(); $("#naddX").show();
    if (w < 400) {
      $("#undo").hide(); $("#undoX").show();
      $("#tutorial").hide(); $("#tutorialX").show();
    }
    else {
      $("#undoX").hide(); $("#undo").show();
      $("#tutorialX").hide(); $("#tutorial").show();
    }
    $("#loada").hide(); $("#loadaX").show();
    $("#savea").hide(); $("#saveaX").show();
    $("#newa").hide(); $("#newaX").show();
    $("#alay").hide(); $("#alayX").show();
  }
}