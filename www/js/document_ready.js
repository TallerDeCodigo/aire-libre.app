	/*      _                                       _                        _       
	 *   __| | ___   ___ _   _ _ __ ___   ___ _ __ | |_   _ __ ___  __ _  __| |_   _ 
	 *  / _` |/ _ \ / __| | | | '_ ` _ \ / _ \ '_ \| __| | '__/ _ \/ _` |/ _` | | | |
	 * | (_| | (_) | (__| |_| | | | | | |  __/ | | | |_  | | |  __/ (_| | (_| | |_| |
	 *  \__,_|\___/ \___|\__,_|_| |_| |_|\___|_| |_|\__| |_|  \___|\__,_|\__,_|\__, |
	 *                                                                         |___/ 
	 */
		
window.initializeEvents = function(){
	jQuery(document).ready(function($) {
			console.log("init events");
			/* Create a new account the old fashioned way */
			if($('#register_form').length)
				$('#register_form').validate({
					rules: {
						user_login_reg: "required",
						user_email_reg: {
								required: true,
								email: true
							},
						user_country: "required",
						i_accept_terms : "required"
					},
					messages: {
						user_login_reg: "Debes proporcionar un username",
						user_email_reg: {
								required: "Debes proporcionar un email",
								email: "Por favor proporciona un email válido"
							},
						user_country: "Por favor selecciona tu país",
						i_accept_terms: "Debes aceptar los términos y condiciones para continuar"
					},
					submitHandler: function(e){
						var data_login  	= app.getFormData('#register_form');
						data_login.user_password_reg = $('#user_password_reg').val();
						var responsedata 	= apiRH.registerNative(data_login);
						if(responsedata) {
							apiRH.save_user_data_clientside(responsedata);
							window.location.assign('feed.html?filter_feed=all');
							return;
						}
						app.toast('Lo sentimos, el nombre de usuario ya existe.');
						e.preventDefault();
					}
				});

			/* Log In with a regular ol' account */
			$('#login_form').submit(function(e){
				app.showLoader();
				e.preventDefault();
				var data_login      = app.getFormData('#login_form');
				var responsedata    = apiRH.loginNative(data_login);
				if(responsedata) {
					console.log(responsedata);
					apiRH.save_user_data_clientside(responsedata);
					window.location.assign('home.html');
					return;
				}
				app.toast('Tu email o contraseña no son válidos.');
			});

			/** Login with events **/
			$(document).on('click', '.login_button', function(){
				var provider = $(this).data('provider');
				console.log(provider);
				if(provider == 'facebook')
					apiRH.loginOauth(provider, apiRH.loginCallbackFB);
				if(provider == 'google')
					apiRH.loginOauth(provider, apiRH.loginCallbackGP);
			});

			/* Log Out from the API */
			$('#logout').on('click', function(e){
				/* Requesting logout from server */
				var response = apiRH.logOut({user_login : user, request_token : apiRH.get_request_token() });
				if(response.success){
					app.toast('Session ended, see you soon!');
						app.ls.removeItem('airelibre_log_info');
						app.ls.removeItem('request_token');
						app.ls.removeItem('me.logged');
						app.ls.removeItem('me');
					window.location.assign('feed.html');
					return;
				}
				app.toast('Ocurrió un problema al intentar cerrar tu sesión');
				return;
			});

			/* Hook soft links */
			$('.hook').on('click', function(e){

				if( $(this).hasClass("recent") )
					return app.render_archive("recent");
				if( $(this).hasClass("radio") )
					return audioLibrary.playRadio();
				if( $(this).hasClass("podcast") )
					return app.render_archive("podcast");
				if( $(this).hasClass("columna") )
					return app.render_archive("columna");
				if( $(this).hasClass("home") )
					return app.render_home();
				if( $(this).hasClass("authors") )
					return app.render_authors();
				if( $(this).hasClass("author") )
					return app.render_taxonomy( $(this).data("id"), 'autor', '.view', 'archive' );

				// Single
				if( $(this).hasClass("single-column") )
					return app.render_column($(this).data('id'));
				if( $(this).hasClass("single-podcast") )
					return app.render_podcast($(this).data('id'));
			});

			$('#trigger_search').click(function(){
				if(!$(this).hasClass("open")){
					$(this).addClass("open");
					$("#search_form input").animate({
														width: "74vw"
													})
											.addClass('open')
											.focus();
					return;
				}
				$(this).removeClass("open");
				$("#search_form input").animate({
													width: "0",
													padding: "0"
												})
										.removeClass('open');
				return;
			});

			// $(document).on('click', function(e){
			// 	console.log($(e.target));
			// 	if( ($(e.target).hasClass('search_form') || $(e.target).parent('search_form'))
			// 		&& $('#trigger_search').hasClass('open') ){
			// 		console.log("close it");
			// 		$('#trigger_search').removeClass('open')
			// 		$("#search_form input").animate({
			// 										width: "0",
			// 										padding: "0"
			// 									})
			// 							.removeClass('open');
			// 		e.stopPropagation();
			// 	}
			// });

			$('#search_form').on("submit", function(e){
				e.preventDefault();
				e.stopPropagation();
				var data = app.getFormData($(this));
				return app.render_search_results(data.search);
			});


			$(window).on("load resize",function(){

				var ancho = document.documentElement.clientWidth;
				$(".slide-item").css("width",ancho*0.86);
				$(".slide-item").css("height",ancho*0.86);
				$(".slide-item:first-of-type").css("margin-left",ancho*0.075);
				$(".wrap-slide").css("height",ancho*0.87);
				$(".slider").css("width",ancho*4.6);

			    var IMG_WIDTH = ancho*0.86;
				var currentImg = 0;
				var maxImages = $('.slider .slide-item').length;
				var speed = 500;

				var imgs;

				var swipeOptions = { triggerOnTouchEnd: true, swipeStatus: swipeStatus, allowPageScroll: "vertical", threshold: 75 };

				$(function createSwipe () {
				    imgs = $(".slider");
				    imgs.swipe(swipeOptions);
				});

				function swipeStatus(event, phase, direction, distance) {
				    if (phase == "move" && (direction == "left" || direction == "right")) {
				        var duration = 0;

				        if (direction == "left") {
				            scrollImages((IMG_WIDTH * currentImg) + distance, duration);
				            
				        } else if (direction == "right") {
				            scrollImages((IMG_WIDTH * currentImg) - distance, duration);
				        }

				    } else if (phase == "cancel") {
				        scrollImages(IMG_WIDTH * currentImg, speed);
				    } else if (phase == "end") {
				        if (direction == "right") {
				            previousImage();
				        } else if (direction == "left") {
				            nextImage();
				        }
				    }
				}

				function previousImage() {
				    currentImg = Math.max(currentImg - 1, 0);
				    scrollImages(IMG_WIDTH * currentImg, speed);
				    cualva = currentImg+1;
				    $(".slide-item img").css("height","92%");
				    $(".slide-item:nth-of-type("+cualva+") img").css("height","100%");
				    $(".slide-item img").css("width","auto");
				}

				function nextImage() {
				    currentImg = Math.min(currentImg + 1, maxImages - 1);
				    scrollImages(IMG_WIDTH * currentImg, speed);
				    cualva = currentImg+1;
				    $(".slide-item img").css("height","90%");
				    $(".slide-item:nth-of-type("+cualva+") img").css("height","100%");
				    $(".slide-item img").css("width","auto");
				}

				function scrollImages(distance, duration) {
				    imgs.css("transition-duration", (duration / 1000).toFixed(1) + "s");
				    var value = (distance < 0 ? "" : "-") + Math.abs(distance).toString();
				    imgs.css("transform", "translate(" + value + "px,0)");
				}
				    
			});


			$("a.menu").click(function(){
				$(".overscreen").show();
				setTimeout(function() {$(".overscreen").addClass('active');}, 100);
			});

			$("div.fitted").click(function(){
				$(".overscreen").removeClass('active');
				setTimeout(function() {$(".overscreen").hide();}, 600);
			});

			$('.episodio').on('click', function(){
				$('.episodio .playing').addClass("hidden");
				if($(this).find('.playing').hasClass('hidden'))
					$(this).find('.playing').removeClass("hidden").css("display", "inline-block");
				console.log('here, gonna play podcast');
				audioLibrary.loadNewAudio($(this).data('stream'));
				audioLibrary.playSong();
				$('#insert_artist').text($(this).data('authors'));
				$('.showname').text($(this).data('show')+" : "+$(this).data('episode'));
			});

			$('#pause_player').on('click', function(){
				console.log('clicked pause');
				app.changeStatusPlayer("paused");
				audioLibrary.pauseSong();
			});

			$('#resume_player').on('click', function(){
				console.log('clicked play');
				app.changeStatusPlayer("playing");
				audioLibrary.playSong();
			});

			$('.column_page').fitVids();
		
		

	});

}

	document.addEventListener("radio-started", function(e) {
		console.log("Event");
		console.log(e.detail);
		audioLibrary.setGeneralTimer(audioLibrary.radioPlaylist[0].start);
	  	audioLibrary.mySetTimeout();
	  	// TODO: Replace with dynamic name every time
		$('.showname').text('Aire Libre Radio');
		$('#insert_title').text('Holocene');
		$('#insert_artist').text('Bon Iver');
		$('#insert_album').text('');
	}, false);

	document.addEventListener("radio-loaded", function(e) {
		console.log("Event radio loaded");
	  	// TODO: Replace with dynamic name every time
		$('.showname').text('Aire Libre Radio');
		$('#insert_title').text('Holocene');
		$('#insert_artist').text('Bon Iver');
		$('#insert_album').text('');
		app.hidePlayerLoader();
	}, false);

	document.addEventListener("song-played", function(e) {
		console.log(e.detail);
	});


	document.addEventListener("stream-queued", function(e) {
		console.log(e.detail);
	});