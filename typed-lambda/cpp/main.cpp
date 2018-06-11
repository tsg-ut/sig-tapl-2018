#include <bits/stdc++.h>
using namespace std;

#include "lam.hpp"

int main() {
  string s;

  while(getline(cin, s)) {
    cerr << "Parsing " << s << endl;
    AST tree = parse(s);
    if(!tree) {
      cerr << "Parse failed." << endl;
      continue;
    }
    cout << tree << endl;
    tree->outputDetailTo(cout); cout << endl;

    AST typed_tree = typed(tree);
    if(!typed_tree) {
      cerr << "Type failed." << endl;
      continue;
    }
    cout << typed_tree << endl;
    typed_tree->outputDetailTo(cout); cout << endl;
  }
}
