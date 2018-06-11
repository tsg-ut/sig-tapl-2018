#include <bits/stdc++.h>
using namespace std;

#include <boost/spirit/include/phoenix.hpp>
namespace phx = boost::phoenix;
#include <boost/spirit/include/qi.hpp>
using namespace boost::spirit;

#include "lam.hpp"

using It = string::const_iterator;

template<class Fn> using rule = qi::rule<It, Fn, ascii::space_type>;
template<class Fn> using rule_without_space = qi::rule<It, Fn>;

const unordered_set<string> reserved_word = {
  "case",
  "of",
  "inl",
  "inr",
};

struct LamGrammer : qi::grammar<It, AST(), ascii::space_type> {
  LamGrammer() : LamGrammer::base_type(program) {
    using qi::_1;
    using qi::_2;
    using qi::_val;
    using qi::lit;
    using phx::bind;
    using phx::construct;
    using phx::val;

    program = qi::eps > app;

    app = term[ _val = _1 ] >> *term[ _val = bind(makeAppTree, _val, _1) ];

    term = abs | var | lit('(') > app > lit(')');

    abs = (lit('\\') > ident > lit(':') > type > lit('.') > app)[ _val = bind(makeAbsTree, _1, _2, _3) ];

    var = ident[ _val = bind(makeVarTree, _1) ];

    ident = qi::raw[qi::lexeme[+qi::char_("0-9a-zA-Z_$")]] /* >>
            qi::eps( [&reserved_word](const auto& val) {
              return reserved_word.find(val) != reserved_word.end();
            })*/;

    type = type_term[ _val = _1 ] > -(lit("->") > type)[ _val = bind(makeTypeLambdaTree,  _val, _1) ];

    type_term = ident[ _val = bind(makeTypeNameTree, _1) ] | lit('(') > type > lit(')');

    app.name("app");
    term.name("term");
    abs.name("abs");
    var.name("var");
    ident.name("ident");
    type.name("type");
    type_term.name("type term");

    qi::on_error<qi::fail>(program,
      std::cerr
        << val("Parse error at ") << bind(distance<It>, _1, _3) << val(":\n")
        << val("Expect: \"") << _4 << val("\"\n")
        << val("Got: \"") << construct<string>(_3, _2) << val("\"")
        << endl
    );
  }

  rule<AST()> program, app, abs, var, term;
  rule<TypeAST()> type, type_term;
  rule_without_space<string()> ident;
};

AST parse(const string& expr) {
  AST ast;

  auto it = expr.begin();
  bool success = qi::phrase_parse(it, expr.end(), LamGrammer(), ascii::space, ast);

  if(success) {
    if(it == expr.end()) {
      return ast;
    } else {
      cerr << "at " << distance(expr.begin(), it) << "\nexpected: EOF\nfound: '" << *it << "'.\n";
      return AST();
    }
  } else {
    cerr << "parse failed\n";
    return AST();
  }
}
