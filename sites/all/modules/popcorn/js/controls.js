



(function($){
	Drupal.behaviors.popcorn = {
			attach: function (context, settings) {
				var popcorn = Popcorn('#main-player');
				var controller = new Controller(settings.popcorn['nid'], popcorn);
			}
	};


	function Controller(nid, popcorn){

		this.popcorn = popcorn;
		this.history = new HistoryManager(this);
		this.vidControls = new VideoControls('player-controls', this);
		this.shelfState = new ShelfController('subject', this);


		var self = this;




		function loadKernels(nid){
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function(){
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
					kernels = JSON.parse( xmlhttp.responseText );
					//sanity check
					if (kernels.type == 2){
						for (var i = 0; i < kernels.data.length; i++){
							self.popcorn.drupal(kernels.data[i]);
							self.vidControls.addTrigger(kernels.data[i]);
						}
						self.vidControls.drawTriggers();
					}
				}
			};
			xmlhttp.open("GET", "/popcorn/" + nid + "/kernels", true);
			xmlhttp.send();
		}

		loadKernels(nid);

	}

	Controller.prototype.catchHistory = function(index){
console.log(this.history.historyList);
		var vidData = this.history.loadHistory(index);
		var self = this;

		//remove existing Track Events
		var kernels = this.popcorn.getTrackEvents();
		for (var i = 0; i < kernels.length; i++){
			this.popcorn.removeTrackEvent(kernels[i]._id);
		}

		//remove existing media sources
		while (this.popcorn.media.hasChildNodes()) {
			this.popcorn.media.removeChild(this.popcorn.media.lastChild);
		}
		//Add new media sources
		for (var i = 0; i < vidData.videoUrls.length; i++){
			this.popcorn.media.appendChild(vidData.videoUrls[i]);
		}

		if (vidData.paused){
			this.popcorn.media.autoplay = false;
		}

		//load the new video
		this.popcorn.load();
		//poop();

		//add the new track events from the vidData
		this.vidControls.removeTriggers();
		for (var i = 0; i < vidData.kernels.length; i++){
			this.popcorn.drupal(vidData.kernels[i]);
			this.vidControls.addTrigger(vidData.kernels[i]);
		}

		//advance the video to the previous timestamp
		this.popcorn.listen('loadeddata', function(){
			self.popcorn.currentTime(vidData.currentTime);
			self.popcorn.unlisten('loadeddata');
		});

		this.vidControls.updatePlayButton();
		this.history.updateHistory();
	};

	Controller.prototype.loadModal = function(nodeData, options){
		var self = this;
		var wasPlaying = false;
		if (!this.popcorn.paused()){
			wasPlaying = true;
			this.popcorn.pause();
		}
		

		TINY.box.show({
			html: nodeData,
			boxid: 'popcorn-modal-' + options.nid,
			mask: 'blackmask',
			fixed: false,
			animate: false,
			top: 20,
			opacity: 80,
			width: '930',
			closejs: function(){
				if (wasPlaying){
					self.popcorn.play();
				}},
			openjs: function(){
					jQuery.getJSON('/popcorn/' + options.nid + '/kernels', attachHandlers);
				}
		});
		
		function attachHandlers(kernelData, textStatus, jqXHR){
			for (var i = 0; i < kernelData.data.length; i++){
				self.shelfState.catchKernelData(kernelData.data[i], 'popcorn-modal-');
			}
		}

		window.scrollTo(0, 0);
	};

	Controller.prototype.loadVideo = function(vidData){
		if (document.getElementsByClassName('tbox').length){
			TINY.box.hide();
		}
		this.history.saveHistory();

		//make the video autoplay once it loads
		this.popcorn.media.autoplay = true;

		//remove existing Track Events
		var kernels = this.popcorn.getTrackEvents();
		for (var i = 0; i < kernels.length; i++){
			this.popcorn.removeTrackEvent(kernels[i]._id);
		}

		//remove existing media sources
		while (this.popcorn.media.hasChildNodes()) {
			this.popcorn.media.removeChild(this.popcorn.media.lastChild);
		}
		//Add new media source
		var source;
		for (var i = 0; i < vidData.videos.length; i++){
			source = document.createElement('source');
			source.src = vidData.videos[i].src;
			source.type = vidData.videos[i].mime;
			this.popcorn.media.appendChild(source);

		}

		//load the new video
		this.popcorn.load();
		this.transitionVideo();
		this.vidControls.resetScrubber();

		//add the new track events in full.kernels
		this.vidControls.removeTriggers();
		for (var i = 0; i < vidData.kernels.length; i++){
			this.popcorn.drupal(vidData.kernels[i]);
			this.vidControls.addTrigger(vidData.kernels[i]);
		}

		this.vidControls.updatePlayButton();
	};

	Controller.prototype.transitionVideo = function(){

		window.scrollTo(0, 0);

		var wrapper = document.getElementById('player-wrapper');
		var vidWrapper = document.getElementById('main-player-wrapper');

		vidWrapper.style.position = 'absolute';
		vidWrapper.style.top = '405px';
		vidWrapper.style.left = '0';

		var videoInt = setInterval(function(){
			var increment = 25;
			var top = parseInt(vidWrapper.style.top.replace('px', ''), 10);
			if (top == 0){
				clearInterval(videoInt);
			}
			else{
				var newTop = ((top - increment) >= 0) ? (top - increment) : 0;
				vidWrapper.style.top = newTop + "px";
			}
		}, 25);

	}

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
		for (var i = 0; i < this.controller.popcorn.media.children.length; i++){
			history.videoUrls[i] = this.controller.popcorn.media.children[i].cloneNode(false);
		}

		history.kernels = [];
		var kernels = this.controller.popcorn.getTrackEvents();
		for (var i = 0; i < kernels.length; i++){
			history.kernels[i] = {nid: kernels[i].nid, start: kernels[i].start, end: kernels[i].end, type: kernels[i].type, dest: kernels[i].dest, subject: kernels[i].subject};
		}

		history.currentTime = this.controller.popcorn.currentTime();

		history.paused = this.controller.popcorn.paused();

		history.canvas = document.createElement('canvas');
		history.canvas.height = 382;
		history.canvas.width = 680;
		history.canvas.className = "history-node";
		history.canvas.getContext("2d").drawImage(this.controller.popcorn.media, 0, 0, history.canvas.width, history.canvas.height);

		this.historyList.push(history);

		this.updateHistory();
	};

	HistoryManager.prototype.updateHistory = function(){
		this.resetHistory();
		var len = this.historyList.length;
		var historyNode;
		var self = this;
		for (var i = 0; i < len; i++){
			historyNode = this.historyList[i].canvas;
			var j = i;
			historyNode.addEventListener('click', function(event){
				event.preventDefault();
				self.controller.catchHistory(j);
			});

			this.historyDisplay.appendChild(historyNode);
		}
	};

	HistoryManager.prototype.resetHistory = function(){
		while (this.historyDisplay.hasChildNodes()){
			this.historyDisplay.removeChild(this.historyDisplay.firstChild);
		}
	};



	function VideoControls(canvas, controller){

		this.controller = controller;
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
		
		this.init();
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
			var startPos = (current.start / this.controller.popcorn.duration()) * this.scrubber.width - 15;

			var image;
			if (this.controller.popcorn.currentTime() >= current.start){
				image = document.getElementById(current.type + '-trigger-icon');
			}
			else{
				image = document.getElementById(current.type + '-trigger-icon-dim');
			}

			this.ctx.drawImage(image, startPos, 25);

		}
	};



	VideoControls.prototype.init = function(){

		this.mouseDown = false;

		this.initScrubber();
		this.initPlayButton();
		this.initVolumeButton();


		//draw the main scrubber area background
		this.ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
		this.ctx.fillRect(0, 0, this.scrubber.width, this.scrubber.height);
	}

	VideoControls.prototype.initVolumeButton = function(){
		//register event listeners
		var self = this;
		this.controller.popcorn.listen('volumechange', function(){
			self.updateVolumeButton();
		});
		document.getElementById('volume-button').addEventListener('click', function(){
			if (document.getElementById('volume-button').className == "player-button muted"){
				self.controller.popcorn.unmute();
			}
			else{
				self.controller.popcorn.mute();
			}
		}, false);
	};

	VideoControls.prototype.updateVolumeButton = function(){
		if (this.controller.popcorn.muted()){
			document.getElementById('volume-button').className = "player-button muted";
		}
		else{
			document.getElementById('volume-button').className = "player-button";
		}
	};

	VideoControls.prototype.initPlayButton = function(){
		//register event listeners
		var self = this;
		this.controller.popcorn.listen('pause', function(){
			self.updatePlayButton();
		});
		this.controller.popcorn.listen('play', function(){
			self.updatePlayButton();
		});
		this.controller.popcorn.listen('ended', function(){
			self.controller.popcorn.pause();
		});
		document.addEventListener('keypress', function(event){
			event.preventDefault();
			//pause when the space bar is pressed 
			if (event.charCode == 32){
				togglePlay();
			}
		});
		document.getElementById('play-button').addEventListener('click', togglePlay, false);
		this.updatePlayButton();
		
		function togglePlay(){
			if (self.controller.popcorn.paused() || self.controller.popcorn.ended()){
				self.controller.popcorn.play();
			}
			else{
				self.controller.popcorn.pause();
			}
		}
	};

	VideoControls.prototype.updatePlayButton = function(){
		if (this.controller.popcorn.paused()){
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
		this.controller.popcorn.listen('progress', function(){
			self.updateScrubber();
		});
		this.controller.popcorn.listen('timeupdate', function(){
			self.updateScrubber();
		});
		this.scrubber.addEventListener('mousedown', function(event){
			self.scrubberClick(event);
		}, false);
		this.scrubber.addEventListener('mousemove', function(event){
			self.scrubberHover(event, this);
		}, false);
		document.addEventListener('mouseup', function(event){
			self.mouseDown = false;
		}, false);

		//remove default background color
		this.scrubber.style.backgroundColor = 'transparent';
	};

	VideoControls.prototype.resetScrubber = function(){

		this.scrubber.height = this.scrubber.height;
		this.scrubber.width = this.scrubber.width;

		//draw the main scrubber area background
		this.ctx.fillStyle = "rgba(25, 42, 53, 0.9)";
		this.ctx.fillRect(0, 0, this.scrubber.width, this.scrubber.height);

	};

	VideoControls.prototype.updateScrubber = function(){

		if (this.controller.popcorn.buffered().length > 0){

			//calculate buffered
			var percentBuffered = this.controller.popcorn.buffered().end(0) / this.controller.popcorn.duration();
			//calculate played
			var percentPlayed = (this.controller.popcorn.currentTime() / this.controller.popcorn.duration()) * this.scrubber.width;
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
			this.controller.popcorn.currentTime(((coords.offsetX) / this.scrubber.width) * this.controller.popcorn.duration());
			this.mouseDown = true;
		}

		//click is on a trigger icon
		for (var index in this.triggers){

			var current = this.triggers[index];
			var startPos = (current.start / this.controller.popcorn.duration()) * this.scrubber.width - 15;

			if ((coords.offsetX < (startPos + 30) && coords.offsetX > startPos)
					&& (coords.offsetY < 50 && coords.offsetY > 25)){
				this.controller.popcorn.currentTime(current.start);
			}

		}
	}

	VideoControls.prototype.scrubberHover = function(event, target){
		var coords = this.getCoords(event);

		if (this.mouseDown){
			this.controller.popcorn.currentTime(((coords.offsetX) / this.scrubber.width) * this.controller.popcorn.duration());
		}

		target.style.cursor = "auto";

		//hover is in the scrubber area
		if(coords.offsetY < 70 && coords.offsetY > 50){
			target.style.cursor = "pointer";
		}


		for (var index in this.triggers){

			var current = this.triggers[index];
			var startPos = (current.start / this.controller.popcorn.duration()) * this.scrubber.width - 15;

			if ((coords.offsetX < (startPos + 30) && coords.offsetX > startPos)
					&& (coords.offsetY < 50 && coords.offsetY > 25)){
				target.style.cursor = "pointer";
			}

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

		var canoffset = jQuery(event.target).offset();
		x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
		y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

		return {offsetX: x, offsetY: y};
	};




	function ShelfController(state, controller){
		var self = this;

		this.controller = controller;
		this.shelfState = state;

		this.initControls();

		this.controller.popcorn.listen('kernelData', function(data){
			self.catchKernelData(data, "popcorn-node-");
		});
		this.controller.popcorn.listen('kernelPop', function(data){
			self.catchKernelPop(data);
		});
		this.controller.popcorn.listen('kernelDestroy', function(options){
			var groupNode = document.getElementById(self.shelfState + "-" + options[self.shelfState].replace(" ", "-"));
			if (groupNode && groupNode.childNodes && groupNode.childNodes.length == 1){
				groupNode.parentNode.removeChild(groupNode);
			}
		});

	}

	ShelfController.prototype.catchKernelData = function(options, nodePrefix){
		var self = this;
		//attach click handlers to the anchor tags
		var kernel = document.getElementById(nodePrefix + options.nid);
		var anchor,
		previewAnchors = kernel.getElementsByClassName("popcorn-preview");
		for (var i = 0; i < previewAnchors.length; i++){
			anchor = previewAnchors.item(i);
			anchor.addEventListener('click', togglePreview, false);
		}

		var actionAnchors = kernel.getElementsByClassName("popcorn-action");
		for (var i = 0; i < actionAnchors.length; i++){
			anchor = actionAnchors.item(i);
			anchor.addEventListener('click', catchKernel, false);
		}

		function catchKernel(event){
			event.preventDefault();

			//ajax call to load video urls and track data
			jQuery.getJSON("/popcorn/" + options.nid + "/full", function(response, textStatus, jqXHR){

				var full = response.data;

				if (typeof full == "object"){
					self.controller.loadVideo(full);
				}
				else{
					self.controller.loadModal(full, options);
				}
			});
		}

		function togglePreview(event){
			event.preventDefault();

			var node = document.getElementById(nodePrefix + options.nid);

			var inPreview = false;
			var classList = node.className.split(" ");
			var newClassName = [];
			for (var i = 0; i < classList.length; i++){
				if (classList[i] == "preview"){
					inPreview = true;
				}
				else{
					newClassName.push(classList[i]);
				}
			}
			if (!inPreview){
				newClassName.push("preview");
			}
			node.className = newClassName.join(" ");
		}
	};

	ShelfController.prototype.catchKernelPop = function(options){
		//move kernels to the shelf if the destination is full
		var destination = document.getElementById(options.dest);
		while (destination.childNodes.length > 2){
			var moveNode = destination.lastChild;
			var target = this.getGroupContainer(moveNode.className, this.shelfState);
			target.appendChild(destination.lastChild);
		}

	};

	ShelfController.prototype.getGroupContainer = function(classes, type){
		var i, target, targetId,
		list = classes.split(" "),
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

			//add group heading
			var heading = document.createElement('h2');
			var re = new RegExp("^" + type + "-");
			heading.innerHTML = targetId.replace(re, '').replace('-', ' ');
			heading.className = 'popcorn-' + type + '-heading';
			target.appendChild(heading);

			document.getElementById('kettle').appendChild(target);
		}

		return target;

	};

	ShelfController.prototype.initControls = function(){

		var self = this;

		var shelfControls = document.getElementById("shelf-controls").getElementsByTagName("a");
		for (var i = 0; i< shelfControls.length; i++){
			shelfControls[i].addEventListener('click', function(event){

				event.preventDefault();

				if (this.id != "by-" + self.shelfState){

					var otherControl = document.getElementById("by-" + self.shelfState);
					otherControl.className = "";
					this.className = "current-control";

					var newState = (self.shelfState == "subject") ? "type" : "subject";

					var subject, 
					subjects = document.getElementsByClassName("popcorn-" + self.shelfState);

					while (subjects.length){
						var target, kernel
						subject = subjects.item(0),
						kernels = subject.getElementsByClassName("popcorn-node");
						while (kernels.length){
							kernel = kernels.item(0);
							target = self.getGroupContainer(kernel.className, newState);
							target.appendChild(kernel);
						}
						subject.parentNode.removeChild(subject);
					}

					self.shelfState = newState;

				}
			}, false);
		}
	};

})(jQuery);