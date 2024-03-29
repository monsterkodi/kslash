
![kslash](kslash.png)

**kslash** is a collection of path utilities.

I use it as a replacement for [node's](https://nodejs.org/) [`path`](https://nodejs.org/dist/latest/docs/api/path.html) module.
It aims to deal with file paths in a platform independent way.
Maybe it contains some tools of interest to you, even if you target only one platform.

## resolve(p ...) 

Applies `unenv` and `untilde` before converting path into an absolute one.

Joins all arguments before doing so.

This is the function I use the most and it usually resolves all my problems ☺️

## path(p) 

Normalizes the path and converts backslashes to slashes.

```coffeescript
slash = require 'kslash'
slash.path 'C:\\Back\\Slash'                           ▸ C:/Back/Slash
slash.path 'C:\\Back\\Slash\\..\\To\\The\\..\\Future'  ▸ C:/Back/To/Future
```

Windows is capable of handling paths with forward slashes,
that's why all exported functions return 'slashed' paths -- except the next one -- which you can use in cases where it isn't :)

## unslash(p)

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

## unenv(p) 

Replaces `$...` with matching environment variables

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

## tmpfile(ext)

Returns a joined path of os.tmpdir and an [uuid](https://www.npmjs.com/package/uuid)

## pkg(p)

Searches backwards in `pathlist` of p for a package.json and returns the containing folder, if one is found.

## git(p) 

Same as `pkg`, just looking for `.git` directory instead.

## touch(p)

Like the unix command, creates intermediate directories if they don't exist.

## list(p,opt,cb) listdir(p,opt,cb)

Calls back with a list of info objects for items in directory p.
A small wrapper around the `walkdir` package.

## exists(p, cb)

Returns [stat](https://nodejs.org/dist/latest/docs/api/fs.html#fs_class_fs_stats) of path p if it exists, null otherwise.

The callback is optional.
If provided, the test is executed asynchronously and the callback will be called with the result

```coffeescript
slash.exists p, (stat) -> if stat then # ...
```

The same is true for the following functions that have a callback argument:

## isDir(p, cb) dirExists(p, cb)

Returns [stat](https://nodejs.org/dist/latest/docs/api/fs.html#fs_class_fs_stats) of path p if it is a directory, null otherwise.

## isFile(p, cb) fileExists(p, cb)

Returns [stat](https://nodejs.org/dist/latest/docs/api/fs.html#fs_class_fs_stats) of path p if it is a file, null otherwise.

## isWritable(p, cb)

Returns true if p is writable.

## isText(p)

Returns true if p is a textfile.

## readText(p, cb)

Returns content of p as an utf8 string. 
Returns an empty string, if p doesn't exist or isn't readable.

## unused(p, cb)

Returns p if p doesn't exist. 
Otherwise, returns a path with a number attached such that the path doesn't exist.

## watch(p, cb)

calls cb each time p changes. if p is a directory, cb will be called for each file change in that directory.

## unwatch(p, cb)

removes watches created with watch.

## sanitize(p)

Removes leading and trailing newlines from path p.

## win()

Returns true if path.sep is '\\'. 

## isAbsolute(p) isRelative(p) normalize(p) dirname(p) extname(p) basename(p, ext) parse(p) join()

Same as the functions of the `path` module but p is `sanitized` and `slashed` first.

## Doesn't throw

All functions return an empty string or null if the provided path is an empty string, null or undefined.
The same is true, if an underlying function call throws an error.

If this is too lax for your taste, or you want to debug your code, you can redefine the function `slash.error`:

```coffeescript
slash.error = (msg) -> # throw or log or something else ...
```

[![npm package][npm-image]][npm-url] 
[![downloads][downloads-image]][downloads-url] 

[npm-image]:https://img.shields.io/npm/v/kslash.svg
[npm-url]:http://npmjs.org/package/kslash
[downloads-image]:https://img.shields.io/npm/dm/kslash.svg
[downloads-url]:https://www.npmtrends.com/kslash
