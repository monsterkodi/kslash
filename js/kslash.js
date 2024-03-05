// monsterkodi/kode 0.249.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}}

var fs, os, path

os = require('os')
fs = require('fs-extra')
path = require('path')
class Slash
{
    static logErrors = false

    static path (p)
    {
        if (!(p != null ? p.length : undefined))
        {
            return Slash.error("Slash.path -- no path?")
        }
        if (Slash.win())
        {
            p = path.normalize(p)
            p = p.replace(Slash.reg,'/')
        }
        else
        {
            p = p.replace(Slash.reg,'/')
            p = path.normalize(p)
        }
        if (p.endsWith(':.') && p.length === 3)
        {
            p = p.slice(0, 2)
        }
        if (p.endsWith(':') && p.length === 2)
        {
            p = p + '/'
        }
        return p
    }

    static unslash (p)
    {
        if (!(p != null ? p.length : undefined))
        {
            return Slash.error("Slash.unslash -- no path?")
        }
        p = Slash.path(p)
        if (Slash.win())
        {
            if (p.length >= 3 && (p[0] === '/' && '/' === p[2]))
            {
                p = p[1] + ':' + p.slice(2)
            }
            p = path.normalize(p)
            if (p[1] === ':')
            {
                p = p[0].toUpperCase() + p.slice(1)
            }
        }
        return p
    }

    static resolve (p)
    {
        if (!(p != null ? p.length : undefined))
        {
            p = process.cwd()
        }
        if (arguments.length > 1)
        {
            p = Slash.join.apply(0,arguments)
        }
        p = Slash.unenv(Slash.untilde(p))
        if (Slash.isRelative(p))
        {
            p = Slash.path(path.resolve(p))
        }
        else
        {
            p = Slash.path(p)
        }
        return p
    }

    static split (p)
    {
        return Slash.path(p).split('/').filter(function (e)
        {
            return e.length
        })
    }

    static splitDrive (p)
    {
        var filePath, parsed, root

        p = Slash.path(p)
        parsed = Slash.parse(p)
        root = parsed.root
        if (root.length > 1)
        {
            if (p.length > root.length)
            {
                filePath = p.slice(root.length - 1)
            }
            else
            {
                filePath = '/'
            }
            return [filePath,root.slice(0,root.length - 2)]
        }
        else if (parsed.dir.length > 1)
        {
            if (parsed.dir[1] === ':')
            {
                return [p.slice(2),parsed.dir[0]]
            }
        }
        else if (parsed.base.length === 2)
        {
            if (parsed.base[1] === ':')
            {
                return ['/',parsed.base[0]]
            }
        }
        return [Slash.path(p),'']
    }

    static removeDrive (p)
    {
        return Slash.splitDrive(p)[0]
    }

    static isRoot (p)
    {
        return Slash.removeDrive(p) === '/'
    }

    static splitFileLine (p)
    {
        var c, clmn, d, f, l, line, split

        var _106_14_ = Slash.splitDrive(p); f = _106_14_[0]; d = _106_14_[1]

        split = String(f).split(':')
        if (split.length > 1)
        {
            line = parseInt(split[1])
        }
        if (split.length > 2)
        {
            clmn = parseInt(split[2])
        }
        l = c = 0
        if (Number.isInteger(line))
        {
            l = line
        }
        if (Number.isInteger(clmn))
        {
            c = clmn
        }
        if (d !== '')
        {
            d = d + ':'
        }
        return [d + split[0],Math.max(l,1),Math.max(c,0)]
    }

    static splitFilePos (p)
    {
        var c, f, l

        var _118_16_ = Slash.splitFileLine(p); f = _118_16_[0]; l = _118_16_[1]; c = _118_16_[2]

        return [f,[c,l - 1]]
    }

    static removeLinePos (p)
    {
        return Slash.splitFileLine(p)[0]
    }

    static removeColumn (p)
    {
        var f, l

        var _123_14_ = Slash.splitFileLine(p); f = _123_14_[0]; l = _123_14_[1]

        if (l > 1)
        {
            return f + ':' + l
        }
        else
        {
            return f
        }
    }

