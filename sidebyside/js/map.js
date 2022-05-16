// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 3;
let path = '';

// put this in your global variables
let geojsonPath = 'data/alameda-census-joined-complete.geojson';
let geojsonPath2 = 'data/alameda-census-joined-complete.geojson';
let geojson_data_left;
let geojson_data_right;
let geojson_layer;
let geojson_layer2;

let brew = new classyBrew();

let legend = L.control({position: 'bottomleft'});
let legend2 = L.control({position: 'bottomright'});

let info_panel = L.control();
let info_panel2 = L.control();

let tool_tip = L.tooltip();

// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
    getGeoJSON();
    getGeoJSON2();
});

// create the map
function createMap(lat,lon,zl){
	map = L.map('map').setView([lat,lon], zl);

	//create side by side panel
	map.createPane('left');
	map.createPane('right');

	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

    L.marker([37.75181513732688, -122.20057798867332]).addTo(map);
}

// function to get the geojson data
function getGeoJSON(){

	$.getJSON(geojsonPath,function(data){
		console.log(data)

		// put the data in a global variable
		geojson_data_left = data;

		// call the map function
		mapGeoJSON('Alamedacounty-medianfamilyincome-1970_MedianFamilyIncome_1970') // add a field to be used
	})
}

function mapGeoJSON(field){

	// clear layers in case it has been mapped already
	if (geojson_layer){
		geojson_layer.clearLayers()
	}
	
	// globalize the field to map
	fieldtomap = field;

	// create an empty array
	let values = [];

	// based on the provided field, enter each value into the array
	geojson_data_left.features.forEach(function(item,index){
		values.push(item.properties[field])
	})

	// set up the "brew" options
	brew.setSeries(values);
	brew.setNumClasses(6);
	brew.setColorCode('Oranges');
	brew.classify('equal_interval');


	// create the geojson layer and add to map
	geojson_layer = L.geoJson(geojson_data_left, {
		style: getStyle, //call a function to style each feature
        onEachFeature: onEachFeature, // actions on each feature
		pane: 'left' //put data on left pane
	}).addTo(map);

	
	map.fitBounds(geojson_layer.getBounds())

    // create the legend
    createLegend();

    // // create the infopanel
	createInfoPanel();

	createTooltip();

}

function getStyle(feature){
	return {
		stroke: true,
		color: 'white',
		weight: 1,
		fill: true,
		// fillColor: getColor(feature.properties['Alamedacounty-medianhousevalue-2020 _v2_Median Value']), // instead of a single color, make it based on the population value!
		fillColor: brew.getColorInRange(feature.properties[fieldtomap]),
		fillOpacity: 0.8
	}
}

// Function that defines what will happen on user interactions with each feature
function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});

	// layer.bindTooltip(
	// 	`<b>${properties.STATEFP10}</b>
	// 	<br>${fieldtomap}: ${properties[fieldtomap]}`
	// ).addTo(map);
}

