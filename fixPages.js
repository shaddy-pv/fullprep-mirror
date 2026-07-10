const fs = require('fs');
const path = require('path');

const pages = ['terms', 'privacy', 'cookie-policy', 'refund-policy', 'help', 'faq', 'community'];

pages.forEach(p => {
  const file = path.join('frontend', 'app', '(public)', p, 'page.tsx');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import Navbar from "@\/components\/landing\/Navbar";\n/, '');
  content = content.replace(/import Footer from "@\/components\/landing\/Footer";\n/, '');
  content = content.replace(/<div className="flex flex-col min-h-screen bg-slate-50 dark:bg-\[#050816\]">\n\s*<Navbar \/>/, '<div className="flex flex-col w-full">');
  content = content.replace(/<main className="flex-grow pt-32 pb-16">/, '<div className="flex-grow pb-16">');
  content = content.replace(/<\/main>\n\n\s*<Footer \/>/, '</div>');
  fs.writeFileSync(file, content);
});
console.log('Fixed static pages!');
