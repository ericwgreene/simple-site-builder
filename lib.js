'use strict';

const fs = require('fs');
const path = require('path');
const $ = require('cheerio');
const { copyTransform } = require('./transforms/copy-transform');
const { htmlTransform } = require('./transforms/html-transform');

const prepareDestinationFolder = async (destinationFolder) => {

  await fs.promises.rmdir(destinationFolder, { recursive: true });
  await fs.promises.mkdir(destinationFolder);
};

const copyFilesInFolder = async (sourceFolder, destinationFolder, publish) => {

  const directoryEntries = await fs.promises.readdir(
    sourceFolder,
    { withFileTypes: true },
  );

  const filesToCopy = directoryEntries
    .filter(entry => entry.isFile() && !entry.name.startsWith('.'))
    .map(entry => entry.name);

  return Promise.all(filesToCopy.map(async (fileToCopy) => {

    const sourceFilePath = path.join(sourceFolder, fileToCopy);
    const destinationFilePath = path.join(destinationFolder, fileToCopy);

    if (fileToCopy.endsWith('.html')) {
      await htmlTransform(
        sourceFilePath,
        destinationFilePath,
        sourceFolder,
        publish,
      );
    } else {
      await copyTransform(sourceFilePath, destinationFilePath);
    }

  }));

};

const traverseFolderTree = async (sourceFolder, destinationFolder, publish) => {

  await prepareDestinationFolder(destinationFolder);

  const directoryEntries = await fs.promises.readdir(
    sourceFolder,
    { withFileTypes: true },
  );

  const folders = directoryEntries
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
    .map(folder => folder.name);

  await Promise.all(folders.map(async (folder) => {

    const childSourceFolder = path.join(sourceFolder, folder);
    const childDestinationFolder = path.join(destinationFolder, folder);

    await traverseFolderTree(
      childSourceFolder,
      childDestinationFolder,
      publish,
    );

  }));

  await copyFilesInFolder(
    sourceFolder,
    destinationFolder,
    publish,
  );

};

module.exports.buildSite = async (sourceFolder, destinationFolder, publish) => {

  try {

    await traverseFolderTree(
      sourceFolder,
      destinationFolder,
      publish,
    );

    console.log('All done');

  }
  catch(err) {
    console.log(err);
  }
};
