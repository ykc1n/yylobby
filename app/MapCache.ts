/*
hmmm
caring about performance here might be meme but..

- modifying a cache entry might be expensive if im rewriting the whole file to disk

- adding a new cache entry could be cheap if i just append to the end of the file..
 
- i wouldnt need to remove cache entries


OK for now I will do the super lazy greedy thing and just rewrite the file, especially since I am LITERALLY parsing a lua file LOL
*/

