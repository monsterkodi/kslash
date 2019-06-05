
![kslash](kslash.png)

**kslash** is a collection of path utilities.

## path(p) 

Normalizes the path on all platforms.
Converts backslashes to slashes on Windows.

```coffeescript
slash = require 'kslash'
slash.path 'C:\\Back\\Slash'                           ▸ C:/Back/Slash
slash.path 'C:\\Back\\Slash\\..\\To\\The\\..\\Future'  ▸ C:/Back/To/Future
```

Windows is capable of handling paths with forward slashes,
that's why all exported functions return 'slashed' paths -- except the next one -- which you can use in cases where it isn't :)

## unslash(p)

Normalizes the path on all platforms.
On Windows it converts
- slashes to backslashes
- first dirname to a drive if it has only one letter

```coffeescript
slash.unslash '/c/test'                                ▸ C:\\test
```

## dir(p) 
## file(p)   
## base(p)   
## ext(p) 

```coffeescript
p = '/root/dir/file.txt'
slash.dir(p)  ▸ /root/dir
slash.file(p) ▸ file.txt
slash.base(p) ▸ file
slash.ext(p)  ▸ txt
```

## removeExt(p) 

```coffeescript
slash.removeExt(p) ▸ /root/dir/file
```

## swapExt(p, ext)

```coffeescript
slash.swapExt(p, 'md')  ▸ /root/dir/file.md
slash.swapExt(p, '.md') ▸ /root/dir/file.md
```

## isRoot(p)

```coffeescript
slash.isRoot('C:\\')    ▸ true
slash.isRoot('/')       ▸ true
```

## removeDrive(p)

```coffeescript
slash.removeDrive('C:\\dir\\file.txt')  ▸ /dir/file.txt
```
## home()
## tilde(p) 
## untilde(p) 

```coffeescript
slash.home()                            ▸ /Users/kodi
slash.tilde('/Users/kodi/dir/file.txt') ▸ ~/dir/file.txt
slash.untilde('~/dir/file.txt')         ▸ /Users/kodi/dir/file.txt
```

## split(p)
## splitExt(p) 
## splitDrive(p)

```coffeescript
p = 'C:\\dir/file.txt'
slash.split(p)      ▸ ['C:', 'dir', 'file']
slash.splitExt(p)   ▸ ['C:/dir/file', 'txt']
slash.splitDrive(p) ▸ ['/dir/file', 'c']
```

## splitFileLine(p) 
## splitFilePos(p) 
## removeLinePos(p)
## removeColumn(p) 
## joinFilePos(p, pos) 
## joinFileLine(p, line, col)

```coffeescript
p = '/dir/file.txt:12:3'
slash.splitFileLine(p)       ▸ ['/dir/file.txt', 12, 3]
slash.splitFilePos(p)        ▸ ['/dir/file.txt', [3,11]]
slash.removeLinePos(p)       ▸ '/dir/file.txt'
slash.removeColumn(p)        ▸ '/dir/file.txt:12'
slash.joinFileLine(p, 1, 2)  ▸ '/dir/file.txt:1:2'
slash.joinFilePos(p, [2,1])  ▸ '/dir/file.txt:0:2'
```
## pathlist(p) 

```coffeescript
p = '/dir/file.txt'
slash.pathlist(p) ▸ ['/', '/dir', '/dir/file.txt']
```
## resolve(p) 

Applies `unenv` and `untilde` before converting path into an absolute one.

## unenv(p) 

Replaces `$...` with matching environment variables

```coffeescript
p = '$HOME/dir'
slash.unenv(p) ▸ /Users/kodi/dir
```

## relative(p, to) 

```coffeescript
p = 'C:/test/some/path.txt' 
to ='C:/test/some/other/path')
slash.relative(p,to) ▸ '../../path.txt'
```

## samePath(p, q) 

Resolves p and q and compares the results.

## win()
## encode(p) 

Encodes p for use as an URL.

## fileUrl(p) 

Encodes p and prefixes it with 'file://'

## pkg(p)

Searches backwards in pathlist of p for a package.json and returns the containing folder, if one is found.

## git(p) 

Same as `pkg`, just looking for `.git` directory instead.

## touch(p)

Like the unix command, creates intermediate directories if they dont exist.

## exists(p, cb)

Returns stat of path p if it exists, null otherwise.

The callback is optional.
If provided, functionality will be executed synchronously and the callback will be called with result.
The same is true for the following functions that have a callback argument:

## isDir(p, cb)
## isFile(p, cb)
## fileExists(p, cb)
## dirExists(p, cb)
## isWritable(p, cb) 

## isText(p)

Returns true if p is a textfile.

## readText(p, cb)

Returns content of p as an utf8 string. 
Returns an emty string, if p doesn't exist or isn't readable.

## sanitize(p)

Removes leading and trailing newlines from path p.

## win()

Returns true if path.sep is '/'. 
Reasonable heuristic to check if code is running on a Windows box:
on `wsl` os.platform() returns 'linux', but path.sep is still '/'.

## isAbsolute(p)
## isRelative(p)   
## normalize(p)   
## dirname(p)   
## extname(p)   
## basename(p, ext) 
## parse(p)
## join()

The above wrap the orignal functions of the path module while sanitizing and slashing p.

## Notes

- Most functions return an empty string if the provided path doesn't exist.
