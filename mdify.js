'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const chalk = require('chalk');
const mammoth = require('mammoth');
const md = require('to-markdown');
const opn = require('opn');

Promise.promisifyAll(fs); // eslint-disable-line no-use-extend-native/no-use-extend-native

module.exports = class MDify {
  constructor(options) {
    this.options = options || {};
  }

  makeHTML() {
    return new Promise((resolve, reject) => {
      mammoth
        .convertToHtml({path: this.options.source})
        .then(result => { // eslint-disable-line promise/prefer-await-to-then
          if (this.options.debug) {
            fs.writeFileAsync(this.options.debug, result.value);
          }

          resolve(result.value);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  makeMD(html, ora) {
    return new Promise((resolve, reject) => {
      try {
        const destination = path.resolve(this.options.destination);
        const markdown = md(html, {gfm: true});

        fs.writeFileAsync(this.options.destination, markdown).then(() => { // eslint-disable-line promise/prefer-await-to-then
          resolve(markdown);
        });

        if (this.options.open) {
          opn(destination, {
            wait: false
          });

          if (!this.options.silent && ora) {
            ora.info(
              `opening ${chalk.blue(this.options.destination)} once created`
            );
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }
};
