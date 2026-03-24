import 'dotenv/config'; // Loads .env file contents into process.env by default
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
    🚀  Server is running!
    🔉  Port: ${PORT}
    🔗  URL:  http://localhost:${PORT}
    `);
});
