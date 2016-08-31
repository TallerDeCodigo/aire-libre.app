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
	audioLibrary.audioElement.play();
	app.hidePlayerLoader();
	app.changeStatusPlayer("playing");
	var event = new CustomEvent("song-played", { "detail": "Song playback has started" });
	document.dispatchEvent(event);
}

audioLibrary.pauseSong = function(buffer) {
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
	audioLibrary.loadNewAudio(this.radioFile.stream);
	audioLibrary.audioElement.play();
	audioLibrary.radioPlaylist = this.radioFile.meta;
	app.changeStatusPlayer("playing");
	app.hidePlayerLoader();
	var event = new CustomEvent("radio-started", { "detail": "Radio playback has started" });
	document.dispatchEvent(event);
}

audioLibrary.registerRadio = function(url) {
	this.radioFile = (this.radioFile) ? url : url;
	console.log(this.radioFile);
}

audioLibrary.playNextSong = function(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

audioLibrary.loadNewAudio =  function(url) {
	audioLibrary.audioElement.setAttribute('src', url);
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
