const fs = require('fs');
const yaml = require('yaml');
const handlebars = require("handlebars");
const page = handlebars.compile(fs.readFileSync(`${__dirname}/../src/page.html`, 'utf8'));
const index = handlebars.compile(fs.readFileSync(`${__dirname}/../src/index.html`, 'utf8'));

if (fs.existsSync(`${__dirname}/../public`)) {
  fs.rmdirSync(`${__dirname}/../public`, { recursive: true });
}
fs.mkdirSync(`${__dirname}/../public`);
const pages = [];
for (const file of fs.readdirSync(`${__dirname}/../presentations`)) {
  if (file.endsWith('.ip')) {
    const name = file.split('.')[0];
    const presentation = yaml.parse(fs.readFileSync(`${__dirname}/../presentations/${file}`, 'utf8'));
    pages.push({
      title: presentation.title,
      name,
    });
    fs.writeFileSync(`${__dirname}/../public/${name}.html`, page({presentation}));
  }
}

fs.writeFileSync(`${__dirname}/../public/index.html`, index({pages}));
fs.copyFileSync(`${__dirname}/../node_modules/reveal.js/plugin/highlight/highlight.js`, `${__dirname}/../public/highlight.js`);
fs.copyFileSync(`${__dirname}/../node_modules/reveal.js/plugin/highlight/monokai.css`, `${__dirname}/../public/monokai.css`);
fs.copyFileSync(`${__dirname}/../node_modules/reveal.js/dist/reveal.js`, `${__dirname}/../public/reveal.js`);
fs.copyFileSync(`${__dirname}/../node_modules/reveal.js/dist/reset.css`, `${__dirname}/../public/reset.css`);
fs.copyFileSync(`${__dirname}/../node_modules/reveal.js/dist/reveal.css`, `${__dirname}/../public/reveal.css`);
fs.copyFileSync(`${__dirname}/../node_modules/reveal.js/dist/theme/black.css`, `${__dirname}/../public/black.css`);
fs.copyFileSync(`${__dirname}/../src/style.css`, `${__dirname}/../public/style.css`);