    static ext (p)
    {
        return path.extname(p).slice(1)
    }

    static splitExt (p)
    {
        return [Slash.removeExt(p),Slash.ext(p)]
    }

    static removeExt (p)
    {
        var l

        l = Slash.ext(p).length
        if (l)
        {
            l += 1
        }
        return p.slice(0, p.length - l)
    }

    static swapExt (p, ext)
    {
        return Slash.removeExt(p) + (ext.startsWith('.') && ext || `.${ext}`)
    }

    static join ()
    {
        return [].map.call(arguments,Slash.path).join('/')
    }

    static joinFilePos (file, pos)
    {
        file = Slash.removeLinePos(file)
        if (!(pos != null) || !(pos[0] != null) || (pos[0] === pos[1] && pos[1] === 0))
        {
            return file
        }
        else if (pos[0])
        {
            return file + `:${pos[1] + 1}:${pos[0]}`
        }
        else
        {
            return file + `:${pos[1] + 1}`
        }
    }

    static joinFileLine (file, line, col)
    {
        file = Slash.removeLinePos(file)
        if (!line)
        {
            return file
        }
        if (!col)
        {
            return `${file}:${line}`
        }
        return `${file}:${line}:${col}`
    }

    static dirlist (p, opt, cb)
    {
        return this.list(p,opt,cb)
    }

    static list (p, opt, cb)
    {
        return require('./dirlist')(p,opt,cb)
    }

    static pathlist (p)
    {
        var list

        if (!(p != null ? p.length : undefined))
        {
            Slash.error("Slash.pathlist -- no path?")
            return []
        }
        p = Slash.normalize(p)
        if (p.length > 1 && p[p.length - 1] === '/' && p[p.length - 2] !== ':')
        {
            p = p.slice(0, p.length - 1)
        }
        list = [p]
        while (Slash.dir(p) !== '')
        {
            list.unshift(Slash.dir(p))
            p = Slash.dir(p)
        }
        return list
    }

    static base (p)
    {
        return path.basename(Slash.sanitize(p),path.extname(Slash.sanitize(p)))
    }

    static file (p)
    {
        return path.basename(Slash.sanitize(p))
    }

    static extname (p)
    {
        return path.extname(Slash.sanitize(p))
    }

    static basename (p, e)
    {
        return path.basename(Slash.sanitize(p),e)
    }

    static isAbsolute (p)
    {
        p = Slash.sanitize(p)
        return p[1] === ':' || path.isAbsolute(p)
    }

    static isRelative (p)
    {
        return !Slash.isAbsolute(p)
    }

    static dirname (p)
    {
        return Slash.path(path.dirname(Slash.sanitize(p)))
    }

    static normalize (p)
    {
        return Slash.path(Slash.sanitize(p))
    }

    static dir (p)
    {
        p = Slash.normalize(p)
        if (Slash.isRoot(p))
        {
            return ''
        }
        p = path.dirname(p)
        if (p === '.')
        {
            return ''
        }
        p = Slash.path(p)
        if (p.endsWith(':') && p.length === 2)
        {
            p += '/'
        }
        return p
    }

    static sanitize (p)
    {
        if (!(p != null ? p.length : undefined))
        {
            return Slash.error("Slash.sanitize -- no path?")
        }
        if (p[0] === '\n')
        {
            Slash.error(`leading newline in path! '${p}'`)
            return Slash.sanitize(p.substr(1))
        }
        if (p.endsWith('\n'))
        {
            Slash.error(`trailing newline in path! '${p}'`)
            return Slash.sanitize(p.substr(0,p.length - 1))
        }
        return p
    }

    static parse (p)
    {
        var dict

        dict = path.parse(p)
        if (dict.dir.length === 2 && dict.dir[1] === ':')
        {
            dict.dir += '/'
        }
        if (dict.root.length === 2 && dict.root[1] === ':')
        {
            dict.root += '/'
        }
        return dict
    }

