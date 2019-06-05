
![kslash](kslash.png)

**kslash** is a collection of path utilities.

It is meant to be used as a replacement for the internal `path` module.
It aims to minimize the problems you get when writing platform independent code dealing with paths.
But even if you target only one platform, I hope it might contain some tools of interest to you.

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
slash.unslash '/c/test'         ▸ C:\\test
slash.unslash 'D:/c/test'       ▸ D:\\c\\test
```

## dir(p) 

```coffeescript
p = '/dir/file.txt'
slash.dir(p)                    ▸ /dir
```

## file(p)   

```coffeescript
p = '/dir/file.txt'
slash.file(p)                   ▸ file.txt
```

## base(p)   

```coffeescript
p = '/dir/file.txt'
slash.base(p)                   ▸ file
```

## ext(p) 

```coffeescript
p = '/dir/file.txt'
slash.ext(p)                    ▸ txt
```

## removeExt(p)

```coffeescript
p = '/dir/file.txt'
slash.removeExt(p)              ▸ /dir/file
```

## swapExt(p, ext)

```coffeescript
p = '/dir/file.txt'
slash.swapExt(p, 'md')          ▸ /dir/file.md
slash.swapExt(p, '.md')         ▸ /dir/file.md
```

## isRoot(p)

```coffeescript
slash.isRoot('C:\\')            ▸ true
slash.isRoot('/')               ▸ true
```

## removeDrive(p)

```coffeescript
p = 'C:\\dir\\file.txt'
slash.removeDrive(p)            ▸ /dir/file.txt
```
## home()

```coffeescript
slash.home()                    ▸ C:/Users/kodi
```

## tilde(p) 

```coffeescript
p = 'C:/Users/kodi/file.txt'
slash.tilde(p)                  ▸ ~/file.txt
```

## untilde(p) 

```coffeescript
p = '~/file.txt'
slash.untilde(p)                ▸ C:/Users/kodi/file.txt
```

## split(p)

```coffeescript
p = 'C:\\dir/file.txt'
slash.split(p)                  ▸ ['C:', 'dir', 'file']
```

## splitExt(p) 

```coffeescript
p = 'C:\\dir/file.txt'
slash.splitExt(p)               ▸ ['C:/dir/file', 'txt']
```

## splitDrive(p)

```coffeescript
p = 'C:\\dir/file.txt'
slash.splitDrive(p)             ▸ ['/dir/file.txt', 'c']
```

## splitFileLine(p) 

```coffeescript
p = '/dir/file.txt:12:3'
slash.splitFileLine(p)          ▸ ['/dir/file.txt', 12, 3]
```

## splitFilePos(p) 

```coffeescript
p = '/dir/file.txt:12'
slash.splitFilePos(p)           ▸ ['/dir/file.txt', [0,11]]
```

## removeLinePos(p)

```coffeescript
p = '/dir/file.txt:12:3'
slash.removeLinePos(p)          ▸ /dir/file.txt
```

## removeColumn(p) 

```coffeescript
p = '/dir/file.txt:12:3'
slash.removeColumn(p)           ▸ /dir/file.txt:12
```

## joinFilePos(p, pos) 

```coffeescript
p = '/dir/file.txt:12'
slash.joinFilePos(p, [2, 1])    ▸ /dir/file.txt:2:2
```

## joinFileLine(p, line, col)

```coffeescript
p = '/dir/file.txt'
slash.joinFileLine(p, 1, 2)     ▸ /dir/file.txt:1:2
```

## pathlist(p) 

```coffeescript
p = '/dir/file.txt'
slash.pathlist(p)               ▸ ['/', '/dir', '/dir/file.txt']
```
## resolve(p) 

Applies `unenv` and `untilde` before converting path into an absolute one.

## unenv(p) 

Replaces `$...` with matching environment variables

```coffeescript
p = '$HOME/dir'
slash.unenv(p)                  ▸ C:/Users/kodi/dir
```

## relative(p, to) 

```coffeescript
p = 'C:/test/some/path.txt' 
to ='C:/test/some/other/path'
slash.relative(p,to)            ▸ ../../path.txt
```

## samePath(p, q) 

`Resolves` p and q and compares the results.

## encode(p) 

Encodes p for use as an URL.

```coffeescript
p = '/dir/a # b' 
slash.encode(p)                 ▸ /dir/a%20%23%20b
```

## fileUrl(p) 

Encodes p and prefixes it with 'file://'

```coffeescript
p = '/dir/a # b' 
slash.fileUrl(p)                ▸ file:///dir/a%20%23%20b
```

## pkg(p)

Searches backwards in `pathlist` of p for a package.json and returns the containing folder, if one is found.

## git(p) 

Same as `pkg`, just looking for `.git` directory instead.

## touch(p)

Like the unix command, creates intermediate directories if they don't exist.

## exists(p, cb)

Returns [stat](https://nodejs.org/dist/latest/docs/api/fs.html#fs_class_fs_stats) of path p if it exists, null otherwise.

The callback is optional.
If provided, functionality will be executed synchronously and the callback will be called with result.
The same is true for the following functions that have a callback argument:

```coffeescript
slash.exists p, (stat) -> if stat then # ...
```

## isDir(p, cb) dirExists(p, cb)

Returns stat of path p if it is a directory, null otherwise.

## isFile(p, cb) fileExists(p, cb)

Returns stat of path p if it is a file, null otherwise.

## isWritable(p, cb)

Returns true if p is writable.

## isText(p)

Returns true if p is a textfile.

## readText(p, cb)

Returns content of p as an utf8 string. 
Returns an empty string, if p doesn't exist or isn't readable.

## sanitize(p)

Removes leading and trailing newlines from path p.

## win()

Returns true if path.sep is '/'. 
Reasonable heuristic to check if code is running on a Windows box:
on `wsl` os.platform() returns 'linux', but path.sep is still '/'.

## isAbsolute(p) isRelative(p) normalize(p) dirname(p) extname(p) basename(p, ext) parse(p) join()

Same as the functions of the `path` module but p is `sanitized` and `slashed` first.

## Doesn't throw

All functions return an empty string or null if the provided path is an empty string, null or undefined.
The same is true, if an underlying function call throws an error.

If this is too lax for your taste, or you want to debug your code, you can redefine the function `slash.error`:

```coffeescript
slash.error = (msg) -> # throw or log or something else ...
```

