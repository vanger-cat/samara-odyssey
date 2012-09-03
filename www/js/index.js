/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
(function($, window){

var init = function(){
 if (init.called) {
   return;
 }
 init.called = true;


        //$(document).ready(function(){

            var fsclient = new FourSquareClient(null, null, null, true);

            $('#login a').click(function(e){
                var id = 'EZEDVJFRCCRXAPQRVMJJM1XUETBCEAU53RY40VI0LEUOW1Z1',
                    secret = '12YBZID4MUFPVO4SRP3HKMARVM415ERM541KKZ0UH4ZANGVE',
                    callback = 'http://app-test.samara-odyssey.dansamara.ru/';

                fsclient = new FourSquareClient(id, secret, callback, true);

                var authenticationURL = fsclient.AUTHENTICATION_URL + "?client_id=" + fsclient.clientId;
                authenticationURL += FourSquareUtils.createQueryString("&", {
                                     response_type: "token",
                                     redirect_uri: fsclient.redirectUri
                                 });
                window.open(authenticationURL, '_self');

                return e.preventDefault();
            });

            if(!fsclient.accessToken){
                $('#login').show();
                $('#debug').append('<p>URL: ' + document.URL + '</p>');
            }else{
                $('#info').show();
                fsclient.usersClient.users('self', { 
                    onSuccess: function(data) { 
                        $('#user-id').html(data.response.user.id);
                        $('#user-name').html(data.response.user.firstName);
                        $('#user-foto').html('<img src="' + data.response.user.photo + '"/>');
                        //console.log(data);
                    },
                    onFailure: function(data) {
                        alert('Не могу получить информацию о пользователе!');
                    }
                });
            }
        //});
}

  init.called = false;
  
  document.addEventListener('deviceready', init, false);
  $(init);

}(jQuery, window));