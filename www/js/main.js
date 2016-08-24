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
			var log_info 	= JSON.parse(this.ls.getItem('dedalo_log_info'));
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
						window.location.assign('feed.html?filter_feed=all');
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
			var filenames = ['header', 'history_header', 'history_header_nouser', 'search_header', 'feed_chunk', 'sidemenu', 'sidemenu_logged', 'footer', 'subheader', 'dom_assets'];
			
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
				OAuth.initialize('VWadBFs2rbk8esrvqSEFCyHGKnc');
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
		render_search_composite : function(){
			user = (user) ? user : "not_logged";
			$.getJSON(api_base_url+user+'/content/search-composite/')
			 .done(function(response){
				console.log(JSON.stringify(response));
				response.search_active =  true;
				var data 	 = app.gatherEnvironment(response);
					data.search_active = true;
				var template = Handlebars.templates['search'];
				$('.main').html( template(data) );
			})
			 .fail(function(error){
				console.log(JSON.stringify(error));
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
		initMakersMap : function(){

			var map;
			var mapOptions = {
				zoom: 15,
				disableDefaultUI: true,
				zoomControl: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
			setTimeout(function(){
				if(!loggedIn){
					$(".wrapper").show();
					setTimeout(function() {$("#user").animate({"right":"0%"}, 300)}, 10);
				}
			}, 2000);
			map = new google.maps.Map(document.getElementById('map'), mapOptions);
			navigator.geolocation.getCurrentPosition(function(position) {

				
				var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				var printer = [];
				var scanner = [];
				var witship = [];
				user_first = (user_first) ? user_first : "Guest";
				var infowindow = new google.maps.InfoWindow({
					map: map,
					position: geolocate,
					content: '<div class="geoloc_me"><h3>'+user_first+'</h3></div>',
					buttons: { close: { visible: false } }
				});

				var allBtn = document.getElementById("allBtn");
				var printBtn = document.getElementById("printBtn");
				var scanBtn = document.getElementById("scanBtn");
				var shipBtn = document.getElementById("shipBtn");

				google.maps.event.addDomListener(printBtn, "click", function(){ app.onlyprint(position, map) });
				google.maps.event.addDomListener(scanBtn, "click", function(){ app.onlyscan(position, map) });
				google.maps.event.addDomListener(shipBtn, "click", function(){ app.onlyship(position, map)});
				// google.maps.event.addDomListener(allBtn, "click", function(){ app.showall(position, map)});

				map.setCenter(geolocate);

				app.hideLoader();
			});  
		
		},
		initPrinterMap : function(file_carried){

			var map;
			var mapOptions = {
				zoom: 15,
				disableDefaultUI: true,
				zoomControl: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			var file_carried = (file_carried) ? file_carried : null;
			
			map = new google.maps.Map(document.getElementById('map'), mapOptions);
			navigator.geolocation.getCurrentPosition(function(position) {
				var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				var printer = [];

				var infowindow = new google.maps.InfoWindow({
					map: map,
					position: geolocate,
					content: '<div class="geoloc_me"><h3>'+user_first+'</h3></div>',
					buttons: { close: { visible: false } }
				});
				app.onlyprint(position, map, file_carried);
				map.setCenter(geolocate);
				app.hideLoader();
			});  
		
		}, 
		onlyprint: function(position, map, file_carried) {
			app.showLoader();
			var theResponse = null;
			var image = 'images/marker.png';
			var printer = [];
			if(app.marker2.length)
				for(var j = 0; j<app.marker2.length; j++){
					app.marker2[j].setMap(null);
				}
			if(app.marker3.length)
				for(var k = 0; k<app.marker3.length; k++){
					app.marker3[k].setMap(null);
				}

			$.getJSON(api_base_url+'around/'+user+'/makers/printer'+'?@='+position.coords.latitude+','+position.coords.longitude , function(response){
			})
			 .fail(function(err){
				app.hideLoader();
				if(!loggedIn){
					$(".wrapper").show();
					setTimeout(function() {$("#user").animate({"right":"0%"}, 300)}, 10);
					app.toast("Please log in to locate printers and makers around you.");
				}else{
					app.toast("Couldn't locate printers around you, please check your GPS settings and try again.");
				}
			})
			 .done(function(response){	
				theResponse = response;
				var i;		 	
				for(i = 0; i<response.count-1; i++){
					printer.push(new google.maps.LatLng(response.pool[i].latitude, response.pool[i].longitude));
					app.marker1.push(new google.maps.Marker({ position: printer[i], map: map, icon: image }));
					app.marker1[i].ref_id = parseInt(theResponse.pool[i].ID);
					app.marker1[i].distance_to = theResponse.pool[i].distance;
					app.marker1[i].addListener('click', 
												function() {
													app.showLoader();
													var context = this;
													$.getJSON(api_base_url+'min/'+user+'/maker/'+context.ref_id)
													 .done(function(response){
														var data = {profile: response.profile, ref_id: file_carried, distance: context.distance_to};
														var template = (file_carried) 
																			? Handlebars.templates['maker_map_select'] 
																			: Handlebars.templates['maker_map'];
														data.file_reference = (file_carried) ? file_carried : null;
														$('#insert_info').html( template(data) );
														$("#info-maker").fadeIn();
														app.hideLoader();
													})
													 .fail(function(error){
														app.toast("Oops! couldn't get maker details");
														app.hideLoader();
													 });
												});
					app.marker1[i].setVisible(true);
				}

				setTimeout(function(){
					app.hideLoader();
				}, 2000);
				$("#info-maker").hide();
			});
		}, 
		onlyscan: function(position, map) {
			app.showLoader();
			var image = 'images/marker.png';
			var theResponse = null;
			var scanner = [];
			if(app.marker1.length)
				for(var j = 0; j<app.marker1.length; j++){
					app.marker1[j].setMap(null);
				}
			if(app.marker3.length)
				for(var k = 0; k<app.marker3.length; k++){
					app.marker3[k].setMap(null);
				}
			$.getJSON(api_base_url+'around/'+user+'/makers/scanner'+'?@='+position.coords.latitude+','+position.coords.longitude , function(response){
			})
			 .fail(function(err){
				console.log(JSON.stringify(err));
				app.hideLoader();
				app.toast("Couldn't locate scanners around you, please check your GPS settings and try again.")
			})
			 .done(function(response){
				theResponse = response;
				var i;					
				for( i = 0; i<response.count-1; i++){
					scanner.push(new google.maps.LatLng(response.pool[i].latitude, 
														response.pool[i].longitude));
					app.marker2[i].ref_id = parseInt(theResponse.pool[i].ID);
					app.marker2[i].distance_to = theResponse.pool[i].distance;
					app.marker2.push(new google.maps.Marker({ position: scanner[i], map: map, icon: image }));
					app.marker2[i].addListener('click', 
												function() { 
													app.showLoader();
													var context = this;
													$.getJSON(api_base_url+'min/'+user+'/maker/'+context.ref_id)
													 .done(function(response){
														var data = {profile: response.profile, distance: context.distance_to};
														var template = Handlebars.templates['maker_map'];
														$('#insert_info').html( template(data) );
														$("#info-maker").fadeIn();
														app.hideLoader();
													})
													 .fail(function(error){
														app.toast("Oops! couldn't get maker details");
														app.hideLoader();
													 });
												});
					app.marker2[i].setVisible(true);
				}
				setTimeout(function(){
					app.hideLoader();
				}, 2000);
				$("#info-maker").hide();
			});
		},
		onlyship: function(position, map) {
			app.showLoader();
			app.registerTemplate('partials/maker_map');
			var theResponse = null;
			var image = 'images/marker.png';
			var witship = [];
			if(app.marker1.length)
				for(var j = 0; j<app.marker1.length; j++){
					app.marker1[j].setMap(null);
				}
			if(app.marker2.length)
				for(var k = 0; k<app.marker2.length; k++){
					app.marker2[k].setMap(null);
				}

			$.getJSON(api_base_url+'around/'+user+'/makers/shipping'+'?@='+position.coords.latitude+','+position.coords.longitude , function(response){
			})
			 .fail(function(err){
				app.hideLoader();
				app.toast("Couldn't locate printers around you, please check your GPS settings and try again.");
			})
			 .done(function(response){	
				theResponse = response;
				var i;		 	
				for(i = 0; i<response.count-1; i++){
					witship.push(new google.maps.LatLng(response.pool[i].latitude, response.pool[i].longitude));
					app.marker3.push(new google.maps.Marker({ position: witship[i], map: map, icon: image }));
					app.marker3[i].ref_id = parseInt(theResponse.pool[i].ID);
					app.marker3[i].distance_to = theResponse.pool[i].distance;
					app.marker3[i].addListener('click', 
												function() {
													app.showLoader();
													var context = this;
													$.getJSON(api_base_url+'min/'+user+'/maker/'+context.ref_id)
													 .done(function(response){
														var data = {profile: response.profile, distance: context.distance_to};
														var template = Handlebars.templates['maker_map'];
														$('#insert_info').html( template(data) );
														$("#info-maker").fadeIn();
														app.hideLoader();
													})
													 .fail(function(error){
														app.toast("Oops! couldn't get maker details");
														app.hideLoader();
													 });
												});
					app.marker3[i].setVisible(true);
				}

				setTimeout(function(){
					app.hideLoader();
				}, 2000);
				$("#info-maker").hide();
			});
		}, 
		showall: function() {
			for (var i = 0; i < marker1.length; i++) { marker1[i].setVisible(true) }
			for (var i = 0; i < marker2.length; i++) { marker2[i].setVisible(true) }
			for (var i = 0; i < marker3.length; i++) { marker3[i].setVisible(true) }
			$("#info-maker").hide();
		},
		render_map : function(){
			
			var data = {explore_active: true};
			var map_template = Handlebars.templates['map'];
			$('.main').html( map_template(data) );
			app.showLoader();
			app.initMakersMap();
		},
		render_file_map : function(ref_id){
			/** Render map when printing a file **/
			var reference = ref_id;
			var data = app.gatherEnvironment(null, "Select a printer")
			data['explore_active'] =  true;

			var template = Handlebars.templates['file_map'];
			$('.main').html( template(data) );
			app.showLoader();
			app.initPrinterMap(reference);
		},
		render_detail : function(product_id){

			$.getJSON(api_base_url+'products/'+product_id)
			 .done(function(response){
				var data = app.gatherEnvironment(response, "Printables");

				var template = Handlebars.templates['detail'];
				$('.main').html( template(data) );
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
		render_notifications : function(){
			/* Send header_title for it renders history_header */
			var data = app.gatherEnvironment(null, "Notifications");
			data.notifications_active = true;

			var template = Handlebars.templates['notifications'];
			$('.main').html( template(data) );
			setTimeout(function(){
				app.hideLoader();
			}, 2000);
		},
		render_dashboard : function(){
			$.getJSON(api_base_url+user+'/dashboard/')
			 .done(function(response){
				/* Send header_title for it renders history_header */
				var data = app.gatherEnvironment(response, "Dashboard");
				var template = Handlebars.templates['dashboard'];
				$('.main').html( template(data) );
				setTimeout(function(){
					app.hideLoader();
				}, 2000);
			})
			  .fail(function(err){
				console.log(JSON.stringify(err));
			});
		},
		render_maker : function(maker_id){
			$.getJSON(api_base_url+user+'/maker/'+maker_id)
			 .done(function(response){
				/* Send header_title for it renders history_header */
				var data = app.gatherEnvironment(response, "Maker profile");

				var template = Handlebars.templates['maker'];
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
		render_direct_photo : function(){
			//app.registerTemplate('direct_photo');
			var data = app.gatherEnvironment(null, "Advanced search");
			var template = Handlebars.templates['direct_photo'];

			$('.main').html( template(data) );
			setTimeout(function(){
				app.hideLoader();
			}, 2000);

		},
		render_select_printer : function(ref_id, printer_id){
			/*** Make purchase action ***/
			var response = apiRH.makeRequest(user+'/purchase/'+ref_id, {printer_id: printer_id});
			if(response){
				// $context.addClass('read');
				var data = app.gatherEnvironment(null, "Printing in progress...");

				var template = Handlebars.templates['select_printer'];
				$('.main').html( template(data) );
				setTimeout(function(){
					app.hideLoader();
				}, 2000);
				return;
			}
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
					app.ls.removeItem('dedalo_log_info');
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