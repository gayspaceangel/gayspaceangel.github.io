var routineStep = 0;
var currentRoutine = null;
var beepAudio = null;

function loadBeep() {
	if (beepAudio === null) {
		beepAudio = new Howl({
			autoplay: false,
			loop: false,
			urls: [ 'pop.wav', 'pop.mp3' ]
		});
	}
}

function beep() {
	if (beepAudio !== null) {
		beepAudio.play();
	}
}

var interval = null;
var timerVal = 0;
var timerCount = 0;
var playBeep = false;
var flashScreen = false;
var paused = false;
var stepVal = 0;
var routines = {};
var isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
var $progressBar = null;

function reset() {
	if (interval !== null) {
//		clearInterval(interval);
		clearTimeout(interval);
		interval = null;
	}
	timerVal = 0;
	$progressBar.val(0).slider("refresh");
	$('#start-button-container').show();
	$('#kegel-progress-container').hide();
}

function getNextStep() {
	if (currentRoutine === null) {
		return null;
	}
	if (routineStep >= currentRoutine.length) {
		return null;
	}
	return currentRoutine[routineStep++];
}

function intervalFunction() {
	if (timerVal > timerCount) {
		$progressBar.val(timerCount).slider("refresh");
//		clearInterval(interval);
		clearTimeout(interval);
		interval = null;
		var nextStep = getNextStep();
		if (nextStep === null) {
			$('#timermessage').text('All done!');
			setTimeout(reset, 1000);
		}
		else {
			if (playBeep) {
				beep();
			}               
			if (flashScreen) {
				var $currentPage = $( ':mobile-pagecontainer' ).pagecontainer( 'getActivePage' );
				$currentPage.css('background-color', '#38c');
				setTimeout(function() { $currentPage.css('background-color', ''); }, 100);
			}
			if (vibrate) {
				navigator.vibrate(100);
			}                   
			runStep(nextStep);
		}
	}
	else {
		interval = setTimeout(intervalFunction, stepVal)
		$progressBar.val(timerVal).slider("refresh");
		timerVal += stepVal;
	}
}

function runStep(step) {
	if (interval !== null) {
		clearTimeout(interval);
		//clearInterval(interval);
		interval = null;
	}
	$('#timermessage').text(step.text);

	stepVal = 50;
	if (isDevice) {
		stepVal = 100;
	}
	timerVal = stepVal;

	//timerCount += stepVal;
	timerCount = step.duration * 1000;
	$progressBar.attr('max', timerCount).val(0).slider("refresh");
	
	interval = setTimeout(intervalFunction, stepVal);	
}

