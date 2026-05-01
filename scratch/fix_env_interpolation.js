const fs = require('fs');
const path = require('path');

const files = [
  'structures/JS/elysia/mongo-elysia.js',
  'structures/JS/elysia/sequelize-elysia.js',
  'structures/JS/express/mongo-express.js',
  'structures/JS/express/sequelize-express.js',
  'structures/JS/fastify/mongo-fastify.js',
  'structures/JS/fastify/sequelize-fastify.js',
  'structures/TS/elysia/mongo-elysia.js',
  'structures/TS/elysia/sequelize-elysia.js',
  'structures/TS/express/mongo-express.js',
  'structures/TS/express/sequelize-express.js',
  'structures/TS/fastify/mongo-fastify.js',
  'structures/TS/fastify/sequelize-fastify.js'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace \${options.encryption ? 'true' : 'false'} or \'true\' etc.
    // Notice that there could be \' or ' inside the conditional
    content = content.replace(/ENCRYPT=\\\$\{\s*options\.encryption\s*\?\s*\\?['"]true\\?['"]\s*:\s*\\?['"]false\\?['"]\s*\}/g, 'ENCRYPT=${options.encryption ? "true" : "false"}');

    fs.writeFileSync(fullPath, content);
});

console.log("Done");
