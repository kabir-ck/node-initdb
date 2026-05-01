const fs = require('fs');
const path = require('path');

const files = [
  'structures/JS/fastify/mongo-fastify.js',
  'structures/JS/fastify/sequelize-fastify.js',
  'structures/TS/fastify/mongo-fastify.js',
  'structures/TS/fastify/sequelize-fastify.js'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');

    // Add ENCRYPTION_KEY and ENCRYPT to .env
    content = content.replace(/JWT_SECRET=`/g, "JWT_SECRET=\nENCRYPTION_KEY=your-32-byte-secret-key-here-123456789012\nENCRYPT=\\${options.encryption ? 'true' : 'false'}`");

    fs.writeFileSync(fullPath, content);
});

console.log("Done");
