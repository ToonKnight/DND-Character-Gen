import axios from 'axios';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch a random place
async function fetchRandomPlace() {
  try {
    const response = await axios.get('https://random-data-api.com/api/address/random_address');
    return response.data.city;
  } catch (error) {
    console.error('Error fetching random place:', error);
    return 'the Unknown Land';
  }
}



async function generateFantasyDescription(name, race, charClass) {
  const title = await fetchRandomTitle();
  const place = await fetchRandomPlace();


  
  return `${name} ${title}, a ${race} ${charClass} from ${place}`;

  

}
fetchRandomPlace().then(city => console.log(`City: ${city}`));