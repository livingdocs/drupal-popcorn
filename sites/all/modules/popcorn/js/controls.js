

var popcorn;
jQuery(document).ready(function() {
	
	popcorn = Popcorn('#main-player');
	var controller = new Controller();
	

	
});

function Controller(){
	
	this.history = new HistoryManager(this);
	this.vidControls = new VideoControls('player-controls');
	
	
	this.vidControls.init();

	var self = this;
	
	//register listeners for kernelPop(click) events
	this.shelfState = 'type';
	popcorn.listen('kernelPop', function(data){
		self.catchKernel(data);
	});
	popcorn.listen('kernelDestroy', function(options){
		var groupNode = document.getElementById(self.shelfState + "-" + options[self.shelfState].replace(" ", "-"));
		if (groupNode && groupNode.childNodes && groupNode.childNodes.length == 1){
			groupNode.parentNode.removeChild(kernel);
		}
	});
	
	var shelfControls = document.getElementById("shelf-controls").getElementsByTagName("a");
	for (var i = 0; i< shelfControls.length; i++){
		shelfControls[i].addEventListener('click', function(event){
			
			event.preventDefault();
			
			if (this.id != "by-" + self.shelfState){
			
				var newState = (self.shelfState == "subject") ? "type" : "subject";
				
				var subject, 
				subjects = document.getElementsByClassName("popcorn-" + self.shelfState);
				
				while (subjects.length){
					var target, kernel
					subject = subjects.item(0),
					kernels = subject.getElementsByClassName("popcorn-node");
					while (kernels.length){
						kernel = kernels.item(0);
						target = getTarget(kernel.className, newState);
						target.appendChild(kernel);
					}
					subject.parentNode.removeChild(subject);
				}
				
				self.shelfState = newState;
				
			}
			
			function getTarget(classes, type){
				var i, target,
				list = classes.split(" ");
				targetId = '',
				l = list.length;
				for (i = 0; i < l; i++){
					if (list[i].match('^' + type + '(.*)$')){
						targetId = list[i];
						target = document.getElementById(targetId);
						break;
					}
				}
				if (target == null){
					target = document.createElement('div');
					target.id = targetId;
					target.className = 'popcorn-' + type;

					var heading = document.createElement('h2');
					var re = new RegExp("^" + type + "-");
					heading.innerHTML = targetId.replace(re, '').replace('-', ' ');
					heading.className = 'popcorn-' + type + '-heading';
					target.appendChild(heading);
					
					document.getElementById('kettle').appendChild(target);
				}
				
				return target;

			}
		}, false);
	}
	

	function loadKernels(nid){
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
				kernels = JSON.parse( xmlhttp.responseText );
				//sanity check
				if (kernels.type == 2){
					for (var i = 0; i < kernels.data.length; i++){
						popcorn.drupal(kernels.data[i]);
						self.vidControls.addTrigger(kernels.data[i]);
					}
					self.vidControls.drawTriggers();
				}
			}
		};
		xmlhttp.open("GET", "/popcorn/" + nid + "/kernels", true);
		xmlhttp.send();
	}
	  
	loadKernels(2);
	
}

Controller.prototype.catchHistory = function(index){
	
	var vidData = this.history.loadHistory(index);

	//remove existing Track Events
	var kernels = popcorn.getTrackEvents();
	for (var i = 0; i < kernels.length; i++){
		popcorn.removeTrackEvent(kernels[i]._id);
	}

	//remove existing media sources
	while (popcorn.media.hasChildNodes()) {
		popcorn.media.removeChild(popcorn.media.lastChild);
	}
	//Add new media sources
	for (var i = 0; i < vidData.videoUrls.length; i++){
		popcorn.media.appendChild(vidData.videoUrls[i]);
	}
	
	if (vidData.paused){
		popcorn.media.autoplay = false;
	}

	//load the new video
	popcorn.load();
	
	//add the new track events from the vidData
	this.vidControls.removeTriggers();
	for (var i = 0; i < vidData.kernels.length; i++){
		popcorn.drupal(vidData.kernels[i]);
		this.vidControls.addTrigger(vidData.kernels[i]);
	}

	//advance the video to the previous timestamp
	popcorn.listen('loadeddata', function(){
		popcorn.currentTime(vidData.currentTime);
		popcorn.unlisten('loadeddata');
	});
	
	this.vidControls.updatePlayButton();
	this.history.updateHistory();
};

