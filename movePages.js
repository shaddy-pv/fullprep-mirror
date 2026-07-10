const fs = require('fs');
const path = require('path');

const folders = ['careers', 'community', 'cookie-policy', 'faq', 'help', 'privacy', 'refund-policy', 'team', 'terms'];

const srcDir = path.join(__dirname, 'frontend', 'app', '(public)');
const destDir = path.join(__dirname, 'frontend', 'app', '(marketing)');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

folders.forEach(folder => {
  const srcPath = path.join(srcDir, folder);
  const destPath = path.join(destDir, folder);

  if (fs.existsSync(srcPath)) {
    fs.renameSync(srcPath, destPath);
    console.log(`Moved ${folder} to (marketing)`);

    // Now re-add Navbar and Footer to page.tsx
    const pagePath = path.join(destPath, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');

      // Add imports if they don't exist
      if (!content.includes('import Navbar from "@/components/landing/Navbar"')) {
        content = content.replace(/import React/, 'import Navbar from "@/components/landing/Navbar";\nimport Footer from "@/components/landing/Footer";\nimport React');
      }

      // Add components back
      if (content.includes('<div className="flex flex-col w-full">')) {
        content = content.replace('<div className="flex flex-col w-full">', '<div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#050816]">\n      <Navbar />\n');
      }

      if (content.includes('<div className="flex-grow pb-16">')) {
        content = content.replace('<div className="flex-grow pb-16">', '<main className="flex-grow pt-32 pb-16">');
      }

      if (content.includes('      </div>\n    </div>')) {
        content = content.replace('      </div>\n    </div>', '      </main>\n\n      <Footer />\n    </div>');
      }

      fs.writeFileSync(pagePath, content);
      console.log(`Updated layout for ${folder}`);
    }
  }
});
console.log('All pages moved and layouts updated successfully!');