// on mouse over, highlight the feature
function highlightFeature(e) {
	var layer = e.target;

	// style to use on mouse over
	layer.setStyle({
		weight: 2,
		color: '#666',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

    info_panel.update(layer.feature.properties)

}

// on mouse out, reset the style, otherwise, it will remain highlighted
function resetHighlight(e) {
	geojson_layer.resetStyle(e.target);

    info_panel.update() // resets infopanel
}

// on mouse click on a feature, zoom in to it
function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function createInfoPanel(){

	info_panel.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info_panel.update = function (properties) {
		// if feature is highlighted
		if(properties){
			this._div.innerHTML = `	<b>${properties.NAMELSAD10}</b>
									<br>${fieldtomap}: ${properties[fieldtomap]}`;
		}
		// if feature is not highlighted
		else
		{
			this._div.innerHTML = 'Hover over a neighborhood';
		}
	};

	info_panel.addTo(map);

}

//create overlay for left panel

// let overlay1970 = L.geoJson(field, {
//     style: getStyle,
//     pane: 'left',
//     onEachFeature: onEachFeature
// }).addTo(map);


function createLegend(){
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
		breaks = brew.getBreaks(),
		labels = [],
		from, to;
		
		for (var i = 0; i < breaks.length; i++) {
			from = breaks[i];
			to = breaks[i + 1];
			if(to) {
				labels.push(
					'<i style="background:' + brew.getColorInRange(from) + '"></i> ' +
					from.toFixed(2) + ' &ndash; ' + to.toFixed(2));
				}
			}
			
			div.innerHTML = labels.join('<br>');
			return div;
		};
		
		legend.addTo(map);
}




//right pane

function getGeoJSON2(){

	$.getJSON(geojsonPath2,function(data){
		console.log(data)

		// put the data in a global variable
		geojson_data_right = data;

		// call the map function
		mapGeoJSON2('Alamedacounty-medianfamilyincome-2020_MedianFamilyIncome_2020') // add a field to be used
	})
}

function mapGeoJSON2(field2){

	// clear layers in case it has been mapped already
	if (geojson_layer2){
		geojson_layer2.clearLayers()
	}
	
	// globalize the field to map
	fieldtomap2 = field2;

	// create an empty array
	let values2 = [];

	// based on the provided field, enter each value into the array
	geojson_data_right.features.forEach(function(item,index){
		values2.push(item.properties[field2])
	})

	// set up the "brew" options
	brew.setSeries(values2);
	brew.setNumClasses(6);
	brew.setColorCode('Oranges');
	brew.classify('equal_interval');


	// create the geojson layer and add to map
	geojson_layer2 = L.geoJson(geojson_data_right, {
		style: getStyle2, //call a function to style each feature
        onEachFeature: onEachFeature2, // actions on each feature
		pane: 'right' //put data on left pane
	}).addTo(map);

	
	map.fitBounds(geojson_layer2.getBounds())

    // create the legend
    createLegend2();

    // // create the infopanel
	createInfoPanel2();

	// createTooltip();

}

function getStyle2(feature){
	return {
		stroke: true,
		color: 'white',
		weight: 1,
		fill: true,
		// fillColor: getColor(feature.properties['Alamedacounty-medianhousevalue-2020 _v2_Median Value']), // instead of a single color, make it based on the population value!
		fillColor: brew.getColorInRange(feature.properties[fieldtomap]),
		fillOpacity: 0.8
	}
}

function createLegend2(){
	legend2.onAdd = function (map) {
		var div2 = L.DomUtil.create('div', 'info legend'),
		breaks2 = brew.getBreaks(),
		labels2 = [],
		from2, to2;
		
		for (var i = 0; i < breaks2.length; i++) {
			from = breaks2[i];
			to = breaks2[i + 1];
			if(to) {
				labels2.push(
					'<i style="background:' + brew.getColorInRange(from) + '"></i> ' +
					from2.toFixed(2) + ' &ndash; ' + to2.toFixed(2));
				}
			}
			
			div.innerHTML = labels2.join('<br>');
			return div2;
		};
		
		legend2.addTo(map);
}

// Function that defines what will happen on user interactions with each feature
function onEachFeature2(feature, layer) {
	layer.on({
		mouseover: highlightFeature2,
		mouseout: resetHighlight2,
		click: zoomToFeature2
	});

	// layer.bindTooltip(
	// 	`<b>${properties.STATEFP10}</b>
	// 	<br>${fieldtomap}: ${properties[fieldtomap]}`
	// ).addTo(map);
}

// on mouse over, highlight the feature
function highlightFeature2(e) {
	var layer = e.target;

	// style to use on mouse over
	layer.setStyle({
		weight: 2,
		color: '#666',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

    info_panel.update(layer.feature.properties)

}

// on mouse out, reset the style, otherwise, it will remain highlighted
function resetHighlight2(e) {
	geojson_layer2.resetStyle(e.target);

    info_panel.update() // resets infopanel
}

// on mouse click on a feature, zoom in to it
function zoomToFeature2(e) {
	map.fitBounds(e.target.getBounds());
}

function createInfoPanel2(){

	info_panel2.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info_panel2.update = function (properties) {
		// if feature is highlighted
		if(properties){
			this._div.innerHTML = `	<b>${properties.NAMELSAD10}</b>
									<br>${fieldtomap}: ${properties[fieldtomap]}`;
		}
		// if feature is not highlighted
		else
		{
			this._div.innerHTML = 'Hover over a neighborhood';
		}
	};

	info_panel2.addTo(map);

}


L.control.sideBySide(geojson_data_left, geojson_data_right).addTo(map);


function createTooltip(){
	tool_tip.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	tool_tip.update = function (properties) {
		// if feature is highlighted
		if(properties){
			this._div.innerHTML = `	<b>${properties.STATEFP10}</b>
									<br>${fieldtomap}: ${properties[fieldtomap]}`;
		}
		// if feature is not highlighted
		else
		{
			this._div.innerHTML = 'Hover over a neighborhood';
		}
	};

	tool_tip.addTo(map);
}

function navFlyToIndex(lat,lon){
	map.flyTo([lat,lon],12)
};

//to do: rename properties without spaces and numbers
//how to add multiple layers on a map
//classybrew with data that contains symsbols "$" + ","
//binding popup
//leaflet side by side