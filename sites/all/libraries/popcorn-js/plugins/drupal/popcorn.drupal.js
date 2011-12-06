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
	var nodeData = {};

	Popcorn.plugin( "drupal", function (){

		//constants
		var TEASER = 0;
		var TEASER_TEXT = 'teaser';
		var FULL = 1;
		var FULL_TEXT = 'full';

		var highlight = document.getElementById('highlight');
		var kettle = document.getElementById('kettle');

		function ajaxLoadData(dataType, options){
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function(){
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200){

					var event = JSON.parse(xmlhttp.responseText);

					switch (event.type){
					case TEASER:
						receiveTeaser(event.data, options);
						break;
					case FULL:
						receiveFull(event.data, options);
						break;
					}

				}
			};
			xmlhttp.open("GET", "/popcorn/" + options.nid + "/" + dataType, true);
			xmlhttp.send();
		}

		/*
		 * Add the node teaser to the DOM
		 */
		function popKernel(nid){
			highlight.insertBefore(nodeData[nid].content, highlight.firstChild);
			if (highlight.childNodes.length > 2){
				var moveNid = highlight.lastChild.firstChild.id.match(/node-(\d+)/)[1];
				var kernelSubject = document.getElementById(nodeData[moveNid].subject.replace(' ', '_'));
				if (kernelSubject == null){
					kernelSubject = createNewSubject(nodeData[moveNid].subject);
					kettle.appendChild(kernelSubject);
				}
				kernelSubject.appendChild(highlight.lastChild);
				//no need to remove the node from highlight in chrome...
			}
		}

		function createNewSubject(subject){
			var container = document.createElement('div');
			container.id = subject.replace(' ', '_');
			container.className = 'popcorn-subject';
			var heading = document.createElement('h2');
			heading.innerHTML = subject;
			heading.className = 'popcorn-subject-heading';
			container.appendChild(heading);
			return container;
		}

		function receiveTeaser(teaser, options){
			//sanity check to make sure that the returned event is a teaser
			//create the wrapper div and 
			var nodeDiv = document.createElement('div');
			nodeDiv.id = options._id;
			nodeDiv.className = "popcorn-node";
			nodeDiv.innerHTML = teaser.content;
			//override all anchor tag click events
			var anchors = nodeDiv.getElementsByTagName('a');
			for (var i = 0; i < anchors.length; i++){
				anchors[i].addEventListener('click', popcornClickCapture, false);
			}
			//update the teaser content
			teaser.content = nodeDiv;
			//add the data to the internal cache
			nodeData[options.nid] = teaser;

			//now that the data is loaded, make the kernel pop
			popKernel(options.nid);
		}

		function receiveFull(full, options){
			if (typeof full == 'object'){

				//  make our video autoplay once it loads
				//popcorn.media.autoplay = true;

				//remove existing Track Events
				var kernels = popcorn.getTrackEvents();
				for (var i = 0; i < kernels.length; i++){
					popcorn.removeTrackEvent(kernels[i]._id);
				}
				//then add the new track events in full.kernels
				for (var i = 0; i < full.kernels.length; i++){
					popcorn.drupal(full.kernels.data[i]);
				}


				//remove existing media sources
				while (popcorn.media.hasChildNodes()) {
					popcorn.media.removeChild(popcorn.media.lastChild);
				}
				//Add new media source
				var source;
				for (var i = 0; i < full.videos.length; i++){
					source = document.createElement('source');
					source.src = full.videos[i].src;
					source.type = full.videos[i].mime;
					popcorn.media.appendChild(source);

				}

				//load the new video
				popcorn.load();
			}
		}

		/*
		 * Anchor click event function
		 */
		function popcornClickCapture(event){
			var parent = this.parentNode;
			while (!parent.classList.contains('node')){
				parent = parent.parentNode;
			}
			ajaxLoadData(FULL_TEXT, {nid: parent.id.match(/node-(\d+)/)[1]});
			//prevent the default behavior of the anchor
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
						label: "Node ID"
					},
				}
			},
			_setup : function( options ) {
				//loadXMLDoc(options.nid);
			},
			start: function( event, options ){
				//use the cached data for the kernel if available
				if (options.nid in nodeData){
					popKernel(options.nid);
				}
				else{
					ajaxLoadData(TEASER_TEXT, options);
				}
			},
			end: function( event, options ){
				var nodeDiv = document.getElementById(options._id);
				nodeDiv.parentNode.removeChild(nodeDiv);

				var subjectContainer = document.getElementById(nodeData[options.nid].subject.replace(' ', '_'));
				if (subjectContainer != null && subjectContainer.childNodes.length == 1){
					subjectContainer.parentNode.removeChild(subjectContainer);
				}

			}
		};
	});
})(Popcorn);
