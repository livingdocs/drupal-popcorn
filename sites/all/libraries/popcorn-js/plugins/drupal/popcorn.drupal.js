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
		    	nodeDiv.innerHTML = xmlhttp.responseText;
		    	nodeData[nid] = nodeDiv;
		    }
		  }
		  xmlhttp.open("GET", "/node/" + nid + "/popcorn/teaser", true);
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
	              label: "Nid"
	          },
	        }
	      },
	      _setup : function( options ) {
	         console.log('Setting up trigger for nid: ' + options.nid);
	         loadXMLDoc(options.nid);
	      },
	      start: function( event, options ){
	         console.log('starting trigger for:' + options.nid);
	         document.getElementById('junk').appendChild(nodeData[options.nid]);
	      },
	      end: function( event, options ){
		      console.log('ending trigger for:' + options.nid);
	    	  var nodeDiv = document.getElementById("popcorn-node-" + options.nid);
	    	  nodeDiv.parentNode.removeChild(nodeDiv);
	      }
	  }
  });
})(Popcorn);