$(function() {
	if (isDevice) {
		navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
		if (navigator.vibrate) {
			$('#vibrate-checkbox').prop('disabled', false).show().checkboxradio( "enable" );
			$('#vibrate-checkbox-label').show();
		}
	}

	$('#optionsFieldset').find('input[type="checkbox"]').filter(':enabled')
	.on('change', function(event) {
		localStorage[ $(this).attr('id') ] = $(this).prop('checked') ? 'true' : 'false';
	})
	.each(function() {
		var value = localStorage[ $(this).attr('id') ];
		if (value !== undefined && value !== null) {
			$(this).prop('checked', (value === true || value === 'true') ).checkboxradio('refresh');
		}		
	});

	var typeValue = localStorage['type'];
	if (typeValue === undefined || typeValue === null || typeValue === '') {
		typeValue = 'normal';
	}
	$('#typeFieldset').find('input[type="radio"]')
	.on('change', function(event) {
		localStorage['type'] = $(this).val();
	})
	.each(function() {
		$(this).prop('checked', (typeValue === $(this).val()) ).checkboxradio('refresh');				
	});

	if ($('#beep-checkbox').prop('checked')) {
		loadBeep();
	}
	else {
		$('#beep-checkbox').on('change', function() {
			if ($(this).prop('checked')) {
				loadBeep();
			}
		});
	}


	$( ":mobile-pagecontainer" ).on('pagecontainerbeforeshow', '#home-page', function() {
		reset();
	});

	$('<input/>').appendTo('#progressbarcontainer').attr({'name':'progressbar','id':'progressbar','data-highlight':'true','min':'0','max':'100','value':'0','type':'range'}).slider({
		create: function( event, ui ) {
			$(this).closest('.ui-slider').css('height', '3em')
			.find('input').hide().css('margin-left','-9999px') // Fix for some FF versions
			.end()
			.find('.ui-slider-track').css({'margin-top':'0', 'margin-bottom':'0', 'margin-left': '.3125em', 'margin-right':'.3125em', 'pointer-events': 'none', height: '2em', 'box-shadow': 'none', '-webkit-box-shadow': 'none', '-moz-box-shadow': 'none' }).removeClass('ui-shadow-inset').end()
			.find('.ui-slider-handle').remove();
		},
		start: function(event, ui) {
			event.preventDefault(); 
			event.stopImmediatePropagation();
			return false;
		},
		stop: function(event, ui) {
			event.preventDefault();
			event.stopImmediatePropagation();
			return false;
		}
	}).slider("refresh");

	$('#start-button').on('click', function(event) {
		event.preventDefault();
		
		routineStep = 0;
		paused = false;
		var typeValue = $('#typeFieldset').find('input[type="radio"]').filter(':checked').val();

		if (!(typeValue in routines) || routines[typeValue] === null) {
			if (typeValue === 'normal') {
				currentRoutine = [];
				for (var i = 0; i < 14 ; i++ ) {
					currentRoutine.push({ text: 'Hold', duration: 10 });
					currentRoutine.push({ text: 'Release', duration: 10 });
				}
				currentRoutine.push({ text: 'Hold', duration: 10 });
				currentRoutine.push({ text: 'Release', duration: 30 });
				for ( var i = 1 ; i <= 5 ; i++ ) {
					for (var j = 1; j <= 9; j++) {
						currentRoutine.push({ text: 'Hold', duration: 1 });
						currentRoutine.push({ text: 'Release', duration: 1 });
					}
					currentRoutine.push({ text: 'Hold', duration: 1 });
					if (i < 5) {
						currentRoutine.push({ text: 'Release', duration: 10 });
					}
				}
				routines[typeValue] = currentRoutine;
			}
			else if (typeValue === 'short') {
				currentRoutine = [];
				for (var i = 0; i < 6 ; i++ ) {
					currentRoutine.push({ text: 'Hold', duration: 10 });
					currentRoutine.push({ text: 'Release', duration: 10 });
				}
				currentRoutine.push({ text: 'Hold', duration: 10 });
				currentRoutine.push({ text: 'Release', duration: 30 });
				for ( var i = 1 ; i <= 3 ; i++ ) {
					for (var j = 1; j <= 9; j++) {
						currentRoutine.push({ text: 'Hold', duration: 1 });
						currentRoutine.push({ text: 'Release', duration: 1 });
					}
					currentRoutine.push({ text: 'Hold', duration: 1 });
					if (i < 3) {
						currentRoutine.push({ text: 'Release', duration: 10 });
					}
				}
				routines[typeValue] = currentRoutine;
			}
			else if (typeValue === 'advanced') {
				currentRoutine = [];
				for (var i = 0; i < 14 ; i++ ) {
					currentRoutine.push({ text: 'Hold', duration: 30 });
					currentRoutine.push({ text: 'Release', duration: 10 });
				}
				currentRoutine.push({ text: 'Hold', duration: 30 });
				currentRoutine.push({ text: 'Release', duration: 30 });
				for ( var i = 1 ; i <= 5 ; i++ ) {
					for (var j = 1; j <= 9; j++) {
						currentRoutine.push({ text: 'Hold', duration: 1 });
						currentRoutine.push({ text: 'Release', duration: 1 });
					}
					currentRoutine.push({ text: 'Hold', duration: 1 });
					if (i < 5) {
						currentRoutine.push({ text: 'Release', duration: 10 });
					}
				}
				routines[typeValue] = currentRoutine;
			}
			else {
				alert('invalid type value [' + typeValue + ']');
			}
		}
		else {
			currentRoutine = routines[typeValue];
		}

		step = getNextStep();
		if (step !== null) {
			$progressBar = $('#progressbar');
			$('#pause-button').val('Pause').button('refresh');
			$('#kegel-progress-container').show();
			$('#start-button-container').hide();

			playBeep = $('#beep-checkbox').prop('checked');
			if (playBeep) {
				loadBeep();
			}
			flashScreen = $('#flashes-checkbox').prop('checked');
			vibrate = isDevice && navigator.vibrate && $('#vibrate-checkbox').prop('checked');

			runStep(step);
		}
	});

	$('#pause-button').on('click', function(event) {
		if (paused) {
			jQuery(this).val('Pause').button('refresh');
			paused = false;
//			interval = setInterval(intervalFunction, stepVal); 
			interval = setTimeout(intervalFunction, stepVal); 
		}
		else {
			jQuery(this).val('Resume').button('refresh');
			paused = true;
			if (interval !== null) {
//				clearInterval(interval);
				clearTimeout(interval);
				interval = null;
			}
			event.preventDefault();
		}
	});
	$('#cancel-button').on('click', function(event) {
		event.preventDefault();
		reset();
	});

});
