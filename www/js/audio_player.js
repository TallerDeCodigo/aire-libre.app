/*** Audio library js module ***/

window.audioLibrary = {
};

audioLibrary.audioBuffer 	= null;
audioLibrary.playlist 		= [];
audioLibrary.radioFile 		= null;


// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

audioLibrary.play = function() {
  	function playSound(buffer, time) {
		var source = context.createBufferSource();
		source.buffer = buffer;
		source.connect(context.destination);
		if (!source.start)
		  source.start = source.noteOn;
		source.start(time);
  	}
}

audioLibrary.playSong = function(buffer) {
	var event = new CustomEvent("song-played", { "detail": "Song playback has started" });
	document.dispatchEvent(event);
	var source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(context.destination);
	source.start(0);
}
audioLibrary.pauseSong = function(buffer) {
	var event = new CustomEvent("song-paused", { "detail": "Song playback has been paused" });
	document.dispatchEvent(event);
}

audioLibrary.initPlaylist = function(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

audioLibrary.playRadio = function() {
	audioLibrary.loadNewAudio(this.radioFile);
	
	var event = new CustomEvent("radio-started", { "detail": "Radio playback has started" });
	document.dispatchEvent(event);
}

audioLibrary.registerRadio = function(url) {
	this.radioFile = (this.radioFile) ? url : url;
	console.log(url);
	console.log(this.radioFile);
}

audioLibrary.playNextSong = function(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

audioLibrary.loadNewAudio =  function(url) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

  	// Decode asynchronously
  	request.onload = function() {
		context.decodeAudioData(request.response, function(buffer) {
		  audioBuffer = buffer;
		  audioLibrary.playSong(audioBuffer);
		}, function(err){
			console.log(err);
		});
  	}
  	request.send();
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
