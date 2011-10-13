jQuery(document).ready(function() {

	player = document.getElementById('main-player');
	
	popcorn = Popcorn('#main-player');

	buffer = document.getElementById('progressBar');
	
	playButton = document.getElementById('playerPlay');
	playButton.onclick = function(){
		if (player.paused || player.ended) {
			 if (player.ended) {
					player.currentTime = 0;
		}
			 this.innerHTML = '&#x2590&#x2590';
			 this.title = 'pause';
			 player.play();
		} else {
			 this.innerHTML = '&#x25BA';
			 this.title = 'play';
			 player.pause();
		}
	}
	
	/* Scrubber Stuff */
	
	player.addEventListener('timeupdate', updateProgress, false); 
	player.addEventListener('progress', updateSeekable, false);  
	
	function updateSeekable(){   
		 buffer.style.width = ((this.buffered.end() / this.duration) * 100) + '%';
	}  
	
	function updateProgress(){
		var progressPos = document.getElementById('progressPosition');
		var progressProg = document.getElementById('playerProgress');
		progressPos.style.width = ((this.currentTime / this.duration) * 100) + '%';
		
		
			
		// setup the line style
		context.fillStyle = '#eac14f';
		context.fillRect(0, (canvas.height / 2) - (scrubberHeight / 2), (this.currentTime / this.duration) * canvas.width, scrubberHeight);
		context.fillStyle = '#4b4c52';
		context.fillRect((this.currentTime / this.duration) * canvas.width, (canvas.height / 2) - (scrubberHeight / 2), canvas.width, scrubberHeight);
		
	}

	jQuery('#playerProgress').click(function(event){
		popcorn.currentTime((event.offsetX / 600) * popcorn.duration());
	});

	jQuery('#theCanvas').click(function(event){
		popcorn.currentTime((event.offsetX / 720) * popcorn.duration());
		console.log(event);
	});
	
	
	
	/* Volume Stuff */
	
	jQuery('#volumePosition').css('height', (player.volume * 100) + "%");

	jQuery('#playerVolume').hover(function(){
		jQuery('#volumeControl').toggle();
	});

	jQuery('#volumeControl').click(function(event){
		var volumePos = document.getElementById('volumePosition');
		volumePos.style.height = (120 - event.offsetY) + 'px';
		volumePos.style.top = (event.offsetY) + 'px';
		popcorn.volume((120 - event.offsetY) / 120);
		console.log(event);
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var scrubberHeight = 2;
	
	
	var canvas = document.getElementById("theCanvas"),
    context = canvas.getContext("2d");

	context.fillStyle = '#2c353e';
	context.fillRect(0,0,canvas.width,canvas.height);
	
	// setup the line style
	context.fillStyle = '#4b4c52';
	context.fillRect(0, (canvas.height / 2) - (scrubberHeight / 2), canvas.width, scrubberHeight);
	
	// colour the path
	context.stroke();
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	


});
