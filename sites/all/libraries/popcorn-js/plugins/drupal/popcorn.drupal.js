(function (Popcorn) {

	/**
	 * Drupal popcorn plug-in
	 *
	 * @param {Object} options
	 *
	 * Example:
	   var p = Popcorn('#video')
	      .drupal({
	        start: 5, // seconds
	        end: 15, // seconds
	        nid: 17 // drupal node id
	      } )
	 *
	 */

	Popcorn.plugin( "drupal", function (){

		var nodeData = [];

		function loadXMLDoc(nid){
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function(){
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
					var nodeDiv = document.createElement('div');
					nodeDiv.id = "popcorn-node-" + nid;
					nodeDiv.className = "popcorn-node";
					nodeDiv.innerHTML = xmlhttp.responseText;
					var anchors = nodeDiv.getElementsByTagName('a');
					for (var i = 0; i < anchors.length; i++){
						anchors[i].addEventListener('click', popcornClickCapture, false);
					}
					nodeData[nid] = nodeDiv;
				}
			}
			xmlhttp.open("GET", "/popcorn/" + nid + "/teaser", true);
			xmlhttp.send();
		}

		function popcornClickCapture(event){
			console.log('Popcorn link clicked');
			event.preventDefault();
		}

		return {
			manifest: {
				about: {
					name: "Popcorn Drupal Plugin",
					version: "0.1",
					author: "Doug Miller - C4 Tech & Design",
					website: "http://www.c4tech.com/"
				},
				options: {
					start: {
						elem: "input",
						type: "number",
						label: "In"
					},
					end: {
						elem: "input",
						type: "number",
						label: "Out"
					},
					nid: {
						elem: "input",
						type: "number",
						label: "Nid"
					},
				}
			},
			_setup : function( options ) {
				loadXMLDoc(options.nid);
			},
			start: function( event, options ){
				if (nodeData.length){
					var summary = document.getElementById('highlight');
					summary.insertBefore(nodeData[options.nid], summary.firstChild);
					if (summary.childNodes.length > 2){
						document.getElementById('kettle').appendChild(summary.lastChild);
					}
				}
			},
			end: function( event, options ){
	    	  var nodeDiv = document.getElementById("popcorn-node-" + options.nid);
	    	  nodeDiv.parentNode.removeChild(nodeDiv);
			}
		}
	});
})(Popcorn);
