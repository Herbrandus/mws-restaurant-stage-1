/* General script for restaurant page of Restaurant Reviews */
/* written by Gerben Boersma */

let restaurant;
var newMap;

/*  Initialize map as soon as the page is loaded.
 * 
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();

  // insert current year for copyright
  document.querySelector('#yr').innerHTML = new Date().getFullYear();
});

/*  Initialize leaflet map
 * 
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  


/*  Get current restaurant from page URL.
 * 
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {

      self.restaurant = restaurant;

      if (!restaurant) {
        console.error(error);
        return;
      }

      fillRestaurantHTML();
      callback(null, restaurant);

      // customize page title  
      let mainTitle = 'Your Favorite Restaurant Review App';
      let docTitle = document.getElementsByTagName('title')[0];

      let newName = restaurant.name + ' | ' + mainTitle;

      docTitle.innerText = newName;
    });
  }
}

/*  Create restaurant HTML and add it to the webpage
 * 
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  
  // set restaurant name
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  // set address of restaurant
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  // get the image of restaurant and set it
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  // create the alt tag for the restaurant image
  let imgAlt = document.createAttribute('alt');
  imgAlt.value = 'Photo of ' + restaurant.name;
  image.setAttributeNode(imgAlt);

  // create label for cuisine of restaurant
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill reviews
  fillReviewsHTML();
 
}

/*  Create restaurant operating hours HTML table and add it to the webpage.
 * 
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');

  // loop over all operating hours in db and generate table
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/*  Create all reviews HTML and add them to the webpage.
 * 
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/*  Create review HTML and add it to the webpage.
 * 
 */
createReviewHTML = (review) => {

  // create container list item
  const li = document.createElement('li');

  const header = document.createElement('div');

  // add class to header
  let className = document.createAttribute('class');
  className.value = 'review-header';
  header.setAttributeNode(className);

  // create element for author name
  let name = document.createElement('p');

  // add class to author field
  className = document.createAttribute('class');
  className.value = 'author';
  name.setAttributeNode(className);

  name.innerHTML = review.name;
  header.appendChild(name);

  // create element for date posted
  const date = document.createElement('p');

  // add class to date posted field
  className = document.createAttribute('class');
  className.value = 'postDate';
  date.setAttributeNode(className);

  date.innerHTML = review.date;
  header.appendChild(date);

  li.appendChild(header);

  // create element for rating
  const rating = document.createElement('p');

  // add class to rating field
  className = document.createAttribute('class');
  className.value = 'rating';
  rating.setAttributeNode(className);

  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  // create element to contain the message
  const comments = document.createElement('p');

  // add class to message field
  className = document.createAttribute('class');
  className.value = 'message';
  comments.setAttributeNode(className);

  comments.innerHTML = review.comments;
  li.appendChild(comments);

  // output review
  return li;
}

/*  Add restaurant name to the breadcrumb navigation menu
 * 
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');

  const ariaLabel = document.createAttribute('aria-current');
  ariaLabel = 'page';
  li.setAttributeNode(ariaLabel);
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/*  Get a parameter by name from page URL.
 * 
 */
getParameterByName = (name, url) => {
if (!url)
  url = window.location.href;
name = name.replace(/[\[\]]/g, '\\$&');
const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
  results = regex.exec(url);
if (!results)
  return null;
if (!results[2])
  return '';
return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
