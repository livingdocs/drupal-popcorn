

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
					}
				}
			};
			xmlhttp.open("GET", "/popcorn/" + nid + "/kernels", true);
			xmlhttp.send();
		}

		loadKernels(nid);

		this.skipTime = NaN;
		this.popcorn.listen('loadeddata', function(){
			self.processQueuedTasks();
			if (!isNaN(self.skipTime)){
				this.currentTime(self.skipTime);
				self.skipTime = NaN;
			}
		});
	}
	
	Controller.prototype.processQueuedTasks = function(){
		this.vidControls.drawQueuedTriggers();
	};

	Controller.prototype.catchHistory = function(index){
		var vidData = this.history.loadHistory(index);

		//remove existing Track Events
		var kernels = this.popcorn.getTrackEvents();
		for (var i = 0; i < kernels.length; i++){
			this.popcorn.removeTrackEvent(kernels[i]._id);
		}

        //clear the kettle
        var kettle = document.getElementById("kettle");
        while (kettle.hasChildNodes()){
            kettle.removeChild(kettle.lastChild);
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

		//add the new track events from the vidData
		this.vidControls.removeTriggers();
		for (var i = 0; i < vidData.kernels.length; i++){
			this.popcorn.drupal(vidData.kernels[i]);
			this.vidControls.addTrigger({
				id: vidData.kernels[i].id, 
				nid: vidData.kernels[i].nid, 
				start: vidData.kernels[i].start, 
				end: vidData.kernels[i].end, 
				subject: vidData.kernels[i].subject, 
				type: vidData.kernels[i].type
			});
		}

		//advance the video to the previous timestamp
		this.skipTime = vidData.currentTime;

		this.vidControls.updatePlayButton();
        this.loading = false;
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
                                }
            },
            openjs: function(){
                    jQuery.getJSON('/popcorn/' + options.nid + '/kernels', attachHandlers);
            }
		});
		
		function attachHandlers(kernelData, textStatus, jqXHR){
			for (var i = 0; i < kernelData.data.length; i++){
				self.shelfState.catchKernelData(kernelData.data[i], 'popcorn-modal-');
			}

			if (typeof kernelData.data.js !== "undefined"){
				//jQuery.getScript("//maps.google.com/maps?file=api&amp;v=2&amp;key=AIzaSyAVkTFPWaejdP6soprnHjxxG1C8h7SOtJk");
				jQuery.getScript(kernelData.data.js);
			}
		}

		window.scrollTo(0, 0);
            this.loading = false;
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

        //clear the kettle
        var self = this;
        var kettle = document.getElementById("kettle");
        while (kettle.hasChildNodes()){
            kettle.removeChild(kettle.lastChild);
        }
        //add return to main video control
        var returnLink = document.createElement('a');
        returnLink.href='#';
        returnLink.addEventListener('click', function(event){
            event.preventDefault();
            if (self.loading){
                return;
            }
            self.loading = true;
            self.catchHistory(0);
        });
        returnLink.appendChild(document.createTextNode('Return to main video'));
        var returnWrap = document.createElement('div');
        returnWrap.className = 'popcorn-return';
        returnWrap.appendChild(returnLink);
        kettle.appendChild(returnWrap);

		//remove existing media sources
		while (this.popcorn.media.hasChildNodes()) {
			this.popcorn.media.removeChild(this.popcorn.media.lastChild);
		}
		//Add new media sources
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
			this.vidControls.addTrigger({
				id: vidData.kernels[i].id, 
				nid: vidData.kernels[i].nid, 
				start: vidData.kernels[i].start, 
				end: vidData.kernels[i].end, 
				subject: vidData.kernels[i].subject, 
				type: vidData.kernels[i].type
			});
		}

		this.vidControls.updatePlayButton();
        this.loading = false;
	};

	Controller.prototype.transitionVideo = function(){

		//window.scrollTo(0, 0);

		var vidWrapper = document.getElementById('main-player-wrapper');
        
        vidWrapper.className = "transition";

		var videoInt = setInterval(function(){
            clearInterval(videoInt);
            document.getElementById('main-player-wrapper').className = "";
		}, 1);
	};
	
	

	function HistoryManager(controller){

		this.controller = controller;
		this.historyList = [];
		this.historyDisplay = document.getElementById('player-history');

	};

	HistoryManager.prototype.loadHistory = function(pos){
		var selected = this.historyList[pos];
        var current = document.getElementById("history-node-" + pos);

        var historyNodes = document.getElementsByClassName("history-node");
        for (var i = this.historyList.length - 1; i >= pos; i--){
            current.parentNode.removeChild(document.getElementById("history-node-" + i));
        }
        
		this.historyList = this.historyList.slice(0, pos);
        document.getElementById('player-wrapper').style.marginTop = (this.historyList.length * 15) + 'px';
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

        var pos = this.historyList.length;
		history.canvas = document.createElement('canvas');
		history.canvas.height = 405;
		history.canvas.width = 720;
		history.canvas.className = "history-node transition";
		history.canvas.top = 0;
		history.canvas.id = "history-node-" + pos;
		history.canvas.getContext("2d").drawImage(this.controller.popcorn.media, 0, 0, history.canvas.width, history.canvas.height);

		this.historyList.push(history);

        var self = this;
        var wrapper = document.getElementById('player-wrapper')
        history.canvas.addEventListener('click', function(event){
            event.preventDefault();
            if (self.controller.loading){
                return;
            }
            self.controller.loading = true;
            self.controller.catchHistory(pos);
        });

        wrapper.insertBefore(history.canvas, wrapper.firstChild);
        //wrapper.style.marginTop = (15 * this.historyList.length) + 'px';

        (function(id, len){
            var videoInt = setInterval(function(){
                clearInterval(videoInt);
                document.getElementById(id).className = "history-node";
                document.getElementById('player-wrapper').style.marginTop = len + 'px';
            }, 1);
        })(history.canvas.id, 15 * this.historyList.length);


	};




	function VideoControls(canvas, controller){

		this.controller = controller;
		this.triggers = [];

		this.scrubber = document.getElementById(canvas);

		this.playButton = document.getElementById('play-button');

		this.scrubberHeight = 2;
		this.scrubberStartPos = 0;
		
		this.init();
	};

	VideoControls.prototype.addTrigger = function(data){
		this.triggers[data.start] = data;
		this.drawTrigger(data);
	};

	VideoControls.prototype.removeTriggers = function(){
		this.triggers = [];
		var triggerZone = document.getElementById('trigger-zone');
		while (triggerZone.hasChildNodes()) {
			triggerZone.removeChild(triggerZone.lastChild);
		}
	};

	VideoControls.prototype.drawQueuedTriggers = function(){
		for(var i in this.triggers){
			this.drawTrigger(this.triggers[i]);
		}
	};

	VideoControls.prototype.drawTrigger = function(trigger){
		var self = this;
		var iconRadius = 8;

		if (this.controller.popcorn.duration()){
	
			var startPos = (trigger.start / this.controller.popcorn.duration()) * document.getElementById('trigger-zone').offsetWidth - iconRadius;
	
			var button = document.createElement("button");
			button.className = trigger.type + "-trigger-icon trigger-icon trigger-icon-" + trigger.nid;
			button.style.left = startPos + "px";
			button.type = "button";
			button.addEventListener("click", function(){
				self.controller.popcorn.currentTime(trigger.start);
			});
	
			document.getElementById("trigger-zone").appendChild(button);
		}

	};

	VideoControls.prototype.updateTriggers = function(){
		for (var index in this.triggers){
			var current = this.triggers[index];
			var nodes = document.getElementsByClassName("trigger-icon-" + current.nid);
			if (current.start <= this.controller.popcorn.currentTime()){
				for (var j = 0; j < nodes.length; j++){
					if (nodes[j].className.indexOf("active") == -1){
						nodes[j].className += " active";
					}
				}
			}
			else{
				for (var j = 0; j < nodes.length; j++){
					if (nodes[j].className.indexOf("active")){
						var classList = nodes[j].className.split(" ");
						var newClassName = [];
						for (var k = 0; k < classList.length; k++){
							if (classList[k] != "active"){
								newClassName.push(classList[k]);
							}
						}
						nodes[j].className = newClassName.join(" ");
					}
				}
			}
		}
	};



	VideoControls.prototype.init = function(){
		var self = this;

		this.scrubberCanDrag = false;
		this.volumeCanDrag = false;

		this.initScrubber();
		this.initPlayButton();
		this.initVolumeButton();
		this.updateVolume(this.controller.popcorn);
		
		document.addEventListener('mouseup', function(event){
			self.scrubberCanDrag = false;
			self.volumeCanDrag = false;
		}, false);
	};

	VideoControls.prototype.initVolumeButton = function(){
		//register event listeners
		var self = this;
		this.controller.popcorn.listen('volumechange', function(){
			self.updateVolume(this);
		});
        var volumeControl = document.getElementById('volume-wrapper')
        volumeControl.addEventListener('mousemove', function(event){
			self.volumeDrag(event, this);
		}, false);
		volumeControl.addEventListener('mousedown', function(event){
			self.volumeDown(event, this);
		}, false);
		document.getElementById('volume-button').addEventListener('click', function(event){
			self.volumeClick(event, this);
		}, false);
		document.getElementById('volume-button').addEventListener('mouseover', function(event){
                volumeControl.className = "visible";
		}, false);
		document.getElementById('volume-button').addEventListener('mouseout', function(event){
                volumeControl.className = "";
		}, false);
	};

	VideoControls.prototype.volumeDrag = function(event, target){
            //the mousemove is only a drag event if this.volumeCanDrag is true
            if (this.volumeCanDrag){
                    //left click only
                    if (event.button == 0){
                            var coords = this.getCoords(event, target);
                            var vol = Math.log(1 - (coords.offsetY / target.offsetHeight)) / Math.log(10) + 1;
                            //var vol = Math.pow(coords.offsetX / target.offsetWidth, 1 / 2);
                            if (vol <= 0){
                                    this.controller.popcorn.mute();
                            }
                            else{
                                    this.controller.popcorn.unmute();
                                    this.controller.popcorn.volume(vol);
                            }
                    }
            }
	};
	
    VideoControls.prototype.volumeClick = function (event, target){
            if (event.button == 0){
                    if (document.getElementById('volume-button').className == " muted"){
                            this.controller.popcorn.unmute();
                    }
                    else{
                            this.controller.popcorn.mute();
                    }
            }

    };
	
	VideoControls.prototype.volumeDown = function (event, target){
			//left click only
            if (event.button == 0){
                    this.volumeCanDrag = true;
                    var coords = this.getCoords(event, target);
                    var vol = Math.log(1 - (coords.offsetY / target.offsetHeight)) / Math.log(10) + 1;
                    if (vol <= 0){
                            this.controller.popcorn.mute();
                    }
                    else{
                            this.controller.popcorn.unmute();
                            this.controller.popcorn.volume(vol);
                    }
            }
	};
			
	VideoControls.prototype.updateVolume = function(popcorn){
		var volume = document.getElementById('volume-level');
		if (popcorn.muted()){
			document.getElementById('volume-button').className = " muted";
			volume.style.top = "100%";
		}
		else{
			document.getElementById('volume-button').className = "";
			volume.style.top = (1 - Math.pow(10, popcorn.volume() - 1)) * 100 + "%";
			//volume.style.height = Math.pow(popcorn.volume(), 2) * 100 + "%";
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
            //do nothing if in modal view
            //if (!document.getElementsByClassName('tbox').length){
                //pause when the space bar is pressed 
                if (event.charCode == 32){
                    togglePlay();
                }
            //}
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
			document.getElementById('play-button').className = " paused";
		}
		else{
			document.getElementById('play-button').className = "";
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
			self.updateTriggers();
		});
		document.getElementById('scrubb').addEventListener('mousedown', function (event){
			self.scrubberDown(event, this);
		}, false);
		document.getElementById('scrubb').addEventListener('mousemove', function(event){
			self.scrubberDrag(event, this);
		}, false);
	};

	VideoControls.prototype.updateScrubber = function(){

		if (this.controller.popcorn.buffered().length > 0){

			//calculate buffered
			var percentBuffered = (this.controller.popcorn.buffered().end(0) / this.controller.popcorn.duration()) * 100;
			//calculate played
			var percentPlayed = (this.controller.popcorn.currentTime() / this.controller.popcorn.duration()) * 100;
			//draw the updated scrubber
			document.getElementById('buffered').style.width = percentBuffered + "%";
			document.getElementById('played').style.width = percentPlayed + "%";
		}

	};

	VideoControls.prototype.resetScrubber = function(){
		document.getElementById('buffered').style.width = 0;
		document.getElementById('played').style.width = 0;
	};

	VideoControls.prototype.scrubberDown = function(event, target){
		//left click only
		if (event.button == 0){
			var coords = this.getCoords(event, target);
			this.controller.popcorn.currentTime(((coords.offsetX) / target.offsetWidth) * this.controller.popcorn.duration());
			this.scrubberCanDrag = true;
		}
	};

	VideoControls.prototype.scrubberDrag = function(event, target){
		//left click only
		if (event.button == 0){
			//the mousemove is only a drag event if this.scrubberCanDrag is true
			if (this.scrubberCanDrag){
				var coords = this.getCoords(event, target);
				this.controller.popcorn.currentTime(((coords.offsetX) / target.offsetWidth) * this.controller.popcorn.duration());
			}
		}


	};

	//required to determine the relative coordinates of a click event
	VideoControls.prototype.getCoords = function(event, target){
		var totalOffsetX = 0;
	    var totalOffsetY = 0;
	    var canvasX = 0;
	    var canvasY = 0;
	    var currentElement = target;

	    do{
	        totalOffsetX += currentElement.offsetLeft;
	        totalOffsetY += currentElement.offsetTop;
	    }
	    while(currentElement = currentElement.offsetParent)

	    canvasX = event.pageX - totalOffsetX;
	    canvasY = event.pageY - totalOffsetY;

	    return {offsetX: canvasX, offsetY: canvasY};
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

	};

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

		var closeButtons = kernel.getElementsByClassName("close-kernel");
		for (var i = 0; i < closeButtons.length; i++){
			button = closeButtons.item(i);
			button.addEventListener('click', togglePreview, false);
		}

		var actionAnchors = kernel.getElementsByClassName("popcorn-action");
		for (var i = 0; i < actionAnchors.length; i++){
			anchor = actionAnchors.item(i);
			anchor.addEventListener('click', togglePreview, false);
		}

		function catchKernel(event){
			event.preventDefault();
            if (self.controller.loading){
                    return;
            }
            self.controller.loading = true;

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
			else if (this.className.indexOf("popcorn-preview") !== -1 || this.className.indexOf("popcorn-action") !== -1){
				catchKernel(event);
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
