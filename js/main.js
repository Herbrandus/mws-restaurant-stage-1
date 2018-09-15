/* General script for homepage of Restaurant Reviews */
/* written by Gerben Boersma */

let restaurants;
let neighborhoods;
let cuisines;
var newMap;
var markers = [];


/*  Fetch neighborhoods and cuisines as soon as the page is loaded.
 * 
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();

  // insert current year for copyright
  document.querySelector('#yr').innerHTML = new Date().getFullYear();
});


/*  Fetch all neighborhoods and set their HTML.
 * 
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}


/*  Set neighborhoods HTML.
 * 
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}


/*  Fetch all cuisines and set their HTML.
 * 
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}


/*  Set cuisines HTML.
 * 
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}


/*  Initialize leaflet map, called from HTML.
 * 
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiZ2Vib2Vyc21hIiwiYSI6ImNqbTB6cnJnYjJhM3Eza3F2MnZpMTd3NnQifQ._dUm64nyRbDTb6HpVJgqOA',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}


/*  Update page and map for current restaurants.
 * 
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}


/*  Clear current restaurants, their HTML and remove their map markers.
 * 
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}


/*  Create all restaurants HTML and add them to the webpage.
 * 
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');

  // incrementing number for tabindexes
  let iterator = 1;
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant, iterator));
    iterator++;
  });
  addMarkersToMap();
}


/*  Create restaurant HTML.
 * 
 */
createRestaurantHTML = (restaurant, iterator) => {

  const li = document.createElement('li');

  // add role to list item
  let listRole = document.createAttribute('role');
  listRole.value = 'listitem';
  li.setAttributeNode(listRole);

  // add image
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  
  let imgAlt = document.createAttribute('alt');
  imgAlt.value = 'Photo of ' + restaurant.name;
  image.setAttributeNode(imgAlt);

  // enclose image in an extra anchor
  const imglink = document.createElement('a');
  imglink.href = DBHelper.urlForRestaurant(restaurant);
  imglink.append(image);

  li.append(imglink);

  // add title of restaurant
  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  // add neighborhood
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  // add address to item
  const address = document.createElement('address');
  address.innerHTML = restaurant.address;
  li.append(address);

  // add anchor for more info
  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);

  // give anchor a class
  let className = document.createAttribute('class');
  className.value = 'detailsBtn';
  more.setAttributeNode(className);

  // give anchor a role of button
  let linkRole = document.createAttribute('role');
  linkRole.value = 'button';
  more.setAttributeNode(linkRole);

  // give anchor a tabindex of an incrementing number
  let tabindex = document.createAttribute('tabindex');
  tabindex.value = iterator + 2;
  more.setAttributeNode(tabindex);

  // add anchor to list item
  li.append(more)
  
  // return list item
  return li;
}


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}