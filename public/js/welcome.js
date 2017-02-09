$(document).ready(function() {

    var questionHeight;
    var seconds = 5;
    var user = {};
    var playlists = [];

    var params = getHashParams();

    var access_token = params.access_token,
        error = params.error;

    if ($(window).width() < 1024) {
        questionHeight = 3;
    } else {
        questionHeight = 2;
    }

    function countdown() {
        var counter = setInterval(function() {
                seconds--;
                if (seconds < 1) {
                    clearInterval(counter);
                    $('#welcome').fadeOut(function() {
                        initialiseTracker();
                        $('#quiz').fadeIn();
                        var trackHeight = parseInt($("#track").css("font-size"));
                        var playlistHeight = parseInt($("#playlist").css("font-size"));
                        var quizHeight = trackHeight + playlistHeight;
                        $('#track').css('bottom', playlistHeight + 'px');
                        $('#question').height(quizHeight * questionHeight);
                    });
                } else {
                    $('#countdown').html(seconds.toString()).removeClass('animated zoomIn').hide().show().addClass('animated zoomIn');
                }
            },
            800);
    }

    function noPlaylists() {
        $('#welcome').fadeIn();
        $('#user').html('So ' + user.id +', this is awkward....');
        $('#message').html('You have no playlists...');
        $('#countdown').hide();
        setTimeout(function() {
            window.location.href = 'https://muse.conorhughes.me'
        }, 3000);
    }

    function getUser() {
        return $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                user = response;
            }
        });
    }

    function getPlaylists() {
        return $.ajax({
            url: 'https://api.spotify.com/v1/me/playlists',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                playlists = response.items;
            }
        });
    }

    function displayWelcome() {
        $('#user').html('Welcome, ' + user.id + '!');
        $('#message').html('The quiz will begin in');
        setTimeout(function() {
            $('#welcome').fadeIn(function() {
                countdown();
            });
        }, 500);
    }

    function initialiseTracker() {
        $('#score').html('Score: ' + 0);
        $('#counter').html('Question: ' + 1);
    }

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {
            getUser().then(function() {
                getPlaylists().then(function() {
                    if (playlists.length == 0) {
                        noPlaylists();
                    } else {
                        displayWelcome();
                    }
                });
            });
        }
    }
});
