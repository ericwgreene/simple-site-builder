#!/usr/bin/env node

const path = require('path');
const yargs = require("yargs");
const http = require('http');
const serveHandler = require('serve-handler');
const livereload = require('livereload');
const chokidar = require('chokidar');

const { buildSite } = require('../lib');

const options = yargs
  .usage("Usage: -s <source> -d <destination> -w -p <port>")
  .option("s", {
    alias: "source",
    describe: "Source folder",
    type: "string",
    demandOption: true,
  })
  .option("d", {
    alias: "destination",
    describe: "Destination folder",
    type: "string",
    demandOption: true,
  })
  .option("d", {
    alias: "destination",
    describe: "Destination folder",
    type: "string",
    demandOption: true,
  })
  .option("p", {
    alias: "port",
    describe: "Port number",
    default: 1453,
    type: "number",
    demandOption: false,
  })
  .option("w", {
    alias: "watch",
    describe: "Run in watch mode",
    type: "boolean",
    demandOption: false,
  })
  .argv;

const sourceAbsolutePath = path.resolve(options.source);
const destinationAbsolutePath = path.resolve(options.destination);

buildSite(sourceAbsolutePath, destinationAbsolutePath)
  .then(() => {

    const server = http.createServer((req, res) =>
      serveHandler(req, res, { public: destinationAbsolutePath }));
     
    server.listen(options.port, () => {
      console.log(`Running at http://localhost:${options.port}`);
    });

    const lrserver = livereload.createServer({ delay: 1000 });
    lrserver.watch(destinationAbsolutePath);

    chokidar.watch(sourceAbsolutePath).on('change', async () => {
      await buildSite(sourceAbsolutePath, destinationAbsolutePath);
      console.log('built new site');
    });

  });