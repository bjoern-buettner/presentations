const fs = require('fs');
const yaml = require('yaml');
const handlebars = require("handlebars");
const cssc = require('css-condense');
const { minify } = require('html-minifier-terser');

const page = handlebars.compile(fs.readFileSync(`${__dirname}/../src/page.html`, 'utf8'));
const index = handlebars.compile(fs.readFileSync(`${__dirname}/../src/index.html`, 'utf8'));
const htmlMinifyOptions = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  removeComments: true,
  useShortDoctype: true,
};
const now = Date.now();

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
    (async () => {
      fs.writeFileSync(
          `${__dirname}/../public/${name}.html`,
          await minify(page({presentation, now}), htmlMinifyOptions)
      );
    })();
  }
}

(async () => {
  fs.writeFileSync(
      `${__dirname}/../public/index.html`,
      await minify(index({pages, now}), htmlMinifyOptions)
  );
})();

(async () => {
  fs.writeFileSync(
      `${__dirname}/../public/speaker-view.html`,
      await minify(fs.readFileSync(`${__dirname}/../node_modules/reveal.js/plugin/notes/speaker-view.html`, 'utf8'), htmlMinifyOptions)
  );
})();

fs.copyFileSync(`${__dirname}/../src/logo.png`, `${__dirname}/../public/logo.png`);
fs.copyFileSync(`${__dirname}/../src/favicon.ico`, `${__dirname}/../public/favicon.ico`);

((cssFiles) => {
  let css = '';
  for (const file of cssFiles) {
    css = css + `\n/*!${file.split('/').pop()}*/\n` + cssc.compress(fs.readFileSync(file, 'utf8'));
  }
  fs.writeFileSync(`${__dirname}/../public/style.css`, css.substring(1));
})([
  `${__dirname}/../node_modules/reveal.js/dist/reset.css`,
  `${__dirname}/../node_modules/reveal.js/dist/reveal.css`,
  `${__dirname}/../src/bjoern-buettner-theme.css`,
  `${__dirname}/../node_modules/reveal.js/plugin/highlight/monokai.css`,
  `${__dirname}/../node_modules/reveal.js-verticator/plugin/verticator/verticator.css`,
  `${__dirname}/../node_modules/reveal.js-copycode/plugin/copycode/copycode.css`,
  `${__dirname}/../src/style.css`,
]);

((jsFiles) => {
  let js = '';
  for (const file of jsFiles) {
    js = js + `\n/*!${file.split('/').pop()}*/\n` + fs.readFileSync(file, 'utf8');
  }
  fs.writeFileSync(`${__dirname}/../public/scripts.js`, js.substring(1));
})([
  `${__dirname}/../node_modules/reveal.js/dist/reveal.js`,
  `${__dirname}/../node_modules/reveal.js/plugin/highlight/highlight.js`,
  `${__dirname}/../node_modules/reveal.js/plugin/notes/notes.js`,
  `${__dirname}/../node_modules/reveal.js-verticator/plugin/verticator/verticator.js`,
  `${__dirname}/../node_modules/reveal.js-copycode/plugin/copycode/copycode.js`,
]);
