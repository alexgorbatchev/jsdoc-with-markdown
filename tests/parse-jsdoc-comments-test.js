import { readdirSync, readFileSync } from 'fs';
import { expect } from 'chai';
import parseJSDocComments from '../parse-jsdoc-comments';
import extractComments from 'babel-extract-comments';

describe('format-cmd', () => {
  readdirSync(`${__dirname}/fixtures`).forEach(fileName => {
    it(fileName, () => {
      const input = readFileSync(`${__dirname}/fixtures/${fileName}`, 'utf8');
      const expected = require(`${__dirname}/expected/${fileName}`);
      const comments = extractComments(input);
      const actual = parseJSDocComments(comments[0].value);
      expect(actual).to.eql(expected);
    });
  });
});
