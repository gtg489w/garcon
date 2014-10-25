var SAAgent = null;
var SASocket = null;
var CHANNELID = 104;
var ProviderAppName = "HelloAccessoryProvider";

function createHTML(log_string) {
	alert(log.innerHTML + "<br> : " + log_string);
}

function onerror(err) {
	alert("err [" + err + "]");
}

var agentCallback = {
	onconnect : function(socket) {
		SASocket = socket;
		//alert("HelloAccessory Connection established with RemotePeer");
		createHTML("startConnection");
		SASocket.setSocketStatusListener(function(reason){
			console.log("Service connection lost, Reason : [" + reason + "]");
			disconnect();
		});
	},
	onerror : onerror
};

var peerAgentFindCallback = {
	onpeeragentfound : function(peerAgent) {
		try {
			if (peerAgent.appName == ProviderAppName) {
				SAAgent.setServiceConnectionListener(agentCallback);
				SAAgent.requestServiceConnection(peerAgent);
			} else {
				alert("Not expected app!! : " + peerAgent.appName);
			}
		} catch(err) {
			console.log("exception [" + err.name + "] msg[" + err.message + "]");
		}
	},
	onerror : onerror
};

function onsuccess(agents) {
	try {
		if (agents.length > 0) {
			SAAgent = agents[0];
			
			SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
			SAAgent.findPeerAgents();
		} else {
			alert("Not found SAAgent!!");
		}
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
};

function connect() {
	if (SASocket) {
		alert('Already connected!');
        return false;
    }
	try {
		webapis.sa.requestSAAgent(onsuccess, function (err) {
			console.log("err [" + err.name + "] msg[" + err.message + "]");
		});
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
};

function disconnect() {
	try {
		if (SASocket != null) {
			SASocket.close();
			SASocket = null;
			createHTML("closeConnection");
		}
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
};

function onreceive(channelId, data) {
	alert('receive');
	createHTML(data);
};

function fetch() {
	try {
		//SASocket.setDataReceiveListener(onreceive);
		SASocket.setDataReceiveListener(function(channelId, data) {
			alert(data);
		});
		SASocket.sendData(CHANNELID, "Hello Accessory!");
	} catch(err) {
		alert("exception [" + err.name + "] msg[" + err.message + "]");
	}
};


var getOrders = function() {
	try {
		SASocket.setDataReceiveListener(function(channelId, data) {
//			alert(data);
			var j = JSON.parse(data);
			if(j.id && j.totalAmount > 0) {
				order = j;
				acceptingPayment = true;
				showPayment();
			}
		});
		SASocket.sendData(CHANNELID, "getOrders");
	} catch(err) {
		//alert("exception [" + err.name + "] msg[" + err.message + "]");
	}
};

var postPayment = function() {
	try {
		SASocket.setDataReceiveListener(function(channelId, data) {
			$('.page').hide();
			$('#page-payment-success').fadeIn();
			setTimeout(function() {
				$('.page').hide();
				// reset
				$('#page-home').fadeIn();
				acceptingPayment = false;
				$('#payment-page-container').css({ 'top': '0px' });
				$('#payment-page-container').show();
				$('#no-tip').show();
				$('#payment-card-line').hide();
				$('#payment-processing-line').hide();
				$('#page-payment-success').hide();
				$('#payment-processing-page').hide();
				$('#payment-total').show();
				$('#payment-tip btn').removeClass('btn-selected');
				pinIndex = 1;
				$('.pin-entry div').hide();
				$('#btn-tip-10').removeClass('btn-selected');
				$('#btn-tip-15').removeClass('btn-selected');
				$('#btn-tip-20').removeClass('btn-selected');
			}, 3000);
		});
		var amt = $('#payment-total-dollar').text() + $('#payment-total-cents').text();
		amt = amt.replace('$','');
		SASocket.sendData(CHANNELID, 'postPayment'+JSON.stringify({"orderId":order.id,"userId":1,"userCardId":paymentCardId,"amount":amt,"tipAmount":0.0}));
	} catch(err) {
		alert("exception [" + err.name + "] msg[" + err.message + "]");
	}
};

var getPaymentHistory = function() {
	$('#payment-history-list').html('');
	$('#payment-history-list').hide();
	$('#payment-history-loading').show();
	try {
		SASocket.setDataReceiveListener(function(channelId, data) {
			showHistory(JSON.parse(data));
		});
		SASocket.sendData(CHANNELID, "getHistory");
	} catch(err) {
	}
};

var showHistory = function(trans) {
	var html = "";
	trans.OrderHistory.forEach(function(tran) {
		var date = tran.closeDateTime.split('T')[0].split('-');
		html += '<tr><td>'+date[1]+'/'+date[2]+'/'+date[0]+'</td><td>$'+tran.totalAmount+'</td><td><div class="btn btn-dispute" style="font-size: 16px;">Dispute</div></td></tr>';
	});
	$('#payment-history-list').append(html);
	$('#payment-history-loading').hide();
	$('.btn-dispute').click(function() {
		contactSupport();
	});
	$('#payment-history-list').fadeIn();

};

var contactSupport = function() {
	try {
		SASocket.setDataReceiveListener(function(channelId, data) {
			// do nada
		});
		SASocket.sendData(CHANNELID, "support");
	} catch(err) {
	}
};









var order;	
var pinStart = {};
var userId = 1;
var getCards = "http://slabs.cc/garcon/api/usercard?$filter=userId%20eq%20"+userId;
var getHistory = "http://slabs.cc/garcon/api/user/history/1";
var acceptingPayment = false;
var paymentCardId;
var pinIndex = 1;

$(window).load(function(){
	setInterval(function() {
		if(acceptingPayment) {
			return;
		}
		getOrders();
	}, 5000);


	$('#btn-payment-history').click(function() {
		$('.page').hide();
		$('#page-payment-history').fadeIn();
		getPaymentHistory();
		//http://slabs.cc/garcon/api/user/history/1
	});
	$('#payment-history-back').click(function() {
		$('.page').hide();
		$('#page-home').fadeIn();
	});
	
	
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
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		var x = touch.pageX - pinStart.x;
		var y = touch.pageY - pinStart.y;
		if(Math.abs(x) > 40 || Math.abs(y) > 40) {
			var dir = "up";
			if(Math.abs(x) > Math.abs(y)) {
				if(x > 0) {
					dir = 'right';
				} else {
					dir = 'left';
				}
			} else {
				if(y > 0) {
					dir = 'down';
				} else {
					dir = 'up';
				}
			}
			$('#pin-entry-'+pinIndex+' .arrow_'+dir).fadeIn();
			pinIndex++;
			if(pinIndex > 6) {
				$('.page').hide();
				$('#payment-processing-page').fadeIn();
				postPayment();
			}
		}
		//pinIndex
		resetPinBox();
		pinStart = {};
	});


	

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

	// connect to the phone
	connect();

});

/*
{
  "id": 1,
  "orderId": 2,
  "userId": 3,
  "userCardId": 4,
  "amount": 5.0,
  "tipAmount": 6.0
}
*/
// Page: PAYMENT
var totalPayment = 85.13;
var showPayment = function() {
	totalPayment = order.totalAmount;

	$('.page').hide();
	$('#page-payment').fadeIn();
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
//showPayment();

var addTip = function(tip) {
	var total = totalPayment + totalPayment*tip;
	var cents = (total % 1.0) + "000";
	$('#payment-total-dollar').text("$" + Math.floor(total));
	$('#payment-total-cents').text("." + cents[2] + cents[3]);
	slideToCardSelection();
};

var slideToCardSelection = function() {
	var html = "";
	data_cards.forEach(function(card) {
		var cardType = "card_visa";
		if(card.cardType == 'MASTER') {
			cardType = "card_mastercard";
		}
		html += '<div id="card1" style="background-image: url('+cardType+'.png);" class="payment-card" rel="'+card.id+'"><div class="card-title">'+card.description+'</div></div>';
	});
	$('#payment-cards').html('');
	$('#payment-cards').append(html);
	$('.payment-card').click(function() {
		$('#payment-card-line').fadeOut();
		$('#payment-total').fadeOut();
		$('#payment-processing-line').fadeIn();
		paymentCardId = $(this).attr('rel');
		//postPayment();
		$('.page').hide();
		resetPinBox();
		$('#page-password').fadeIn();
	});
	$('#payment-page-container').animate({
		top: '-122px'
	});
	setTimeout(function() {
		$('#payment-card-line').fadeIn();
	}, 400);
	$('#no-tip').fadeOut();
};

var resetPinBox = function() {
	$('#pin-box').animate({
		top: '60px',
		left: '60px'
	}, 200);
};
resetPinBox();
