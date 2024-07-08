// AppServer.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import CharacterGenerator from './CharacterGenerator.js';
import DungeonGenerator from './Maps.js';

export default class AppServer {
    constructor(port) {
        this.app = express();
        this.port = port;
        this.configureServer();
        this.setupRoutes();
        this.start();
    }

    configureServer() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        this.app.get('/character.html', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'character.html'));
        });

        this.app.get('/dungeon.html', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'dungeon.html'));
        });

        this.app.get('/generate-character', async (req, res) => {
            const { race, charClass, alignment, background, gender } = req.query;
            const generator = new CharacterGenerator();
            const character = await generator.generateCharacter(race, charClass, alignment, background, gender);
            res.json(character);
        });

        this.app.get('/generate-map', (req, res) => {
            const { dungeonName, dungeonSize, roomLayout, roomSize, corridors } = req.query;
            const mapGenerator = new DungeonGenerator(dungeonSize, roomLayout, roomSize, corridors);
            const result = mapGenerator.generate();
            res.json(result);
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server is running at http://localhost:${this.port}`);
        });
    }
}
