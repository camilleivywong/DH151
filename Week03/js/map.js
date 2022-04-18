// let's create some data
let data = [
    {
        'id' : 1,
        'title': 'The Oakland Alameda Coliseum',
        'description': "Home to the Oakland A's, I went to this stadium many times as a teen to watch games on fireworks night.",
        'lat': 37.75180665435585, 
        'lon': -122.2003634116433,
        'url': "https://lh5.googleusercontent.com/p/AF1QipNG3JDvGHfkSKFpViYSzceA55AMP7H_BQ_O3VMC=w444-h240-k-no",
    },
    {
        'id' : 2,
        'title': 'Estadio Azteca',
        'description': "I saw a football game here in August 2021 while visiting Mexico City.",
        'lat': 19.305151998203126,
        'lon': -99.15110696588069,
        'url': 'https://lh5.googleusercontent.com/p/AF1QipPYGzXyvrer0jSzccDvWjK1gMWdK29JkwNxdKbB=w426-h240-k-no',
    },
    {
        'id' : 3,
        'title': 'Staples Center',
        'description': "I recently saw a game here with the Lakers. Lebron is much taller than the rest of the players.",
        'lat': 34.04319247255241,
        'lon': -118.26732751542133,
        'url': "https://lh5.googleusercontent.com/p/AF1QipOibv6SAgWSWlJrtMurNHKA1lPBqw52gMK2Chyh=w408-h306-k-no",
    },
    {
        'id' : 4,
        'title': 'SoFi Stadium',
        'description': "The most futuristic stadium I've ever been to. Privately funded at $5 billion dollars, this is the most expensive stadium to date and it shows.",
        'lat': 33.953634170543246, 
        'lon': -118.33902887309414,
        'url': 'https://lh5.googleusercontent.com/p/AF1QipMbfcU1KmOegQd67QHxU2oec_QXswMwz7RpW-nG=w408-h306-k-no',
    },
    {
        'id' : 5,
        'title': 'T-Mobile Park',
        'description': "In July, I'll be going to a Blue Jays game where they'll play against the Mariners.",
        'lat': 47.59154729235125, 
        'lon': -122.33248704392236,
        'url': "https://lh5.googleusercontent.com/p/AF1QipNjc-p-alwmfwAgcjaNP3u9147MtVm4V58O2tND=w552-h240-k-no",
    }
]

let map = L.map('map').setView([0,0], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let myMarkers = L.featureGroup();

// loop through data
data.forEach(function(item, index){
    let marker = L.marker([item.lat,item.lon]).addTo(map)
        .bindPopup(`<h2>${item.title}</h2><p>${item.description}</p><div class="image-box"><img src=${item.url} width="300" height="300"></div>`);

        // add data to sidebar
        $('.sidebar').append(`<div class="sidebar-item" onclick="flyToIndex(${index})">${item.title}</div>`)

        $('.sidebar-item').hover(function(){
            $(this).css('background-color', 'yellow');
        }, function(){
            $(this).css("background-color", "gainsboro");
        });

}); 

myMarkers.addTo(map)

// define layers
let layers = {
	"My Markers": myMarkers
}

// add layer control box
L.control.layers(null,layers).addTo(map)

// make the map zoom to the extent of markers
map.fitBounds(myMarkers.getBounds());


function flyToIndex(index){
	map.flyTo([data[index].lat,data[index].lon],12)

    // open the popup
	myMarkers.getLayers()[index].openPopup()
}

function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.body.style.gridTemplateColumns = "250px";
  }
  
  function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.body.style.gridTemplateColumns= "0px";
  }