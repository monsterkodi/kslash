
![kslash](kslash.png)

**kslash** is a collection of path utilities.

path(p) 
unslash(p) 

dir(p)   
file(p)   
base(p)   
ext(p) 
removeExt(p) 
swapExt(p, ext)

isRoot(p) 
removeDrive(p) 

home()
tilde(p) 
untilde(p) 
userData()

split(p)
splitExt(p) 
splitDrive(p) 
splitFileLine(p) 
splitFilePos(p) 
removeLinePos(p) 
removeColumn(p) 

joinFilePos(p, pos) 
joinFileLine(p, line, col) 

pathlist(p) 

isAbsolute(p)   
isRelative(p)   
normalize(p)   
sanitize(p)
parse(p)
unenv(p) 
resolve(p) 
relative(p, to) 
fileUrl(p) 
samePath(p, q) 

win()
join()
dirname(p)   
extname(p)   
basename(p, ext) 

escape(p) 
encode(p) 

pkg(p) 
git(p) 

touch(p) 

exists(p, cb) 
isDir(p, cb) 
isFile(p, cb) 
fileExists(p, cb) 
dirExists(p, cb) 
isWritable(p, cb) 

isText(p) 
readText(p, cb) 

### Notes

- Most functions return an empty string if the provided path doesn't exist.
- Callbacks are optional. If provided, callback will be called with result or empty string on failure.
