// monsterkodi/kode 0.128.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var slash, dirList

slash = require('./kslash')

dirList = function (dirPath, opt, cb)
{
    var walkdir, _36_21_, _37_21_, _38_21_, dirs, files, filter, onDir, onFile, fileSort, walker

    walkdir = require('walkdir')
    if (typeof(dirPath) == 'function' && !(opt != null))
    {
        cb = dirPath
        dirPath = '.'
    }
    else
    {
        if (typeof(opt) == 'function' && !(cb != null))
        {
            cb = opt
        }
        else
        {
            cb = (cb != null ? cb : (opt != null ? opt.cb : undefined))
        }
    }
    opt = (opt != null ? opt : {})
    opt.textTest = ((_36_21_=opt.textTest) != null ? _36_21_ : false)
    opt.ignoreHidden = ((_37_21_=opt.ignoreHidden) != null ? _37_21_ : true)
    opt.logError = ((_38_21_=opt.logError) != null ? _38_21_ : true)
    dirs = []
    files = []
    dirPath = slash.resolve(dirPath)
    filter = function (p)
    {
        var base

        base = slash.file(p)
        if (base.startsWith('.'))
        {
            if (opt.ignoreHidden)
            {
                return true
            }
            if (_k_.in(base,['.DS_Store']))
            {
                return true
            }
        }
        if (base === 'Icon\r')
        {
            return true
        }
        if (base.toLowerCase().startsWith('ntuser.'))
        {
            return true
        }
        if (base.toLowerCase().startsWith('$recycle'))
        {
            return true
        }
        return false
    }
    onDir = function (d, stat)
    {
        var dir

        if (!filter(d))
        {
            dir = {type:'dir',file:slash.path(d),name:slash.basename(d),stat:stat}
            return dirs.push(dir)
        }
    }
    onFile = function (f, stat)
    {
        var file

        if (!filter(f))
        {
            file = {type:'file',file:slash.path(f),name:slash.basename(f),stat:stat}
            if (opt.textTest)
            {
                if (slash.isText(f))
                {
                    file.textFile = true
                }
            }
            return files.push(file)
        }
    }
    fileSort = function (a, b)
    {
        return a.name.localeCompare(b.name)
    }
    if (typeof(cb) == 'function')
    {
        try
        {
            walker = walkdir.walk(dirPath,{no_recurse:true})
            walker.on('directory',onDir)
            walker.on('file',onFile)
            walker.on('end',function ()
            {
                return cb(dirs.sort(fileSort).concat(files.sort(fileSort)))
            })
            walker.on('error',function (err)
            {
                if (opt.logError)
                {
                    console.error(err)
                }
            })
            return walker
        }
        catch (err)
        {
            if (opt.logError)
            {
                console.error(err)
            }
        }
    }
    else
    {
        try
        {
            walkdir.sync(dirPath,{no_recurse:true},function (p, stat)
            {
                if (stat.isDirectory())
                {
                    return onDir(p,stat)
                }
                else
                {
                    return onFile(p,stat)
                }
            })
            return dirs.sort(fileSort).concat(files.sort(fileSort))
        }
        catch (err)
        {
            if (opt.logError)
            {
                console.error(err)
            }
            return []
        }
    }
}
module.exports = dirList