Controller.prototype.catchKernel = function(options){
	var destination = document.getElementById(options.dest);
	while (destination.childNodes.length > 2){
		var moveNode = destination.lastChild;
		var target = getTarget(moveNode.className, this.shelfState);
		target.appendChild(destination.lastChild);
		//create correct container and append to 
	}
	
	function getTarget(classes, type){
		var i, target,
		list = classes.split(" ");
		targetId = '',
		l = list.length;
		for (i = 0; i < l; i++){
			if (list[i].match('^' + type + '(.*)$')){
				targetId = list[i];
				target = document.getElementById(targetId);
				break;
			}
		}
		if (target == null){
			target = document.createElement('div');
			target.id = targetId;
			target.className = 'popcorn-' + type;

			var heading = document.createElement('h2');
			var re = new RegExp("^" + type + "-");
			heading.innerHTML = targetId.replace(re, '').replace('-', ' ');
			heading.className = 'popcorn-' + type + '-heading';
			target.appendChild(heading);
			
			document.getElementById('kettle').appendChild(target);
		}
		
		return target;

	}
	
};

Controller.prototype.loadModal = function(nodeData){
	var wasPlaying = false;
	if (!popcorn.paused()){
		wasPlaying = true;
	    popcorn.pause();
	}
	var modalFrame = document.createElement('div');
	modalFrame.id = 'modal-frame';
	modalFrame.addEventListener('click', function(){
		//document.getElementsByTagName('body')[0].removeChild(modalFrame);
	}, false);
	
	var modalDialog = document.createElement('div');
	modalDialog.id = 'modal-dialog';
	modalDialog.innerHTML = nodeData;
	
	var closeButton = document.createElement('button');
	closeButton.id = 'modal-close';
	closeButton.innerHTML = "X";
	closeButton.addEventListener('click', function(){
		if (wasPlaying){
			popcorn.play();
		}
		document.getElementsByTagName('body')[0].removeChild(modalFrame);
	}, false);
	modalDialog.appendChild(closeButton);
	
	modalFrame.appendChild(modalDialog);
	
	document.getElementsByTagName('body')[0].appendChild(modalFrame);
};

Controller.prototype.loadVideo = function(vidData){

	this.history.saveHistory();
	
	//make the video autoplay once it loads
	popcorn.media.autoplay = true;

	//remove existing Track Events
	var kernels = popcorn.getTrackEvents();
	for (var i = 0; i < kernels.length; i++){
		popcorn.removeTrackEvent(kernels[i]._id);
	}

	//remove existing media sources
	while (popcorn.media.hasChildNodes()) {
		popcorn.media.removeChild(popcorn.media.lastChild);
	}
	//Add new media source
	var source;
	for (var i = 0; i < vidData.videos.length; i++){
		source = document.createElement('source');
		source.src = vidData.videos[i].src;
		source.type = vidData.videos[i].mime;
		popcorn.media.appendChild(source);

	}

	//load the new video
	popcorn.load();
	this.vidControls.resetScrubber();
	
	//add the new track events in full.kernels
	this.vidControls.removeTriggers();
	for (var i = 0; i < vidData.kernels.length; i++){
		popcorn.drupal(vidData.kernels[i]);
		this.vidControls.addTrigger(vidData.kernels[i]);
	}
	
	this.vidControls.updatePlayButton();
};

function HistoryManager(controller){
	
	this.controller = controller;
	this.historyList = [];
	this.historyDisplay = document.getElementById('player-history');
	
}

HistoryManager.prototype.loadHistory = function(i){
	var selected = this.historyList[i];
	this.historyList = this.historyList.slice(0, i);
	return selected;
};

