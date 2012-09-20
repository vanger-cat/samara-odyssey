$(function() {
    function init(){
        var d = $(document);
        d.bind("pagechange", onPageChange);
        render_loding_page();
    }
    
    function onPageChange(event, data) {
        var toPageId = data.toPage.attr("id");
        switch (toPageId) {
            case 'select-place': render_select_page(); break;
            case 'login': render_login_page(); break;
            case 'user-info': render_user_info_page(); break;
            case 'task': render_task_page(); break;
            case 'loading': render_loding_page(); break;
        }
    }

    function render_loding_page(){
        // Проверка токена
        $.mobile.loading('show');
        try{
            var switch_to_login = function(){
                $.mobile.loading('hide');
                $.mobile.changePage($('#login'));
            }
            var fsclient = new FourSquareClient(null, null, null, true);
            if(fsclient.accessToken){
                fsclient.usersClient.users('self', {
                    onSuccess: function(data) {
                        $.mobile.loading('hide');            
                        $.mobile.changePage($('#task'));
                    },
                    onFailure: switch_to_login
                });
            }else{
                switch_to_login();
            }
        } catch(e){
            switch_to_login();
        }
    }

    function render_login_page(){
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

    function render_user_info_page(){
        $.mobile.loading('show');
        var fsclient = new FourSquareClient(null, null, null, true);
        fsclient.usersClient.users('self', { 
            onSuccess: function(data) { 
                $('#user-info .user-id').html(data.response.user.id);
                $('#user-info .user-name').html(data.response.user.firstName);
                $('#user-info .user-avatar').attr('src',data.response.user.photo);
                //console.log(data);
                $.mobile.loading('hide');
                toast('test');
            },
            onFailure: function(data) {
                alert('Не могу получить информацию о пользователе!');
                $.mobile.loading('hide');
            }
        });
    }

    /**
     * TODO: обновление текущей позиции
     *       отображение маркера по клику на место (? нужно ли, если радиус - 50м)
     *       обновление информации только если сменились координаты
     */
    function render_select_page(){
        var fsclient = new FourSquareClient(null, null, null, true);
        var params = { 'll': '53.20445,50.12376', 'radius': 50 };
        $('#select-place ul li').remove();
        fsclient.venuesClient.explore(params, { 
            onSuccess: function(data) { 
                var venues = [];
                for(var i=0; i < data.response.groups[0].items.length; i++){
                    item = data.response.groups[0].items[i];
                    // venues.push({
                    //     'id': item.venue.id,
                    //     'name': item.venue.name,
                    //     'location': { 'lat': item.venue.location.lat, 'lng': item.venue.location.lng},
                    //     'category': item.venue.categories[0].name
                    // });
                    var ll = 'Lat: ' + item.venue.location.lat + '<br/>Lng: ' + item.venue.location.lng;
                    $('#select-place ul').append(
                        $('<li>').append($('<a>').attr('href', '#')
                                                 .append($('<h3>').append(item.venue.name))
                                                 .append($('<p>').append(item.venue.categories[0].name)))
                                 .append($('<span class="ui-li-count">').append(ll))
                    );
                }
                $('#select-place ul').listview('refresh');
                //console.log(data.response.groups);
                
                //$('#select-place-debug').html(prettyPrint(data.response));
                //$.dump(data.response.groups[0].items, true);
                // $.dump(venues, false);
            },
            onFailure: function(data) {
                alert('Не могу получить информацию о местности!');
            }
        });
        
        // Also works with: var yourStartLatLng = '59.3426606750, 18.0736160278';
        var yourStartLatLng = new google.maps.LatLng(53.21320001, 50.2060001);
        $('#select-place-map').gmap({'center': yourStartLatLng, 'zoom': 11});

        // $('#select-place-map').gmap().bind('init', function(ev, map) {
        //     $('#select-place-map').gmap('addMarker', {'position': '53.213200,50.206000', 'bounds': false}).click(function() {
        //         $('#select-place-map').gmap('openInfoWindow', {'content': 'Hello World!'}, this);
        //     });
        // });

        $('#select-place-map').gmap('addMarker', {'position': '57.7973333,12.0502107', 'bounds': false}).click(function() {
            $('#select-place-map').gmap('openInfoWindow', {'content': 'Hello World!'}, this);
        });
    }

    function render_task_page(){
        $.ajax({
            url: 'http://app-test.samara-odyssey.dansamara.ru/actions/task.php',
            dataType: 'jsonp',
            success: function(data){
                if (data.hasOwnProperty('task')) {
                    $('#task p.current-class').html(data.task);
                    update_task_map_height();
                }
            }
        });
        $('#task .map').gmap({'center': '53.21320001, 50.2060001', 'zoom': 13});
    }

    function update_task_map_height(){
        // $header = $page.children( ":jqmData(role=header)" ),
        // $content = $page.children( ":jqmData(role=content)" ),
        var map_height = $(window).outerHeight() - 
                        $('#task div[data-role="header"]').outerHeight() - 
                        $('#task div[data-role="content"]').outerHeight() -
                        $('#task .map').outerHeight();
        $('#task .map').height(map_height).gmap('refresh');
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
        .fadeOut( 400, function(){
        $(this).remove();
        });
    }

    $(init);
});
