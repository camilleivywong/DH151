// Global variables
let map;
let lat = 37.75181513732688;
let lon = -122.20057798867332;
let zl = 4;
let path = '';

// put this in your global variables
// let geojsonPath = 'data/alameda-census-joined-complete.geojson';
let geojson_data;
// let geojson_data_right;
let geojson_layer;
let geojson_layers = [];

let brew = new classyBrew();

let legend = L.control({ position: 'bottomright' });

let info_panel = L.control();


let geoJsonData = [
	{
		path: 'data/alameda-census-joined-complete.geojson',
		mfi: 'Alamedacounty-medianfamilyincome-2020_MedianFamilyIncome_2020',
		code: 385
	},
	{
		path: 'data/Seattle.geojson',
		mfi: 'SEATTLE_MHI2020',
		code: 53
	},
	{
		path: 'data/SJ_Joined.geojson',
		mfi: 'sccmhi2020_MHI',
		code: 685
	},
	{
		path: 'data/LA-census-joined.geojson',
		mfi: 'LA_mfi_2020_MEDIANFAMILYINCOME_2020',
		code: 415
	}
];

// let tool_tip = L.tooltip();

// initialize
$(document).ready(function () {
	createMap(lat, lon, zl);
	geojson_layer = L.geoJSON().addTo(map);

	getGeoJSON(geoJsonData[0]);

	// for (let i = 0; i < geoJsonData.length; i++) {
	// 	console.log(geoJsonData[i])
	// 	getGeoJSON(geoJsonData[i]);
	// }
});

// create the map
function createMap(lat, lon, zl) {
	map = L.map('map').setView([lat, lon], zl);

	//create side by side panel
	map.createPane('left');
	map.createPane('right');

	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	L.marker([37.75181513732688, -122.20057798867332]).addTo(map);
}

// function to get the geojson data
function getGeoJSON(allGeoJsonData) {

	$.getJSON(allGeoJsonData.path, function (data) {
		console.log(data)

		// put the data in a global variable
		geojson_data = data;

		// call the map function
		mapGeoJSON(allGeoJsonData, allGeoJsonData.mfi, 6, "Oranges", 'equal_interval') // add a field to be used
	})
}

function mapGeoJSON(allData, field, num_classes, color, scheme) {

	// clear layers in case it has been mapped already
	if (geojson_layer) {
		geojson_layer.clearLayers()
	}

	// globalize the field to map
	// fieldtomap = field;

	// create an empty array
	let values = [];

	// based on the provided field, enter each value into the array
	geojson_data.features.forEach(function (item, index) {
		values.push(item.properties[field])
	})

	geoJsonData["mfi"] = field;

	// set up the "brew" options
	brew.setSeries(values);
	brew.setNumClasses(num_classes);
	brew.setColorCode(color);
	brew.classify(scheme);


	// create the geojson layer and add to map
	geojson_layer = L.geoJson(geojson_data, {
		style: function (feature) {
			// console.log("helloooOoooOO")
			return {
				stroke: true,
				color: 'white',
				weight: 1,
				fill: true,
				fillColor: brew.getColorInRange(feature.properties[field]),
				fillOpacity: 0.8
			}
		}, //call a function to style each feature
		onEachFeature: onEachFeature, // actions on each feature
		pane: 'left' //put data on left pane
	}).addTo(map);

	// geojson_layer.addData(geojson_data);
	// geojson_layer.setStyle({
	// 	style: function (feature) {
	// 		console.log("helloooOoooOO")
	// 		return {
	// 			stroke: true,
	// 			color: 'white',
	// 			weight: 1,
	// 			fill: true,
	// 			fillColor: brew.getColorInRange(feature.properties[field]),
	// 			fillOpacity: 0.8
	// 		}
	// 	}, //call a function to style each feature
	// 	onEachFeature: onEachFeature, // actions on each feature
	// 	pane: 'left' //put data on left pane
	// })


	map.fitBounds(geojson_layer.getBounds())

	// create the legend
	createLegend();

	// // create the infopanel
	createInfoPanel(allData, field);

	// createTooltip();

}

function getStyle(feature) {
	return {
		stroke: true,
		color: 'white',
		weight: 1,
		fill: true,
		fillColor: brew.getColorInRange(feature.properties[fieldtomap]),
		fillOpacity: 0.8
	}
}

function createLegend() {
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
			breaks = brew.getBreaks(),
			labels = [],
			from, to;

		for (var i = 0; i < breaks.length; i++) {
			from = breaks[i];
			to = breaks[i + 1];
			if (to) {
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

function createInfoPanel(allData, fieldName) {
	console.log('data: ', allData);
	info_panel.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info_panel.update = function (properties) {
		// if feature is highlighted
		if (properties && allData.code == '53') {
			this._div.innerHTML = `	<b>${properties.NAMELSAD}</b>
									<br>KING COUNTY</br>
									<br>${"MEDIAN FAMILY INCOME 2020"}: ${properties[allData.mfi]}`;
		} else if (properties && allData.code == '385') {
			this._div.innerHTML = `	<b>${properties.NAMELSAD10}</b>
									<br>ALAMEDA COUNTY</br>
									<br>${"MEDIAN FAMILY INCOME 2020"}: ${properties[allData.mfi]}`;
		} else if (properties && allData.code == '685') {
			this._div.innerHTML = `	<b>${properties.NAMELSAD}</b>
									<br>SANTA CLARA COUNTY</br>
									<br>${"MEDIAN FAMILY INCOME 2020"}: ${properties[allData.mfi]}`;
		} else if (properties && allData.code == '415') {
			this._div.innerHTML = `	<b>${properties.NAMELSAD10}</b>
									<br>LOS ANGELES COUNTY</br>
									<br>${"MEDIAN FAMILY INCOME 2020"}: ${properties[allData.mfi]}`;
		} 

		// if feature is not highlighted
		else {
			this._div.innerHTML = 'Hover over a neighborhood';
		}
	};

	info_panel.addTo(map);

}

// L.control.sideBySide(geojson_data, geojson_data_right).addTo(map);

// function createTooltip() {
// 	tool_tip.onAdd = function (map) {
// 		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
// 		this.update();
// 		return this._div;
// 	};

// 	// method that we will use to update the control based on feature properties passed
// 	tool_tip.update = function (properties) {
// 		// if feature is highlighted
// 		if (properties) {
// 			this._div.innerHTML = `	<b>${properties.STATEFP10}</b>
// 									<br>${fieldtomap}: ${properties[fieldtomap]}`;
// 		}
// 		// if feature is not highlighted
// 		else {
// 			this._div.innerHTML = 'Hover over a neighborhood';
// 		}
// 	};

// 	tool_tip.addTo(map);
// }

function navFlyToIndex(lat, lon, index) {
	map.panTo([lat, lon], 8, index)
};
