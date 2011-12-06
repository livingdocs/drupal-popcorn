
jQuery(document).ready(function() {

//var popcorn = Popcorn('#main-player');
var controls;
var ctx;

init();

function init(){
	
	//get references to the canvas and context
	controls = document.getElementById('player-controls2');
	ctx = controls.getContext("2d");
	
	drawTaper();
	
	initScrubber();

	/*
	popcorn.listen('timeupdate', updateScrubber); 
	popcorn.listen('progress', updateScrubber);  
	popcorn.listen('volumechange', updateVolume);  
	popcorn.listen('play', drawPauseButton);  
	popcorn.listen('pause', drawPlayButton); 
	*/
}

function initScrubber(){
	//main scrubber area
	ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
	ctx.fillRect(0, 20, controls.width, controls.height);
}

function drawTaper(){
	//tapered top
	ctx.fillStyle = "rgba(25, 42, 53, 0.8)";
	ctx.strokeStyle = "rgba(25, 42, 53, 0.8)";
	ctx.beginPath();
	ctx.moveTo(0, 20);
	ctx.lineTo(20, 0);
	ctx.lineTo(controls.width - 20, 0);
	ctx.lineTo(controls.width, 20);
	ctx.fill();
	ctx.closePath();
}

});