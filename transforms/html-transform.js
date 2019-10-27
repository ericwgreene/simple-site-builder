const fs = require('fs');
const path = require('path');
const $ = require('cheerio');

module.exports.htmlTransform = async (
  sourceFilePath,
  destinationFilePath,
  sourceFolder,
) => {

  const html = await fs.promises.readFile(sourceFilePath, 'utf-8');

  const template = $.load(html);

  const nodes = template('[data-partial]');

  await Promise.all(nodes.map(async (_, element) => {
    const node = $(element);
    const partialPath = path.join(sourceFolder, node.attr('data-partial')); 
    const partialContent = await fs.promises.readFile(partialPath, 'utf-8');
    node.html(partialContent);
    node.removeAttr('data-partial');
  }).get());

  template('body').append(
    `<!-- Live Reload -->\n` +
    `<script>\n` +
    `  document.write(\n` +
    `    '<script src="http://' + \n` +
    `    (location.host || 'localhost').split(':')[0] + \n` +
    `    ':35729/livereload.js?snipver=1"></' + \n` +
    `    'script>')\n` +
    `</script>\n` + 
    `<!-- End Live Reload -->\n`
  );

  await fs.promises.writeFile(destinationFilePath, template.html(), 'utf-8');

};