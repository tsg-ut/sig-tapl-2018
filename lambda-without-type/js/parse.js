'use strict';
import { VarTree, AbsTree, AppTree } from './trees.js';

export function parse(program, startPos = 0) {
  const parseRegexp = /(\w+)|(?:\\|λ)\s*(\w+)\s*\.|(\()|(\s+)/y;
  let retTree = null;
  let li = 0;

  {
    const l = (program.match(/\(/g) || []).length;
    const r = (program.match(/\)/g) || []).length;
    if(l !== r) throw new Error('Syntax error: mismatch parentheses');
  }

  function unexpectedCharError() {
    const ch = program[li] ? `char '${program[li]}'` : `EOF`;
    return new Error(`Syntax error: unexpected ${ch} at ${startPos + li}`);
  }

  function parensEnd(startIndex) {
    let c = 0;
    let i;
    for(i = startIndex; i < program.length; ++i) {
      if(program[i] === '(') ++c;
      if(program[i] === ')') --c;
      if(c < 0) return i;
    }
    return i;
  }

  while(li < program.length) {
    parseRegexp.lastIndex = li;
    const match = parseRegexp.exec(program);
    if(!match || match.index !== li) {
      throw unexpectedCharError();
    }
    const si = li;
    li += match[0].length;

    let currentTree;
    if(match[1]) {
      // var
      currentTree = new VarTree(si, match[1]);
    } else if(match[2]) {
      // lambda
      const j = parensEnd(li);
      currentTree = new AbsTree(si, match[2], parse(program.slice(li, j), startPos + li));
      li = j + 1;
    } else if(match[3]) {
      // apply
      const j = parensEnd(li);
      currentTree = parse(program.slice(li, j), startPos + li);
      li = j + 1;
    } else if(match[4]) {
      // space
      continue;
    }

    if(retTree) {
      retTree = new AppTree(si, retTree, currentTree);
    } else {
      retTree = currentTree;
    }
  }
  if(!retTree) {
    throw unexpectedCharError();
  }
  return retTree;
}
