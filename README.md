# OVA3
OVA3 is the latest release of the Online Visualisation of Argument analysis tool. OVA3 is thoroughly re-engineered for speed, stability and scalability and introduces collaborative editing, PDF annotation, utterance timestamps and a re-designed easy-to-use graphical interface. Like its predecessor (OVA2, ova2.arg.tech) it supports a wide variety of argumentation schemes and is also designed to handle both simple monological arguments and complex arguments situated in dialogue, as well as providing optional support for analysis using Inference Anchoring Theory.

OVA has tens of thousands of users and is a native Argument Web application, interfacing to annotation of millions of words across thousands of arguments through the underlying AIF representation used in a variety of AI applications including argument mining algorithms, automatic grading software and visual analytics that provide insight and summary.

OVA3 is released as free software and can be found online at ova.arg.tech with an accompanying user manual.

The codebase is released under CC-BY-SA.



<h1>Development for OVA3</h1>
<p>All javascript files can be found in /res/js </li>
<ul><li>The ova-init.js file handles the initialisation. </li>
<li>The ova-ctrl.js file handles the user interaction. </li>
<li>The ova-draw.js file handles drawing on the SVG. </li>
<li>The ova-save.js file handles the saving and loading to/from JSONs and AIFdb.</li>
<li>The ova-tutorial.js file contains the code for all the OVA help tutorials. </li>
<li>The ova-model.js file contains the definition of nodes, edges and participants.</li>
</ul><p>
