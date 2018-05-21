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


// AbsTreeのargがstringなのはブチギレ案件です（VarTreeにするとif文が減ります）
function Change(tree, from, to) {
  console.log("Change");
  console.log(tree);
  console.log(from);
  console.log(to);
  if (tree instanceof VarTree) {
    if (tree.name == from) {
      return to;
    }
    else {
      return tree;
    }
  }
  else if (tree instanceof AbsTree) {
    if (tree.arg == from) {
      return new AbsTree({}, to, Change(tree.body, from, to));
    }
    else {
      return new AbsTree({}, tree.arg, Change(tree.body, from, to));
    }
  }
  else if (tree instanceof AppTree) {
    return new AppTree({}, Change(tree.fn, from, to), Change(tree.arg, from, to));
  }
  else {
    return tree;
  }
}

function Apply(tree) {
  console.log("Apply");
  console.log(tree);
  if (tree instanceof AppTree) {
    console.log("AppTree");
  }
  else if(tree instanceof VarTree) {
    console.log("VarTree");
  }
  else if(tree instanceof AbsTree) {
    console.log("AbsTree");
  }
  else {
    console.log("Else");
  }
  if (tree instanceof AppTree) {
    if (tree.fn instanceof AbsTree) {
      return Change(tree.fn.body, tree.fn.arg, tree.arg);
    }
    else {
      return new AppTree({}, Apply(tree.fn), Apply(tree.arg));
    }
  }
  else {
    return tree;
  }
}

export function evalSteps(tree) {
  const steps = [];
  for(let i = 0; i < 100; i++) {
    console.log(i);
    console.log(tree);
    steps.push(tree);
    let change=tree;
    tree = Apply(tree);
  }
  return steps;
}
