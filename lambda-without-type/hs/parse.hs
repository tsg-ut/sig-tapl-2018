module Lam.Parse (parse) where
import           Lam.Trees

import           Data.Maybe (listToMaybe)
import qualified Data.Char as C

isIdentifierChar :: Char -> Bool
isIdentifierChar = flip elem $ ['a'..'z'] ++ ['A'..'Z'] ++ ['0'..'9'] ++ "_"

unexpectedChar :: String -> Int -> String
unexpectedChar s i =
  "Syntax error: unexpected " ++ maybe "EOF" (\c-> '\'':c:"\'") (listToMaybe s) ++
  " at " ++ show i

parse :: String -> Either String AST
parse program =
  case parseApp program 0 of
    Left  e             -> Left e
    Right (tree, "", _) -> Right tree
    Right (tree, s,  i) -> Left $ unexpectedChar s i

parseApp :: String -> Int -> Either String (AST, String, Int)
parseApp s i =
  case parse' (Right []) s i of
    Left  e               -> Left e
    Right (rts, s', i') ->
      case length rts of
        0 -> Left $ unexpectedChar s i
        1 -> Right (head rts, s', i')
        _ -> Right (foldr1 (flip AppTree) rts, s', i')

-- [AST] is reversed
parse' ::  Either String [AST] -> String -> Int -> Either String ([AST], String, Int)
parse' (Left e)    _        _ = Left e
parse' (Right rts) ('(':s)  i = do
  (t, s', i') <- parseApp s (i+1)
  case s' of
    ')':s'' -> parse' (Right $ t:rts) s'' (i'+1)
    _       -> Left $ unexpectedChar s' i'

parse' x           ('\\':s) i = parse' x ('λ':s) i
parse' (Right rts) ('λ':s)  i =
  case span isIdentifierChar s of
    ("",  _)      -> Left $ unexpectedChar s (i+1)
    (arg, '.':s') -> do
      (t, s'', i') <- parseApp s' (i+2 + length arg)
      Right (AbsTree arg t : rts, s'', i')

    (arg, s')     -> Left $ unexpectedChar s' (i+1 + length arg)

parse' (Right rts) s        i =
  case listToMaybe s of
    Just c | C.isAlpha c -> do
      let (var, s') = span isIdentifierChar s
      parse' (Right $ VarTree var : rts) s' (i + length var)

    Just c | C.isSpace c -> parse' (Right rts) (tail s) (i+1)
    _                    -> Right (rts, s, i)
