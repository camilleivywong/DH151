// Global variables
let map;
let lat = 47.60923991706992;
let lon = -122.32353071793634;
let zl = 12;

let path = "data/SeattleXLClean.csv";

let markers = L.featureGroup();

// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
	readCSV(path);
});

// create the map
function createMap(lat,lon,zl){
	map = L.map('map').setView([lat,lon], zl);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

// function to read csv data
function readCSV(path){
	Papa.parse(path, {
		header: true,
		download: true,
		complete: function(data) {
			console.log(data);
			
			// map the data
			mapCSV(data);

		}
	});
}

function mapCSV(data){
	
	// circle options
	let circleOptions = {
		radius: 6,
		weight: 1,
		color: 'white',
		fillColor: 'dodgerblue',
		fillOpacity: 1
	}

	// loop through each entry
	data.data.forEach(function(item,index){
		// create marker
		let marker = L.circleMarker([item.INTPTLAT,item.INTPTLON],circleOptions)
		
		.on('mouseover',function(){
			this.bindPopup(`${item.CENSUSTRACT}<br>
							King County <br>
							2020 Median Household Income: ${item['2020_MEDHOUSEINC']}`).openPopup()
		})

		// add marker to featuregroup		
		markers.addLayer(marker)

		// add entry to sidebar
		$('.sidebar').append(`<div class="sidebar-item" onclick="flyToIndex(${index})">${item.CENSUSTRACT}</div>`)

		$('.sidebar-item').hover(function(){
			$(this).css('background-color', 'yellow');
		}, function(){
			$(this).css("background-color", "#f1f1f1");
		});
	})

	// add featuregroup to map
	markers.addTo(map)

	// fit markers to map
	map.fitBounds(markers.getBounds())
}

function flyToIndex(index){
	map.setZoom(17);
	map.flyTo(markers.getLayers()[index]._latlng);
}

// function panToImage(index){
// 	// zoom to level 17 first
// 	map.setZoom(17);
// 	// pan to the marker
// 	map.panTo(markers.getLayers()[index]._latlng);
// }