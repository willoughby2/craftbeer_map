/* eslint-disable no-console */
/*eslint-env browser*/
L.map = function (id, options) {
    return new L.Map(id, options);
};

function mapSetup(){
    // set the view for the contiguous United States
    var map = L.map('mapid').setView([34.45, -96.77], 4);

    //I chose mapbox.light map since its grayscale would all my icons to stand out. 
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1Ijoid2lsbG91Z2hieTIiLCJhIjoiY2lzc2J5aWtpMDc2ODJ5cGh5MTlxNjczeSJ9.7FKJ5Mye4bhoImWAeCRhZg'
    }).addTo(map);
    
    getData(map);
    
    getTopBrewData(map);
    
    getTotalBrewData(map);
    
    var overlayLayers = {
        "StateBreweries": total,
        "TopBreweries": top
    };
    
    L.control.layers(overlayLayers).addTo(map);
}

function getData(map){
    $.ajax({
        dataType: "json",
        url: "data/beer_consumption2.geojson",
        interactive: false,
        success: function(response){
                var rewind = geojsonRewind(response, clockwise);
                L.geoJSON(rewind).addTo(map);
                console.log(rewind);
        }
    });
}

function getTopBrewData(map, top){
    $.ajax("data/topbreweries.geojson", {
        dataType: "json",
        success: function(response){
            var topMarker = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            
            var top = L.geoJSON(response, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, topMarker);
                }
            });
        }
    })
}

function getTotalBrewData(map, total){
    $.ajax("data/breweries_state.geojson", {
        dataType: "json",
        success: function(response){
            var totalMarker = {
                radius: 8,
                fillColor: "yellow",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }
            
            var total = L.geoJSON(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, totalMarker);
                }
            }).addTo(map);
        }
    })
}


$(document).ready(mapSetup);