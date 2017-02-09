$(document).ready(function() {

    var questionHeight;
    var seconds = 5;
    var clicked = false;
    var answer;
    var answers = ['a', 'b', 'c', 'd'];
    var score = 0;
    var count = 0;
    var user = {};
    var playlists = [];
    var tracks = [];

    var params = getHashParams();

    var access_token = params.access_token,
        error = params.error;

    function shuffleArray(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function getRandomNumber(max) {
        return Math.floor(Math.random() * (max - 1));
    }

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
        $('#user').html('So ' + user.id + ', this is awkward....');
        $('#message').html('You have no playlists...');
        $('#countdown').hide();
        setTimeout(function() {
            window.location.href = 'https://muse.conorhughes.me'
        }, 4000);
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

    function getTracks() {
        var promise = Promise.resolve(null);

        playlists.forEach(function(playlist) {
            promise = promise.then(function() {
                return getTrack(playlist.name, playlist.tracks.href);
            });
        });

        return promise.then(function() {
            return true;
        });
    }

    function getTrack(playlist, url) {
        return $.ajax({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                setTracks(playlist, response.items);
                if (response.next != null) {
                    getTrack(playlist, response.next);
                }
            }
        });
    }

    function setTracks(playlist, list) {
        var promise = Promise.resolve(null);

        list.forEach(function(track) {
            promise = promise.then(function() {
                if (track.track != null) {
                    return tracks.push({
                        playlist: playlist,
                        name: track.track.name,
                        artist: track.track.artists[0].name,
                        artist_id: track.track.artists[0].id,
                        asked: false
                    })
                }
            });
        });

        return promise.then(function() {
            return true;
        });
    }

    function getRelatedArtists(id) {
        return $.ajax({
            url: 'https://api.spotify.com/v1/artists/' + id + '/related-artists',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        });
    }

    $('.answer').click(function(event) {
        event.preventDefault();
        if (!clicked) {
            clicked = true;
            setTimeout(function() {
                $(event.target.id).removeClass('hover');
                showCorrectAnswer(event.target.id);
            }, 500);
        }
    });

    function showCorrectAnswer(picked_answer) {
        $('#' + answer).addClass('correct');
        setTimeout(function() {
            clicked = false;
            $('#' + answer).removeClass('correct');
            if (picked_answer == answer) {
                score++;
            }
            updateScore();
            createQuestion();
        }, 1000);
    }

    function updateScore() {
        $('#score').html('Score: ' + score);
        $('#counter').html('Question: ' + (count + 1));
    }

    function setAnswer() {
        var randomNumber = getRandomNumber(4);
        answer = answers[randomNumber];
        $('#' + answer).html(tracks[count].artist);
    }

    function createQuestion() {
        if (count == tracks.length) {
            $('#quiz').fadeOut(function() {
                $('#welcome').fadeIn();
                $('#user').html('Wow ' + user.id + '!');
                $('#message').html('You answered all ' + (count) + ' questions....<br>Your final score was ' + score + '!');
                $('#countdown').html('');
                setTimeout(function() {
                    window.location.href = 'https://muse.conorhughes.me'
                }, 5000);
            });
        } else {
            getRelatedArtists(tracks[count].artist_id).then(function(response) {
                count++;
                shuffleArray(response.artists);
                $('#track').html(tracks[count].name);
                $('#playlist').html(tracks[count].playlist);
                $('#a').html(response.artists[0].name);
                $('#b').html(response.artists[1].name);
                $('#c').html(response.artists[2].name);
                $('#d').html(response.artists[3].name);
                setAnswer();
            });
        }
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
                        getTracks().then(function() {
                            shuffleArray(tracks);
                            createQuestion();
                        });
                    }
                });
            });
        }
    }
});
