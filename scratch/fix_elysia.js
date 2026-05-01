const fs = require('fs');
const path = require('path');

const files = [
  'structures/JS/elysia/mongo-elysia.js',
  'structures/JS/elysia/sequelize-elysia.js',
  'structures/TS/elysia/mongo-elysia.js',
  'structures/TS/elysia/sequelize-elysia.js'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(/\.onParse\(async\s*\(\{ request \}\)\s*=>\s*\{/g, ".onParse(async ({ request }) => {\n    if (process.env.ENCRYPT !== 'true') return;");
    content = content.replace(/\.mapResponse\(\(\{ response \}\)\s*=>\s*\{/g, ".mapResponse(({ response }) => {\n    if (process.env.ENCRYPT !== 'true') return response;");

    fs.writeFileSync(fullPath, content);
});

console.log("Done");
