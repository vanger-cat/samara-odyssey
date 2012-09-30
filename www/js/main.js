$(function() {
    var app_data = {
        'radius': 300
    }

    function init(){
        var d = $(document);
        d.bind("pagechange", onPageChange);
        d.bind("pageinit", onPageInit);
        build_loding_page();
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
        var access_keys = { 'fs_access_token': "ZPIFQ24SSJW2IZROKZ3MM5BPFXUA5OHI0DCH44HUTLFOQ3OY",
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
        var params = { quality: 70, allowEdit: true, destinationType: Camera.DestinationType.DATA_URL };
        navigator.camera.getPicture(onSuccess, onFailure, params);
    }

    function do_checkin(){
        var fsclient = new FourSquareClient(null, null, null, true);
        var params = { 'venueId': app_data.task.location, 'shout': $('#comment').val()};
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
        fsclient.venuesClient.venues(app_data.task.location, { 
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
            /*onSuccess*/ function(position){
                show_places(position.coords);
            },
            /*onError*/ function(error){
            }
        );
    }

    function show_places(coords){
        $.mobile.loading('show');
        var fsclient = new FourSquareClient(null, null, null, true);
        var params = { 'll': coords.latitude + ', ' + coords.longitude, 'radius': app_data.radius };
        var checkin = function(id){ $.mobile.changePage($('#checkin')); }
        fsclient.venuesClient.explore(params, { 
            onSuccess: function(data) {
                console.log(data);
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
                        console.log(app_data);
                    if(item.venue.id == app_data.task.location){
                      li.attr('data-theme','e')
                        .append($('<a>').attr('href', '#').append(title).append(desc).click(checkin))
                        .append(count);
                    }else{
                        //li.append(title).append(desc).append(count);
                      li.append($('<a>').attr('href', '#').append(title).append(desc).click(checkin))
                        .append(count);
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
        
        // Also works with: var yourStartLatLng = '59.3426606750, 18.0736160278';
        //var yourStartLatLng = new google.maps.LatLng(53.21320001, 50.2060001);
        //$('#select-place-map').gmap({'center': yourStartLatLng, 'zoom': 11});

        // $('#select-place-map').gmap().bind('init', function(ev, map) {
        //     $('#select-place-map').gmap('addMarker', {'position': '53.213200,50.206000', 'bounds': false}).click(function() {
        //         $('#select-place-map').gmap('openInfoWindow', {'content': 'Hello World!'}, this);
        //     });
        // });

        // $('#select-place-map').gmap('addMarker', {'position': '57.7973333,12.0502107', 'bounds': false}).click(function() {
        //     $('#select-place-map').gmap('openInfoWindow', {'content': 'Hello World!'}, this);
        // });
    }

    function build_task_page(){
        //$.mobile.loading('show');
        $.ajax({
            url: 'http://app-test.samara-odyssey.dansamara.ru/actions/task.php',
            dataType: 'jsonp',
            success: function(data){
                if (data.hasOwnProperty('text')) {
                    $('#task p.current-class').html(data.text);
                    app_data.task = data;
                    update_task_map_height();
                    $('#task .map').gmap({'center': '53.21320001, 50.2060001', 'zoom': 13});
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
});
