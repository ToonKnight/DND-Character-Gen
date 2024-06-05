import axios from 'axios';

class CharacterGenerator {
    constructor() {
        this.races = {
            Human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
            Elf: { dexterity: 2 },
            Dwarf: { constitution: 2 },
            Halfling: { dexterity: 2 },
            Orc: { strength: 2, constitution: 1, intelligence: -2 },
            Dragonborn: { strength: 2, charisma: 1 },
            Gnome: { intelligence: 2 },
            HalfElf: { charisma: 2, two_other_scores: 1 },  // Special handling needed
            HalfOrc: { strength: 2, constitution: 1 },
            Tiefling: { charisma: 2, intelligence: 1 },
            Aarakocra: { dexterity: 2, wisdom: 1 },
            Genasi: {
                constitution: 2,
                sub_race: {
                    air: { dexterity: 1 },
                    earth: { strength: 1 },
                    fire: { intelligence: 1 },
                    water: { wisdom: 1 }
                }
            },
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

        this.classes = {

            Fighter: {
                skills: ['Athletics', 'Perception'],
                proficiencies: ['All armor', 'Shields', 'Simple weapons', 'Martial weapons'],
                hitDice: '1d10'
            },
            Wizard: {
                skills: ['Arcana', 'History'],
                proficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
                hitDice: '1d6'
            },
            Rogue: {
                skills: ['Stealth', 'Acrobatics'],
                proficiencies: ['Light armor', 'Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
                hitDice: '1d8'
            },
            Cleric: {
                skills: ['Insight', 'Religion'],
                proficiencies: ['Light armor', 'Medium armor', 'Shields', 'Simple weapons'],
                hitDice: '1d8'
            },
            Bard: {
                skills: ['Performance', 'Persuasion'],
                proficiencies: ['Light armor', 'Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
                hitDice: '1d8'
            },
            Paladin: {
                skills: ['Athletics', 'Persuasion'],
                proficiencies: ['All armor', 'Shields', 'Simple weapons', 'Martial weapons'],
                hitDice: '1d10'
            },
            Ranger: {
                skills: ['Survival', 'Stealth'],
                proficiencies: ['Light armor', 'Medium armor', 'Shields', 'Simple weapons', 'Martial weapons'],
                hitDice: '1d10'
            },
            Druid: {
                skills: ['Nature', 'Perception'],
                proficiencies: ['Light armor', 'Medium armor (non-metal)', 'Shields (non-metal)', 'Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Slings', 'Spears'],
                hitDice: '1d8'
            },
            Monk: {
                skills: ['Acrobatics', 'Stealth'],
                proficiencies: ['Simple weapons', 'Shortswords'],
                hitDice: '1d8'
            },
            Sorcerer: {
                skills: ['Arcana', 'Persuasion'],
                proficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
                hitDice: '1d6'
            },
            Warlock: {
                skills: ['Intimidation', 'Deception'],
                proficiencies: ['Light armor', 'Simple weapons'],
                hitDice: '1d8'
            },
            Barbarian: {
                skills: ['Intimidation', 'Survival'],
                proficiencies: ['Light armor', 'Medium armor', 'Shields', 'Simple weapons', 'Martial weapons'],
                hitDice: '1d12'
            }
            // Additional classes can be added here
        };
    }   

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateAttribute() {
        let rolls = [];
        for (let i = 0; i < 4; i++) {
            rolls.push(this.getRandomInt(1, 6));
        }
        rolls.sort((a, b) => b - a);
        rolls.pop();
        return rolls.reduce((a, b) => a + b, 0);
    }

    async fetchRandomName() {
        try {
            const response = await axios.get('https://randomuser.me/api/');
            const user = response.data.results[0];
            return `${user.name.first} ${user.name.last}`;
        } catch (error) {
            console.error('Error fetching random name:', error);
            return 'Unknown Name';
        }
    }

    async fetchRandomTitle() {
        try {
            const response = await axios.get('https://random-word-api.herokuapp.com/word?number=1');
            return response.data[0];
        } catch (error) {
            console.error('Error fetching random title:', error);
            return 'the Unknown';
        }
    }

    async fetchRandomPlace() {
        try {
            const response = await axios.get('https://random-data-api.com/api/address/random_address');
            return response.data.city;
        } catch (error) {
            console.error('Error fetching random place:', error);
            return 'the Unknown Land';
        }
    }

    async generateFantasyDescription(name, race, charClass) {
        const title = await this.fetchRandomTitle();
        const place = await this.fetchRandomPlace();
        return `${name} ${title}, a ${race} ${charClass} from ${place}`;
    }

    async generateCharacter(race, charClass, alignment, background) {
        let attributes = {
            strength: this.generateAttribute(),
            dexterity: this.generateAttribute(),
            constitution: this.generateAttribute(),
            intelligence: this.generateAttribute(),
            wisdom: this.generateAttribute(),
            charisma: this.generateAttribute()
        };

        // Apply race modifiers to attributes
        const raceModifiers = this.races[race];
        Object.keys(raceModifiers).forEach(attr => {
            if (attr === 'two_other_scores' && race === 'HalfElf') {
                // Example: Randomly choose two other attributes to increment
                const possibleAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom'].filter(a => a !== 'charisma');
                const selectedAttributes = [];
                while (selectedAttributes.length < 2) {
                    const attrToIncrement = possibleAttributes.splice(this.getRandomInt(0, possibleAttributes.length - 1), 1)[0];
                    selectedAttributes.push(attrToIncrement);
                }
                selectedAttributes.forEach(a => attributes[a] += 1);
            } else if (typeof raceModifiers[attr] === 'object') {
                // Handle sub-race modifiers, e.g., for Genasi
                const subRace = raceModifiers.sub_race[background];  // Assuming `background` key holds sub-race type
                if (subRace) {
                    Object.keys(subRace).forEach(subAttr => attributes[subAttr] += subRace[subAttr]);
                }
            } else {
                attributes[attr] = (attributes[attr] || 0) + raceModifiers[attr];
            }
        });

        const charName = await this.fetchRandomName();
        const description = await this.generateFantasyDescription(charName, race, charClass);

        return {
            name: charName,
            race,
            class: charClass,
            alignment,
            background,
            description,
            attributes
        };
    }
}

export default CharacterGenerator;
