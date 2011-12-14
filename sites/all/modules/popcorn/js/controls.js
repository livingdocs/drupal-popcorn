var popcorn;
jQuery(document).ready(function() {
	
	popcorn = Popcorn('#main-player');
	var controller = new Controller();
	

	
});

function Controller(){
	
	this.history = new HistoryManager();
	this.vidControls = new VideoControls('player-controls');
	
	
	this.vidControls.init();
	
	//register listeners for kernelPop(click) events
	var self = this;
	popcorn.listen('kernelPop', function(data){
		self.history.saveHistory();
		self.catchKernel(data);
		self.vidControls.reset();
	});
	

	function loadKernels(nid){
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
				kernels = JSON.parse( xmlhttp.responseText );
				//sanity check
				if (kernels.type == 2){
					for (var i = 0; i < kernels.data.length; i++){
						popcorn.drupal(kernels.data[i]);
					}
				}
			}
		};
		xmlhttp.open("GET", "/popcorn/" + nid + "/kernels", true);
		xmlhttp.send();
	}
	  
	loadKernels(2);
	
	//development code
	this.historyBack = document.getElementById('history-back');
	this.historyBack.addEventListener('click', function(event){
		event.preventDefault();
		
		var vidData = self.history.loadHistory();

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

		//load the new video
		popcorn.load();
		
		//add the new track events from the vidData
		for (var i = 0; i < vidData.kernels.length; i++){
			popcorn.drupal(vidData.kernels[i]);
		}

		//advance the video to the previous timestamp
		popcorn.listen('loadeddata', function(){
			popcorn.currentTime(vidData.currentTime);
			popcorn.unlisten('loadeddata');
		});
		
	}); 
}

Controller.prototype.catchKernel = function(data){
	//data only contains the nid

	//ajax call to load video urls and track data
	jQuery.getJSON("/popcorn/" + data.nid + "/full", function(response, textStatus, jqXHR){

		var full = response.data;
		
		//make the video autoplay once it loads
		//popcorn.media.autoplay = true;

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
		for (var i = 0; i < full.videos.length; i++){
			source = document.createElement('source');
			source.src = full.videos[i].src;
			source.type = full.videos[i].mime;
			popcorn.media.appendChild(source);

		}

		//load the new video
		popcorn.load();
		
		//add the new track events in full.kernels
		for (var i = 0; i < full.kernels.length; i++){
			popcorn.drupal(full.kernels[i]);
		}
		
	});
}

function HistoryManager(){
	
	this.historyList = [];
	
}

HistoryManager.prototype.loadHistory = function(){
	return this.historyList.pop();
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
		history.kernels[i] = {nid: kernels[i].nid, start: kernels[i].start, end: kernels[i].end};
	}
	
	history.currentTime = popcorn.currentTime();
	
	this.historyList.push(history);
};



function VideoControls(canvas){


	this.controls = document.getElementById(canvas);
	this.ctx = this.controls.getContext("2d");

	this.scrubberHeight = 2;
	this.scrubberLength = this.controls.width - 140 - 300;
	this.scrubberStartPos = 70;
	

	//init volume controls
	this.volume = document.getElementById('volume-control');
	this.volCtx = this.volume.getContext("2d");
	this.volumeScrubberWidth = 2;
	this.maxVolScrubLen = this.volume.height - 10;
}



VideoControls.prototype.init = function(){
	
	this.initScrubber();

	/*
	popcorn.listen('volumechange', updateVolume);  
	popcorn.listen('play', drawPauseButton);  
	popcorn.listen('pause', drawPlayButton); 
	 */
	

	//draw the tapered top background
	this.ctx.fillStyle = "rgba(25, 42, 53, 0.8)";
	this.ctx.strokeStyle = "rgba(25, 42, 53, 0.8)";
	this.ctx.beginPath();
	this.ctx.moveTo(0, 20);
	this.ctx.lineTo(20, 0);
	this.ctx.lineTo(this.controls.width - 20, 0);
	this.ctx.lineTo(this.controls.width, 20);
	this.ctx.fill();
	this.ctx.closePath();
	

	//draw the main scrubber area background
	this.ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
	this.ctx.fillRect(0, 20, this.controls.width, this.controls.height);
}



