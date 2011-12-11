
jQuery(document).ready(function() {
	var popcorn = Popcorn('#main-player');
	vidControls = new VideoControls('player-controls', popcorn);
	vidControls.init();
	

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
	
});


function VideoControls(canvas, popcornInstance){


	this.popcorn = popcornInstance;
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
	this.popcorn.listen('volumechange', updateVolume);  
	this.popcorn.listen('play', drawPauseButton);  
	this.popcorn.listen('pause', drawPlayButton); 
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

/*
 * Scrubber related functions
 */

VideoControls.prototype.initScrubber = function(){
	//register event listeners
	var self = this;
	this.popcorn.listen('timeupdate', function(){
		self.updateScrubber();
	});
	this.popcorn.listen('progress', function(){
		self.updateScrubber();
	});
}

VideoControls.prototype.updateScrubber = function(){
    var percentBuffered = null;
    // FF4+, Chrome
    if (this.popcorn && this.popcorn.buffered() && this.popcorn.buffered().length > 0 && this.popcorn.buffered().end && this.popcorn.duration()) {
    	percentBuffered = this.popcorn.buffered().end(0) / this.popcorn.duration();
    } 
    // Some browsers (e.g., FF3.6 and Safari 5) cannot calculate target.bufferered.end()
    // to be anything other than 0. If the byte count is available we use this instead.
    // Browsers that support the else if do not seem to have the bufferedBytes value and
    // should skip to there. Tested in Safari 5, Webkit head, FF3.6, Chrome 6, IE 7/8.
    else if (this.popcorn && this.popcorn.bytesTotal != undefined && this.popcorn.bytesTotal > 0 && this.popcorn.bufferedBytes != undefined) {
    	percentBuffered = this.popcorn.bufferedBytes / this.popcorn.bytesTotal;
    	console.log('hmm');
    }

    if (percentBuffered !== null) {
    	percentBuffered = 100 * Math.min(1, Math.max(0, percentBuffered));

        // ... do something with var percent here (e.g. update the progress bar)

    }
	
	if (this.popcorn.buffered().length > 0){
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
		//var percentBuffered = this.popcorn.buffered().end(0) / this.popcorn.duration();
		this.ctx.fillStyle = "rgb(75, 76, 82)";
		var grayLength = (percentBuffered * this.scrubberLength);
		console.log(this.popcorn.buffered().end(0));
		console.log(this.popcorn.duration());
		this.ctx.fillRect(this.scrubberStartPos, 55 - (this.scrubberHeight / 2), grayLength, this.scrubberHeight);
		
		//fill played
		this.ctx.save();
    	this.ctx.fillStyle = "rgb(234, 194, 82)";
    	this.ctx.shadowBlur = 5;
    	this.ctx.shadowColor = "rgb(234, 194, 82)";
		var played = (this.popcorn.currentTime() / this.popcorn.duration()) * this.scrubberLength;
		this.ctx.fillRect(this.scrubberStartPos, 55 - (this.scrubberHeight / 2), played, this.scrubberHeight);
		this.ctx.restore();	
	}
}

/*
 * Volume related functions
 */

VideoControls.prototype.initVolume = function(){
	//register event listeners
	var self = this;
	this.popcorn.listen('volumechange', function(){
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
