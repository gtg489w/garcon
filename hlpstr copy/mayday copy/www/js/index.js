var config = {
    opentok: {
        apiKey: '45045452',
        sid: '2_MX40NTA0NTQ1Mn5-MTQxNDI1NDQ2MzEzMn5VbVg2UnE5NXZoeEVSQzVXWXYyTlcycFJ-fg',
        token: 'T1==cGFydG5lcl9pZD00NTA0NTQ1MiZzaWc9NjFhMzA0ZTMzNDcyOWY1MDgyM2Q1NmVmMGJiNjdlOGM0NWVkMjgzMjpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTJfTVg0ME5UQTBOVFExTW41LU1UUXhOREkxTkRRMk16RXpNbjVWYlZnMlVuRTVOWFpvZUVWU1F6VlhXWFl5VGxjeWNGSi1mZyZjcmVhdGVfdGltZT0xNDE0MjU0NTc0Jm5vbmNlPTAuMjU4MTQ3NDcyOTkyOTM2MyZleHBpcmVfdGltZT0xNDE0ODU5MjU4'
    }
};
var connected = false;

var startVideo = function() {
    if(connected) {
        return;
    }
    connected = true;
    var session = TB.initSession( config.opentok.apiKey, config.opentok.sid );
    session.on({
        'streamCreated': function( event ){
            var div = document.createElement('div');
            div.setAttribute('id', 'stream' + event.stream.streamId);
            div.className = 'otherPerson';
            document.getElementById('page_video').appendChild(div);
            session.subscribe( event.stream, div.id, {subscribeToAudio: true} );
        },
        'streamDestroyed': function(event) {
            connected = false;
        },
        'error': function() {
            
        }
    });

    session.connect(config.opentok.token, function(){
        var publisher = TB.initPublisher(config.opentok.apiKey,'myPublisherDiv');
        session.publish( publisher );
    });
};

var initialize = function() {
    $(function() {
        $('.page').hide();
       startVideo();
    });
};

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        initialize();
        
    }
};
