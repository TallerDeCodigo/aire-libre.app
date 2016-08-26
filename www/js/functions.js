
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

$(window).load(function(){
	$(function() {

		$("a.menu").click(function(){
			$(".overscreen").show();
			setTimeout(function() {$(".overscreen").addClass('active');}, 100);
		});

		$("div.fitted").click(function(){
			$(".overscreen").removeClass('active');
			setTimeout(function() {$(".overscreen").hide();}, 600);
		});

	});

});

(function($){

	"use strict";

	$(function(){

		console.log('hello from functions.js');

		/**
		 * Validación de emails
		 */
		window.validateEmail = function (email) {
			var regExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return regExp.test(email);
		};

		/**
		 * Regresa todos los valores de un formulario como un associative array 
		 */
		window.getFormData = function (selector) {
			var result = [],
				data   = $(selector).serializeArray();

			$.map(data, function (attr) {
				result[attr.name] = attr.value;
			});
			return result;
		}

	});

})(jQuery);