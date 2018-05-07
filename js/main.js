/* eslint-disable no-console */
/*eslint-env browser*/

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
            }).addTo(map);
            top.bringToFront();
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