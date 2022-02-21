/**
 * The main help tutorial
 */
function mainTut() {
    var intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: 'iframe#left1',
                intro: "<p>Highlight sections of text from the webpage to create a node.</p>",
                position: 'right',
            },
            {
                element: '#analysis_text',
                intro: "<p>Enter the text that you want to analyse here.</p><p>Select sections of text to create a node.</p>",
                position: 'right',
            },
            {
                element: '#right1',
                intro: "<p>Select text to the left and click here to add a node.</p><p>Ctrl+Click a node to edit.</p><p>Shift+Click and drag between nodes to add edges</p>",
                position: 'left',
            },
            // {
            //   element: '#minimap',
            //   intro: "<p>An overview of the analysis can be seen here.</p><p>Drag the box to move around the canvas.</p>",
            //   position: 'left',
            // },
            {
                element: '#undo',
                intro: "Click here to undo the last change you made to an analysis.</p>",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#reset',
                intro: "<p>Move around the canvas using the arrow keys on your keyboard.</p><p>Click here to reset your view.</p>",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#nadd',
                intro: "Nodes with custom text (enthymemes) can be added by clicking here and then clicking on the canvas.",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#eadd',
                intro: "<p>Edges can be added between nodes by clicking here, clicking on a node and dragging to the target node.</p><p>Click once for support or twice for conflict. Click again to cancel.</p><p>Edges can also be added by holding shift (support) or 'a' (conflict).</p>",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#newa',
                intro: "<p>Click here to start a new analysis. Any changes since you last saved will be lost.</p>",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#em_newa',
                intro: "<p>Click here to start a new analysis. Any changes since you last saved will be lost.</p>",
                position: 'left',
            },
            {
                element: '#savea',
                intro: "<p>Your analysis can be saved locally as either a JSON file, that can be re-opened in OVA, or an image.</p><p>Analyses can also be saved to AIFdb.</p>",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#em_savea',
                intro: "<p>Your analysis can be saved locally as either a JSON file, that can be re-opened in OVA, or an image.</p><p>Analyses can also be saved to AIFdb.</p>",
                position: 'left',
            },
            {
                element: '#loada',
                intro: "<p>Click here to load a previous analysis saved in JSON format or to AIFdb.</p>",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#em_loada',
                intro: "<p>Click here to load a previous analysis saved in JSON format or to AIFdb.</p>",
                position: 'left',
            },
            {
                element: '#alay',
                intro: "<p>Automatically layout your diagram.</p><p><strong>Warning:</strong>This will move any nodes that you have already positioned.</p>",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#em_alay',
                intro: "<p>Automatically layout your diagram.</p><p><strong>Warning:</strong>This will move any nodes that you have already positioned.</p>",
                position: 'left',
            },
            {
                element: '#stngs',
                intro: "<p>Click here to change analysis settings.</p>",
                position: 'bottom-middle-aligned',
            },
            {
                element: '#em_stngs',
                intro: "<p>Click here to change analysis settings.</p>",
                position: 'left',
            },
            {
                element: '#linkicon',
                intro: "<p>Click here to share your analysis.</p><p>Shared analyses are collaborative and can be edited by multiple people.</p>",
                position: 'left',
            },
            {
                element: '#xmenutoggle',
                intro: "<p>Click here to access your analysis settings or to share your analysis for collborative working.</p>",
                position: 'left',
            }
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

/**
 * The help tutorial for the settings modal
 */
function setTut() {
    var intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: '#tab-display',
                intro: "<p>Display Settings</p> <p>Click here to view display settings.</p>",
            },
            {
                element: '#tab-analysis',
                intro: "<p>Analysis Settings</p> <p>Click here to view analysis settings.</p>",
            },
            {
                element: '#tab-schemes',
                intro: "<p>Scheme Set Settings</p> <p>Click here to view scheme set settings.</p>",
            },
            {
                element: '#tab-timestamps',
                intro: "<p>Timestamp Settings</p> <p>Click here to view timestamp settings.</p>",
            },
            {
                element: '#font-size',
                intro: "Set text size."
            },
            {
                element: '#bwtoggle',
                intro: "Toggle Black and White Mode",
            },
            {
                element: '#dialogicaltoggle',
                intro: "<p>Toggle Dialogical Mode</p> <p>Turning off dialogical mode will remove the dialogical aspect.</p>",
            },
            {
                element: '#riattoggle',
                intro: "<p>Toggle Rapid IAT Mode</p> <p>Turning off Rapid IAT mode will stop the dialogical aspect from being automatically added.</p>",
            },
            {
                element: '#eAddtoggle',
                intro: "<p>Toggle Sticky Add Edge Mode</p> <p>Turning on sticky add edge mode will change clicking the 'Add Edge' button from opening the menu to instead directly adding an edge.</p>",
            },
            {
                element: '#cqtoggle',
                intro: "Toggle Critical Question Mode"
            },
            {
                element: '#ra_sset',
                intro: "<p>Filter the list of available argumentation schemes for RA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#ca_sset',
                intro: "<p>Filter the list of available argumentation schemes for CA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#ya_sset',
                intro: "<p>Filter the list of available argumentation schemes for YA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#ta_sset',
                intro: "<p>Filter the list of available argumentation schemes for TA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#ma_sset',
                intro: "<p>Filter the list of available argumentation schemes for MA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#pa_sset',
                intro: "<p>Filter the list of available argumentation schemes for PA nodes by selecting a particular scheme set to be used as the default.</p>",
            },
            {
                element: '#timestampRegExp',
                intro: "<p>Timestamp Format</p> <p>When adding timestamps, this format can be used to offset the start date and time by a number of hours, minutes or seconds. It should be included within the text being analysed wherever the offset should start.</p>"
            },
            {
                element: '#startTimestampLabel',
                intro: "<p>Start Date and Time</p> <p>When adding timestamps, this date and time should be changed to when the text being analsyed began. All timestamps are calculated based off of it.</p>"
            },
            {
                element: '#startTimestampBtn',
                intro: "<p>Change Start Date and Time</p> <p>Click here to change the start date and time.</p>"
            },
            {
                element: '#timestamptoggle',
                intro: "<p>Toggle Add Timestamps</p><p>Turning on add timestamps will add a timestamp to a locution node when it is added.</p>"
            },
            {
                element: '#showTimestamptoggle',
                intro: "<p>Toggle Show Timestamps</p> <p>Turning on show timestamps will display above locution nodes any timestamps that have been added to them, while turning it off will hide all timestamps on locution nodes.</p>"
            },
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

