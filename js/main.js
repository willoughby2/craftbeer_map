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
}

function getData(map){
    var consumption = new L.geoJSON();
    consumption.addTo(map);
    
    $.ajax({
        dataType: "json",
        url: "data/beerconsumption.geojson",
        success: function(data){
            $(data.features).each(function(key, data) {
                consumption.addData(data);
            });
        }
    });
}

$(document).ready(mapSetup);