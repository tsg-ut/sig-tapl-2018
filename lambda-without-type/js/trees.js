'use strict';

export class AST {
  constructor(info) {
    this.info = info;
    this.pos = info.pos;
    this.highlighted = info.highlighted;
  }

  toString() {
    return this.toHighlightedString().map(v => v.str).join('');
  }
}

export class VarTree extends AST {
  constructor(info, n) {
    super(info);
    this.name = n;
    Object.freeze(this);
  }

  toHighlightedString() {
    return [{ hl: this.highlighted, str: this.name }];
  }
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

  toHighlightedString({ isLast = true } = {}) {
    return [
      { hl: this.highlighted === true, str: isLast ? '' : '('},
      { hl: this.highlighted, str: `\\${this.arg}.` },
      ...this.body.toHighlightedString({ isFirst: true, isLast: true }),
      { hl: this.highlighted === true, str: isLast ? '' : ')'},
    ];
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

  toHighlightedString({ isFirst = true, isLast = true } = {}) {
    return [
      { hl: this.highlighted === true, str: isFirst ? '' : '('},
      ...this.fn.toHighlightedString({ isFirst: true, isLast: false }),
      { hl: this.highlighted, str: ' '},
      ...this.arg.toHighlightedString({ isFirst: false, isLast: isLast || !isFirst }),
      { hl: this.highlighted === true, str: isFirst ? '' : ')'},
    ];
  }

  toTreeString() { return `App(${this.fn.toTreeString()}, ${this.arg.toTreeString()})`; }
}
