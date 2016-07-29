import merge from 'lodash.merge';
import parseCodeBlocks from 'gfm-code-blocks';
import Remarkable from 'remarkable';

const tagParsers = {
  param(value, render) {
    const matches = value.match(/^\s*\{([\w\|]+)\}\s+(\w+)\s*-\s*(.*)$/);

    if (matches) {
      return {
        type: matches[1],
        name: matches[2],
        description: render(matches[3]),
      };
    }
  }
}

function stripStars(str) {
  return str
    .replace(/^\s{0,1}\*\s*$/mg, '')
    .replace(/^\s{0,1}\*\s{1}/mg, '')
    ;
}

function getCodeBlockForOffset(codeBlocks, offset) {
  for (const block of codeBlocks) {
    if (offset >= block.start && offset <= block.end) {
      return block;
    }
  }
}

function isOffsetInsideCodeBlock(codeBlocks, offset) {
  return !!getCodeBlockForOffset(codeBlocks, offset);
}

function mergeParagraphLines(str, codeBlocks) {
  const callback = (match, m1, m2, offset) =>
    isOffsetInsideCodeBlock(codeBlocks, offset)
      ? `${m1}\n${m2}`
      : `${m1} ${m2}`
      ;

  return str
    .replace(/([^\n])\n([^\n])/g, callback)
    .replace(/\s*$/gm, '')
    ;
}

function parseTagValue(tagName, tagValue, render) {
  const parser = tagParsers[tagName];
  const results = {
    type: tagName,
  };

  return parser
    ? merge(results, { [ tagName ]: parser(tagValue, render) })
    : { ...results, value: render(tagValue) }
    ;
}

function getTag(line) {
  const matches = line.match(/^@(\w+)\s*(.*)$/);

  if (matches) {
    return [ matches[1], matches[2] ];
  }

  return [];
}

function splitIntoBlocks(str, codeBlocks, render) {
  const blocks = [];
  let pos = 0;
  let offset = 0;

  while ((pos = str.indexOf('\n', offset)) !== -1) {
    const codeBlock = getCodeBlockForOffset(codeBlocks, pos);

    if (codeBlock) {
      blocks.push({
        type: 'code',
        value: render(codeBlock.block),
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

function processBlocks(blocks, render) {
  return blocks
    .map(block => {
      if (typeof block === 'object') {
        return block;
      }

      const [ tagName, tagValue ] = getTag(block);

      if (tagName) {
        return parseTagValue(tagName, tagValue, render);
      }

      return {
        type: 'paragraph',
        value: render(block),
      };
    })
    ;
}

export default function parseJSDocComments(input, render) {
  let commentString = stripStars(input);
  let codeBlocks = parseCodeBlocks(commentString);

  commentString = mergeParagraphLines(commentString, codeBlocks);

  // update position of all code blocks due to line shift
  codeBlocks = parseCodeBlocks(commentString);

  if (!render) {
    const markdown = new Remarkable();
    render = value => markdown.render(value);
  }

  return processBlocks(
    splitIntoBlocks(commentString, codeBlocks, render),
    render
  );
}
