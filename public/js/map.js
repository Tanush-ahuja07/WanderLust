document.addEventListener('DOMContentLoaded', function () {
  var mapDiv = document.getElementById('map');
  var latitude = mapDiv.dataset.latitude;
  var longitude = mapDiv.dataset.longitude;

  var map = L.map('map').setView([latitude, longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  L.marker([latitude, longitude]).addTo(map)
    .bindPopup(`<h4>${listing.title}</h4>Location will be provided after booking`)
    .openPopup();
});
