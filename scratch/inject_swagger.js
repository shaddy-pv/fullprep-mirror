const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'backend', 'src', 'routes');

const routePrefixes = {
  'authRoutes.js': '/api/auth',
  'healthRoutes.js': '/api',
  'problemRoutes.js': '/api/problems',
  'submissionRoutes.js': '/api/submissions',
  'userRoutes.js': '/api/users',
  'settingsRoutes.js': '/api/settings',
  'notificationRoutes.js': '/api/notifications',
  'aiRoutes.js': '/api/ai',
  'learningPathRoutes.js': '/api/learning-paths',
  'contestRoutes.js': '/api/contests',
  'friendRoutes.js': '/api/friends',
  'paymentRoutes.js': '/api/payment',
  'jobRoutes.js': '/api/jobs',
  'teamRoutes.js': '/api/team',
  'contactRoutes.js': '/api/contact',
};

fs.readdirSync(routesDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if this file already has swagger annotations
    if (content.includes('@openapi') || content.includes('@swagger')) {
        console.log(`Skipping ${file} - already contains swagger annotations`);
        return;
    }

    const prefix = routePrefixes[file] || '/api';
    const lines = content.split('\n');
    let newContent = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const routeMatch = line.match(/router\.(get|post|put|patch|delete)\(["']([^"']+)["']/);
        
        if (routeMatch) {
            const method = routeMatch[1];
            let endpoint = routeMatch[2];
            
            // Format endpoint for swagger (convert /:id to /{id})
            const swaggerPath = (prefix + endpoint).replace(/:([a-zA-Z0-9_]+)/g, '{$1}').replace(/\/$/, '');
            
            // Extract possible path parameters
            const pathParams = [];
            let paramMatch;
            const paramRegex = /:([a-zA-Z0-9_]+)/g;
            while ((paramMatch = paramRegex.exec(endpoint)) !== null) {
                pathParams.push(paramMatch[1]);
            }
            
            // Find a description from inline comments
            let description = `Endpoint for ${method.toUpperCase()} ${endpoint}`;
            const commentMatch = line.match(/\/\/\s*(.*)/);
            if (commentMatch) {
                description = commentMatch[1].trim();
            }

            // Build JSDoc
            newContent.push(`/**`);
            newContent.push(` * @openapi`);
            newContent.push(` * ${swaggerPath}:`);
            newContent.push(` *   ${method}:`);
            newContent.push(` *     summary: ${description}`);
            newContent.push(` *     tags: [${file.replace('Routes.js', '')}]`);
            
            if (pathParams.length > 0) {
                newContent.push(` *     parameters:`);
                pathParams.forEach(p => {
                    newContent.push(` *       - in: path`);
                    newContent.push(` *         name: ${p}`);
                    newContent.push(` *         required: true`);
                    newContent.push(` *         schema:`);
                    newContent.push(` *           type: string`);
                });
            }
            
            newContent.push(` *     responses:`);
            newContent.push(` *       200:`);
            newContent.push(` *         description: Successful operation`);
            newContent.push(` */`);
        }
        
        newContent.push(line);
    }
    
    fs.writeFileSync(filePath, newContent.join('\n'));
    console.log(`Updated ${file} with basic Swagger annotations`);
  }
});