HistoryManager.prototype.saveHistory = function(){
	var history = {};
	history.videoUrls = [];
	for (var i = 0; i < popcorn.media.children.length; i++){
		history.videoUrls[i] = popcorn.media.children[i].cloneNode(false);
	}
	
	history.kernels = [];
	var kernels = popcorn.getTrackEvents();
	for (var i = 0; i < kernels.length; i++){
		history.kernels[i] = {nid: kernels[i].nid, start: kernels[i].start, end: kernels[i].end, type: kernels[i].type};
	}
	
	history.currentTime = popcorn.currentTime();
	
	history.paused = popcorn.paused();
	
	this.historyList.push(history);
	
	this.updateHistory();
};

HistoryManager.prototype.updateHistory = function(){
	this.resetHistory();
	var len = this.historyList.length;
	var historyNode;
	var historyNodeLink;
	for (var i = 0; i < len; i++){
		historyNode = document.createElement('div');
		historyNode.className = "history-node";
		historyNode.id = "history-node-" + i;
		
		historyNodeLink = document.createElement('a');
		historyNodeLink.href = '#'
		var self = this;
		var j = i;
		historyNodeLink.addEventListener('click', function(event){
			event.preventDefault();
			self.controller.catchHistory(j);
		});
		historyNode.appendChild(historyNodeLink);
		
		this.historyDisplay.appendChild(historyNode);
	}
};

HistoryManager.prototype.resetHistory = function(){
	while (this.historyDisplay.hasChildNodes()){
		this.historyDisplay.removeChild(this.historyDisplay.firstChild);
	}
};



function VideoControls(canvas){

	this.triggers = [];

	this.scrubber = document.getElementById(canvas);
	this.ctx = this.scrubber.getContext("2d");
	
	this.playButton = document.getElementById('play-button');

	this.scrubberHeight = 2;
	this.scrubberStartPos = 0;
	

	//init volume controls
	this.volume = document.getElementById('volume-control');
	this.volCtx = this.volume.getContext("2d");
	this.volumeScrubberWidth = 2;
	this.maxVolScrubLen = this.volume.height - 10;
}

VideoControls.prototype.addTrigger = function(data){
	this.triggers[data.start] = data;
};

VideoControls.prototype.removeTriggers = function(){
	this.triggers = [];
};

VideoControls.prototype.drawTriggers = function(){
	var drawTriggerImage = function(image, startPos, context){
	      return function(){
	    	  context.drawImage(image, startPos, 5);
	      };
	}
	
	for (var index in this.triggers){
		
		var current = this.triggers[index];
		var startPos = (current.start / popcorn.duration()) * this.scrubber.width - 15;
		
		var image;
	    if (popcorn.currentTime() >= current.start){
	    	image = document.getElementById(current.type + '-trigger-icon');
	    }
	    else{
	    	image = document.getElementById(current.type + '-trigger-icon-dim');
	    }
	    
	    this.ctx.drawImage(image, startPos, 25);
		
	}
};



VideoControls.prototype.init = function(){
	
	this.initScrubber();
	this.initPlayButton();
	this.initVolumeButton();


	//draw the tapered top background
	var taper = document.getElementById('player-controls-taper');
	var taperCtx = taper.getContext("2d");
	taperCtx.fillStyle = "rgba(25, 42, 53, 0.8)";
	taperCtx.strokeStyle = "rgba(25, 42, 53, 0.8)";
	taperCtx.beginPath();
	taperCtx.moveTo(0, 20);
	taperCtx.lineTo(20, 0);
	taperCtx.lineTo(taper.width - 20, 0);
	taperCtx.lineTo(taper.width, 20);
	taperCtx.fill();
	taperCtx.closePath();
	

	//draw the main scrubber area background
	this.ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
	this.ctx.fillRect(0, 0, this.scrubber.width, this.scrubber.height);
}

VideoControls.prototype.initVolumeButton = function(){
	//register event listeners
	var self = this;
	popcorn.listen('volumechange', function(){
		self.updateVolumeButton();
	});
	document.getElementById('volume-button').addEventListener('click', function(){
		if (document.getElementById('volume-button').className == "player-button muted"){
			popcorn.unmute();
		}
		else{
			popcorn.mute();
		}
	}, false);
};

VideoControls.prototype.updateVolumeButton = function(){
	if (popcorn.muted()){
		document.getElementById('volume-button').className = "player-button muted";
	}
	else{
		document.getElementById('volume-button').className = "player-button";
	}
};

