// Function to retrieve stored data from session storage
async function retrieveStoredData() {
  // Retrieve stored data from localStorage
  const currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
  const destination = localStorage.getItem('destination');
  const departureDate = localStorage.getItem('departureDate');
  const destinationLocation = JSON.parse(localStorage.getItem('destinationLocation'));
  const currentIataCode = localStorage.getItem('currentIataCode');
  const destinationIataCode = localStorage.getItem('destinationIataCode');

  // Check if the required data is available
  if (currentLocation && destination && departureDate && destinationLocation) {
    // Display the stored data (optional)
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
      <p>Current Location:</p>
      <p>Latitude: ${currentLocation.lat}</p>
      <p>Longitude: ${currentLocation.lng}</p>
      <p>Destination: ${destination}</p>
      <p>Destination Latitude: ${destinationLocation.lat}</p>
      <p>Destination Longitude: ${destinationLocation.lng}</p>
      <p>Departure Date: ${departureDate}</p>
      <p>Current Location IATA: ${currentIataCode}</p>
      <p>Destination Location IATA: ${destinationIataCode}</p>
    `;

    try {
      // Call the searchFlightPriceOffers function and await the result
      const flightPriceOffers = await searchFlightPriceOffers(
        currentIataCode,
        destinationIataCode,
        departureDate
      );

      // Process the flight price offers data
      processFlightPriceOffers(flightPriceOffers);
    } catch (error) {
      console.error('Error retrieving flight price offers:', error);
    }
  } else {
    console.error('Stored data not found.');
  }
}

// Call the retrieveStoredData function on page load
document.addEventListener('DOMContentLoaded', retrieveStoredData, searchFlightPriceOffers);

// Function to search for flight price offers using the Amadeus API
async function searchFlightPriceOffers(currentIataCode, destinationIataCode, departureDate) {
  // Use the Amadeus Flight Offers Search API to get flight price offers
  const clientId = 'QsDw1NAA1de307vqAoMrpVSAEGHbRR3h';
  const clientSecret = 'FFRrmi8ZhebdbYXw';

  // Obtain an access token
  return fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  })
    .then((response) => response.json())
    .then((data) => {
      const accessToken = data.access_token;
      const amadeusEndpoint = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${currentIataCode}&destinationLocationCode=${destinationIataCode}&departureDate=${departureDate}&adults=1&nonStop=true&currencyCode=USD&max=250`;
      // Use the access token to fetch flight price offers
      return fetch(amadeusEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          return data;
        })
        .catch((error) => {
          console.error('Error retrieving flight price offers:', error);
          throw error;
        });
    })
    .catch((error) => {
      console.error('Error retrieving access token:', error);
      throw error;
    });
}


// Function to process flight price offers data
function processFlightPriceOffers(data) {
  // Display the flight price offers on the page
  const resultDiv = document.getElementById('result');
  const uniqueOffers = {}; // Object to store unique flight offers

  if (data.data && data.data.length > 0) {
    resultDiv.innerHTML = '<h2 class="text-2xl font-bold">Flight Price Offers:</h2>';
    data.data.forEach((offer) => {
      // Check if the offer price is not already stored
      if (!uniqueOffers[offer.price.total]) {
        uniqueOffers[offer.price.total] = true; // Store the offer price

        const departureTerminal = offer.itineraries[0].segments[0].departure.terminal;
        const arrivalTerminal =
          offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.terminal;

        resultDiv.innerHTML += `
          <div class="my-4 p-4 border border-gray-300 rounded">
            <p class="text-lg font-semibold">Price: ${offer.price.total}</p>
            <p class="text-gray-600">Airline: ${offer.itineraries[0].segments[0].carrierCode}</p>
            <p class="text-gray-600">Departure Terminal: ${departureTerminal}</p>
            <p class="text-gray-600">Arrival Terminal: ${arrivalTerminal}</p>
          </div>
        `;
      }
    });

    // Create a back button
    const backButton = document.createElement('button');
    backButton.innerText = 'Back';
    backButton.classList.add('bg-blue-500', 'text-white', 'py-2', 'px-4', 'rounded');
    backButton.addEventListener('click', () => {
      // Go back to the index.html page
      window.location.href = 'index.html';
    });

    // Append the back button to the result div
    resultDiv.appendChild(backButton);

    // Clear local storage after displaying flight prices
    localStorage.clear();
  } else {
    resultDiv.innerHTML = '<p class="text-red-500">No flight price offers found.</p>';
    localStorage.clear();
  }
}
