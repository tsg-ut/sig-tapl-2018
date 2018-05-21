module Lam.Trees (AST(..), showLam) where

data AST = VarTree String
         | AbsTree String AST
         | AppTree AST AST deriving Show

showLam :: AST -> String
showLam = showLam' True True
  where
    -- showLam' isFirstChild isLastChild tree
    showLam' :: Bool -> Bool -> AST -> String
    showLam' _ _ (VarTree v) = v
    showLam' _ True (AbsTree arg body) = "\\" ++ arg ++ "." ++ showLam' True True body
    showLam' True l (AppTree fn arg) = showLam' True False fn ++ " " ++ showLam' False l arg
    showLam' _ _ t = "(" ++ showLam' True True t ++ ")"