VideoControls.prototype.initPlayButton = function(){
	//register event listeners
	var self = this;
	popcorn.listen('pause', function(){
		self.updatePlayButton();
	});
	popcorn.listen('play', function(){
		self.updatePlayButton();
	});
	popcorn.listen('ended', function(){
		popcorn.pause();
	});
	document.getElementById('play-button').addEventListener('click', function(){
		if (popcorn.paused() || popcorn.ended()){
			popcorn.play();
		}
		else{
			popcorn.pause();
		}
	}, false);
};

VideoControls.prototype.updatePlayButton = function(){
	if (popcorn.paused()){
		document.getElementById('play-button').className = "player-button paused";
	}
	else{
		document.getElementById('play-button').className = "player-button";
	}
};



/*
 * Scrubber related functions
 */

VideoControls.prototype.initScrubber = function(){
	//register event listeners
	var self = this;
	popcorn.listen('progress', function(){
		self.updateScrubber();
	});
	popcorn.listen('timeupdate', function(){
		self.updateScrubber();
	});
	this.scrubber.addEventListener('click', function(event){
		self.scrubberClick(event);
	}, false);
	
};

VideoControls.prototype.resetScrubber = function(){

	this.scrubber.height = this.scrubber.height;
	this.scrubber.width = this.scrubber.width;

	//draw the main scrubber area background
	this.ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
	this.ctx.fillRect(0, 0, this.scrubber.width, this.scrubber.height);
	
};

VideoControls.prototype.updateScrubber = function(){
	
	if (popcorn.buffered().length > 0){
		
		//fill buffered
		var percentBuffered = popcorn.buffered().end(0) / popcorn.duration();
		//fill played
		var percentPlayed = (popcorn.currentTime() / popcorn.duration()) * this.scrubber.width;
		//draw the updated scrubber
		this.drawScrubber(percentBuffered, percentPlayed);
	}
	
};

VideoControls.prototype.drawScrubber = function(buffered, played){

	//reset the scrubber
	this.resetScrubber();
	

	this.drawTriggers();
	
	//fill duration
	this.ctx.save();
	this.ctx.fillStyle = "rgb(71, 85, 86)";
	this.ctx.fillRect(0, 60 - (this.scrubberHeight / 2), this.scrubber.width, this.scrubberHeight);
	this.ctx.restore();	

	//fill buffered
	this.ctx.fillStyle = "rgb(148, 127, 83)";
	var grayLength = (buffered * this.scrubber.width);
	this.ctx.fillRect(0, 60 - (this.scrubberHeight / 2), grayLength, this.scrubberHeight);
	
	//fill played
	this.ctx.save();
	this.ctx.fillStyle = "rgb(255, 205, 51)";
	this.ctx.shadowBlur = 5;
	this.ctx.shadowColor = "rgb(255, 205, 51)";
	this.ctx.fillRect(0, 60 - (this.scrubberHeight / 2), played, this.scrubberHeight);
	this.ctx.restore();	
	
};

VideoControls.prototype.scrubberClick = function(event){
	var coords = this.getCoords(event);
	
	//click is in the scrubber area
	if(coords.offsetY < 70 && coords.offsetY > 50){
		popcorn.currentTime(((coords.offsetX) / this.scrubber.width) * popcorn.duration());
	}
}

VideoControls.prototype.drawTaper = function(){
	//tapered top
	this.ctx.fillStyle = "rgba(25, 42, 53, 0.8)";
	this.ctx.strokeStyle = "rgba(25, 42, 53, 0.8)";
	this.ctx.beginPath();
	this.ctx.moveTo(0, 20);
	this.ctx.lineTo(20, 0);
	this.ctx.lineTo(this.scrubber.width - 20, 0);
	this.ctx.lineTo(this.scrubber.width, 20);
	this.ctx.fill();
	this.ctx.closePath();
};

//additional function required to determine the relative coordinates of a click event
VideoControls.prototype.getCoords = function(event){
	var x, y;

	canoffset = jQuery(event.target).offset();
	x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
	y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

	return {offsetX: x, offsetY: y};
};
