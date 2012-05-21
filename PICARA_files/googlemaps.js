function popupInfo (marker, note) {
    return function () {
        marker.openInfoWindowHtml('<span style = "white-space : nowrap">' + note + '</span>');
    }
}

//showAddress takes up to 4 arguments. 
// map is the GMap2 object. It's a global variable initialized down in the load() function
// address is the string that you want to geocode. Be as generic or as specific as you want. City, state works fine
// Note is what is displayed when the marker is clicked on. If it's not passed, it'll display the address
// icon is an optional GIcon element to use a different marker than the default.
//   use the markerIcon function to create one for simplicity's sake.

function addAddressMarker(map, address, note, icon) {

    var geocoder = new google.maps.ClientGeocoder();

    geocoder.getLatLng(
        address,
        function(point) {

            if (!point) {
                //alert(address + " not found");
            } 
            else {
                var marker = new google.maps.Marker(point, icon);

                map.addOverlay(marker);
                
                if (note.length > 0) {
                    google.maps.Event.addListener(marker, 'click', popupInfo(marker, note));
                }
            }
        }
    );
}


// given a path to an image, this creates a new GIcon object for you. Note that it assumes that you're creating one of the same
// dimensions as the default.
function markerIcon (path) {
    var icon = new google.maps.Icon();
    icon.image = path;
    icon.shadow = "http://www.google.com/mapfiles/shadow50.png";
    icon.iconSize = new google.maps.Size(20, 34);
    icon.shadowSize = new google.maps.Size(37, 34);
    icon.iconAnchor = new google.maps.Point(9, 34);
    icon.infoWindowAnchor = new google.maps.Point(9, 2);
    icon.infoShadowAnchor = new google.maps.Point(18, 25);
    
    return icon;
}

//standard loading function. It's of arbitrary size and roughly centered on the US. I don't have a slick way to arbitrarily 
//center anywhere. I'll leave that as an exercise for the reader
function loadMap(mapElementID, latitude, longitude, zoomLevel) {
    if (google.maps.BrowserIsCompatible()) {

        var mapElement = document.getElementById(mapElementID);

        var map = new google.maps.Map2(mapElement);
        if (latitude == null || longitude == null) {
            latitude = 37.93;
            longitude = -96.06;
        }
        if (zoomLevel == null) {
            zoomLevel = 4;
        }

        map.setCenter(new google.maps.LatLng(latitude, longitude), zoomLevel);
    
        return map;
    
    }
}

function loadMapByAddress(mapElementID, address, zoomLevel, note, icon) {
    if (google.maps.BrowserIsCompatible()) {
    
        var geocoder = new google.maps.ClientGeocoder();

        var mapElement = document.getElementById(mapElementID);

        if (zoomLevel == null) {
            zoomLevel = 4;
        }

        var map = new google.maps.Map2(mapElement);

        geocoder.getLatLng(
            address,
            function(point) {
                if (!point) {
                    //alert(address + " not found");
                } 
                else {                
                    map.setCenter(point, zoomLevel);
                    addAddressMarker(map, address, note, icon);
                }
            }
        );
        
        return map;
    }
}
    

//these two functions are just used in the javascript demo
function demoAddAddress(map) {
    showAddress(map, document.getElementById('address').value);
    return false;
}

function addLatLongMarker(map, latitude, longitude, note, icon) {
    
    marker = new google.maps.Marker( new google.maps.LatLng( latitude, longitude), icon);
    
    map.addOverlay( marker );
    if (note.length > 0) {
        google.maps.Event.addListener(marker, 'click', popupInfo(marker, note));
    }
    
    return false;
}