    static home ()
    {
        return Slash.path(os.homedir())
    }

    static tilde (p)
    {
        var _249_36_

        return (Slash.path(p) != null ? Slash.path(p).replace(Slash.home(),'~') : undefined)
    }

    static untilde (p)
    {
        var _250_36_

        return (Slash.path(p) != null ? Slash.path(p).replace(/^\~/,Slash.home()) : undefined)
    }

    static unenv (p)
    {
        var i, k, v

        i = p.indexOf('$',0)
        while (i >= 0)
        {
            for (k in process.env)
            {
                v = process.env[k]
                if (k === p.slice(i + 1,i + 1 + k.length))
                {
                    p = p.slice(0,i) + v + p.slice(i + k.length + 1)
                    break
                }
            }
            i = p.indexOf('$',i + 1)
        }
        return Slash.path(p)
    }

    static relative (rel, to)
    {
        var rd, rl, td, tl

        if (!(to != null ? to.length : undefined))
        {
            to = process.cwd()
        }
        rel = Slash.resolve(rel)
        if (!Slash.isAbsolute(rel))
        {
            return rel
        }
        if (Slash.resolve(to) === rel)
        {
            return '.'
        }
        var _271_17_ = Slash.splitDrive(rel); rl = _271_17_[0]; rd = _271_17_[1]

        var _272_17_ = Slash.splitDrive(Slash.resolve(to)); tl = _272_17_[0]; td = _272_17_[1]

        if (rd && td && rd !== td)
        {
            return rel
        }
        return Slash.path(path.relative(tl,rl))
    }

    static fileUrl (p)
    {
        return `file:///${Slash.encode(p)}`
    }

    static samePath (a, b)
    {
        return Slash.resolve(a) === Slash.resolve(b)
    }

