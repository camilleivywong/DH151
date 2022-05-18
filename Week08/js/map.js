let map;
let lat = 0;
let lon = 0;
let zl = 3;

// let path = '';

let markers = L.featureGroup();
let jsondata;

$( document ).ready(function() {
    createMap(lat,lon,zl);
	getJSON();
});

// create the map
function createMap(lat,lon,zl){
	map = L.map('map').setView([lat,lon], zl);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

function getJSON(){
	$.getJSON('https://data.lacity.org/resource/2nrs-mtv8.json?$order=date_rptd%20desc',function(data){
		console.log(data)
		jsondata = data;
		mapJSON()
	})
}

function mapJSON(data){
    // circle options
	let circleOptions = {
		radius: 6,
		weight: 1,
		color: 'white',
		fillColor: 'dodgerblue',
		fillOpacity: 1
	}
    
    filtered_data.forEach(function(item, index){
        let marker = L.circleMarker([item.lat, item.long], circleOptions)
    })
    
}