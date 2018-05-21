'use strict';
import { VarTree, AbsTree, AppTree } from './trees.js';
import { parse } from './parse.js';
export { parse };

export function uniqueVar(tree, { viLast = new Map(), viStack = new Map() } = {}) {
  function uname(v) {
    const vs = viStack.get(v);
    if(vs === undefined || vs.length === 0) {
      return null;
    } else {
      const vi = vs[vs.length - 1];
      return `${v}$${vi}`;
    }
  }

  if(tree instanceof VarTree) {
    const u = uname(tree.name);

    if(u) {
      return new VarTree(tree.info, u);
    } else {
      return tree;
    }
  } else if(tree instanceof AbsTree) {
    if(!viStack.has(tree.arg)) {
      viStack.set(tree.arg, []);
    }
    const vi = (viLast.get(tree.arg) || 0) + 1;
    viLast.set(tree.arg, vi);
    viStack.get(tree.arg).push(vi);

    const t = new AbsTree(tree.info, uname(tree.arg), uniqueVar(tree.body, { viLast, viStack }));
    viStack.get(tree.arg).pop();
    return t;
  } else if(tree instanceof AppTree) {
    return new AppTree(tree.info, uniqueVar(tree.fn, { viLast, viStack }), uniqueVar(tree.arg, { viLast, viStack }));
  } else {
    return tree;
  }
}

export function evalSteps(tree) {
  const steps = [];
  steps.push(new AppTree({}, new AbsTree({}, 'a$1', new VarTree({}, 'a$1')), new VarTree({}, 'a$2')));
  steps.push(new VarTree({}, 'a$2'));
  return steps;
}
