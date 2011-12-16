
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