VideoControls.prototype.reset = function(){

	this.controls.height = this.controls.height;
	this.controls.width = this.controls.width;
	

	//draw the tapered top background
	this.ctx.fillStyle = "rgba(25, 42, 53, 0.8)";
	this.ctx.strokeStyle = "rgba(25, 42, 53, 0.8)";
	this.ctx.beginPath();
	this.ctx.moveTo(0, 20);
	this.ctx.lineTo(20, 0);
	this.ctx.lineTo(this.controls.width - 20, 0);
	this.ctx.lineTo(this.controls.width, 20);
	this.ctx.fill();
	this.ctx.closePath();
	

	//draw the main scrubber area background
	this.ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
	this.ctx.fillRect(0, 20, this.controls.width, this.controls.height);
	
}

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
}

VideoControls.prototype.updateScrubber = function(){
	
	if (popcorn.buffered().length > 0){
		
		//fill buffered
		var percentBuffered = popcorn.buffered().end(0) / popcorn.duration();
		//fill played
		var percentPlayed = (popcorn.currentTime() / popcorn.duration()) * this.scrubberLength;

		this.drawScrubber(percentBuffered, percentPlayed);
	}
	
}

VideoControls.prototype.drawScrubber = function(buffered, played){

	//reset the scrubber
	this.ctx.save();
	this.ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
	this.ctx.clearRect(this.scrubberStartPos - 5, 44, this.scrubberLength + 10, 22);
	this.ctx.fillRect(this.scrubberStartPos - 5, 44, this.scrubberLength + 10, 22);
	this.ctx.restore();	
	
	//fill duration
	this.ctx.save();
	this.ctx.fillStyle = "rgb(255, 76, 82)";
	this.ctx.fillRect(this.scrubberStartPos, 55 - (this.scrubberHeight / 2), this.scrubberLength, this.scrubberHeight);
	this.ctx.restore();	

	//fill buffered
	this.ctx.fillStyle = "rgb(75, 76, 82)";
	var grayLength = (buffered * this.scrubberLength);
	this.ctx.fillRect(this.scrubberStartPos, 55 - (this.scrubberHeight / 2), grayLength, this.scrubberHeight);
	
	//fill played
	this.ctx.save();
	this.ctx.fillStyle = "rgb(234, 194, 82)";
	this.ctx.shadowBlur = 5;
	this.ctx.shadowColor = "rgb(234, 194, 82)";
	this.ctx.fillRect(this.scrubberStartPos, 55 - (this.scrubberHeight / 2), played, this.scrubberHeight);
	this.ctx.restore();	
	
}

/*
 * Volume related functions
 */

VideoControls.prototype.initVolume = function(){
	//register event listeners
	var self = this;
	popcorn.listen('volumechange', function(){
		self.updateVolume();
	});
	



	updateVolume();

	volume.addEventListener('mouseout', function(){ volume.style.display = 'none'; }, false);
	volume.addEventListener('click', volumeClick, false);
}

VideoControls.prototype.updateVolume = function(){
	//reset volume scrubber area
	volCtx.save();
	volCtx.fillStyle = "rgba(25, 42, 53, 0.9)";
	volCtx.clearRect(0, 0, volume.width, volume.height);
	volCtx.fillRect(0, 0, volume.width, volume.height);
	volCtx.restore();
	
	var startX = (volume.width / 2) - 1,
	startY = 5,
	volLen = maxVolScrubLen * player.volume,
	volOffset = (maxVolScrubLen - volLen);
	
	//fill volume
	volCtx.save();
	volCtx.fillStyle = "rgb(234, 194, 82)";
	volCtx.shadowBlur = 5;
	volCtx.shadowColor = "rgb(234, 194, 82)";
	volCtx.fillRect(startX, startY + volOffset, volumeScrubberWidth, maxVolScrubLen * player.volume);
	volCtx.restore();	
	
	//fill scrubber base
	volCtx.fillStyle = "rgb(75, 76, 82)";
	volCtx.fillRect(startX, startY, volumeScrubberWidth, volOffset);
}


VideoControls.prototype.drawTaper = function(){
	//tapered top
	this.ctx.fillStyle = "rgba(25, 42, 53, 0.8)";
	this.ctx.strokeStyle = "rgba(25, 42, 53, 0.8)";
	this.ctx.beginPath();
	this.ctx.moveTo(0, 20);
	this.ctx.lineTo(20, 0);
	this.ctx.lineTo(this.controls.width - 20, 0);
	this.ctx.lineTo(this.controls.width, 20);
	this.ctx.fill();
	this.ctx.closePath();
}

//additional function required to determine the relative coordinates of a click event
VideoControls.prototype.getCoords = function(event){
	var x, y;

	canoffset = jQuery(event.target).offset();
	x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
	y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

	return {offsetX: x, offsetY: y};
}
