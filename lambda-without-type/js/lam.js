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

function assign(tree, from, to) {
  if(tree instanceof VarTree) {
    if(tree.name === from) {
      return to;
    } else {
      return tree;
    }
  } else if(tree instanceof AppTree) {
    return new AppTree(tree.info, assign(tree.fn, from, to), assign(tree.arg, from, to));
  } else {
    if(tree.arg === from) {
      // 内部に同名の変数がある
      return tree;
    }
    return new AbsTree(tree.info, tree.arg, assign(tree.body, from, to));
  }
}

function evalStep(tree) {
  if(tree instanceof AppTree) {
    if(tree.fn instanceof AbsTree) {
      return { newTree: assign(tree.fn.body, tree.fn.arg, tree.arg), changed: true };
    } else {
      const { newTree: newFn, changed: changedFn } = evalStep(tree.fn);
      if(changedFn) {
        return { newTree: new AppTree(tree.info, newFn, tree.arg), changed: true };
      }
      const { newTree: newArg, changed: changedArg } = evalStep(tree.arg);
      if(changedArg) {
        return { newTree: new AppTree(tree.info, tree.fn, newArg), changed: true };
      }
    }
  }
  return { newTree: tree, changed: false };
}

export function evalSteps(tree) {
  const steps = [tree];
  while(true) {
    const { newTree, changed } = evalStep(steps[steps.length - 1]);
    if(!changed) break;
    steps.push(newTree);
  }
  return steps;
}
