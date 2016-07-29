# jsdoc-with-markdown

[![GratiPay](https://img.shields.io/gratipay/user/alexgorbatchev.svg)](https://gratipay.com/alexgorbatchev/)
![Downloads](https://img.shields.io/npm/dm/jsdoc-with-markdown.svg)
![Version](https://img.shields.io/npm/v/jsdoc-with-markdown.svg)

Parses JSDoc-like string into JSON assuming the formating is in Markdown.

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
//     "value": "This is a description."
//   },
//   {
//     "type": "paragraph",
//     "value": "## Example"
//   },
//   {
//     "type": "code",
//     "value": "```js\nfunction hello() {\n  console.log('Hi!');\n}\n```"
//   }
// ]
```

## License

ISC
