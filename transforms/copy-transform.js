const { promises: { copyFile } } = require('fs');

module.exports.copyTransform = async (sourceFilePath, destinationFilePath) => {
  await copyFile(sourceFilePath, destinationFilePath);
};