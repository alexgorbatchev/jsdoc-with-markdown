# jsdoc-with-markdown

[![GratiPay](https://img.shields.io/gratipay/user/alexgorbatchev.svg)](https://gratipay.com/alexgorbatchev/)
![Downloads](https://img.shields.io/npm/dm/jsdoc-with-markdown.svg)
![Version](https://img.shields.io/npm/v/jsdoc-with-markdown.svg)

Parses JSDoc-like string into JSON assuming the formating is in Markdown. You can use [babel-extract-comments](https://github.com/jonschlinkert/babel-extract-comments) to extract comments from JavaScript source.

## Installation

```
npm instal --save-dev jsdoc-with-markdown
```

## Usage

```
import parseJSDocComments from 'parse-jsdoc-comments';

parseJSDocComments(
 * This is a description.
 *
 * ## Example
 *
 * ```js
 * function hello() {
 *   console.log('Hi!');
 * }
 * ```
);

// [
//   {
//     "type": "paragraph",
//     "value": "<p>This is a description.</p>\n"
//   },
//   {
//     "type": "paragraph",
//     "value": "<h2>Example</h2>\n"
//   },
//   {
//     "type": "code",
//     "value": "<pre><code class=\"language-js\">function hello() {\n  console.log('Hi!');\n}\n</code></pre>\n"
//   }
// ]
```

## License

ISC
