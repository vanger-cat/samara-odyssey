$(function() {
    function init(){
        var d = $(document);
        d.bind("pagechange", onPageChange);
    }
    
    function onPageChange(event, data) {
        var toPageId = data.toPage.attr("id");
        switch (toPageId) {
            case 'select-place': render_select_page(); break;
            case 'login': render_login_page(); break;
            case 'user-info': render_user_info_page(); break;
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

        $('#login a.login').click(function(){
            for (var key in access_keys) {
                FourSquareUtils.storeValue(key, access_keys[key]);
            };
        });
    }

    function render_user_info_page(){
        var fsclient = new FourSquareClient(null, null, null, true);
        fsclient.usersClient.users('self', { 
            onSuccess: function(data) { 
                $('#user-info .user-id').html(data.response.user.id);
                $('#user-info .user-name').html(data.response.user.firstName);
                $('#user-info .user-avatar').attr('src',data.response.user.photo);
                //console.log(data);
            },
            onFailure: function(data) {
                alert('Не могу получить информацию о пользователе!');
            }
        });
    }

    function render_select_page(){
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

    $(init);
});
