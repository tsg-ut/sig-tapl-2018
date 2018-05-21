'use strict';

export class AST {
  constructor(info) {
    this.info = info;
    this.pos = info.pos;
    this.highlighted = info.highlighted;
  }
}

export class VarTree extends AST {
  constructor(info, n) {
    super(info);
    this.name = n;
    Object.freeze(this);
  }

  toString() { return this.name; }
  toTreeString() { return `Var(${this.name})`; }
}

export class AbsTree extends AST {
  constructor(info, arg, body) {
    super(info);
    this.arg = arg;
    this.body = body;
    Object.freeze(this);
  }

  toString({ isLast = true } = {}) {
    let s = `\\${this.arg}.${this.body.toString({ isFirst: true, isLast: true })}`;
    if(!isLast) s = `(${s})`;
    return s;
  }

  toTreeString() { return `Abs(${this.arg}, ${this.body.toTreeString()})`; }
}

export class AppTree extends AST {
  constructor(info, fn, arg) {
    super(info);
    this.fn = fn;
    this.arg = arg;
    Object.freeze(this);
  }

  toString({ isFirst = true, isLast = true } = {}) {
    const fnStr = this.fn.toString({ isFirst: true, isLast: false });
    const argStr = this.arg.toString({ isFirst: false, isLast: isLast || !isFirst });

    let s = `${fnStr} ${argStr}`;
    if(!isFirst) s = `(${s})`;
    return s;
  }

  toTreeString() { return `App(${this.fn.toTreeString()}, ${this.arg.toTreeString()})`; }
}
