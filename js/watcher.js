// monsterkodi/kode 0.128.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var slash

slash = require('./kslash')
class Watcher
{
    static dirWatchers = {}

    constructor (dir)
    {
        this.dir = dir
        this.notify = this.notify.bind(this)
        this.onChange = this.onChange.bind(this)
        this.files = {}
        this.cache = {}
        this.cbcks = []
        this.timer = null
        this.watch = slash.fs.watch(this.dir,this.onChange)
    }

    addCb (cb, file)
    {
        var _32_25_

        if (file)
        {
            this.files[file] = ((_32_25_=this.files[file]) != null ? _32_25_ : [])
            if (!(_k_.in(cb,this.files[file])))
            {
                return this.files[file].push(cb)
            }
        }
        else
        {
            if (!(_k_.in(cb,this.cbcks)))
            {
                return this.cbcks.push(cb)
            }
        }
    }

    delCb (cb, file)
    {
        if (file)
        {
            if (_k_.in(cb,this.files[file]))
            {
                this.files[file].splice(this.files[file].indexOf(cb),1)
                if (this.files[file].length === 0)
                {
                    delete this.files[file]
                }
            }
        }
        else
        {
            if (_k_.in(cb,this.cbcks))
            {
                this.cbcks.splice(this.cbcks.indexOf(cb),1)
            }
        }
        if ((this.cbcks.length === 0 && 0 === Object.keys(this.files).length))
        {
            this.watch.close()
            return delete Watcher.dirWatchers[this.dir]
        }
    }

    onChange (change, p)
    {
        var f

        clearTimeout(this.timer)
        f = slash.join(this.dir,p)
        this.cache[f] = 1
        return this.timer = setTimeout(this.notify,100)
    }

    notify ()
    {
        var files, f, cb

        files = Object.keys(this.cache)
        this.cache = {}
        var list = _k_.list(files)
        for (var _78_14_ = 0; _78_14_ < list.length; _78_14_++)
        {
            f = list[_78_14_]
            var list1 = _k_.list(this.files[f])
            for (var _80_19_ = 0; _80_19_ < list1.length; _80_19_++)
            {
                cb = list1[_80_19_]
                cb(f)
            }
            var list2 = _k_.list(this.cbcks)
            for (var _83_19_ = 0; _83_19_ < list2.length; _83_19_++)
            {
                cb = list2[_83_19_]
                cb(f)
            }
        }
    }

    static watch (path, cb)
    {
        var p

        p = slash.resolve(path)
        return slash.isDir(p,(function (d)
        {
            if (d)
            {
                return this.watchDir(cb,p)
            }
            else
            {
                return this.watchDir(cb,slash.dir(p),p)
            }
        }).bind(this))
    }

    static watchDir (cb, dir, file)
    {
        if (!this.dirWatchers[dir])
        {
            this.dirWatchers[dir] = new Watcher(dir)
        }
        return this.dirWatchers[dir].addCb(cb,file)
    }

    static unwatch (path, cb)
    {
        var p

        p = slash.resolve(path)
        return slash.isDir(p,(function (d)
        {
            if (d)
            {
                return this.unwatchDir(cb,p)
            }
            else
            {
                return this.unwatchDir(cb,slash.dir(p),p)
            }
        }).bind(this))
    }

    static unwatchDir (cb, dir, file)
    {
        if (!this.dirWatchers[dir])
        {
            return
        }
        return this.dirWatchers[dir].delCb(cb,file)
    }
}

module.exports = Watcher