// app.js
import AppServer from './AppServer.js';

const port = process.env.PORT || 3001; // Use the environment variable or default to 3000
new AppServer(port);
