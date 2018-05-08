/* eslint-disable no-console */
/*eslint-env browser*/

function mapSetup(){
    // set the view for the contiguous United States
    var map = L.map('mapid').setView([37, -96.77], 4);

    //I chose mapbox.light map since its grayscale would all my icons to stand out. 
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1Ijoid2lsbG91Z2hieTIiLCJhIjoiY2lzc2J5aWtpMDc2ODJ5cGh5MTlxNjczeSJ9.7FKJ5Mye4bhoImWAeCRhZg'
    }).addTo(map);
    
    var choropleth = new L.geoJSON().addTo(map);
    var total = new L.geoJSON().addTo(map);
    var top = new L.geoJSON().addTo(map);
    
    getData(map, choropleth);
    getTopBrewData(map, top);
    getTotalBrewData(map, total);
    
    var overlayLayers = {
        "Beer Consumption per Capita": choropleth,
        "StateBreweries": total,
        "TopBreweries": top
    };
    
    L.control.layers(null, overlayLayers).addTo(map);
}

function getData(map, choropleth){
    $.ajax({
        dataType: "json",
        url: "data/map_beercon.geojson",
        success: function(response){
                var choropleth = L.geoJSON(response, {style: style}).addTo(map);
                choropleth.bringToBack();
        }
    });
}

function getChoroplethColor(c) {
    return c > 1.6 ? '#993404' :
           c > 1.5 ? '#d95f0e' :
           c > 1.3 ? '#fe9929' :
           c > 1.15 ? '#fec44f' :
           c > .93 ? '#fee391' :
                      '#ffffd4';
}

function style(feature) {
    return {
        fillColor: getChoroplethColor(feature.properties.beer_2011),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function getTopBrewData(map, top){
    $.ajax("data/topbreweries.geojson", {
        dataType: "json",
        success: function(response){
            var topMarker = L.icon({
                    iconUrl: 'lib/images/Beer-icon3.png',
                    iconSize: [35,35],
                    iconAnchor: [10,15]
            });
            
            var top = L.geoJSON(response, {
                pointToLayer: function(feature, latlng) {
                    var popupContent = "<br><b>Brewery Name:</b> " + feature.properties.brewery_name + "<br><b>Location:</b> " + feature.properties.city + ", " + feature.properties.state;
                    return L.marker(latlng, {icon: topMarker}).bindPopup(popupContent);
                }
            }).addTo(map);
        }
    })
}

function calcTotalRadius(attValue) {
    var scaleFactor = 5;
    var area = attValue * scaleFactor;
    var radius = Math.sqrt(area/Math.PI);

    return radius;
}

function createTotalSymbols(data, map, attributes){
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
    
}

function updateTotalSymbols(map, attribute) {
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            
            var props = layer.feature.properties;
            
            var radius = calcTotalRadius(props[attribute]);
            layer.setRadius(radius);
            
            var popupContent =  "<br><b>State: </b>" + props.name;
            
            var year = attribute.split("_")[1];
            
            //I truncated the ridership numbers to make them easier to read.
            popupContent += "<p><b>Craft Breweries in " + year + ":</b> " + props[attribute];
            
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,0)
            });
        }
    })
}

function processData(data){

    var attributes = [];
    
    var properties = data.features[0].properties;
    
    for (var attribute in properties){
        if (attribute.indexOf("breweries") > -1){
            attributes.push(attribute);
        }
    }

    return attributes;
}

function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('#reverse').html('<img width="50%" src="lib/images/backward.png">');
    $('#forward').html('<img width="50%" src="lib/images/forward.png">');
    
    $('.range-slider').attr({
        max: 5,
        min: 0,
        value: 0,
        step: 1
    });
};

function pointToLayer(feature, latlng, attributes){

    var attribute = "breweries_2011";
    
    //I chose a red color to make it pop against the grayscale map
    var options = {
        radius: 8,
        fillColor: "#cd2626",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
    };
    
    var attValue = Number(feature.properties[attribute]);
    
    options.radius = calcTotalRadius(attValue);
    
    //creates the circle markers using options above
    var layer = L.circleMarker(latlng, options);
    
    //creates the popup
    var popupContent = "<br><b>State: </b>" + feature.properties.state_name;
    
    //adds the popup info to the circle marker layer
    layer.bindPopup(popupContent);
    
    return layer;
     
}


function getTotalBrewData(map, total){
    $.ajax("data/breweries_state.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
            
            createTotalSymbols(response, map, attributes);
            createSequenceControls(map, attributes);

        }
    })
}


$(document).ready(mapSetup);