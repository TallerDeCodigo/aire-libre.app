/*** Audio library js module ***/

window.audioLibrary = {
};

audioLibrary.audioBuffer 	= null;
audioLibrary.playlist 		= [];
audioLibrary.radioPlaylist 	= [];
audioLibrary.radioFile 		= null;
audioLibrary.playlistPointer= null;
audioLibrary.generalTimer 	= null;
audioLibrary.plPointer 		= 0;

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
	audioLibrary.loadNewAudio(this.radioFile.stream);
	audioLibrary.radioPlaylist = this.radioFile.meta;
	audioLibrary.audioElement.play();
	app.changeStatusPlayer("playing");
	app.hidePlayerLoader();
}

audioLibrary.registerRadio = function(url) {
	this.radioFile = (this.radioFile) ? url : url;
	var eventradio = new CustomEvent("radio-loaded", { "detail": "Radio playback has been loaded" });
	document.dispatchEvent(eventradio);
	audioLibrary.loadNewAudio(this.radioFile.stream);
	audioLibrary.radioPlaylist = this.radioFile.meta;
	app.changeStatusPlayer("paused");
	app.hidePlayerLoader();
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

audioLibrary.setGeneralTimer = function(myTimer){

	var timerArray = myTimer.split(":");
	var minutes = (timerArray[0]*60)*1000;
	var seconds = timerArray[1]*1000;
	this.generalTimer = minutes+seconds;
	this.plPointer++;
}

audioLibrary.mySetTimeout = function(){
      		
	setTimeout( function(){
		var context = radioPlaylist[plPointer-1];
  		$('.showname').empty().text(context.title);
    	$('.album').attr('src', context.cover);
    	$('.breadcrumbs').empty().text(context.artist);
    	var myTimer = radioPlaylist[plPointer].start;
    	this.setGeneralTimer(myTimer);
    	this.mySetTimeout();
  	}, this.generalTimer);
}


window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
