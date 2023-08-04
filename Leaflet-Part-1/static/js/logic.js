// Stores an API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Performs a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
    // Once the response has been received, the data.features object is sent to the createFeatures function.
    createFeatures(data.features);
  });
  
  // The below defines the steps which will be taken whenever the createFeatures function is called (with the current code, these will be the steps executed with data.features from our JSON). 
  function createFeatures(earthquakeData) {

    // Below are [2] nested functions which will be called later in L.geoJSON; they define what is ran once for each feature in the features array:
    
    // 1. Gives each feature a popup that describes the magnitude, the location, and depth of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`
      Magnitude: <h3>${feature.properties.mag}</h3><hr>
      <p>Place: <h3>${feature.properties.place}</h3><hr></p>
      </h3><p>Depth: <h3>${feature.geometry.coordinates[2]}</h3></p>`);
    }
  
    // 2. Gives each feature a circle marker using its' coordinates.
    function createCircleMarker(feature, coordinates) {
        // Define the properties of each circle marker based on earthquake's magnitude.
        let magnitude = feature.properties.mag;

        return L.circleMarker(coordinates, {
            radius: magnitude * 5,
            fillColor: "green",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9,
        });
    }

    // Create a GeoJSON layer with the popups and circle markers.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
  }
  
  
  