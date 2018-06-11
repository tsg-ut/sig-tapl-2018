#ifndef INCLUDE_GUARD_LAM_HPP
#define INCLUDE_GUARD_LAM_HPP 1

#include <bits/stdc++.h>
using namespace std;

#include "tree.hpp"

/**
 * 戻り値のASTはshared_ptrで、パース失敗時はnull的なやつ
 */
extern AST parse(const string&);

/**
 * これを実装する
 */
extern AST typed(const AST);
#endif
