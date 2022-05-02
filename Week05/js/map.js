// Global variables
let map;
let lat = 47.60923991706992;
let lon = -122.32353071793634;
let zl = 11.4;
let path = 'data/seattleXLClean.csv';
let markers = L.featureGroup();
let markers2 = L.featureGroup();

let csvdata;


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
			// put the data in a global variable
			csvdata = data;

			// call the mapCSV function to map the data
			mapCSV();

            // create sidebar buttons
			// createSidebarButtons();
		}
	});
}

function mapCSV(){

	// loop through every row in the csv data
	csvdata.data.forEach(function(item, index){
		// check to make sure the Latitude column exists
		if(item.INTPTLAT != undefined){

			// Lat exists, so create a circleMarker for each country
            // add 2020 median household income data
            let marker = L.circleMarker([item.INTPTLAT,item.INTPTLON])
            .on('mouseover',function(){
				this.bindPopup(`${item['CENSUSTRACT']}<br>
                                2020 Median Household Income: ${item['2020_MEDHOUSEINC']}`).openPopup()
			}) // show data on hover

			// add the circleMarker to the featuregroup
            markers.addLayer(marker)

            $('.sidebar').append(`<p>${item['CENSUSTRACT']}<br>2020 Median Household Income: ${item['2020_MEDHOUSEINC']}</p>`)
		
            // add 1990 Median Household income data
            let marker2 = L.circleMarker([item.INTPTLAT,item.INTPTLON])
            .on('mouseover',function(){
				this.bindPopup(`${item['CENSUSTRACT']}<br>
                                1990 Median Household Income: ${item['1990_MEDHOUSEINC']}`).openPopup()
			}) // show data on hover

			// add the circleMarker to the featuregroup
            markers2.addLayer(marker2)
        } // end if
	})

	// add the featuregroup to the map
    markers.addTo(map)


    let layers = {
        "Median Household Income 2020" : markers,
        "Median Household Income 1990" : markers2
    }
    
    // add layer control box
    L.control.layers(null,layers).addTo(map)

	// fit the circleMarkers to the map view
    map.fitBounds(markers.getBounds())
}


// function mapCSV(){
//     csvdata.data.forEach(function(item, index){
//         let medInc2020 = L.circleMarker([item.INTPTLAT,item.INTPTLON])
//         .on('mouseover',function(){
//             this.bindPopup(`${item['CENSUSTRACT']}<br>
//                             2020 Median Household Income: ${item['2020_MEDHOUSEINC']}`).openPopup()
//         })

//         markers.addLayer(medInc2020)
//     })  
// }

// function flyToIndex(lat, lon){
// 	map.flyTo([lat,lon],14)
// };


// function createSidebarButtons(){

// 	// put all available dates into an array
// 	// using slice to remove first 4 columns which are not dates
// 	let dates = csvdata.meta.fields.slice(4)

// 	// loop through each date and create a hover-able button
// 	dates.forEach(function(item,index){
// 		$('.sidebar').append(`<div onmouseover="mapCSV('${item}')" class="sidebar-item" title="${item}">${item}</div>`)
// 	})
// }