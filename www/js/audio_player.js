/*** Audio library js module ***/

window.audioLibrary = {
};

audioLibrary.audioBuffer 	= null;
audioLibrary.playlist 		= [];
audioLibrary.radioPlaylist 	= [];
audioLibrary.radioFile 		= null;
audioLibrary.playlistPointer= null;

audioLibrary.audioElement = document.createElement('audio');


// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

audioLibrary.playSong = function(buffer) {
	console.log("Play song");
	audioLibrary.audioElement.play();
	app.hidePlayerLoader();
	app.changeStatusPlayer("playing");
	var event = new CustomEvent("song-played", { "detail": "Song playback has started" });
	document.dispatchEvent(event);
}

audioLibrary.pauseSong = function(buffer) {
	console.log("Pause song");
	audioLibrary.audioElement.pause();
	app.changeStatusPlayer("paused");
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
	console.log("Play radio");
	var eventradio = new CustomEvent("radio-started", { "detail": "Radio playback has started" });
	document.dispatchEvent(eventradio);
	console.log("Event????");
	audioLibrary.loadNewAudio(this.radioFile.stream);
	audioLibrary.audioElement.play();
	audioLibrary.radioPlaylist = this.radioFile.meta;
	app.changeStatusPlayer("playing");
	app.hidePlayerLoader();
}

audioLibrary.registerRadio = function(url) {
	this.radioFile = (this.radioFile) ? url : url;
}

audioLibrary.playNextSong = function(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

audioLibrary.loadNewAudio =  function(url) {
	console.log("Loading new audio");
	audioLibrary.audioElement.setAttribute('src', url);
	var event = new CustomEvent("stream-queued", { "detail": "New file queued for stream" });
	document.dispatchEvent(event);
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
