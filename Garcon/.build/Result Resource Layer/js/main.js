var pinStart = {};

var resetPinBox = function() {
	$('#pin-box').animate({
		top: '60px',
		left: '60px'
	}, 200);
}

$(window).load(function(){
	//document.addEventListener('tizenhwkey', function(e) {
    //    if(e.keyName == "back")
    //        tizen.application.getCurrentApplication().exit();
    //});
	
	resetPinBox();
	
	$('#pin-box').on("touchstart", function(e){
		e.preventDefault();
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		pinStart.x = touch.pageX;
		pinStart.y = touch.pageY;
	});
	$('#pin-box').on("touchmove", function(e){
		e.preventDefault();
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		var x = touch.pageX - pinStart.x;
		var y = touch.pageY - pinStart.y;
		
		x = 3*x/5;
		y = 3*y/5;
		if(Math.abs(x) > Math.abs(y)) {
			$('#pin-box').css({
				top: '60px',
				left: (60+x)+'px'
			});
		} else {
			$('#pin-box').css({
				top: (60+y)+'px',
				left: '60px'
			});
		}
		
	});
	$('#pin-box').on("touchend", function(e){
		e.preventDefault();
		resetPinBox();
		pinStart = {};
	});






	// Page: PAYMENT
	var totalPayment = 85.13;
	var showPayment = function() {
		var cents = (totalPayment % 1.0) + "000";
		var t10 = (totalPayment * .1) + "00";
		t10 = t10.substr(0, t10.indexOf(".")+3)
		var t15 = (totalPayment * .15) + "00";
		t15 = t15.substr(0, t15.indexOf(".")+3)
		var t20 = (totalPayment * .2) + "00";
		t20 = t20.substr(0, t20.indexOf(".")+3)
		$('#payment-total-dollar').text("$" + Math.floor(totalPayment));
		$('#payment-total-cents').text("." + cents[2] + cents[3]);
		$('#btn-tip-10 .sub').text("$" + t10);
		$('#btn-tip-15 .sub').text("$" + t15);
		$('#btn-tip-20 .sub').text("$" + t20);
	};
	showPayment();

	var addTip = function(tip) {
		var total = totalPayment + totalPayment*tip;
		var cents = (total % 1.0) + "000";
		$('#payment-total-dollar').text("$" + Math.floor(total));
		$('#payment-total-cents').text("." + cents[2] + cents[3]);
		slideToCardSelection();
	};

	$('#btn-tip-10').click(function() {
		$('#btn-tip-10').addClass('btn-selected');
		$('#btn-tip-15').removeClass('btn-selected');
		$('#btn-tip-20').removeClass('btn-selected');
		addTip(.1);
	});
	$('#btn-tip-15').click(function() {
		$('#btn-tip-10').removeClass('btn-selected');
		$('#btn-tip-15').addClass('btn-selected');
		$('#btn-tip-20').removeClass('btn-selected');
		addTip(.15);
	});
	$('#btn-tip-20').click(function() {
		$('#btn-tip-10').removeClass('btn-selected');
		$('#btn-tip-15').removeClass('btn-selected');
		$('#btn-tip-20').addClass('btn-selected');
		addTip(.2);
	});
	$('#no-tip').click(function() {
		slideToCardSelection();
	});

	var slideToCardSelection = function() {
		$('#page-payment').animate({
			top: '-122px'
		});
		setTimeout(function() {
			$('#payment-card-line').fadeIn();
		}, 400);
		$('#no-tip').fadeOut();
	};




	$('.payment-card-right').click(function() {
		var degree_right = 20;
		var degree_center = 0;
		var degree_left = -20;
		rotate = setInterval(function() {
			if(degree_right <= 0) {
				window.clearInterval(rotate);
			}
			$('.payment-card-right').css({
				'-webkit-transform': 'rotate(' + degree_right + 'deg)',
			    '-moz-transform': 'rotate(' + degree_right + 'deg)',
			    'transform': 'rotate(' + degree_right + 'deg)'
			});
			$('.payment-card-left').css({
				'-webkit-transform': 'rotate(' + degree_left + 'deg)',
			    '-moz-transform': 'rotate(' + degree_left + 'deg)',
			    'transform': 'rotate(' + degree_left + 'deg)'
			});
			$('.payment-card-center').css({
				'-webkit-transform': 'rotate(' + degree_center + 'deg)',
			    '-moz-transform': 'rotate(' + degree_center + 'deg)',
			    'transform': 'rotate(' + degree_center + 'deg)'
			});

			degree_right -= 1;
			degree_center -= 1;
			degree_left -= 1;
		}, 15);
		$('.payment-card-right').animate({
			left: '60px',
			top: '0px',
			opacity: 1
		});
		$('.payment-card-left').animate({
			left: '-220px',
			top: '80px',
		});
		$('.payment-card-center').animate({
			left: '-180px',
			top: '80px',
			opacity: .4
		});
	});


});



