$(function() {
    // jQuery.data()?
    var app_data = {
        'radius': 300,
        'task_url': 'http://app-test.samara-odyssey.dansamara.ru/actions/task.php',
        // 'default_location': '53.21320001, 50.2060001'
        'default_location': '53.18955,50.13695'
    }

    function init(){
        var d = $(document);
        d.bind("pagechange", onPageChange);
        d.bind("pageinit", onPageInit);
        build_loding_page();

            pictureSource=navigator.camera.PictureSourceType;
            destinationType=navigator.camera.DestinationType;
            
            $('a.capturePhoto').click(capturePhoto);
            $('a.capturePhotoEdit').click(capturePhotoEdit);
            $('a.getPhoto1').click(getPhoto1);
            $('a.getPhoto1').click(getPhoto2);

    }
    
    function onPageInit(event) {
        switch ($(event.target).attr('id')) {
            case 'login': build_login_page(); break;
            case 'task': build_task_page(); break;
            case 'loading': build_loding_page(); break;
            case 'checkin': build_checkin_page(); break;
        }
    }

    function onPageChange(event, data) {
        switch(data.toPage.attr('id')){
            case 'task': update_task_map(); break;
            case 'checkin': render_checkin_page(); break;
            case 'select-place': render_select_page(); break;
            case 'checkin-result': render_checkin_result_page(); break;
        }
    }

    function build_loding_page(){
        // Проверка токена
        $.mobile.loading('show');
        var switch_to_login = function(){
            $.mobile.loading('hide');
            $.mobile.changePage($('#login'));
        }
        try{
            var fsclient = new FourSquareClient(null, null, null, true);
            fsclient.usersClient.users('self', {
                onSuccess: function(data) {
                    $.mobile.loading('hide');            
                    $.mobile.changePage($('#task'));
                },
                onFailure: switch_to_login
            });
        } catch(e){
            switch_to_login();
        }
    }

    function build_login_page(){
        var access_keys = { 'fs_access_token': "K1R4X0DTYE54OV0ZCRMIY2GH4RNZTDDVBX4FGIZGLVGMSUJ4",
                            'fs_client_id': "B1DDKTTHYTZELCCAH3UDX2FLM3SV5YGEV3ORZDPN5Q50TGG0",
                            'fs_client_secret': "14AIKY23DMTZ4YOOLLHI4I5A2OTZIEOT5TOPVNJ1NPYWYTK4",
                            'fs_redirect_uri': 'http://app-test.samara-odyssey.dansamara.ru/' };
        var list = '';
        for (var key in access_keys) {
            list += '<dt>' + key + ':</dt><dd><small>' + access_keys[key] + '</small></dd>';
        };
        $('.auth-tokens').html('<dl>'+list+'</dl>');

        var href_get_new_token = 'https://foursquare.com/oauth2/authenticate?client_id=' + 
                                 access_keys.fs_client_id + '&response_type=token' + '&redirect_uri=' + 
                                 access_keys.fs_redirect_uri;

        $('#login a.get_new').attr('href', href_get_new_token);

        $('#login a.login').click(function(){
            for (var key in access_keys) {
                FourSquareUtils.storeValue(key, access_keys[key]);
            };
        });
    }

    function build_checkin_page(){
        $('#checkin a.checkin').click(do_checkin);
        $('#checkin a.photo').click(do_photo);
    }
    
    function do_photo(){
        var onSuccess = function(imageData){            
            $('#checkin a.checkin').show();
            $('#checkin a.photo').hide();
            $('#checkin img.photo').attr('src', "data:image/jpeg;base64," + imageData).show();
        };
        var onFailure = function(){};
        var params = { quality: 20, destinationType: Camera.DestinationType.DATA_URL };
        navigator.camera.getPicture(onSuccess, onFailure, params);
    }

    function do_checkin(){
        var fsclient = new FourSquareClient(null, null, null, true);
        var params = { 'venueId': app_data.current_venue_id, 'shout': $('#comment').val()};
        fsclient.checkinsClient.add(params, {
            onSuccess: function(data){
                $('#checkin-result div[data-role="content"]').html('OK!<br/>ID:' + data.id);
                $.mobile.changePage($('#checkin-result'));
            },
            onFailure: function(data){
                alert('FAIL');
            }
        });
    }

    function render_checkin_page(){
        $.mobile.loading('show');

        $('#checkin img.photo').hide();
        $('#checkin a.checkin').hide();
        $('#checkin a.photo').show();

        var fsclient = new FourSquareClient(null, null, null, true);
        fsclient.usersClient.users('self', { 
            onSuccess: function(data) { 
                $('#checkin .user-id').html(data.response.user.id);
                $('#checkin .user-name').html(data.response.user.firstName);
                $('#checkin .user-avatar').attr('src',data.response.user.photo);
                $.mobile.loading('hide');
            },
            onFailure: function(data) {
                alert('Не могу получить информацию о пользователе!');
                $.mobile.loading('hide');
            }
        });
        fsclient.venuesClient.venues(app_data.current_venue_id, { 
            onSuccess: function(data) { 
                $('#checkin .place-name').html(data.response.venue.name);
                $('#checkin .place-desc').html(data.response.venue.categories[0].name);
            },
            onFailure: function(data) {
                alert('Не могу получить информацию о месте!');
            }
        });
    }

    function render_select_page(){
        $('#select-place ul li').remove();

        navigator.geolocation.getCurrentPosition(
            function(position){ /*onSuccess*/
                show_places(position.coords.latitude + ', ' + position.coords.longitude);
            },
            function(error){ /*onError*/
                alert('Текщее местоположение определить не удалось. Используем координаты по умолчанию.');
                show_places(app_data.default_location);
            }
        );
    }

    function show_places(location){
        $.mobile.loading('show');
        var fsclient = new FourSquareClient(null, null, null, true);
        var params = { 'll': location, 'radius': app_data.radius };
        var locations = [];
        for (var i = app_data.tasks.length - 1; i >= 0; i--) {
            locations.push(app_data.tasks[i].location);
        };
        fsclient.venuesClient.explore(params, { 
            onSuccess: function(data) {
                //console.log(data);
                var venues = [];
                for(var i=0; i < data.response.groups[0].items.length; i++){
                    item = data.response.groups[0].items[i];
                    // venues.push({
                    //     'id': item.venue.id,
                    //     'name': item.venue.name,
                    //     'location': { 'lat': item.venue.location.lat, 'lng': item.venue.location.lng},
                    //     'category': item.venue.categories[0].name
                    // });
                    var li    = $('<li>'),
                        ll    = 'Lat: ' + item.venue.location.lat + '<br/>Lng: ' + item.venue.location.lng,
                        desc  = $('<p>').append(item.venue.categories[0].name + ' ID: ' + item.venue.id),
                        title = $('<h3>').append(item.venue.name),
                        count = $('<span class="ui-li-count">').append(ll);
                    if(locations.indexOf(item.venue.id) != -1){
                        var venue_id = item.venue.id;
                        li.attr('data-theme','e')
                        .append($('<a>').attr('href', '#').append(title).append(desc).click(function(){
                            app_data.current_venue_id = venue_id;
                            $.mobile.changePage($('#checkin'));
                        }))
                        .append(count);
                    }else{
                        li.append(title).append(desc).append(count);
                      // li.append($('<a>').attr('href', '#').append(title).append(desc).click(checkin))
                        // .append(count);
                    }
                    
                    $('#select-place ul').append(li);
                }
                $('#select-place ul').listview('refresh');
                $.mobile.loading('hide');
                //$('#select-place-debug').html(prettyPrint(data.response));
                //$.dump(data.response.groups[0].items, true);
                // $.dump(venues, false);
            },
            onFailure: function(data) {
                alert('Не могу получить информацию о местности!');
                $.mobile.loading('hide');
            }
        });
    }

    function build_task_page(){
        //$.mobile.loading('show');
        $.ajax({
            url: app_data.task_url,
            dataType: 'jsonp',
            success: function(data){
                if (data.hasOwnProperty('tasks')) {
                    ul = $('<ul>');
                    for(var i = 0; i < data.tasks.length; i++){
                        ul.append($('<li>').append(data.tasks[i].text));
                    }
                    $('#task p.current-class').html(ul);
                    app_data.tasks = data.tasks;
                    update_task_map_height();
                    $('#task .map').gmap({'center': app_data.default_location, 'zoom': 13});
                    $('#task .map-wrapper').bind('tap', update_task_map);
                }
            }
        });
    }

    function update_task_map(){
        navigator.geolocation.getCurrentPosition(
            /*onSuccess*/ function(position){
                $('#task .map-wrapper h1').hide();
                var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                $('#task .map').gmap('option', 'center', pos).gmap('refresh');
            },
            /*onError*/ function(error){
                $('#task .map-wrapper h1').html('Ошибка: ' + error.message).show();
            }
        );
    }

    // TODO
    function update_task_map_height(){
        // var content = $('#task div[data-role="content"]'),
        //     map_height = $(window).outerHeight()
        //                  - $('#task div[data-role="header"]').outerHeight(true)
        //                  - $('#task div[data-role="content"]').outerHeight(true)
        //                  - $('#task .map').outerHeight(true);
        // $('#task .map-wrapper').height(map_height);
    }

    function render_checkin_result_page(){
        
    }

    var toast=function(msg){
        $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h3>"+msg+"</h3></div>")
        .css({ display: "block",
               opacity: 0.90,
               position: "fixed",
               padding: "7px",
               "text-align": "center",
               width: "270px",
               left: ($(window).width() - 284)/2,
               top: $(window).height()/2 })
        .appendTo( $.mobile.pageContainer ).delay( 1500 )
        .fadeOut( 400, function(){ $(this).remove(); });
    }
    
    document.addEventListener('deviceready', init, false);
    $(init);

            var pictureSource; // picture source
            var destinationType; // sets the format of returned value
            
            //if we've captured photo succesfully
            function onPhotoSuccess(imageData)
            {
                // Get image handle
                var smallImage = document.getElementById('cameraSmallImage');
                
                // Unhide image elements
                smallImage.style.display = 'block';
                
                // Show the captured photo
                // holy mother of God - image received as string:)
                smallImage.src = "data:image/jpeg;base64," + imageData;
            }
            
            //photo taken and URI sent to JavaScript
            function onPhotoURISuccess( photoURI )
            {
                // Get image handle
                var largeImage = document.getElementById('cameraLargeImage');
                
                // Unhide image elements
                largeImage.style.display = 'block';
                
                // Show the captured photo
                // The inline CSS rules are used to resize the image
                largeImage.src = imageURI;
            }
            
            // Something bad happened! We need something to do!
            function onFail(message) {
                alert('Failed because: ' + message);
            }
            
            
            //capture photo and return image as base-64 string
            function capturePhoto() {
                // Take picture using device camera and retrieve image as base64-encoded string
                navigator.camera.getPicture(onPhotoSuccess, onFail, { quality: 50,
                                            destinationType: destinationType.DATA_URL });
            }
            
            // A button will call this function
            //
            function capturePhotoEdit() {
                // Take picture using device camera, allow edit, and retrieve image as base64-encoded string
                navigator.camera.getPicture(onPhotoSuccess, onFail, { quality: 20, allowEdit: true,
                                            destinationType: destinationType.DATA_URL });
            }
            
            // A button will call this function
            function getPhoto(source) {
                // Retrieve image file location from specified source
                navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
                                            destinationType: destinationType.FILE_URI,
                                            sourceType: source });
            }

});
