// Global variables
let map;
let lat = 47.60923991706992;
let lon = -122.32353071793634;
let zl = 12;
let path = 'data/SeattleXLClean.csv';
let markers = L.featureGroup();
let markers2 = L.featureGroup();
let markers3 = L.featureGroup();
let markers4 = L.featureGroup();

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

	let circleOptions = {
		radius: 7,
		weight: 1,
		color: 'white',
		fillColor: 'dodgerblue',
		fillOpacity: 1
	}

	// loop through every row in the csv data
	csvdata.data.forEach(function(item, index){
		// check to make sure the Latitude column exists
		if(item.INTPTLAT != undefined){

			// Lat exists, so create a circleMarker for each country
            // add 2020 median household income data
            let marker = L.circleMarker([item.INTPTLAT,item.INTPTLON], circleOptions)
            .on('mouseover',function(){
				this.bindPopup(`${item['CENSUSTRACT']}<br>
								King County <br>
                                2020 Median Household Income: ${item['2020_MEDHOUSEINC']}`).openPopup()
			}) // show data on hover

			// add the circleMarker to the featuregroup
            markers.addLayer(marker)
			
		
            // add 1990 Median Household income data
            let marker2 = L.circleMarker([item.INTPTLAT,item.INTPTLON])
            .on('mouseover',function(){
				this.bindPopup(`${item['CENSUSTRACT']}<br>
                                1990 Median Household Income: ${item['1990_MEDHOUSEINC']}`).openPopup()
			}) // show data on hover

			// add the circleMarker to the featuregroup
            markers2.addLayer(marker2)
			

			// add 1990 median house value
			let marker3 = L.circleMarker([item.INTPTLAT,item.INTPTLON])
            .on('mouseover',function(){
				this.bindPopup(`${item['CENSUSTRACT']}<br>
                                1990 Median House Value: ${item['1990_MEDHOUSEVAL']}`).openPopup()
			}) 
            markers3.addLayer(marker3)
			

			// add 2020 median house value 
			let marker4 = L.circleMarker([item.INTPTLAT,item.INTPTLON])
            .on('mouseover',function(){
				this.bindPopup(`${item['CENSUSTRACT']}<br>
                                2020 Median House Value: ${item['2020_MEDHOUSEVAL']}`).openPopup()
			}) 

		
            markers4.addLayer(marker4)

			// $('.sidebar').append(`<p>${item['CENSUSTRACT']}<br>2020 Median Household Income: ${item['2020_MEDHOUSEINC']}</p>`)
			
			$('.sidebar').append(`<div class="sidebar-item" onclick="flyToIndex(${index})">${item.CENSUSTRACT}</div>`)

			$('.sidebar-item').hover(function(){
				$(this).css('background-color', 'yellow');
			}, function(){
				$(this).css("background-color", "#f1f1f1");
			});

        } // end if

	})

	// add the featuregroup to the map
    markers.addTo(map)
	// markers2.addTo(map)


    let layers = {
        "Median Household Income in 2020" : markers,
        "Median Household Income in 1990" : markers2,
		"Median House Value in 1990" : markers3,
		"Median House Value in 2020" : markers4
     }
    
    // add layer control box
    L.control.layers(null,layers).addTo(map)

	// add side by side comparison
	// L.control.sideBySide(markers, markers2).addTo(map);

	// fit the circleMarkers to the map view
    map.fitBounds(markers.getBounds())
}



function navFlyToIndex(lat,lon){
	map.flyTo([lat,lon],12)
	// map.flyTo([].INTPTLAT,data[indexdata[index].INTPTLON],12)

    // // open the popup
	// myMarkers.getLayers()[index].openPopup()
};

function flyToIndex(index){
	map.setZoom(17);
	map.flyTo(markers.getLayers()[index]._latlng);
}

// function createSidebarButtons(){

// 	// put all available dates into an array
// 	// using slice to remove first 4 columns which are not dates
// 	let dates = csvdata.meta.fields.slice(4)

// 	// loop through each date and create a hover-able button
// 	dates.forEach(function(item,index){
// 		$('.sidebar').append(`<div onmouseover="mapCSV('${item}')" class="sidebar-item" title="${item}">${item}</div>`)
// 	})
// }