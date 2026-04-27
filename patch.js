const fs = require('fs');

function extractCompressContent(moduleFilePath) {
    const content = fs.readFileSync(moduleFilePath, 'utf8');
    
    // For module-fastify.js (uses getCompressMiddlewareContent())
    if (content.includes('getCompressMiddlewareContent()')) {
        const match = content.match(/function getCompressMiddlewareContent\(\) \{[\s\S]*?return \[([\s\S]*?)\]\.join\('\\n'\);\s*\}/);
        if (match) {
            return '[ ' + match[1] + ' ].join(\'\\n\')';
        }
    }
    
    // For others
    const match = content.match(/if \(options && options\.compress\) \{[\s\S]*?name:\s*['"]compressMiddleware\.[a-z]+['"],\s*content:\s*(`[\s\S]*?`)\s*\}\);/);
    if (match) return match[1];
    return null;
}

function patchSetupFile(setupFilePath, moduleFilePath) {
    if (!fs.existsSync(setupFilePath)) return;
    const compressContent = extractCompressContent(moduleFilePath);
    if (!compressContent) {
        console.log('Could not extract compress content for', setupFilePath);
        return;
    }

    let content = fs.readFileSync(setupFilePath, 'utf8');
    
    // Check if it's already patched
    if (content.includes('files: (index, Projectname, options) => {')) {
        console.log('Already patched:', setupFilePath);
        return;
    }
    
    if (content.includes('files:(index,Projectname, options)')) {
        console.log('Already patched:', setupFilePath);
        return;
    }

    // Replace function signature
    content = content.replace(/files:\s*\(([^,]+),\s*([^)]+)\)\s*=>\s*\{\s*return\s*\[/, 'files: ($1, $2, options) => { let filesArray = [');
    
    // Replace the end of array
    let isReplaced = false;
    content = content.replace(/\]\}\s*,?\s*(cmd\s*:|\}$)/, function(match, p1) {
        isReplaced = true;
        return `];
    if (options && options.compress) {
        filesArray.push({
            folder: 'Middleware',
            name: '${setupFilePath.includes('TS') ? 'compressMiddleware.ts' : 'compressMiddleware.js'}',
            content: ${compressContent}
        });
    }
    return filesArray;
},
${p1}`;
    });

    if (isReplaced) {
        fs.writeFileSync(setupFilePath, content);
        console.log('Patched', setupFilePath);
    } else {
        console.log('Failed to patch array end in', setupFilePath);
    }
}

// Express JS
patchSetupFile('structures/JS/express/mongo-express.js', 'structures/JS/express/module-express.js');
patchSetupFile('structures/JS/express/sequelize-express.js', 'structures/JS/express/module-express.js');

// Express TS
patchSetupFile('structures/TS/express/mongo-express.js', 'structures/TS/express/module-express.js');
patchSetupFile('structures/TS/express/sequelize-express.js', 'structures/TS/express/module-express.js');

// Fastify JS
patchSetupFile('structures/JS/fastify/mongo-fastify.js', 'structures/JS/fastify/module-fastify.js');
patchSetupFile('structures/JS/fastify/sequelize-fastify.js', 'structures/JS/fastify/module-fastify.js');

// Fastify TS
patchSetupFile('structures/TS/fastify/mongo-fastify.js', 'structures/TS/fastify/module-fastify.js');
patchSetupFile('structures/TS/fastify/sequelize-fastify.js', 'structures/TS/fastify/module-fastify.js');

// Elysia JS
patchSetupFile('structures/JS/elysia/mongo-elysia.js', 'structures/JS/elysia/module-elysia.js');
patchSetupFile('structures/JS/elysia/sequelize-elysia.js', 'structures/JS/elysia/module-elysia.js');

// Elysia TS
patchSetupFile('structures/TS/elysia/mongo-elysia.js', 'structures/TS/elysia/module-elysia.js');
patchSetupFile('structures/TS/elysia/sequelize-elysia.js', 'structures/TS/elysia/module-elysia.js');
