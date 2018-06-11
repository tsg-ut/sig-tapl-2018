#ifndef INCLUDE_GUARD_TREE_HPP
#define INCLUDE_GUARD_TREE_HPP 1

#include <bits/stdc++.h>
using namespace std;

#define SHARED_PTR(name) \
  using name = shared_ptr<name##Entity>;

struct TypeASTEntity {
  virtual void outputTo(ostream&) = 0;
  virtual void outputDetailTo(ostream&) = 0;
};
SHARED_PTR(TypeAST)
inline ostream& operator<<(ostream& o, TypeAST a) { a->outputTo(o); return o; }

struct TypeNameTreeEntity : TypeASTEntity {
  string name;

  TypeNameTreeEntity(string name)
    : name(name) {}

  void outputTo(ostream& o) {
    o << name;
  }

  void outputDetailTo(ostream& o) {
    o << "TypeName(" << name << ")";
  }
};
SHARED_PTR(TypeNameTree)
inline TypeNameTree makeTypeNameTree(string name) { return make_shared<TypeNameTreeEntity>(name); }

struct TypeLambdaTreeEntity : TypeASTEntity {
  TypeAST arg, ret;

  TypeLambdaTreeEntity(TypeAST arg, TypeAST ret)
    : arg(arg), ret(ret) {}

  void outputTo(ostream& o) {
    o << "(";
    arg->outputTo(o);
    o << "->";
    ret->outputTo(o);
    o << ")";
  }

  void outputDetailTo(ostream& o) {
    o << "TypeLambda(";
    arg->outputDetailTo(o);
    o << ", ";
    ret->outputDetailTo(o);
    o << ")";
  }
};
SHARED_PTR(TypeLambdaTree)
inline TypeLambdaTree makeTypeLambdaTree(TypeAST arg, TypeAST ret) { return make_shared<TypeLambdaTreeEntity>(arg, ret); }


struct ASTEntity {
  virtual void outputTo(ostream&) = 0;
  virtual void outputDetailTo(ostream&) = 0;
};
SHARED_PTR(AST)
inline ostream& operator<<(ostream& o, AST a) { a->outputTo(o); return o; }

struct VarTreeEntity : ASTEntity {
  string name;

  VarTreeEntity(string name)
    : name(name) {}

  void outputTo(ostream& o) {
    o << name;
  }

  void outputDetailTo(ostream& o) {
    o << "Var(" << name << ")";
  }
};
SHARED_PTR(VarTree)
inline VarTree makeVarTree(string name) { return make_shared<VarTreeEntity>(name); }

struct AppTreeEntity : ASTEntity {
  AST fn, arg;

  AppTreeEntity(AST fn, AST arg)
    : fn(fn), arg(arg) {}

  void outputTo(ostream& o) {
    o << "(";
    fn->outputTo(o);
    o << " ";
    arg->outputTo(o);
    o << ")";
  }

  void outputDetailTo(ostream& o) {
    o << "App(";
    fn->outputDetailTo(o);
    o << ", ";
    arg->outputDetailTo(o);
    o << ")";
  }
};
SHARED_PTR(AppTree)
inline AppTree makeAppTree(AST fn, AST arg) { return make_shared<AppTreeEntity>(fn, arg); }

struct AbsTreeEntity : ASTEntity {
  string arg;
  TypeAST arg_type;
  AST body;

  AbsTreeEntity(string arg, TypeAST arg_type, AST body)
    : arg(arg), arg_type(arg_type), body(body) {}

  void outputTo(ostream& o) {
    o << "(\\" << arg << ": " << arg_type << ". ";
    body->outputTo(o);
    o << ")";
  }

  void outputDetailTo(ostream& o) {
    o << "Abs(" << arg << ", ";
    arg_type->outputDetailTo(o);
    o << ", ";
    body->outputDetailTo(o);
    o << ")";
  }
};
SHARED_PTR(AbsTree)
inline AbsTree makeAbsTree(string arg, TypeAST arg_type, AST body) { return make_shared<AbsTreeEntity>(arg, arg_type, body); }

struct WithTypeTreeEntity : ASTEntity {
  AST ast;
  TypeAST type;

  WithTypeTreeEntity(AST ast, TypeAST type)
    : ast(ast), type(type) {}

  void outputTo(ostream& o) {
    ast->outputTo(o);
    o << " :: ";
    type->outputTo(o);
  }

  void outputDetailTo(ostream& o) {
    o << "WithType(";
    ast->outputDetailTo(o);
    o << ", ";
    type->outputDetailTo(o);
    o << ")";
  }
};
SHARED_PTR(WithTypeTree)
inline WithTypeTree makeWithTypeTree(AST ast, TypeAST type) { return make_shared<WithTypeTreeEntity>(ast, type); }

#endif
