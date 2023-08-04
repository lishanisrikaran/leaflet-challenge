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
  
    // 2. Gives each feature a circle marker with dynamic styling.
    function createCircleMarker(feature, coordinates) {
       
        // Defines the properties of each circle marker based on the earthquake's magnitude and depth.
       
       
        let magnitude = feature.properties.mag;

        // Conditionals for earthquake depth.
        function getColor(feature) {

            let depth = feature.geometry.coordinates[2]

                let color = "";
                if (depth > 90) {
                    color = "#FF0000";
                }
                else if (depth > 70) {
                    color = "#FF8C00";
                }
                else if (depth > 50) {
                    color = "#FFA500";
                }
                else if (depth > 30) {
                    color = "#FFD700";
                }
                else if (depth > 10) {
                    color = "#ADFF2F";
                }
                else {
                    color = "#7CFC00";
                }

            return color;
        }


        return L.circleMarker(coordinates, {
            radius: magnitude * 5,
            fillColor: getColor(feature),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9,
        });
    }

    // Creates a GeoJSON layer with dynamic circle marker popups and styling.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker

    });
  
    // Sends the earthquakes layer to the createMap function.
    createMap(earthquakes);
}
  
function createMap(earthquakes) {
  
    // Creates the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Creates a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };
  
    // Creates an overlay object to hold the overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };
  
    // Creates the map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
            61.2176, -139.8997
        ],
        zoom: 5,
        layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Passes in the baseMaps and overlayMaps.
    // Adds the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
  
  }
  
  