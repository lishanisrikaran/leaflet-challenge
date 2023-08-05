/*
This code has been broken down into four digestable sections: 
1) Retreieves the earthquake geojson data and calls a function on it's features array of objects, this function will create circle markers and their popups for each earthquake. 
2) The function called in section 1 is defined.
3) Sets up a function which contains the steps to create a legend that displays the various depth magnitudes and what colors they are depicted by.
4) Creation of the map object. 
*/

// 1)_______________________________________________________________________________________________________________________________________________________________________


// Stores an API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Performs a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
    // Once the response has been received, the data.features object is sent to the createFeatures function.
    createFeatures(data.features);
});


// 2)_______________________________________________________________________________________________________________________________________________________________________


// The below defines the steps which will be taken whenever the createFeatures function is called (with the current code, these will be the steps executed with data.features 
// from the geoJSON). 
function createFeatures(earthquakeData) {

    // Below are [2] nested functions which will be called later in L.geoJSON; they define what is ran once for each feature in the features array:
    
    // 1. Gives each feature a popup that describes the magnitude, the location, and depth of the earthquake.
    function createTooltip(feature, layer) {
        layer.bindPopup(`
        Magnitude: <h3>${feature.properties.mag}</h3><hr><p>
        Place: <h3>${feature.properties.place}</h3><hr></p></h3><p>
        Depth: <h3>${feature.geometry.coordinates[2]}</h3></p>`);
    }
  
    // 2. Steps taken to create a dynamic circle marker based on each feature's entries.
    function createCircleMarker(feature, coordinates) {
       
        // Defines the properties of each circle marker based on the earthquake's magnitude and depth.
        
        let magnitude = feature.properties.mag;

        function getColor(feature) {
            let depth = feature.geometry.coordinates[2];
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

        // Returns a circle marker where the radius and fill color are variable due to their values being populated based off the magnitude and depth in the observed feature. 
        return L.circleMarker(coordinates, {
            radius: magnitude * 5,              // Size of the circle will be dependant on the feature's magnitude.
            fillColor: getColor(feature),       // Color of the circle will be dependant on the feature's depth.
            color: "#000",                      // Circumference color.
            weight: 1,                          // Edge weight.
            opacity: 1,                         // Edge opacity. 
            fillOpacity: 0.9,                   // Circle marker's fill opacity. 
        });
    }

    // Creates a GeoJSON layer with dynamic circle marker's and their popups.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: createTooltip,
        pointToLayer: createCircleMarker
    });
  
    // Sends the earthquakes layer to the createMap function.
    createMap(earthquakes);
}


// 3)_______________________________________________________________________________________________________________________________________________________________________


// Function to create the legend which will explain the color system adopted to visualise depth's magnitude.
function createLegend(map, title) {
    
    legend = L.control({position: "bottomright"});         // Legend position on the map.
    
    legend.onAdd = function (map) {
        let div = L.DomUtil.create("div", "info legend");  // Creates a div with a class called 'info legend'.
        let labels = [];                                   // Array set up to store legend's content. 

        let depthColors = {
            "-10-10": "#7CFC00",
            "10-30": "#ADFF2F",
            "30-50": "#FFD700",
            "50-70": "#FFA500",
            "70-90": "#FF8C00",
            "90+": "#FF0000"
        };

        labels.push(`<b>${title}</b>`);                     // Adds the title to the legend.

        // Loops through the depthColors object and for each key (depth range), and value (color hex), their content and style are appended to the labels array.
        Object.entries(depthColors).forEach(([range, color]) => {
            labels.push(`<i style="background:${color}"></i> ${range}`);
        });


        div.innerHTML = labels.join("<br>");                // Enters the labels array within the div and separates each line with a line break.
        return div;
    };

    legend.addTo(map);                                  // Adds the legend to the map specified. 
}


// 4)_______________________________________________________________________________________________________________________________________________________________________
  

function createMap(earthquakes) {
    
    // Creates the base layers.
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let satellite = L.tileLayer(`https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${TOKEN}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> contributors'
    });
    	
    // Creates a baseMaps object.
    let baseMaps = {
        "Topographic": topo, 
        "Street": street,
        "Satellite": satellite
    };
  
    // Creates the map, giving it the topo and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
            61.2176, -139.8997
        ],
        zoom: 5,
        layers: [topo, earthquakes]
    });

    // Creates a layer control for the end user.
    // Passes in the baseMaps and overlayMaps.
    // Adds the layer control to the map.
    L.control.layers(baseMaps, 
        {Earthquakes: earthquakes},
        {collapsed: false}
    ).addTo(myMap);

    // Calls the function to create the legend with the map just created and gives it the title "Depth".
    createLegend(myMap, "Depth:");

    
    // Whenever the earthquakes overlay is unticked, the legend will also be removed.
    myMap.on("overlayremove", function (eventLayer) {
        if (eventLayer.name === "Earthquakes") {
            if (legend) {
                legend.remove();
            }
        }
    });
    
    // Whenever the earthquakes overlay is ticked, the legend will be added back.
    myMap.on("overlayadd", function (eventLayer) {
        if (eventLayer.name === "Earthquakes") {
            createLegend(myMap, "Depth:");
        }
    });

}

