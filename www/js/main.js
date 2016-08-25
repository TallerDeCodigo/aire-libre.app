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
			/*** Initialize maps tools ***/
			this.marker1 = [];
			this.marker2 = [];
			this.marker3 = [];
			/* Check if has any token */
			if(apiRH.has_token()){
				/* Check if has a valid token */
				var response = apiRH.has_valid_token();
				if(response){
					var data_id = $(this).data('id');
					console.log('You okay, now you can start making calls');
					/* Take the user to it's timeline */
					var is_home = window.is_home;
					if(is_home)
						window.location.assign('home.html');
					return;
				}else{
					/* Token is not valid, user needs to authenticate */
					console.log("Your token is not valid anymore (or has not been validated yet)");
					return;
				}
			}

			/* Copiado de ondeviceready ----- QUITAR ----- */
			// var backButtonElement = document.getElementById("backBtn");
			// if(backButtonElement)
			// 	backButtonElement.addEventListener("click", app.onBackButton, false);
			
			/* Requesting passive token if no token is previously stored */
			console.log("Token::: "+apiRH.request_token().get_request_token());
		},
		registerCompiledPartials: function() {
			console.log("Register pre compiled partials");
			/* Add files to be loaded here */
			var filenames = ['header', 'nowplaying'];
			
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
			}, 2000);
			// if(!loggedIn)
			// 		window.location.assign('login.html');
			
		},
		render_home : function(){
			app.showLoader();
			// if(!loggedIn)
			// 		window.location.assign('login.html');

			app.registerTemplate('home');

			$.getJSON(api_base_url+'feed' , function(response){
			})
			 .fail(function(err){
				console.log(JSON.stringify(err));
				app.hideLoader();
				app.toast("Failed connecting to our servers, please check your Internet connection.")
			})
			 .done(function(response){
				var data = app.gatherEnvironment(response, "Inicio");
					data.home_active = true;
				var home_tpl = Handlebars.templates['home'];
				console.log(data);
				var html 	 = home_tpl(data);
				$('.container').html( html );
				setTimeout(function(){	
					app.hideLoader();
					if(!loggedIn)
						$('#account1').trigger('click');
				}, 2000);
			});
			
		},
		render_feed : function(offset, filter){
			app.showLoader();
			$.getJSON(api_base_url+'feed/'+offset+'/'+filter , function(response){
			})
			 .fail(function(err){
				console.log(JSON.stringify(err));
				app.hideLoader();
				app.toast("Failed connecting to our servers, please check your Internet connection.")
			})
			 .done(function(response){
				var data = app.gatherEnvironment(response);
					data.home_active = true;
				var feed_tpl = Handlebars.templates['feed'];
				console.log(data);
				var html 	 = feed_tpl(data);
				$('.main').html( html );
				setTimeout(function(){	
					app.hideLoader();
					if(!loggedIn)
						$('#account1').trigger('click');
				}, 2000);
			});
			
		},
		render_search_results : function(search_term){
			$.getJSON(api_base_url+'content/search/'+search_term)
			 .done(function(response){
				console.log(response);
				var data 	 = app.gatherEnvironment(response);
					data.search_active = true;
					data.search_term = search_term;
					console.log(data);
				var template = Handlebars.templates['search_results'];
				$('.main').html( template(data) );
			})
			 .fail(function(error){
				console.log(error);
			 });
		},
		render_column : function(column_id){
			app.registerTemplate('column');
			$.getJSON(api_base_url+'columns/'+column_id)
			 .done(function(response){
				var data = app.gatherEnvironment(response, "Leyendo");
				console.log(data);
				var template = Handlebars.templates['column'];
				$('.container').html( template(data) );
				setTimeout(function(){
					app.hideLoader();
				}, 2000);
			})
			 .fail(function(error){
				console.log(error);
			 });
		},
		render_post : function(post_id){

			/* Send header_title for it renders history_header */
			$.getJSON(api_base_url+'content/'+post_id)
			 .done(function(response){
				var data = app.gatherEnvironment(response, "Now reading");

				var template = Handlebars.templates['post'];
				$('.main').html( template(data) );
				setTimeout(function(){
					app.hideLoader();
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
		render_settings : function(){
			/* Send header_title for it renders history_header */
			$.getJSON(api_base_url+user+'/me/')
			 .done(function(response){
				var data = app.gatherEnvironment(response, "Account settings");
				console.log(data);
				/* Get printers and models from catalogue */
				data.printers = app.getJsonCatalogue("pModels");
				var parent_count = Object.keys(app.getJsonCatalogue("pModels")).length;
				var this_brand = null;
				data.printer_brands = [];
				data.printer_models = [];
				for(var i = 0; i < parent_count; i++){
					this_brand = Object.keys(data.printers)[i];
					data.printer_brands.push(this_brand);
					var level_count = data.printers[this_brand].length;
					data.printer_models[this_brand] =  [];
					for(var j = 0; j<level_count; j++ ){
						var this_model = data.printers[this_brand];
						data.printer_models[this_brand].push(this_model[j]);
					}
				}
				window.printers_global = data.printer_models;
				var template = Handlebars.templates['settings'];
				$('.main').html( template(data) );
				setTimeout(function(){
					app.hideLoader();
				}, 2000);
			})
			  .fail(function(err){
				console.log(err);
			});
		},
		render_taxonomy : function(term_id, tax_name, targetSelector, templateName ){
			$.getJSON(api_base_url+'content/taxonomy/'+tax_name+'/'+term_id)
			 .done(function(response){
			 	console.log(response);
				/* Send header_title for it renders history_header */
				var header_title = (tax_name == 'design-tools') ? 'Made with: '+response.name : response.name;
				var data = app.gatherEnvironment(response, header_title);

				var template = Handlebars.templates[templateName];
				$(targetSelector).html( template(data) );
				setTimeout(function(){
					app.hideLoader();
				}, 2000);
			})
			  .fail(function(err){
				console.log(err);
			});
		},
		get_file_from_device: function(destination, source){
			apiRH.getFileFromDevice(destination, source);		
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

/*      _                                       _                        _       
 *   __| | ___   ___ _   _ _ __ ___   ___ _ __ | |_   _ __ ___  __ _  __| |_   _ 
 *  / _` |/ _ \ / __| | | | '_ ` _ \ / _ \ '_ \| __| | '__/ _ \/ _` |/ _` | | | |
 * | (_| | (_) | (__| |_| | | | | | |  __/ | | | |_  | | |  __/ (_| | (_| | |_| |
 *  \__,_|\___/ \___|\__,_|_| |_| |_|\___|_| |_|\__| |_|  \___|\__,_|\__,_|\__, |
 *                                                                         |___/ 
 */
	jQuery(document).ready(function($) {

		// $('#search_by_photo').click(function(){
		// 	app.get_file_from_device('search', 'camera');
		// });

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


// ----------------------------------------------------------------------



		//MARK NOTIFICATION AS READ
		$('.main').on('tap', '.each_notification a', function(e){
			e.preventDefault();
			var redirect = $(this).attr('href');
			var $context = $(this);
			if($context.hasClass('read')) return false;
			var context_id = $context.data('id');
			
			var response = apiRH.makeRequest(user+'/notifications/read/'+context_id);
			if(response){
				$context.addClass('read');
			}
			window.location.assign(redirect);
			
		});


		/* Pagination Load more posts */
		$(document).on('tap', '#load_more_posts', function(e){
			e.preventDefault();
			var offset = $(this).data('page');
			app.get_user_timeline(offset);
			e.stopPropagation();
		});

		/* Pagination Load more search results */
		$(document).on('tap', '#load_more_results', function(e){
			e.preventDefault();
			var offset = $(this).data('page');
			var GET = app.getUrlVars();

			app.get_search_results(GET.searchbox, offset);
			e.stopPropagation();
		});


	});