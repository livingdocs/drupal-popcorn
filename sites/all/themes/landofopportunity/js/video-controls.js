jQuery(document).ready(function() {

	var player = document.getElementById('main-player');
	
	var popcorn = Popcorn('#main-player');
	
	player.addEventListener('timeupdate', updateProgress, false); 
	player.addEventListener('progress', updateProgress, false);  
	player.addEventListener('volumechange', updateVolume, false);  
	player.addEventListener('play', drawPauseButton, false);  
	player.addEventListener('pause', drawPlayButton, false);  
	
	
		
	
	
	
	
	
	//init volume controls
	var volume = document.getElementById('volume-control'),
    volCtx = volume.getContext("2d"),
    volumeScrubberWidth = 2,
    maxVolScrubLen = volume.height - 10;


	updateVolume();

	
	function updateVolume(){
		resetVolume();
		
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
	
	//reset volume scrubber
	function resetVolume(){
		volCtx.save();
    	volCtx.fillStyle = "rgba(25, 42, 53, 0.9)";
    	volCtx.clearRect(0, 0, volume.width, volume.height);
    	volCtx.fillRect(0, 0, volume.width, volume.height);
    	volCtx.restore();	
	}
	
	function volumeClick(event){
		console.log(event.layerY);
		var coords = getCoords(event);
		//click is in the play/pause area
		if(coords.offsetX < (scrubberStartPos + scrubberLength) && coords.offsetX > scrubberStartPos && coords.offsetY < 66 && coords.offsetY > 44){
			popcorn.currentTime(((coords.offsetX - scrubberStartPos) / scrubberLength) * popcorn.duration());
		}
		player.volume = coords.offsetY / volume.height;
	}
	
	

	
	function controlsHover(event){
		var coords = getCoords(event);
		//hovering over the volume control    controls.width - 50, 40, 30, 30
		if (coords.offsetX < controls.width - 20 && coords.offsetX > controls.width - 50 && coords.offsetY < 70 && coords.offsetY > 40){
			volume.style.display = 'block';
		}
		else{
			volume.style.display = 'none';
		}
	}
	
	
	
	//init player controls
	var controls = document.getElementById('player-controls'),
    ctx = controls.getContext("2d");

	controls.addEventListener('click', controlsClick, false);
	controls.addEventListener('mousemove', controlsHover, false);
	volume.addEventListener('mouseout', function(){ volume.style.display = 'none'; }, false);
	volume.addEventListener('click', volumeClick, false);
	
	
	var scrubberHeight = 2;
	var scrubberLength = controls.width - 120;
	var scrubberStartPos = 60;
	
	

	//main scrubber area
	ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
	ctx.fillRect(0, 15, controls.width, controls.height);
	
	//tapered top
	ctx.fillStyle = "rgba(25, 42, 53, 0.8)";
	ctx.strokeStyle = "rgba(25, 42, 53, 0.8)";
	ctx.beginPath();
	ctx.moveTo(0, 15);
	ctx.lineTo(20, 0);
	ctx.lineTo(controls.width - 20, 0);
	ctx.lineTo(controls.width, 15);
	ctx.fill();
	ctx.closePath();

    drawPlayButton();
    drawVolumeButton();
	
	//play button
    function drawPlayButton(){
    	resetPlayPause();
    	ctx.save();
    	ctx.fillStyle = "rgb(234, 194, 82)";
    	ctx.shadowBlur = 5;
    	ctx.shadowColor = "rgb(234, 194, 82)";
    	ctx.beginPath();
    	ctx.moveTo(15, 40);
    	ctx.lineTo(40, 55);
    	ctx.lineTo(15, 70);
    	ctx.fill();
    	ctx.closePath();
        ctx.restore();
    }
	
	//pause button
    function drawPauseButton(){
    	resetPlayPause();
    	ctx.save();
    	ctx.fillStyle = "rgb(234, 194, 82)";
    	ctx.shadowBlur = 5;
    	ctx.shadowColor = "rgb(234, 194, 82)";
    	ctx.fillRect(15, 40, 10, 30);
    	ctx.fillRect(30, 40, 10, 30);
        ctx.restore();
    }
    
    //clear controls area
    function resetPlayPause(){
    	ctx.save();
    	ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
    	ctx.clearRect(0, 20, 50, 60);
    	ctx.fillRect(0, 20, 50, 60);
    	ctx.restore();	
    }
    
    //clear the scrubber area
    function resetScrubber(){
    	ctx.save();
    	ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
    	ctx.clearRect(scrubberStartPos - 5, 44, scrubberLength + 10, 22);
    	ctx.fillRect(scrubberStartPos - 5, 44, scrubberLength + 10, 22);
    	ctx.restore();	
    }
	

	//replaced by updateProgress
	function updateSeekable(){   
		if (this.buffered.length > 0){
			var percent = this.buffered.end(0) / this.duration;
			ctx.save();
			ctx.fillStyle = "rgb(75, 76, 82)";
			ctx.fillRect(scrubberStartPos, 55 - (scrubberHeight / 2), percent * (controls.width - 100), scrubberHeight);
			ctx.restore();	
		}
	}  
	
	function updateProgress(){
		if (this.buffered.length > 0){
			resetScrubber();
			
			//fill played
			ctx.save();
	    	ctx.fillStyle = "rgb(234, 194, 82)";
	    	ctx.shadowBlur = 5;
	    	ctx.shadowColor = "rgb(234, 194, 82)";
			var played = (popcorn.currentTime() / this.duration) * scrubberLength;
			ctx.fillRect(scrubberStartPos, 55 - (scrubberHeight / 2), (popcorn.currentTime() / this.duration) * scrubberLength, scrubberHeight);
			ctx.restore();	
			
			//fill unplayed
			var percent = this.buffered.end(0) / this.duration;
			ctx.fillStyle = "rgb(75, 76, 82)";
			var grayStartX = scrubberStartPos + ((popcorn.currentTime() / this.duration) * scrubberLength);
			var grayLength = ((this.buffered.end(0) / this.duration) * scrubberLength) - played;
			ctx.fillRect(grayStartX, 55 - (scrubberHeight / 2), grayLength, scrubberHeight);
		}
	}
	
	function controlsClick(event){
		var coords = getCoords(event);
		//click is in the play/pause area
		if (coords.offsetX < 50 && coords.offsetX > 10 && coords.offsetY < 70 && coords.offsetY > 20){

			if (player.paused || player.ended) {
				 if (player.ended) {
						player.currentTime = 0;
				 }
				 player.play();
				 drawPauseButton(this.getContext("2d"));
			} else {
				 player.pause();
				 drawPlayButton(this.getContext("2d"));
			}
			
		}
		//click is in the scrubber area
		else if(coords.offsetX < (scrubberStartPos + scrubberLength) && coords.offsetX > scrubberStartPos && coords.offsetY < 66 && coords.offsetY > 44){
			popcorn.currentTime(((coords.offsetX - scrubberStartPos) / scrubberLength) * popcorn.duration());
		}
	}

	
	//additional function required to determine the relative coordinates of a click event
	function getCoords(event){
		var x, y;

		canoffset = jQuery(controls).offset();
		x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
		y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

		if (ev.layerX || ev.layerX == 0) { // Firefox
			x = ev.layerX;
			y = ev.layerY;
		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
			x = ev.offsetX;
			y = ev.offsetY;
		}
		  
		return {offsetX: x, offsetY: y}
	}

    
    //clear volume area
    function resetVolumeButton(){
    	ctx.save();
    	ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
    	ctx.clearRect(controls.width - 50, 20, 50, 60);
    	ctx.fillRect(controls.width - 50, 20, 50, 60);
    	ctx.strokeStyle = "green";
    	ctx.strokeRect(controls.width - 50, 40, 30, 30);
    	ctx.restore();	
    }
	
	//draw volume
    function drawVolumeButton(){
    	resetVolumeButton();
    	ctx.save();
    	ctx.fillStyle = "rgb(234, 194, 82)";
    	ctx.shadowBlur = 5;
    	ctx.shadowColor = "rgb(234, 194, 82)";
    	ctx.beginPath();
    	ctx.moveTo(controls.width - 40, 51);
    	ctx.lineTo(controls.width - 35, 51);
    	ctx.lineTo(controls.width - 30, 46);
    	ctx.lineTo(controls.width - 30, 63);
    	ctx.lineTo(controls.width - 35, 58);
    	ctx.lineTo(controls.width - 40, 58);
    	ctx.fill();
    	ctx.closePath();
        ctx.restore();
    }
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	


});
