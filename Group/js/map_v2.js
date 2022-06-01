// Global variables
let map;
let lat = 37.75181513732688;
let lon = -122.20057798867332;
let zl = 4;
let path = '';

// put this in your global variables
let geojson_data;
let geojson_layer;
let geojson_layers = [];

let brew = new classyBrew();

let legend = L.control({ position: 'bottomright' });

let info_panel = L.control();


let geoJsonData = [
	{
		path: 'data/alameda-census-joined-complete.geojson',
		mfi2020: 'Alamedacounty-medianfamilyincome-2020_MedianFamilyIncome_2020',
		mfi1900: 'Alamedacounty-medianfamilyincome-1970_MedianFamilyIncome_1970',
		mhv2020: 'Alamedacounty-medianhousevalue-2020_Medianhousevalue_2020',
		mhv1900: 'Alamedacounty-medianhousevalue-1970_Medianhousevalue_1970',
		code: 385
	},
	{
		path: 'data/Seattle.geojson',
		mfi2020: 'SEATTLE_MHI2020',
		mfi1900: 'SEATTLE_MedianHouseholdIncome1990',
		mhv2020: 'SEATTLE_MHV2020',
		mhv1900: 'SEATTLE_MedianHouseholdValue1990',
		code: 53
	},
	{
		path: 'data/SJ_Joined.geojson',
		mfi2020: 'sccmhi2020_MHI',
		mfi1900: 'sccmhi1990_MHI',
		mhv2020: 'sccmhv2020_MedianValue',
		mhv1900: 'sccmhv1990_MedianValue',
		code: 685
	},
	{
		path: 'data/LA-census-joined.geojson',
		mfi2020: 'LA_mfi_2020_MEDIANFAMILYINCOME_2020',
		mfi1900: 'LA_mfi_1970_MEDIANFAMILYINCOME_1970',
		mhv2020: 'LAcounty_medianhousevalue_2020_MEDIANHOUSEVALUE_2020',
		mhv1900: 'LA-mhv_1970_MEDIANHOUSEVALUE_1970',
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

	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	L.marker([37.75181513732688, -122.20057798867332]).addTo(map); // ringcentral
	L.marker([37.33319057932446, -121.9021293478048]).addTo(map); // sap central
	L.marker([47.59151539946235, -122.33248501522382]).addTo(map); // t-mobile
	L.marker([34.0740376046151, -118.2400334039634]).addTo(map); // dodger stadium
}

// function to get the geojson data
function getGeoJSON(allGeoJsonData) {

	$.getJSON(allGeoJsonData.path, function (data) {
		console.log(data)

		// put the data in a global variable
		geojson_data = data;

		// call the map function
		mapGeoJSON(allGeoJsonData, allGeoJsonData.mfi2020, 6, "Oranges", 'equal_interval') // add a field to be used
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

	geoJsonData["mfi2020"] = field;

	// field = [
	// 	geoJsonData["mfi2020"],
	// 	geoJsonData["mfi1900"],
	// 	geoJsonData["mhv2020"],
	// 	geoJsonData["mhv1900"],
	// ]

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
	}).addTo(map);

	map.fitBounds(geojson_layer.getBounds())

	// create the legend
	createLegend();

	// // create the infopanel

	// for (let i = 0; i < field.length; i++) {
	// 	console.log(field[i])
	// 	createInfoPanel(allData, field[i]);
	// }

	createInfoPanel(allData, field);

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

// create control panel with overlay
var overlays = {
	"Median Family Income 2020" : geoJsonData[0]["mfi2020"],
	"Median Family Income 1900" : geoJsonData[0]["mfi1970"],
	"Median Household Income 2020" : geoJsonData[0]["mhv2020"],
	"Median Household Income 1900" : geoJsonData[0]['mhv1900']
};

//add layer to control panel
L.control.layers(null, overlays).addTo(map);



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
									<br>${"MEDIAN FAMILY INCOME 2020"}: ${properties[allData.mfi2020]}`;
		} else if (properties && allData.code == '385') {
			this._div.innerHTML = `	<b>${properties.NAMELSAD10}</b>
									<br>ALAMEDA COUNTY</br>
									<br>${"MEDIAN FAMILY INCOME 2020"}: ${properties[allData.mfi2020]}`;
		} else if (properties && allData.code == '685') {
			this._div.innerHTML = `	<b>${properties.NAMELSAD}</b>
									<br>SANTA CLARA COUNTY</br>
									<br>${"MEDIAN FAMILY INCOME 2020"}: ${properties[allData.mfi2020]}`;
		} else if (properties && allData.code == '415') {
			this._div.innerHTML = `	<b>${properties.NAMELSAD10}</b>
									<br>LOS ANGELES COUNTY</br>
									<br>${"MEDIAN FAMILY INCOME 2020"}: ${properties[allData.mfi2020]}`;
		} 

		// if feature is not highlighted
		else {
			this._div.innerHTML = 'Hover over a neighborhood';
		}
	};
	info_panel.addTo(map);
}



function navFlyToIndex(lat, lon, index) {
	map.panTo([lat, lon], 8, index)
};

// put iframe of tableau maps into sidebar after clicking on nav bar
// 