    static escape (p)
    {
        return p.replace(/([\`\"])/g,'\\$1')
    }

    static encode (p)
    {
        p = encodeURI(p)
        p = p.replace(/\#/g,"%23")
        p = p.replace(/\&/g,"%26")
        return p = p.replace(/\'/g,"%27")
    }

    static pkg (p)
    {
        var _297_20_

        if (((p != null ? p.length : undefined) != null))
        {
            while (p.length && !(_k_.in(Slash.removeDrive(p),['.','/',''])))
            {
                if (Slash.dirExists(Slash.join(p,'.git' || Slash.fileExists(Slash.join(p,'package.noon' || Slash.fileExists(Slash.join(p,'package.json')))))))
                {
                    return Slash.resolve(p)
                }
                p = Slash.dir(p)
            }
        }
        return null
    }

    static git (p, cb)
    {
        var _309_20_

        if (((p != null ? p.length : undefined) != null))
        {
            if (typeof(cb) === 'function')
            {
                Slash.dirExists(Slash.join(p,'.git'),function (stat)
                {
                    if (stat)
                    {
                        return cb(Slash.resolve(p))
                    }
                    else if (!(_k_.in(Slash.removeDrive(p),['.','/',''])))
                    {
                        return Slash.git(Slash.dir(p),cb)
                    }
                })
            }
            else
            {
                while (p.length && !(_k_.in(Slash.removeDrive(p),['.','/',''])))
                {
                    if (Slash.dirExists(Slash.join(p,'.git')))
                    {
                        return Slash.resolve(p)
                    }
                    p = Slash.dir(p)
                }
            }
        }
        return null
    }

    static exists (p, cb)
    {
        var stat

        if (typeof(cb) === 'function')
        {
            try
            {
                if (!(p != null))
                {
                    cb()
                    return
                }
                p = Slash.resolve(Slash.removeLinePos(p))
                fs.access(p,(fs.R_OK | fs.F_OK),function (err)
                {
                    if ((err != null))
                    {
                        return cb()
                    }
                    else
                    {
                        return fs.stat(p,function (err, stat)
                        {
                            if ((err != null))
                            {
                                return cb()
                            }
                            else
                            {
                                return cb(stat)
                            }
                        })
                    }
                })
            }
            catch (err)
            {
                Slash.error("Slash.exists -- " + String(err))
            }
        }
        else
        {
            if ((p != null))
            {
                try
                {
                    p = Slash.resolve(Slash.removeLinePos(p))
                    if (stat = fs.statSync(p))
                    {
                        fs.accessSync(p,fs.R_OK)
                        return stat
                    }
                }
                catch (err)
                {
                    if (_k_.in(err.code,['ENOENT','ENOTDIR']))
                    {
                        return null
                    }
                    Slash.error("Slash.exists -- " + String(err))
                }
            }
        }
        return null
    }

    static fileExists (p, cb)
    {
        var stat

        if (typeof(cb) === 'function')
        {
            return Slash.exists(p,function (stat)
            {
                if ((stat != null ? stat.isFile() : undefined))
                {
                    return cb(stat)
                }
                else
                {
                    return cb()
                }
            })
        }
        else
        {
            if (stat = Slash.exists(p))
            {
                if (stat.isFile())
                {
                    return stat
                }
            }
        }
    }

    static dirExists (p, cb)
    {
        var stat

        if (typeof(cb) === 'function')
        {
            return Slash.exists(p,function (stat)
            {
                if ((stat != null ? stat.isDirectory() : undefined))
                {
                    return cb(stat)
                }
                else
                {
                    return cb()
                }
            })
        }
        else
        {
            if (stat = Slash.exists(p))
            {
                if (stat.isDirectory())
                {
                    return stat
                }
            }
        }
    }

    static touch (p)
    {
        var dir

        try
        {
            dir = Slash.dir(p)
            if (!Slash.isDir(dir))
            {
                fs.mkdirSync(dir,{recursive:true})
            }
            if (!Slash.fileExists(p))
            {
                fs.writeFileSync(p,'')
            }
            return p
        }
        catch (err)
        {
            Slash.error("Slash.touch -- " + String(err))
            return false
        }
    }

    static unused (p, cb)
    {
        var dir, ext, i, name, test

        name = Slash.base(p)
        dir = Slash.dir(p)
        ext = Slash.ext(p)
        ext = ext && '.' + ext || ''
        if (/\d\d$/.test(name))
        {
            name = name.slice(0,name.length - 2)
        }
        if (typeof(cb) === 'function')
        {
            return Slash.exists(p,function (stat)
            {
                var check, i, test

                if (!stat)
                {
                    cb(Slash.resolve(p))
                    return
                }
                i = 1
                test = ''
                check = function ()
                {
                    test = `${name}${`${i}`.padStart(2,'0')}${ext}`
                    if (dir)
                    {
                        test = Slash.join(dir,test)
                    }
                    return Slash.exists(test,function (stat)
                    {
                        if (stat)
                        {
                            i += 1
                            return check()
                        }
                        else
                        {
                            return cb(Slash.resolve(test))
                        }
                    })
                }
                return check()
            })
        }
        else
        {
            if (!Slash.exists(p))
            {
                return Slash.resolve(p)
            }
            for (i = 1; i <= 1000; i++)
            {
                test = `${name}${`${i}`.padStart(2,'0')}${ext}`
                if (dir)
                {
                    test = Slash.join(dir,test)
                }
                if (!Slash.exists(test))
                {
                    return Slash.resolve(test)
                }
            }
        }
    }

    static isDir (p, cb)
    {
        return Slash.dirExists(p,cb)
    }

    static isFile (p, cb)
    {
        return Slash.fileExists(p,cb)
    }

    static isWritable (p, cb)
    {
        if (typeof(cb) === 'function')
        {
            try
            {
                return fs.access(Slash.resolve(p),(fs.constants.R_OK | fs.constants.W_OK),function (err)
                {
                    return cb(!err)
                })
            }
            catch (err)
            {
                Slash.error("Slash.isWritable -- " + String(err))
                return cb(false)
            }
        }
        else
        {
            try
            {
                fs.accessSync(Slash.resolve(p),(fs.constants.R_OK | fs.constants.W_OK))
                return true
            }
            catch (err)
            {
                return false
            }
        }
    }

    static textext = null

    static textbase = {profile:1,license:1,'.gitignore':1,'.npmignore':1}

    static isText (p)
    {
        var ext, isBinary

        try
        {
            if (!Slash.textext)
            {
                Slash.textext = {}
                var list = _k_.list(require('textextensions'))
                for (var _486_24_ = 0; _486_24_ < list.length; _486_24_++)
                {
                    ext = list[_486_24_]
                    Slash.textext[ext] = true
                }
                Slash.textext['crypt'] = true
            }
            ext = Slash.ext(p)
            if (ext && (Slash.textext[ext] != null))
            {
                return true
            }
            if (Slash.textbase[Slash.basename(p).toLowerCase()])
            {
                return true
            }
            p = Slash.resolve(p)
            if (!Slash.isFile(p))
            {
                return false
            }
            isBinary = require('isbinaryfile')
            return !isBinary.isBinaryFileSync(p)
        }
        catch (err)
        {
            Slash.error("Slash.isText -- " + String(err))
            return false
        }
    }

    static readText (p, cb)
    {
        if (typeof(cb) === 'function')
        {
            try
            {
                return fs.readFile(p,'utf8',function (err, text)
                {
                    return cb(!err && text || '')
                })
            }
            catch (err)
            {
                Slash.error("Slash.readText -- " + String(err))
                return cb('')
            }
        }
        else
        {
            try
            {
                return fs.readFileSync(p,'utf8')
            }
            catch (err)
            {
                Slash.error("Slash.readText -- " + String(err))
            }
            return ''
        }
    }

    static writeText (p, text, cb)
    {
        var tmpfile

        tmpfile = Slash.tmpfile()
        if (typeof(cb) === 'function')
        {
            try
            {
                return this.fileExists(p,function (stat)
                {
                    var mode, _525_38_

                    mode = ((_525_38_=(stat != null ? stat.mode : undefined)) != null ? _525_38_ : 0o666)
                    return fs.writeFile(tmpfile,text,{mode:mode},function (err)
                    {
                        if (err)
                        {
                            Slash.error("Slash.writeText - " + String(err))
                            return cb('')
                        }
                        else
                        {
                            return fs.move(tmpfile,p,{overwrite:true},function (err)
                            {
                                if (err)
                                {
                                    Slash.error(`Slash.writeText -- move ${tmpfile} -> ${p} ERROR:` + String(err))
                                    return cb('')
                                }
                                else
                                {
                                    return cb(p)
                                }
                            })
                        }
                    })
                })
            }
            catch (err)
            {
                return cb(Slash.error("Slash.writeText --- " + String(err)))
            }
        }
        else
        {
            try
            {
                fs.writeFileSync(tmpfile,text)
                fs.moveSync(tmpfile,p,{overwrite:true})
                return p
            }
            catch (err)
            {
                Slash.error("Slash.writeText -- " + String(err))
            }
            return ''
        }
    }

    static watch (p, cb)
    {
        var Watcher

        Watcher = require('./watcher')
        return Watcher.watch(p,cb)
    }

    static unwatch (p, cb)
    {
        var Watcher

        Watcher = require('./watcher')
        return Watcher.unwatch(p,cb)
    }

    static tmpfile (ext)
    {
        return Slash.join(os.tmpdir(),require('uuid').v1() + (ext && `.${ext}` || ''))
    }

    static remove (p, cb)
    {
        if (cb)
        {
            return fs.remove(p,cb)
        }
        else
        {
            return fs.removeSync(p)
        }
    }

    static reg = new RegExp("\\\\",'g')

    static win ()
    {
        return path.sep === '\\'
    }

    static fs = fs

    static error (msg)
    {
        if (this.logErrors)
        {
            console.error(msg)
        }
        return ''
    }
}

module.exports = Slash