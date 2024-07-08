// Maps.js
class DungeonGenerator {
    constructor(dungeonSize, roomLayout, roomSize, corridors) {
        this.dungeonSize = dungeonSize;
        this.roomLayout = roomLayout;
        this.roomSize = roomSize;
        this.corridors = corridors;
        this.map = [];
        this.rooms = [];
        this.width = this.getSize(dungeonSize).width;
        this.height = this.getSize(dungeonSize).height;
    }

    getSize(dungeonSize) {
        switch (dungeonSize) {
            case 'small':
                return { width: 20, height: 15 };
            case 'medium':
                return { width: 40, height: 30 };
            case 'large':
                return { width: 60, height: 45 };
            default:
                return { width: 40, height: 30 };
        }
    }

    initializeMap() {
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = 0; // 0 means wall
            }
        }
    }

    generateRooms() {
        let roomCount = this.getRoomCount(this.roomLayout);
        let minSize = this.getRoomSize(this.roomSize).min;
        let maxSize = this.getRoomSize(this.roomSize).max;
        let attempts = 0;

        while (this.rooms.length < roomCount && attempts < roomCount * 5) {
            attempts++;
            let shape = this.getRandomShape(minSize, maxSize);
            let roomWidth = shape.width;
            let roomHeight = shape.height;
            let roomX = Math.floor(Math.random() * (this.width - roomWidth));
            let roomY = Math.floor(Math.random() * (this.height - roomHeight));

            let newRoom = { x: roomX, y: roomY, width: roomWidth, height: roomHeight, shape: shape.shape, number: this.rooms.length + 1 };

            if (!this.isColliding(newRoom)) {
                this.rooms.push(newRoom);
                for (let y = 0; y < shape.layout.length; y++) {
                    for (let x = 0; x < shape.layout[y].length; x++) {
                        if (shape.layout[y][x] === 1) {
                            this.map[roomY + y][roomX + x] = 1; // 1 means floor
                        }
                    }
                }
            }
        }
    }

    isColliding(newRoom) {
        const padding = 1; // Add padding to avoid tight clustering
        for (let room of this.rooms) {
            if (newRoom.x < room.x + room.width + padding && newRoom.x + newRoom.width + padding > room.x &&
                newRoom.y < room.y + room.height + padding && newRoom.y + newRoom.height + padding > room.y) {
                return true;
            }
        }
        return false;
    }

    getRoomCount(roomLayout) {
        switch (roomLayout) {
            case 'scattered':
                return 10;
            case 'clustered':
                return 20;
            default:
                return 10;
        }
    }

    getRoomSize(roomSize) {
        switch (roomSize) {
            case 'small':
                return { min: 3, max: 6 };
            case 'medium':
                return { min: 5, max: 10 };
            case 'large':
                return { min: 7, max: 14 };
            default:
                return { min: 5, max: 10 };
        }
    }

    getRandomShape(minSize, maxSize) {
        const shapes = [
            { shape: 'rectangle', width: Math.floor(Math.random() * (maxSize - minSize) + minSize), height: Math.floor(Math.random() * (maxSize - minSize) + minSize), layout: this.createRectangleLayout(minSize, maxSize) },
            { shape: 'L-shaped', width: Math.floor(Math.random() * (maxSize - minSize) + minSize), height: Math.floor(Math.random() * (maxSize - minSize) + minSize), layout: this.createLShapeLayout(minSize, maxSize) },
            { shape: 'T-shaped', width: Math.floor(Math.random() * (maxSize - minSize) + minSize), height: Math.floor(Math.random() * (maxSize - minSize) + minSize), layout: this.createTShapeLayout(minSize, maxSize) }
        ];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }

    createRectangleLayout(minSize, maxSize) {
        const width = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        const height = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        const layout = Array(height).fill().map(() => Array(width).fill(1));
        return layout;
    }

    createLShapeLayout(minSize, maxSize) {
        const width = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        const height = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        const layout = Array(height).fill().map(() => Array(width).fill(0));
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (y === 0 || x === 0 || y === height - 1 || x === width - 1 || (x < width / 2 && y < height / 2)) {
                    layout[y][x] = 1;
                }
            }
        }
        return layout;
    }

    createTShapeLayout(minSize, maxSize) {
        const width = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        const height = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        const layout = Array(height).fill().map(() => Array(width).fill(0));
        const midHeight = Math.floor(height / 2);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (y === midHeight || (y < midHeight && x >= width / 3 && x < 2 * width / 3)) {
                    layout[y][x] = 1;
                }
            }
        }
        return layout;
    }

    generateCorridors() {
        for (let i = 0; i < this.rooms.length - 1; i++) {
            let roomA = this.rooms[i];
            let roomB = this.rooms[i + 1];

            let pointA = { x: Math.floor(roomA.x + roomA.width / 2), y: Math.floor(roomA.y + roomA.height / 2) };
            let pointB = { x: Math.floor(roomB.x + roomB.width / 2), y: Math.floor(roomB.y + roomB.height / 2) };

            while (pointA.x !== pointB.x || pointA.y !== pointB.y) {
                if (pointA.x !== pointB.x) {
                    pointA.x < pointB.x ? pointA.x++ : pointA.x--;
                } else if (pointA.y !== pointB.y) {
                    pointA.y < pointB.y ? pointA.y++ : pointA.y--;
                }
                if (this.map[pointA.y][pointA.x] === 0) {
                    this.map[pointA.y][pointA.x] = 3; // 3 means corridor
                }
            }
        }
    }

    addDoors() {
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.map[y][x] === 1) {
                    // Add door logic based on surroundings
                    if (this.map[y - 1][x] === 3 && this.map[y + 1][x] === 3 && this.map[y][x - 1] === 1 && this.map[y][x + 1] === 1) {
                        this.map[y][x] = 2; // Door vertical
                    }
                    if (this.map[y][x - 1] === 3 && this.map[y][x + 1] === 3 && this.map[y - 1][x] === 1 && this.map[y + 1][x] === 1) {
                        this.map[y][x] = 2; // Door horizontal
                    }
                }
            }
        }
    }

    generateRoomContent(room) {
        const contents = ['empty', 'furniture', 'treasure', 'trap', 'enemy'];
        const content = contents[Math.floor(Math.random() * contents.length)];
        const loot = this.generateLoot();
        const monster = this.generateMonster();
        room.description = this.generateDescription(content, loot, monster);
        return { content, loot, monster };
    }

    generateLoot() {
        const lootOptions = ['gold coins', 'silver coins', 'gems', 'magic potion', 'sword', 'shield'];
        return lootOptions[Math.floor(Math.random() * lootOptions.length)];
    }

    generateMonster() {
        const monsters = ['goblin', 'skeleton', 'orc', 'troll', 'dragon', 'zombie'];
        return monsters[Math.floor(Math.random() * monsters.length)];
    }

    generateDescription(content, loot, monster) {
        let description = `This room contains ${content}.`;
        if (loot !== 'empty') description += ` You find some loot: ${loot}.`;
        if (monster !== 'empty') description += ` Beware, a ${monster} is here!`;
        return description;
    }

    generate() {
        this.initializeMap();
        this.generateRooms();
        this.generateCorridors();
        this.addDoors();
        for (let room of this.rooms) {
            const { content, loot, monster } = this.generateRoomContent(room);
            room.content = content;
            room.loot = loot;
            room.monster = monster;
        }
        return { map: this.map, rooms: this.rooms };
    }
}

export default DungeonGenerator;
