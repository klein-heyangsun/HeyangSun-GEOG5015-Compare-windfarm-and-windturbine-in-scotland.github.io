// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoiaGV5YW5nc3VuIiwiYSI6ImNscjZkd2l6eTBmeXoybnBhb2tmbHFjeDcifQ.HzTJfoben4NL-5uwY6kWYQ";

//Before map
const windfarm = new mapboxgl.Map({
  container: "windfarm",
  style: "mapbox://styles/heyangsun/cls0g1y4f009n01qle64q0nq6",
  center: [-3.52208, 58.3936], // change to your centre
  zoom: 8
});

//After map
const windturble = new mapboxgl.Map({
  container: "windturble",
  style: "mapbox://styles/heyangsun/cls0fvjf600zh01qyhk7ab59u",
  center: [-3.52208, 58.3936], // change to your centre
  zoom: 8
});

const container = "#comparison-container";
const map = new mapboxgl.Compare(windfarm, windturble, container, {});

//create windfarm legend
windfarm.on("load", () => {
  const windfarm_layers = ["<300k", "600k", "900k", "1.2m", "1.5m", ">1.8m"];
  const windfarm_colors = [
    "#a5dbc7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061"
  ];

  const windfarm_legend = document.getElementById("windfarm-legend");

  windfarm_layers.forEach((layer, i) => {
    const color = windfarm_colors[i];
    const key = document.createElement("div");
    //place holder
    key.className = "windfarm-legend-key";
    key.style.backgroundColor = color;
    key.innerHTML = `${layer}`;

    windfarm_legend.appendChild(key);

    if (i < 3) {
      key.style.color = "black";
    } else {
      key.style.color = "white";
    }
  });
});

windturble.on("load", () => {
  const windfarm_layers = ["<1.5k", "3k", "4.5k", "6k", "7k", ">8.5km"];
  const windfarm_colors = [
    "#ffdbc7",
    "#f4a587",
    "#d6604d",
    "#b2182b",
    "#67001f",
    "#2e000e"
  ];

  const windfarm_legend = document.getElementById("windturbine-legend");

  windfarm_layers.forEach((layer, i) => {
    const color = windfarm_colors[i];
    const key = document.createElement("div");
    //place holder
    key.className = "windturbine-legend-key";
    key.style.backgroundColor = color;
    key.innerHTML = `${layer}`;

    windfarm_legend.appendChild(key);

    if (i < 3) {
      key.style.color = "black";
    } else {
      key.style.color = "white";
    }
  });
});

windfarm.on("load", function () {
  windfarm.addLayer({
    id: "highlight-layer",
    type: "line",
    source: "windfarm-scotland",
    layout: {},
    paint: {
      "line-color": "#000", // black frame
      "line-width": 3 // frame width
    },
    filter: ["in", "NAME", ""] // orginal filter
  });
});

windfarm.on("mousemove", (event) => {
  const dzone = windfarm.queryRenderedFeatures(event.point, {
    layers: ["windfarm-scotland"]
  });

  if (dzone.length) {
    document.getElementById(
      "hv-windfarm"
    ).innerHTML = `<h3>Windfarm Name: ${dzone[0].properties.NAME}</h3><p>Renewable Power: <strong>${dzone[0].properties.RENEWABLES}</strong> kWh</p>
    <p>Shape Area: ${dzone[0].properties.Shape_Area}m\u00B2</p>`;

    // reload layer filter to find new highlight area
    windfarm.setFilter("highlight-layer", [
      "in",
      "NAME",
      dzone[0].properties.NAME
    ]);
  } else {
    document.getElementById(
      "hv-windfarm"
    ).innerHTML = `<p>Hover over a data zone!</p>`;
    // remove highlight
    windfarm.setFilter("highlight-layer", ["in", "NAME", ""]);
  }
});

const initialPoint = {
  center: windturble.getCenter(),
  zoom: windturble.getZoom()
};

windturble.on("click", (event) => {
  // If the user clicked on one of your markers, get its information.
  const features = windturble.queryRenderedFeatures(event.point, {
    layers: ["wind-turbines"] // replace with your layer name
  });
  if (!features.length) {
    windturble.flyTo(initialPoint);
  }
  const feature = features[0];

  const infoPanel = document.getElementById("hv-windturbine");
  infoPanel.innerHTML = `<h3>Affiliate with: ${feature.properties.Site_Name}</h3><p>Power: ${feature.properties.kW} kW</p>
  <p>Turbine Height: ${feature.properties.Blade_Top}m</p>`;

  windturble.flyTo({
    center: feature.geometry.coordinates,
    zoom: 10,
    speed: 1, // move speed
    curve: 1, // move curve
    easing: (t) => t // the function of moderator
  });
});

//add position control
const navControl = new mapboxgl.NavigationControl();
windfarm.addControl(navControl, "top-left");
document
  .querySelector(".mapboxgl-ctrl-top-left")
  .classList.add("custom-top-left");

//add geometry function
const geoLocateControl = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true,
  showUserHeading: true
});
windfarm.addControl(geoLocateControl, "top-left");

//add geocoder
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
  placeholder: "Search for places in Glasgow",
  proximity: {
    longitude: 55.8642,
    latitude: 4.2518
  }
});
windfarm.addControl(geocoder, "top-left");
// 地理编码器可能需要特别的处理，因为它可能有自己的容器
