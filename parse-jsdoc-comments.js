import merge from 'lodash.merge';
import parseCodeBlocks from 'gfm-code-blocks';

const tagParsers = {
  param(value) {
    const matches = value.match(/^\s*\{([\w\|]+)\}\s+(\w+)\s*-\s*(.*)$/);

    if (matches) {
      return {
        type: matches[1],
        name: matches[2],
        description: matches[3],
      };
    }
  }
}

class Parser {
  constructor(commentString) {
    this.commentString = commentString;
  }

  stripStars(str) {
    return str
      .replace(/^\s{0,1}\*\s*$/mg, '')
      .replace(/^\s{0,1}\*\s{1}/mg, '')
      ;
  }

  getCodeBlockForOffset(offset) {
    for (const block of this.codeBlocks) {
      if (offset >= block.start && offset <= block.end) {
        return block;
      }
    }
  }

  isOffsetInsideCodeBlock(offset) {
    return !!this.getCodeBlockForOffset(offset);
  }

  mergeParagraphLines(str) {
    const callback = (match, m1, m2, offset) =>
      this.isOffsetInsideCodeBlock(offset)
        ? `${m1}\n${m2}`
        : `${m1} ${m2}`
        ;

    return str
      .replace(/([^\n])\n([^\n])/g, callback)
      .replace(/\s*$/gm, '')
      ;
  }

  parseTagValue(tagName, tagValue) {
    const parser = tagParsers[tagName];
    const results = {
      type: 'tag',
      key: tagName,
      value: tagValue,
    };

    return parser
      ? merge(results, { [ tagName ]: parser(tagValue) })
      : { ...results, value: tagValue }
      ;
  }

  getTag(line) {
    const matches = line.match(/^@(\w+)\s*(.*)$/);

    if (matches) {
      return [ matches[1], matches[2] ];
    }

    return [];
  }

  splitIntoBlocks(str) {
    const blocks = [];
    let pos = 0;
    let offset = 0;

    while ((pos = str.indexOf('\n', offset)) !== -1) {
      const codeBlock = this.getCodeBlockForOffset(pos);

      if (codeBlock) {
        blocks.push({
          type: 'code',
          value: codeBlock.block,
        });

        offset = codeBlock.end + 1;
      } else {
        blocks.push(str.substr(offset, pos - offset));
        offset = pos + 1;
      }
    }

    blocks.push(str.substr(offset, str.length - offset));

    return blocks
      .filter(block => typeof block  === 'string' ? block.length : true)
      ;
  }

  processBlocks(blocks) {
    return blocks
      .map(block => {
        if (typeof block === 'object') {
          return block;
        }

        const [ tagName, tagValue ] = this.getTag(block);

        if (tagName) {
          return this.parseTagValue(tagName, tagValue);
        }

        return {
          type: 'paragraph',
          value: block,
        };
      })
      ;
  }

  run() {
    const commentString = this.stripStars(this.commentString);
    this.codeBlocks = parseCodeBlocks(commentString);

    let blocks =
      this.processBlocks(
        this.splitIntoBlocks(
          this.mergeParagraphLines(
            commentString
          )
        )
      )
      ;

    return blocks;
  }
}

export default function parseJSDocComments(commentString) {
  const parser = new Parser(commentString);
  return parser.run();
}
