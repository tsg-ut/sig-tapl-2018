'use strict';
import { VarTree, AbsTree, AppTree } from './trees.js';
import { parse } from './parse.js';
export { parse };

export function uniqueVar(tree, { viLast = new Map(), viStack = new Map() } = {}) {
  function uname(v) {
    const vs = viStack.get(v);
    if (vs === undefined || vs.length === 0) {
      return null;
    } else {
      const vi = vs[vs.length - 1];
      return `${v}$${vi}`;
    }
  }

  if (tree instanceof VarTree) {
    const u = uname(tree.name);

    if (u) {
      return new VarTree(tree.info, u);
    } else {
      return tree;
    }
  } else if (tree instanceof AbsTree) {
    if (!viStack.has(tree.arg)) {
      viStack.set(tree.arg, []);
    }
    const vi = (viLast.get(tree.arg) || 0) + 1;
    viLast.set(tree.arg, vi);
    viStack.get(tree.arg).push(vi);

    const t = new AbsTree(tree.info, uname(tree.arg), uniqueVar(tree.body, { viLast, viStack }));
    viStack.get(tree.arg).pop();
    return t;
  } else if (tree instanceof AppTree) {
    return new AppTree(tree.info, uniqueVar(tree.fn, { viLast, viStack }), uniqueVar(tree.arg, { viLast, viStack }));
  } else {
    return tree;
  }
}

function replace(tree, name, value) {
  if (tree instanceof VarTree) {
    if (tree.name === name) {
      return value;
    } else {
      return tree;
    }
  } else if (tree instanceof AbsTree) {
    if (tree.arg === name) {
      return tree;
    } else {
      return new AbsTree({}, tree.arg, replace(tree.body, name, value));
    }
  } else if (tree instanceof AppTree) {
    return new AppTree({}, replace(tree.fn, name, value), replace(tree.arg, name, value));
  } else {
    console.error(...arguments);
  }
}

function evaluate(tree) {
  console.log(tree);
  if (tree instanceof AppTree) {
    if (tree.fn instanceof AbsTree) {
      return replace(tree.fn.body, tree.fn.arg, tree.arg);
    } else if (tree.fn instanceof AppTree) {
      return new AppTree({}, evaluate(tree.fn), tree.arg);
    } else if (tree.arg instanceof AppTree) {
      return new AppTree({}, tree.fn, evaluate(tree.arg));
    } else {
      return tree;
    }
  } else {
    return tree;
  }
}

export function evalSteps(tree) {
  const steps = [];
  for (let i = 0; i < 20; i++) {
    console.log(tree.toString());
    tree = evaluate(tree);
    steps.push(tree);
  }
  return steps;
}
