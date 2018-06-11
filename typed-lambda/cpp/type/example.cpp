#include <bits/stdc++.h>
using namespace std;

#include "../lam.hpp"

#define INSTANCE_OF(cls) auto tree = dynamic_pointer_cast<cls##Entity>(q6eBk0oV0v)

AST typed(const AST q6eBk0oV0v) {
  if(INSTANCE_OF(VarTree)) {
    return tree;

  } else if(INSTANCE_OF(AppTree)) {
    return tree;

  } else if(INSTANCE_OF(AbsTree)) {
    return makeWithTypeTree(
      tree,
      makeTypeLambdaTree(
        makeTypeNameTree("A"),
        makeTypeNameTree("B")
      )
    );

  } else {
    cerr << "unknown AST: " << q6eBk0oV0v;
    return AST(); // null
  }
}
