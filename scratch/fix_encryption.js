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

    // 1. Remove if (options && options.encryption) around middleware file generation
    content = content.replace(/if\s*\(\s*options\s*&&\s*options\.encryption\s*\)\s*\{([\s\S]*?name:\s*['"]encryption(?:Middleware|Plugin)(?:\.js|\.ts)?['"][\s\S]*?\}\s*\);?\s*)\}/g, '{ $1 }');

    // 2. Fix Elysia imports
    content = content.replace(/\$\{options\.encryption\s*\?\s*'(import\s*\{\s*encryptionPlugin\s*\}\s*from\s*"[^"]+";)'\s*:\s*''\}/g, '$1');
    content = content.replace(/\$\{options\.encryption\s*\?\s*'\.use\(encryptionPlugin\)'\s*:\s*''\}/g, '.use(encryptionPlugin)');

    // 3. Fix Elysia .env
    content = content.replace(/\$\{options\.encryption\s*\?\s*'ENCRYPTION_KEY=([^']+)'\s*:\s*''\}/g, 'ENCRYPTION_KEY=$1\nENCRYPT=\\${options.encryption ? \\\'true\\\' : \\\'false\\\'}');

    // 4. Fix Express import
    content = content.replace(/\$\{options\.encryption\s*\?\s*`([^`]+)`\s*:\s*''\}/g, '$1');

    // 5. Fix Express/Fastify .env
    content = content.replace(/ENCRYPTION_KEY=([^\s`]+)\s*`/g, 'ENCRYPTION_KEY=$1\\nENCRYPT=\\${options.encryption ? \\\'true\\\' : \\\'false\\\'} `');
    
    // 6. Fix middleware code logic
    content = content.replace(/function encryptResponse\(req, res, next\)\s*\{/g, "function encryptResponse(req, res, next) {\n    if (process.env.ENCRYPT !== 'true') return next();");
    content = content.replace(/function decryptRequest\(req, res, next\)\s*\{/g, "function decryptRequest(req, res, next) {\n    if (process.env.ENCRYPT !== 'true') return next();");
    
    content = content.replace(/export function encryptResponse\(\s*req:\s*Request,\s*res:\s*Response,\s*next:\s*NextFunction\s*\)\s*\{/g, "export function encryptResponse(req: Request, res: Response, next: NextFunction) {\n    if (process.env.ENCRYPT !== 'true') return next();");
    content = content.replace(/export function decryptRequest\(\s*req:\s*Request,\s*res:\s*Response,\s*next:\s*NextFunction\s*\)\s*\{/g, "export function decryptRequest(req: Request, res: Response, next: NextFunction) {\n    if (process.env.ENCRYPT !== 'true') return next();");

    content = content.replace(/fastify\.addHook\('preHandler',\s*async\s*\(request,\s*reply\)\s*=>\s*\{/g, "fastify.addHook('preHandler', async (request, reply) => {\n    if (process.env.ENCRYPT !== 'true') return;");
    content = content.replace(/fastify\.addHook\('onSend',\s*async\s*\(request,\s*reply,\s*payload\)\s*=>\s*\{/g, "fastify.addHook('onSend', async (request, reply, payload) => {\n    if (process.env.ENCRYPT !== 'true') return payload;");
    
    content = content.replace(/fastify\.addHook\('preHandler',\s*async\s*\(request:\s*FastifyRequest,\s*reply:\s*FastifyReply\)\s*=>\s*\{/g, "fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {\n    if (process.env.ENCRYPT !== 'true') return;");
    content = content.replace(/fastify\.addHook\('onSend',\s*async\s*\(request:\s*FastifyRequest,\s*reply:\s*FastifyReply,\s*payload:\s*any\)\s*=>\s*\{/g, "fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: any) => {\n    if (process.env.ENCRYPT !== 'true') return payload;");

    content = content.replace(/export const encryptionPlugin = new Elysia\(\)\s*\n\s*\.onParse\(async\s*\(\{ request, body \}\)\s*=>\s*\{/g, "export const encryptionPlugin = new Elysia()\n  .onParse(async ({ request, body }) => {\n    if (process.env.ENCRYPT !== 'true') return;");
    content = content.replace(/\.mapResponse\(async\s*\(\{ response \}\)\s*=>\s*\{/g, ".mapResponse(async ({ response }) => {\n    if (process.env.ENCRYPT !== 'true') return response;");

    fs.writeFileSync(fullPath, content);
});

// Fix init.js
const initPath = path.join(__dirname, '..', 'init.js');
let initContent = fs.readFileSync(initPath, 'utf8');
initContent = initContent.replace(/if\s*\(options\.encryption\)\s*\{\s*if\s*\(options\.fastify\)\s*\{\s*cmd\s*\+=\s*" fastify-plugin";\s*\}\s*\}/, 'if (options.fastify) {\n        cmd += " fastify-plugin";\n      }');
fs.writeFileSync(initPath, initContent);

console.log("Done");
