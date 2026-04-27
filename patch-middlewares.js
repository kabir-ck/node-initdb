const fs = require('fs');
const path = require('path');

function replaceMiddlewares(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceMiddlewares(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let isModified = false;
            
            // Replace folder: 'Middlewares' to folder: 'Middleware'
            if (content.includes("folder: 'Middlewares'")) {
                content = content.replace(/folder:\s*'Middlewares'/g, "folder: 'Middleware'");
                isModified = true;
            }
            if (content.includes('folder: "Middlewares"')) {
                content = content.replace(/folder:\s*"Middlewares"/g, 'folder: "Middleware"');
                isModified = true;
            }
            
            // Replace 'Middlewares', "Middlewares" string arrays
            if (content.includes("'Middlewares'")) {
                content = content.replace(/'Middlewares'/g, "'Middleware'");
                isModified = true;
            }
            
            // Replace '../Middlewares/compressMiddleware'
            if (content.includes('../Middlewares/compressMiddleware')) {
                content = content.replace(/\.\.\/Middlewares\/compressMiddleware/g, '../Middleware/compressMiddleware');
                isModified = true;
            }

            if (isModified) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed Middlewares typo in', fullPath);
            }
        }
    }
}

replaceMiddlewares('structures');
