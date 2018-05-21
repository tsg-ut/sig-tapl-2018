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

function highlightRec(highlighted, tree) {
  if(tree instanceof VarTree) {
    return highlight(highlighted, tree);
  } else if(tree instanceof AppTree) {
    return highlight(highlighted,
      new AppTree(tree.info, highlightRec(highlighted, tree.fn), highlightRec(highlighted, tree.arg))
    );
  } else {
    return highlight(highlighted,
      new AbsTree(tree.info, tree.arg, highlightRec(highlighted, tree.body))
    );
  }
}

function highlight(highlighted, tree) {
  const info = Object.assign({}, tree.info, { highlighted })
  if(tree instanceof VarTree) {
    return new VarTree(info, tree.name);
  } else if(tree instanceof AppTree) {
    return new AppTree(info, tree.fn, tree.arg);
  } else {
    return new AbsTree(info, tree.arg, tree.body);
  }
}

function assign(tree, from, to) {
  if(tree instanceof VarTree) {
    if(tree.name === from) {
      return {
        oldTree: highlightRec(true, tree),
        newTree: highlightRec(true, to),
      };
    } else {
      return {
        oldTree: tree,
        newTree: tree,
      };
    }
  } else if(tree instanceof AppTree) {
    const { oldTree: oldFn, newTree: newFn } = assign(tree.fn, from, to);
    const { oldTree: oldArg, newTree: newArg } = assign(tree.arg, from, to);
    return {
      oldTree: new AppTree(tree.info, oldFn, oldArg),
      newTree: new AppTree(tree.info, newFn, newArg),
    };
  } else {
    if(tree.arg === from) {
      // 内部に同名の変数がある
      return {
        oldTree: tree,
        newTree: tree,
      };
    }
    const { oldTree: oldBody, newTree: newBody } = assign(tree.body, from, to);
    return {
      oldTree: new AbsTree(tree.info, tree.arg, oldBody),
      newTree: new AbsTree(tree.info, tree.arg, newBody),
    };
  }
}

function evalStep(tree) {
  tree = highlightRec(false, tree);

  if(tree instanceof AppTree) {
    if(tree.fn instanceof AbsTree) {
      const { oldTree: oldBody, newTree: newBody } = assign(tree.fn.body, tree.fn.arg, tree.arg);
      return {
        oldTree: new AppTree(
          tree.info,
          highlight('except-parens', new AbsTree(tree.fn.info, tree.fn.arg, oldBody)),
          highlightRec(true, tree.arg),
        ),
        newTree: newBody,
        changed: true,
      };
    } else {
      const { oldTree: oldFn, newTree: newFn, changed: changedFn } = evalStep(tree.fn);
      if(changedFn) {
        return {
          oldTree: new AppTree(tree.info, oldFn, tree.arg),
          newTree: new AppTree(tree.info, newFn, tree.arg),
          changed: true
        };
      }
      const { oldTree: oldArg, newTree: newArg, changed: changedArg } = evalStep(tree.arg);
      if(changedArg) {
        return {
          oldTree: new AppTree(tree.info, tree.fn, oldArg),
          newTree: new AppTree(tree.info, tree.fn, newArg),
          changed: true,
        };
      }
    }
  }
  return { oldTree: tree, newTree: tree, changed: false };
}

export function evalSteps(tree) {
  const steps = [];
  let last = tree;
  for(let i = 0; i < 1000; ++i) {
    const { oldTree, newTree, changed } = evalStep(last);
    steps.push(oldTree);
    if(!changed) break;
    steps.push(newTree);
    last = newTree;
  }
  return steps;
}
