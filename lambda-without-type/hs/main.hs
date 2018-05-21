import Lam.Parse
import Lam.Trees

import Control.Monad (forM_)

main :: IO ()
main = lines <$> getContents >>= flip forM_ output
  where
    output :: String -> IO ()
    output program =
      case parse program of
        Left e ->
          error e
        Right tree -> do
          print tree
          putStrLn $ showLam tree
          -- let uv = uniqueVar tree
          -- putStrLn . showLam uv
