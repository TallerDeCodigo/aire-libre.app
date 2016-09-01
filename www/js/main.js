   /*     _                        _     _           _   
	*    / \   _ __  _ __     ___ | |__ (_) ___  ___| |_ 
	*   / _ \ | '_ \| '_ \   / _ \| '_ \| |/ _ \/ __| __|
	*  / ___ \| |_) | |_) | | (_) | |_) | |  __/ (__| |_ 
	* /_/   \_\ .__/| .__/   \___/|_.__// |\___|\___|\__|
	*         |_|   |_|               |__/               
	*/

	var app = {
		app_context: this,
			// Application Constructor
		initialize: function() {
			window.firstTime = true;
			window.playing 	 = false;
			this.bindEvents();
			/* Initialize API request handler */
			window.apiRH = new requestHandlerAPI().construct(app);

			/* IMPORTANT to set requests to be syncronous */
			/* TODO test all requests without the following code 'cause of deprecation */
			$.ajaxSetup({
				 async: false
			});
			window.loggedIn = false;
			app.registerCompiledPartials();
			app.registerHelpers();
			/* localStorage init */
			this.ls 		= window.localStorage;
			var log_info 	= JSON.parse(this.ls.getItem('airelibre_log_info'));
			var me_info 	= JSON.parse(this.ls.getItem('me'));
							window.user 		= (log_info) ? log_info.user_login 	: '';
							window.user_display = (me_info)  ? me_info.first_name+' '+me_info.last_name : window.user;
							window.user_first 	= (me_info)  ? me_info.first_name 	: window.user;
							window.user_id 		= (log_info) ? log_info.user_id 	: '';
							window.user_role 	= (log_info) ? log_info.user_role 	: '';
			if(log_info)
				loggedIn = true;

			/* Check if has any token */
			if(apiRH.has_token()){
				/* Check if has a valid token */
				var response = apiRH.has_valid_token();
				if(response){
					var data_id = $(this).data('id');
					console.log('You okay, now you can start making calls');
					/* Take the user to it's timeline */
					var is_home = window.is_home;
					if(window.is_login)
						window.location.assign('home.html');
					return;
				}else{
					/* Token is not valid, user needs to authenticate */
					console.log("Your token is not valid anymore (or has not been validated yet)");
					return;
				}
			}

			/* Requesting passive token if no token is previously stored */
			console.log("Token::: "+apiRH.request_token().get_request_token());
		},
		registerCompiledPartials: function() {
			console.log("Register pre compiled partials");
			/* Add files to be loaded here */
			var filenames = ['header', 'nowplaying', 'loader', 'sidemenu'];
			
			filenames.forEach(function (filename) {
					Handlebars.registerPartial(filename, Handlebars.templates[filename]);
			});
		},
		registerTemplate : function(name) {
			$.ajax({
				url : 'views/' + name + '.hbs',
				success : function(response) {
						if (Handlebars.templates === undefined)
							Handlebars.templates = {};
					Handlebars.templates[name] = Handlebars.compile(response);
				}
			});
			return;
		},
		registerHelpers : function() {
			Handlebars.registerHelper('if_eq', function(a, b, opts) {
				if (a == b) {
					return opts.fn(this);
				} else {
					return opts.inverse(this);
				}
			});
			Handlebars.registerHelper('if_module', function(a, b, opts) {
				if (a%b == 0) {
					return opts.fn(this);
				} else {
					return opts.inverse(this);
				}
			});
			Handlebars.registerHelper("inc", function(value, options) {
			    return parseInt(value) + 1;
			});
			return;
		},
		bindEvents: function() {
			document.addEventListener('deviceready', app.onDeviceReady, false);
			document.addEventListener('mobileinit', app.onDMobileInit, false);
		},
		onBackButton: function(){
			// if(navigator.app){
			// 	console.log('Back button navigator');
			// 	navigator.app.backHistory();
			// 	return;
			// }
			// window.history.back();
			var userAgent = navigator.userAgent || navigator.vendor || window.opera;
		    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
		        // IOS DEVICE
		        history.go(-1);
		    } else if (userAgent.match(/Android/i)) {
		        // ANDROID DEVICE
		        navigator.app.backHistory();
		    } else {
		        // EVERY OTHER DEVICE
		        history.go(-1);
		    }
		},

		// deviceready Event Handler
		onDeviceReady: function() {
			app.receivedEvent('deviceready');
			/*   ___    _         _   _     
			*  / _ \  / \  _   _| |_| |__  
			* | | | |/ _ \| | | | __| '_ \ 
			* | |_| / ___ \ |_| | |_| | | |
			*  \___/_/   \_\__,_|\__|_| |_|
			*/                              
			try{
				OAuth.initialize('JjzKpzscqxZEKNapUXCX_1ZtmfM');
				console.log("Initialized Oauth");
			}
			catch(err){
				app.toast("Oauth error ocurred");
				console.log('OAuth initialize error: ' + err);
			}
			var backButtonElement = document.getElementById("backBtn");
			if(backButtonElement)
				backButtonElement.addEventListener("click", app.onBackButton, false);
			return;
		},

		// deviceready Event Handler
		onMobileInit: function() {
			app.receivedEvent('mobileinit');
			console.log("mobileinit");
		},
		// Update DOM on a Received Event
		receivedEvent: function(id) {
			if(id == 'deviceready' && typeof navigator.splashscreen != 'undefined'){
				navigator.splashscreen.hide();
			}
		},
		getJsonCatalogue: function(catalogue_name) {
			var response = $.getJSON('compiled/catalogues/'+catalogue_name+'.json');
			return JSON.parse(response.responseText);
		},
		gatherEnvironment: function(optional_data, history_title) {
			/* Gather environment information */
			var meInfo 	= apiRH.ls.getItem('me');
			var logged 	= apiRH.ls.getItem('me.logged');
			var parsed 	= {me: JSON.parse(meInfo), logged_user: JSON.parse(logged)};
			
			if(optional_data){
				parsed['data'] = optional_data;
				//return parsed;
			}
			if(history_title)
				parsed['header_title'] = history_title;
			return parsed;

		},
		getUrlVars: function() {
			var vars = {};
			var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
				vars[key] = value;
			});
			return vars;
		},
		/* Returns the values in a form as an associative array */
		/* IMPORTANT: Does NOT include password type fields */
		getFormData: function (selector) {
			return $(selector).serializeJSON();
		},
		isObjEmpty: function (obj) {

				if (obj == null) return true;
				if (obj.length > 0)    return false;
				if (obj.length === 0)  return true;

				for (var key in obj) 
					if (hasOwnProperty.call(obj, key)) return false;
				return true;
		},
		render_login : function(){
			app.showLoader();
			console.log("login man");
			
			app.registerTemplate('login');
			var data = app.gatherEnvironment(null, "Login");
			console.log(data);

			setTimeout(function(){
				var template = Handlebars.templates["login"];
				$('.container').html( template(data) );
				app.hideLoader();
				initializeEvents();
			}, 2000);
			// if(!loggedIn)
			// 		window.location.assign('login.html');
			
		},
		render_home : function(){
			if(!loggedIn)
					window.location.assign('login.html');

			/*** First time loading home ***/
			if(window.firstTime){
				app.registerTemplate('container');
				var container_template = Handlebars.templates['container'];
				var html 	 = container_template();
				$('.container').html( html );
			}

			app.registerTemplate('home');

			$.getJSON(api_base_url+'feed/home/' , function(response){
			})
			 .fail(function(err){
				console.log(JSON.stringify(err));
				app.hideLoader();
				app.toast("Failed connecting to our servers, please check your Internet connection.")
			})
			 .done(function(response){
				var data = app.gatherEnvironment(response, "Inicio");
					data.home_active = true;
					data.playing = true;
					data.radio 	 = response.radio;
					console.log(data);
				var home_tpl = Handlebars.templates['home'];

				$('.view').fadeOut('fast', function(){

					$('.view').html( home_tpl(data) ).css("opacity", 1)
													 .css("display", "block")
													 .css("margin-left", "20px")
													 .animate({
														'margin-left': "0",
														opacity: 1
													}, 240);
					app.showLoader();
					if(window.firstTime){
						app.showPlayerLoader();
						audioLibrary.registerRadio(response.radio);
					}
				});

				setTimeout(function(){
					if(window.firstTime){
						//audioLibrary.playRadio();
						window.firstTime = false;
						window.playing = false;
					}
					
					app.hideLoader();
					initializeEvents();
				}, 2000);
			});
			
		},
		render_archive : function(kind){

			app.showLoader();
			app.registerTemplate('archive');
			$.getJSON(api_base_url+'feed/'+kind+'/' , function(response){
			})
			 .fail(function(err){
				console.log(JSON.stringify(err));
				app.hideLoader();
				app.toast("Failed connecting to our servers, please check your Internet connection.")
			})
			 .done(function(response){
			 	console.log(response);
			 	var title = ( kind == "podcast") ? "PODCAST" : null;
			 		title = (!title && kind == "recent") ? "LO ÚLTIMO" : title;
			 		title = (!title && kind == "columna") ? "ARTÍCULOS" : title;
			 		title = (!title ) ? "ARCHIVO" : title;

				var data = app.gatherEnvironment(response, title);
					data.home_active = true;

				var feed_tpl = Handlebars.templates['archive'];
				$('.view').fadeOut('fast', function(){
					$('body').scrollTop(0);
					$('.view').html( feed_tpl(data) ).css("opacity", 1)
													 .css("display", "block")
													 .css("margin-left", "20px")
													 .animate({
														'margin-left': "0",
														opacity: 1
													}, 240);
				});
				setTimeout(function(){	
					app.hideLoader();
					initializeEvents();
				}, 2000);
			});
			
		},
		render_authors : function(){
			
			app.showLoader();
			app.registerTemplate('authors');
			$.getJSON(api_base_url+'alphabet/terms/autor/' , function(response){
			})
			 .fail(function(err){
				console.log(JSON.stringify(err));
				app.hideLoader();
				app.toast("Failed connecting to our servers, please check your Internet connection.")
			})
			 .done(function(response){
			 	
				var data = app.gatherEnvironment(response, "Autores");
					data.home_active = true;
				console.log(data);
				var feed_tpl = Handlebars.templates['authors'];
				$('.view').fadeOut('fast', function(){
					$('body').scrollTop(0);
					$('.view').html( feed_tpl(data) ).css("opacity", 1)
													 .css("display", "block")
													 .css("margin-left", "20px")
													 .animate({
														'margin-left': "0",
														opacity: 1
													}, 240);
				});
				setTimeout(function(){	
					app.hideLoader();
					initializeEvents();
				}, 2000);
			});
			
		},
		render_search_results : function(search_term){
			app.showLoader();
			app.registerTemplate('archive');
			$.getJSON(api_base_url+'content/search/'+search_term)
			 .done(function(response){
				var data 	 = app.gatherEnvironment(response, '\"'+search_term+'\"');
					data.search_active = true;
					data.search_term = search_term;
				var template = Handlebars.templates['archive'];
				$('.view').fadeOut('fast', function(){
					$('body').scrollTop(0);
					$('.view').html( template(data) ).css("opacity", 1)
													 .css("display", "block")
													 .css("margin-left", "40px")
													 .animate({
														'margin-left': "0",
														opacity: 1
													}, 240);
				});
				setTimeout(function(){
					app.hideLoader();
					initializeEvents();
				}, 2000);
			})
			 .fail(function(error){
				console.log(error);
			 });
		},
		render_column : function(column_id){
			app.showLoader();
			app.registerTemplate('column');
			$.getJSON(api_base_url+'columns/'+column_id)
			 .done(function(response){
				var data = app.gatherEnvironment(response, "Leyendo");
				console.log(data);
				var template = Handlebars.templates['column'];
				$('.view').fadeOut('fast', function(){
					$('body').scrollTop(0);
					$('.view').html( template(data) ).css("opacity", 1)
													 .css("display", "block")
													 .css("margin-left", "20px")
													 .animate({
														'margin-left': "0",
														opacity: 1
													}, 240);
				});
				setTimeout(function(){

					app.hideLoader();
					initializeEvents();
				}, 2000);
			})
			 .fail(function(error){
				console.log(error);
			 });
		},
		render_podcast : function(podcast_id){
			app.showLoader();
			app.registerTemplate('podcast');
			/* Send header_title for it renders history_header */
			$.getJSON(api_base_url+'podcasts/'+podcast_id)
			 .done(function(response){
				var data = app.gatherEnvironment(response, "Podcasts");
				console.log(data);
				var template = Handlebars.templates['podcast'];
				$('.view').fadeOut('fast', function(){
					$('body').scrollTop(0);
					$('.view').html( template(data) ).css("opacity", 1)
													 .css("display", "block")
													 .css("margin-left", "20px")
													 .animate({
														'margin-left': "0",
														opacity: 1
													}, 240);
				});
				setTimeout(function(){
					app.hideLoader();
					initializeEvents();
				}, 2000);
			})
			 .fail(function(error){
				console.log(error);
			 });
		},
		render_create_user : function(){

			/* Send header_title for it renders history_header */
			var data = app.gatherEnvironment(null, "Create account");
			var template = Handlebars.templates['create_account'];

			$('.main').html( template(data) );
			setTimeout(function(){
				app.hideLoader();
			}, 2000);
		},
		render_taxonomy : function(term_id, tax_name, targetSelector, templateName ){
			app.showLoader();
			app.registerTemplate(templateName);
			$.getJSON(api_base_url+'content/taxonomy/'+tax_name+'/'+term_id)
			 .done(function(response){
			 	console.log(response);
				/* Send header_title for it renders history_header */
				var data = app.gatherEnvironment(response, response.name);
				console.log(data);
				var template = Handlebars.templates[templateName];
				$(targetSelector).fadeOut('fast', function(){
					$('body').scrollTop(0);
					$(targetSelector).html( template(data) ).css("opacity", 1)
													 .css("display", "block")
													 .css("margin-left", "20px")
													 .animate({
														'margin-left': "0",
														opacity: 1
													}, 240);
				});
				setTimeout(function(){
					app.hideLoader();
					initializeEvents();
				}, 2000);
			})
			  .fail(function(err){
				console.log(err);
			});
		},
		changeStatusPlayer: function(new_status){
			if(new_status == "paused"){
				$('#player').find('.controls.playing').addClass('hidden');	
				$('#player').find('.controls.paused').removeClass('hidden');
				return;	
			}
			$('#player').find('.controls.paused').addClass('hidden');	
			$('#player').find('.controls.playing').removeClass('hidden');
			return;
		},
		get_file_from_device: function(destination, source){
			apiRH.getFileFromDevice(destination, source);		
		},
		showPlayerLoader: function(){
			$('#player_spinner').show();
		},
		hidePlayerLoader: function(){
			$('#player_spinner').hide();
		},
		showLoader: function(){
			$('#spinner').show();
		},
		hideLoader: function(){
			$('#spinner').hide();
		},
		toast: function(message, bottom){
			try{
				if(!bottom){
					window.plugins.toast.showLongCenter(message);
				}else{
					window.plugins.toast.showLongBottom(message);
				}
			}
			catch(err){
				console.log('Toasting error: ' + JSON.stringify(err));
				alert(message);
			}
			return;
		}
	};