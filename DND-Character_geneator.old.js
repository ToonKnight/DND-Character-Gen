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

// Function to fetch a random fantasy name
async function fetchFantasyName() {
  try {
    const response = await axios.get('https://randomuser.me/api/');
    const user = response.data.results[0];
    return `${user.name.first} ${user.name.last}`;
  } catch (error) {
    console.error('Error fetching fantasy name:', error);
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
    Elf: { dexterity: 2 },
    Dwarf: { constitution: 2 },
    Halfling: { dexterity: 2 },
    Orc: { strength: 2, constitution: 1, intelligence: -2 },
    Dragonborn: { strength: 2, charisma: 1 },
    Gnome: { intelligence: 2 },
    HalfElf: { charisma: 2, two_other_scores: 1 },
    HalfOrc: { strength: 2, constitution: 1 },
    Tiefling: { charisma: 2, intelligence: 1 },
    Aarakocra: { dexterity: 2, wisdom: 1 },
    Genasi: { constitution: 2, sub_race: { air: { dexterity: 1 }, earth: { strength: 1 }, fire: { intelligence: 1 }, water: { wisdom: 1 } } },
    Goliath: { strength: 2, constitution: 1 },
    Aasimar: { charisma: 2 },
    Bugbear: { strength: 2, dexterity: 1 },
    Firbolg: { wisdom: 2, strength: 1 },
    Goblin: { dexterity: 2, constitution: 1 },
    Hobgoblin: { constitution: 2, intelligence: 1 },
    Kenku: { dexterity: 2, wisdom: 1 },
    Kobold: { dexterity: 2, strength: -2 },
    Lizardfolk: { constitution: 2, wisdom: 1 },
    Tabaxi: { dexterity: 2, charisma: 1 },
    Triton: { strength: 1, constitution: 1, charisma: 1 },
    YuanTi: { charisma: 2, intelligence: 1 }
  };

  const classes = {
    Barbarian: { hitDice: '1d12', primaryAbility: 'Strength', savingThrows: ['Strength', 'Constitution'], skills: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
    Bard: { hitDice: '1d8', primaryAbility: 'Charisma', savingThrows: ['Dexterity', 'Charisma'], skills: ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'] },
    Cleric: { hitDice: '1d8', primaryAbility: 'Wisdom', savingThrows: ['Wisdom', 'Charisma'], skills: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
    Druid: { hitDice: '1d8', primaryAbility: 'Wisdom', savingThrows: ['Intelligence', 'Wisdom'], skills: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
    Fighter: { hitDice: '1d10', primaryAbility: 'Strength or Dexterity', savingThrows: ['Strength', 'Constitution'], skills: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
    Monk: { hitDice: '1d8', primaryAbility: 'Dexterity & Wisdom', savingThrows: ['Strength', 'Dexterity'], skills: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
    Paladin: { hitDice: '1d10', primaryAbility: 'Strength & Charisma', savingThrows: ['Wisdom', 'Charisma'], skills: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
    Ranger: { hitDice: '1d10', primaryAbility: 'Dexterity & Wisdom', savingThrows: ['Strength', 'Dexterity'], skills: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
    Rogue: { hitDice: '1d8', primaryAbility: 'Dexterity', savingThrows: ['Dexterity', 'Intelligence'], skills: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
    Sorcerer: { hitDice: '1d6', primaryAbility: 'Charisma', savingThrows: ['Constitution', 'Charisma'], skills: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
    Warlock: { hitDice: '1d8', primaryAbility: 'Charisma', savingThrows: ['Wisdom', 'Charisma'], skills: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
    Wizard: { hitDice: '1d6', primaryAbility: 'Intelligence', savingThrows: ['Intelligence', 'Wisdom'], skills: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'] }
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
    if (raceModifiers[key]) {
      attributes[key] += raceModifiers[key];
    }
  }

  const charName = await fetchFantasyName();
  const description = await generateFantasyDescription(charName, race, charClass);

  const character = {
    name: charName,
    race: race,
    class: charClass,
    alignment: alignment,
    background: background,
    description: description,
    attributes: attributes,
    hitDice: classes[charClass].hitDice,
    primaryAbility: classes[charClass].primaryAbility,
    savingThrows: classes[charClass].savingThrows,
    skills: classes[charClass].skills
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
