import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility function to generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility function to generate a random attribute score (4d6, drop lowest)
function generateAttribute() {
  let rolls = [];
  for (let i = 0; i < 4; i++) {
    rolls.push(getRandomInt(1, 6));
  }
  rolls.sort((a, b) => a - b);
  return rolls.slice(1).reduce((a, b) => a + b, 0); // Drop the lowest roll
}

// Utility function to generate a random item from an array
function getRandomItem(array) {
  return array[getRandomInt(0, array.length - 1)];
}

// Function to fetch a random title
async function fetchRandomTitle() {
  try {
    const response = await axios.get('https://random-word-api.herokuapp.com/word?number=1');
    return response.data[0];
  } catch (error) {
    console.error('Error fetching random title:', error);
    return 'the Unknown';
  }
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

// Function to fetch a random name
async function fetchRandomName() {
  try {
    const response = await axios.get('https://randomuser.me/api/');
    const user = response.data.results[0];
    return `${user.name.first} ${user.name.last}`;
  } catch (error) {
    console.error('Error fetching random name:', error);
    return 'Unknown Name';
  }
}

// Function to generate a fantasy description based on name, race, and class
async function generateFantasyDescription(name, race, charClass) {
  const title = await fetchRandomTitle();
  const place = await fetchRandomPlace();

  return `${name} ${title}, a ${race} ${charClass} from ${place}`;
}

// Function to generate a character with racial and class modifiers
async function generateCharacter(race, charClass, alignment, background) {
  const races = {
    Human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    Elf: { strength: 0, dexterity: 2, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
    Dwarf: { strength: 0, dexterity: 0, constitution: 2, intelligence: 0, wisdom: 0, charisma: 0 },
    Halfling: { strength: 0, dexterity: 2, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
    Orc: { strength: 2, dexterity: 0, constitution: 1, intelligence: -2, wisdom: 0, charisma: 0 },
  };

  const skills = {
    Fighter: ['Athletics', 'Intimidation'],
    Wizard: ['Arcana', 'History'],
    Rogue: ['Stealth', 'Acrobatics'],
    Cleric: ['Religion', 'Medicine'],
    Bard: ['Performance', 'Persuasion'],
  };

  const proficiencies = {
    Fighter: ['All armor', 'Shields', 'Simple weapons', 'Martial weapons'],
    Wizard: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    Rogue: ['Light armor', 'Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    Cleric: ['Light armor', 'Medium armor', 'Shields', 'Simple weapons'],
    Bard: ['Light armor', 'Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
  };

  // Generate base attributes
  const attributes = {
    strength: generateAttribute(),
    dexterity: generateAttribute(),
    constitution: generateAttribute(),
    intelligence: generateAttribute(),
    wisdom: generateAttribute(),
    charisma: generateAttribute(),
  };

  // Apply racial modifiers
  const raceModifiers = races[race];
  for (let key in attributes) {
    attributes[key] += raceModifiers[key];
  }

  const charName = await fetchRandomName();
  const description = await generateFantasyDescription(charName, race, charClass);

  const character = {
    name: charName,
    race: race,
    class: charClass,
    alignment: alignment,
    background: background,
    description: description,
    attributes: attributes,
    skills: skills[charClass],
    proficiencies: proficiencies[charClass],
  };

  return character;
}

// Setup express app
const app = express();
const port = 3000;

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to generate and return character data
app.get('/generate-character', async (req, res) => {
  const { race, charClass, alignment, background } = req.query;
  const character = await generateCharacter(race, charClass, alignment, background);
  res.json(character);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
