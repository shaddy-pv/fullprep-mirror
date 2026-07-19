const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'backend', 'src', 'routes');
const outputFile = path.join('C:', 'Users', 'mdsha', '.gemini', 'antigravity-ide', 'brain', '52478e83-101c-4d02-933e-a3873e086bc7', 'api_documentation.md');

let mdContent = `# FullPrep API Documentation\n\nThis document provides a comprehensive list of all API endpoints in the FullPrep backend.\n\n`;

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
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const prefix = routePrefixes[file] || '/api';
    
    mdContent += `## ${file}\n`;
    mdContent += `Base Path: \`${prefix}\`\n\n`;
    mdContent += `| Method | Endpoint | Description/Handler |\n`;
    mdContent += `|--------|----------|---------------------|\n`;
    
    const routeRegex = /router\.(get|post|put|patch|delete)\(["']([^"']+)["']/g;
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      let endpoint = match[2];
      
      const lineEnd = content.indexOf('\n', match.index);
      const line = content.substring(match.index, lineEnd);
      
      let handler = "Unknown";
      const handlerMatch = line.match(/,\s*([a-zA-Z0-9_]+)\s*\)/);
      if (handlerMatch) {
          handler = handlerMatch[1];
      } else {
         const parts = line.split(',');
         if(parts.length > 1) {
             let lastPart = parts[parts.length-1].trim().replace(/\);?/, '');
             handler = lastPart;
         }
      }

      let description = handler;
      const commentMatch = line.match(/\/\/\s*(.*)/);
      if (commentMatch) {
          description += ` <br/>*${commentMatch[1].trim()}*`;
      }
      
      mdContent += `| \`${method}\` | \`${endpoint}\` | ${description} |\n`;
    }
    mdContent += `\n`;
  }
});

fs.writeFileSync(outputFile, mdContent);
console.log(`Generated ${outputFile}`);