/**
 * The help tutorial for editing nodes
 */
function nodeTut() {
    var intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: '#s_type',
                intro: "Click here to change the node type."
            },
            {
                element: '#s_sset',
                intro: "Filter the list of available argumentation schemes by selecting a particular scheme set.",
            },
            {
                element: '#s_cscheme',
                intro: 'Select the argumentation scheme which this node corresponds to.',
            },
            {
                element: '#s_ischeme',
                intro: 'Select the argumentation scheme which this node corresponds to.',
            },
            {
                element: '#s_lscheme',
                intro: 'Select the argumentation scheme which this node corresponds to.',
            },
            {
                element: '#s_mscheme',
                intro: 'Select the argumentation scheme which this node corresponds to.',
            },
            {
                element: '#s_pscheme',
                intro: 'Select the argumentation scheme which this node corresponds to.',
            },
            {
                element: '#s_tscheme',
                intro: 'Select the argumentation scheme which this node corresponds to.',
            },
            // {
            //     element: '#descriptor_selects',
            //     intro: "Assign schematic roles to each of the nodes.",
            // },
            {
                element: '#cq_selects',
                intro: "Status of each Critical Question. For additional Critical Questions, click the down arrow to select the corresponding node. Critical Questions associated with undercutters can only be instantiated by undercutters; likewise, premises by premises.",
            },
            {
                element: '#timestamp_label',
                intro: "Displays the timestamp for this node."
            },
            {
                element: '#edit_timestamp_btn',
                intro: "Click here to edit the timestamp for this node."
            },
            {
                element: '#n_text',
                intro: "Edit the text for this node."
            },
            {
                element: '#mark_node_btn',
                intro: "Click here to mark this node and its connected edges."
            },
            {
                element: '#unmark_node_btn',
                intro: "Click here to unmark this node and its connected edges."
            },
            {
                element: '#del_node_btn',
                intro: "Click here to delete this node."
            },
            {
                element: '#l_add_btn',
                intro: "Click here to add a locution for this node."
            }
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

/**
 * The help tutorial for adding locutions
 */
function locTut() {
    var intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: '#p_select',
                intro: "Select from participants currently used in this analysis."
            },
            {
                element: '#p_name',
                intro: "Add a new participant. Start typing the participant's name to choose from people already in the Argument Web, or to add a new person.",
            }
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

/**
 * The help tutorial for the loading analysis modal
 */
function loadTut() {
    var intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: '#load-replace',
                intro: "Select where the saved analysis should be placed in relation to your current analysis when loaded in."
            },
            {
                element: '#loadReplace',
                intro: "Check here, if you want to replace your current analysis when loading a saved analysis."
            },
            {
                element: '#loadBelow',
                intro: "Check here, if you want the saved analysis to be placed below the current analysis when it's loaded in."
            },
            {
                element: '#load-file',
                intro: "Select a JSON analysis from your local files to load."
            },
            {
                element: '#load-corpus',
                intro: "Select a corpus from the drop-down list to load."
            },
            {
                element: '#load-nodeset',
                intro: "Enter the AIFdb node set ID of the analysis to load."
            },
            {
                element: '#loadBtn',
                intro: "Click here to start loading the selected analysis."
            },
            {
                element: '#c_loading',
                intro: "The selected analysis is currently loading."
            },
            {
                element: '#list',
                intro: "Details what analysis has been loaded or has failed to load."
            }
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}

/**
 * The help tutorial for the adding an edge modal
 */
function edgeTut() {
    var intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: '#edge_source',
                intro: "First select a source node for the new edge to connect from."
            },
            {
                element: '#source_text',
                intro: "The text the selected source node contains will be displayed here."
            },
            {
                element: '#sourceBtn',
                intro: "Click here to select a source node."
            },
            {
                element: '#sel_source_L',
                intro: "Click here to select a source locution from the dropdown options."
            },
            {
                element: '#edge_target',
                intro: "After a source node has been selected, select the target node for the new edge to connect to. Please note that once a target node has been selected, neither it or the selected source node can be changed."
            },
            {
                element: '#target_text',
                intro: "The text the selected target node contains will be displayed here."
            },
            {
                element: '#targetBtn',
                intro: "Click here to select a target node."
            },
            {
                element: '#sel_target_L',
                intro: "Click here to select a target locution from the dropdown options."
            },
            {
                element: '#mark_node_check',
                intro: "Check this box to mark the edges between the selected source and target nodes and the selected locutions after adding them."
            },
            {
                element: '#edgeBtn',
                intro: "Click here to add the edges between the selected source and target nodes and the selected locutions."
            }
        ].filter(function (obj) { return $(obj.element).length && $(obj.element).is(':visible'); }),
        showStepNumbers: false
    });

    intro.start();
}