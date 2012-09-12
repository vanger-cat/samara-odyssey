// Load foursquare-api

function require(file)
{
    try
    {
        document.write('<script type="text\/javascript" src="'+file+'" charset="utf-8"><\/s' + 'cript>');
    }
    catch(exc)
    {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = file;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}

var path = 'js/foursquare/';
require(path + "foursquare-api.core.js");

var types = ["photos", "venues", "settings", "users", "checkins", "tips", "specials", "updates", "events"];
for(var type in types)
{
  require(path + "endpoint/foursquare-api."+ types[type] +".js");
}
