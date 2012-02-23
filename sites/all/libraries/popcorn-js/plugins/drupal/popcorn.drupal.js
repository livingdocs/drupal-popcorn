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
	        type: 'film_clip', //drupal node content-type
	        dest: 'highlight', //target div id
	        nid: 17 // drupal node id
	      } )
	 *
	 */
	var nodeData = {};

	Popcorn.plugin( "drupal", function (){

		function ajaxLoadData(options, popcorn){
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function(){
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
					var event = JSON.parse(xmlhttp.responseText);

					nodeData[options.nid] = event.data;
					
					var nodeDiv = document.getElementById('popcorn-node-' + options.nid);
					//insert the loaded html
					nodeDiv.innerHTML = nodeData[options.nid].content;
					
					//trigger event to attach the click events
					popcorn.trigger('kernelData', {nid: options.nid, subject: options.subject, type: options.type, dest: options.dest})

				}
			};
			xmlhttp.open("GET", "/popcorn/" + options.nid + "/teaser", true);
			xmlhttp.send();
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
						label: "Node ID"
					},
					dest: {
						elem: "input",
						type: "string",
						label: "Destination Element"
					},
					subject: {
						elem: "input",
						type: "string",
						label: "Nnode Subject"
					},
					type: {
						elem: "input",
						type: "string",
						label: "Node Type"
					}
				}
			},
			_setup: function( options ) {
				//loadXMLDoc(options.nid);
			},
			_teardown: function( options ) {
				delete nodeData[options.nid];
			},
			start: function( event, options ){
				
				var destination = document.getElementById(options.dest);
				//create the wrapper div 
				var nodeDiv = document.createElement('div');
				nodeDiv.id = 'popcorn-node-' + options.nid;
				nodeDiv.className = "popcorn-node";
				nodeDiv.className += " subject-" + options.subject.replace(' ', '-');
				nodeDiv.className += " type-" + options.type.replace(' ', '-');
				//add the new div to the destination
				destination.insertBefore(nodeDiv, destination.firstChild);
				
				//use the cached data for the kernel if available
				if (options.nid in nodeData){
					nodeDiv.innerHTML = nodeData[options.nid].content;
					//trigger event to attach the click events
					this.trigger('kernelData', {nid: options.nid, subject: options.subject, type: options.type, dest: options.dest})
				}
				else{
					ajaxLoadData(options, this);
				}

				this.trigger('kernelPop', {nid: options.nid, subject: options.subject, type: options.type, dest: options.dest});
			},
			end: function( event, options ){
				var nodeDiv = document.getElementById('popcorn-node-' + options.nid);
				nodeDiv.parentNode.removeChild(nodeDiv);


				this.trigger('kernelDestroy', {nid: options.nid, subject: options.subject, type: options.type, dest: options.dest});
			}
		};
	});
})(Popcorn);
