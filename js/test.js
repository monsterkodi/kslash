// monsterkodi/kode 0.249.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var f, f2, f3, home, process, slash, t, _381_32_, _382_33_, _383_41_, _396_37_, _397_36_, _401_35_, _402_36_, _412_29_, _413_30_, _415_26_, _416_24_, _598_24_, _599_24_, _600_24_

slash = require('../')
process = require('process')
module.exports["kslash"] = function ()
{
    section("path", function ()
    {
        compare(slash.path("C:\\"),"C:/")
        compare(slash.path("C:/"),"C:/")
        compare(slash.path("C://"),"C:/")
        compare(slash.path("C:"),"C:/")
        compare(slash.path("C:\\Back\\Slash\\Crap"),"C:/Back/Slash/Crap")
        compare(slash.path("C:\\Back\\Slash\\Crap\\..\\..\\To\\The\\..\\Future"),"C:/Back/To/Future")
    })
    section("removeDrive", function ()
    {
        compare(slash.removeDrive('/some/path'),'/some/path')
        compare(slash.removeDrive('c:/some/path'),'/some/path')
        compare(slash.removeDrive('c:\\some\\path'),'/some/path')
        compare(slash.removeDrive('c:/'),'/')
        compare(slash.removeDrive('c:\\'),'/')
        compare(slash.removeDrive('c:'),'/')
        compare(slash.removeDrive('/'),'/')
    })
    section("ext", function ()
    {
        compare(slash.ext('./none'),'')
        compare(slash.ext('./some.ext'),'ext')
        compare(slash.ext('./some.more.ext'),'ext')
    })
    section("removeExt", function ()
    {
        compare(slash.removeExt('./none'),'./none')
        compare(slash.removeExt('./some.ext'),'./some')
        compare(slash.removeExt('./some.more.ext'),'./some.more')
    })
    section("splitExt", function ()
    {
        compare(slash.splitExt('./none'),['./none',''])
        compare(slash.splitExt('./some.ext'),['./some','ext'])
        compare(slash.splitExt('./some.more.ext'),['./some.more','ext'])
        compare(slash.splitExt('/none'),['/none',''])
        compare(slash.splitExt('/some.ext'),['/some','ext'])
        compare(slash.splitExt('/some.more.ext'),['/some.more','ext'])
        compare(slash.splitExt('none'),['none',''])
        compare(slash.splitExt('some.ext'),['some','ext'])
        compare(slash.splitExt('some.more.ext'),['some.more','ext'])
    })
    section("swapExt", function ()
    {
        compare(slash.swapExt('./some','new'),'./some.new')
        compare(slash.swapExt('./some.ext','new'),'./some.new')
        compare(slash.swapExt('./some.more.ext','new'),'./some.more.new')
        compare(slash.swapExt('/some','new'),'/some.new')
        compare(slash.swapExt('/some.ext','new'),'/some.new')
        compare(slash.swapExt('/some.more.ext','new'),'/some.more.new')
        compare(slash.swapExt('some','new'),'some.new')
        compare(slash.swapExt('some.ext','new'),'some.new')
        compare(slash.swapExt('some.more.ext','new'),'some.more.new')
    })
    section("isRoot", function ()
    {
        compare(slash.isRoot('C:/'),true)
        compare(slash.isRoot('D:'),true)
        compare(slash.isRoot('/'),true)
        compare(slash.isRoot('/a'),false)
        compare(slash.isRoot('c:/a'),false)
        compare(slash.isRoot('C:\\a'),false)
    })
    section("dir", function ()
    {
        compare(slash.dir('/some/path/file.txt'),'/some/path')
        compare(slash.dir('/some/dir/'),'/some')
        compare(slash.dir('/some/dir'),'/some')
        compare(slash.dir('some/dir/'),'some')
        compare(slash.dir('some/dir'),'some')
        compare(slash.dir('/some/'),'/')
        compare(slash.dir('/some'),'/')
        compare(slash.dir('C:/Back'),'C:/')
        compare(slash.dir('D:\\Back'),'D:/')
        compare(slash.dir('../..'),'..')
        compare(slash.dir('.'),'')
        compare(slash.dir('..'),'')
        compare(slash.dir('./'),'')
        compare(slash.dir('../'),'')
        compare(slash.dir('~'),'')
        compare(slash.dir('~/'),'')
        compare(slash.dir('C:/'),'')
        compare(slash.dir('C:/'),'')
    })
    section("pathlist", function ()
    {
        compare(slash.pathlist('/some/path.txt'),['/','/some','/some/path.txt'])
        compare(slash.pathlist('/'),['/'])
        compare(slash.pathlist('.'),['.'])
        compare(slash.pathlist(''),[])
        compare(slash.pathlist('C:\\Back\\Slash\\'),['C:/','C:/Back','C:/Back/Slash'])
        compare(slash.pathlist('C:/Slash'),['C:/','C:/Slash'])
        compare(slash.pathlist('/c/Slash'),['/','/c','/c/Slash'])
        compare(slash.pathlist('\\d\\Slash'),['/','/d','/d/Slash'])
        compare(slash.pathlist('~'),['~'])
    })
    section("base", function ()
    {
        compare(slash.base('/some/path.txt'),'path')
    })
    section("join", function ()
    {
        compare(slash.join('a','b','c'),'a/b/c')
        compare(slash.join('C:\\FOO','.\\BAR','that\\sucks'),'C:/FOO/BAR/that/sucks')
    })
    section("home", function ()
    {
        if (slash.win())
        {
            home = slash.path(process.env['HOMEDRIVE'] + process.env['HOMEPATH'])
        }
        else
        {
            home = process.env['HOME']
        }
        compare(slash.home(),home)
        compare(slash.tilde(home),'~')
        compare(slash.tilde(home + '/sub'),'~/sub')
        compare(slash.untilde('~/sub'),home + '/sub')
    })
    section("unenv", function ()
    {
        compare(slash.unenv('C:/$Recycle.bin'),'C:/$Recycle.bin')
        compare(slash.unenv('$HOME/test'),slash.path(process.env['HOME']) + '/test')
    })
    section("unslash", function ()
    {
        if (!slash.win())
        {
            compare(slash.unslash('/c/test'),'/c/test')
        }
        else
        {
            compare(slash.unslash('/c/test'),'C:\\test')
        }
    })
    section("resolve", function ()
    {
        compare(slash.resolve('~'),slash.home())
        compare(slash.resolve('/'),'/')
        compare(slash.resolve('//'),'/')
        compare(slash.resolve('C:/'),'C:/')
        compare(slash.resolve('C://'),'C:/')
        compare(slash.resolve('C:'),'C:/')
        compare(slash.resolve('C:\\'),'C:/')
        compare(slash.resolve('C:/some/path/on.c'),'C:/some/path/on.c')
        compare(slash.resolve('~','a','b'),slash.resolve(slash.join('~','a','b')))
    })
    section("relative", function ()
    {
        compare(slash.relative('C:\\test\\some\\path.txt','C:\\test\\some\\other\\path'),'../../path.txt')
        compare(slash.relative('C:\\some\\path','C:/some/path'),'.')
        compare(slash.relative('C:/Users/kodi/s/konrad/app/js/coffee.js','C:/Users/kodi/s/konrad'),'app/js/coffee.js')
        compare(slash.relative('C:/some/path/on.c','D:/path/on.d'),'C:/some/path/on.c')
        compare(slash.relative('C:\\some\\path\\on.c','D:\\path\\on.d'),'C:/some/path/on.c')
        compare(slash.relative('\\test\\some\\path.txt','\\test\\some\\other\\path'),'../../path.txt')
        compare(slash.relative('\\some\\path','/some/path'),'.')
        compare(slash.relative('/Users/kodi/s/konrad/app/js/coffee.js','/Users/kodi/s/konrad'),'app/js/coffee.js')
        compare(slash.relative('/some/path/on.c','/path/on.d'),'../../some/path/on.c')
        compare(slash.relative('\\some\\path\\on.c','\\path\\on.d'),'../../some/path/on.c')
    })
    section("parse", function ()
    {
        if (!slash.win())
        {
            return
        }
        compare(slash.parse('c:').root,'c:/')
        compare(slash.parse('c:').dir,'c:/')
    })
    section("split", function ()
    {
        compare(slash.split('/c/users/home/'),['c','users','home'])
        compare(slash.split("d/users/home"),['d','users','home'])
        compare(slash.split("c:/some/path"),['c:','some','path'])
        compare(slash.split('d:\\some\\path\\'),['d:','some','path'])
    })
    section("splitDrive", function ()
    {
        compare(slash.splitDrive('/some/path'),['/some/path',''])
        compare(slash.splitDrive('c:/some/path'),['/some/path','c'])
        compare(slash.splitDrive('c:\\some\\path'),['/some/path','c'])
        compare(slash.splitDrive('c:\\'),['/','c'])
        compare(slash.splitDrive('c:'),['/','c'])
    })
    section("splitFileLine", function ()
    {
        compare(slash.splitFileLine('/some/path'),['/some/path',1,0])
        compare(slash.splitFileLine('/some/path:123'),['/some/path',123,0])
        compare(slash.splitFileLine('/some/path:123:15'),['/some/path',123,15])
        compare(slash.splitFileLine('c:/some/path:123'),['c:/some/path',123,0])
        compare(slash.splitFileLine('c:/some/path:123:15'),['c:/some/path',123,15])
    })
    section("splitFilePos", function ()
    {
        compare(slash.splitFilePos('/some/path'),['/some/path',[0,0]])
        compare(slash.splitFilePos('/some/path:123'),['/some/path',[0,122]])
        compare(slash.splitFilePos('/some/path:123:15'),['/some/path',[15,122]])
        compare(slash.splitFilePos('c:/some/path:123'),['c:/some/path',[0,122]])
        compare(slash.splitFilePos('c:/some/path:123:15'),['c:/some/path',[15,122]])
    })
    section("joinFilePos", function ()
    {
        compare(slash.joinFilePos('/some/path',[0,0]),'/some/path')
        compare(slash.joinFilePos('/some/path',[1,0]),'/some/path:1:1')
        compare(slash.joinFilePos('/some/path',[0,1]),'/some/path:2')
        compare(slash.joinFilePos('/some/path',[1,1]),'/some/path:2:1')
        compare(slash.joinFilePos('/some/path',[0,4]),'/some/path:5')
        compare(slash.joinFilePos('/some/path',[1,5]),'/some/path:6:1')
        compare(slash.joinFilePos('/some/path:23:45',[1,5]),'/some/path:6:1')
        compare(slash.joinFilePos('/some/path:23',[1,5]),'/some/path:6:1')
        compare(slash.joinFilePos('/some/path'),'/some/path')
        compare(slash.joinFilePos('/some/path',[]),'/some/path')
    })
    section("joinFileLine", function ()
    {
        compare(slash.joinFileLine('/some/path',1),'/some/path:1')
        compare(slash.joinFileLine('/some/path',4,0),'/some/path:4')
        compare(slash.joinFileLine('/some/path',5,1),'/some/path:5:1')
        compare(slash.joinFileLine('/some/path:23:45',5,1),'/some/path:5:1')
        compare(slash.joinFileLine('/some/path:23',5,1),'/some/path:5:1')
        compare(slash.joinFileLine('/some/path'),'/some/path')
        compare(slash.joinFileLine('/some/path',0),'/some/path')
    })
    section("exists", function ()
    {
        compare(((slash.exists(__dirname) != null)),true)
        compare(((slash.exists(__filename) != null)),true)
        compare(((slash.exists(__filename + 'foo') != null)),false)
        section("async", function ()
        {
            slash.exists(__filename,function (stat)
            {
                return compare(((stat != null)),true)
            })
            section("not", function ()
            {
                slash.exists(__filename + 'foo',function (stat)
                {
                    return compare(((stat != null)),false)
                })
            })
        })
    })
    section("fileExists", function ()
    {
        compare(((slash.fileExists(__filename) != null)),true)
        compare(((slash.fileExists(__dirname) != null)),false)
    })
    section("dirExists", function ()
    {
        compare(((slash.dirExists(__dirname) != null)),true)
        compare(((slash.dirExists(__filename) != null)),false)
    })
    section("pkg", function ()
    {
        compare(((slash.pkg(__dirname) != null)),true)
        compare(((slash.pkg(__filename) != null)),true)
        compare(((slash.pkg('C:\\') != null)),false)
        compare(((slash.pkg('C:') != null)),false)
    })
    section("isRelative", function ()
    {
        compare(slash.isRelative(__dirname),false)
        compare(slash.isRelative('.'),true)
        compare(slash.isRelative('..'),true)
        compare(slash.isRelative('.././bla../../fark'),true)
        compare(slash.isRelative('C:\\blafark'),false)
        compare(slash.isRelative('C:\\'),false)
        compare(slash.isRelative('C:/'),false)
        compare(slash.isRelative('C:'),false)
        compare(slash.isRelative('..\\blafark'),true)
    })
    section("sanitize", function ()
    {
        compare((slash.sanitize('a.b\n')),'a.b')
        compare((slash.sanitize('\n\n c . d  \n\n\n')),' c . d  ')
    })
    section("isText", function ()
    {
        compare(slash.isText(__dirname + '/../package.json'),true)
        compare(slash.isText(__dirname + '/../img/kslash.png'),false)
    })
    section("readText", function ()
    {
        compare((slash.readText(__dirname + '/../package.noon')),function (a)
        {
            return a.startsWith('name')
        })
        compare((slash.readText(__dirname + '/dir/filedoesntexist')),'')
        section("callback", function ()
        {
            slash.readText(__dirname + '/../package.noon',function (text)
            {
                return compare(text,function (a)
                {
                    return a.startsWith('name')
                })
            })
            section("fail", function ()
            {
                slash.readText(__dirname + '/dir/filedoesntexist',function (text)
                {
                    return compare(text,'')
                })
            })
        })
    })
    section("writeText", function ()
    {
        f = slash.join(__dirname,'test.txt')
        compare(slash.writeText(f,'hello'),f)
        compare(slash.readText(f),'hello')
        f = slash.join(__dirname,'test.txt','subdir')
        compare(slash.writeText(f,'hello'),'')
        section("callback", function ()
        {
            f2 = slash.join(__dirname,'test.txt')
            slash.writeText(f2,"hello world",function (p)
            {
                compare(slash.readText(p),'hello world')
                compare(p,f2)
                return slash.remove(p)
            })
            section("fail", function ()
            {
                f3 = slash.join(__dirname,'test.txt','subdir')
                slash.writeText(f3,"nope",function (p)
                {
                    return compare(p,'')
                })
            })
        })
    })
    section("dirlist", function ()
    {
        process.chdir(__dirname)
        slash.list(function (items)
        {
            return compare(items.map(function (i)
            {
                return i.file
            }),function (a)
            {
                return _k_.in(slash.path(__filename),a)
            })
        })
        section("''", function ()
        {
            slash.list('',function (items)
            {
                return compare(items.map(function (i)
                {
                    return i.file
                }),function (a)
                {
                    return _k_.in(slash.path(__filename),a)
                })
            })
        })
        section(".", function ()
        {
            slash.list('.',function (items)
            {
                return compare(items.map(function (i)
                {
                    return i.file
                }),function (a)
                {
                    return _k_.in(slash.path(__filename),a)
                })
            })
        })
        section("fail", function ()
        {
            slash.list('fail',{logError:false},function (items)
            {
                return compare(items,[])
            })
        })
        section("..", function ()
        {
            slash.list('..',function (items)
            {
                return compare(items.map(function (i)
                {
                    return i.file
                }),function (a)
                {
                    return _k_.in(slash.resolve(`${__dirname}/../package.noon`),a)
                })
            })
        })
        section("sync", function ()
        {
            compare(slash.list().map(function (i)
            {
                return i.file
            }),function (a)
            {
                return _k_.in(slash.path(__filename),a)
            })
            section("''", function ()
            {
                compare(slash.list('').map(function (i)
                {
                    return i.file
                }),function (a)
                {
                    return _k_.in(slash.path(__filename),a)
                })
            })
            section(".", function ()
            {
                compare(slash.list('.').map(function (i)
                {
                    return i.file
                }),function (a)
                {
                    return _k_.in(slash.path(__filename),a)
                })
            })
            section("fail", function ()
            {
                compare(slash.list('fail',{logError:false}),[])
            })
            section("..", function ()
            {
                compare(slash.list('..').map(function (i)
                {
                    return i.file
                }),function (a)
                {
                    return _k_.in(slash.resolve(`${__dirname}/../package.noon`),a)
                })
            })
        })
    })
    section("unused", function ()
    {
        slash.unused(`${__dirname}/../package.noon`,function (file)
        {
            return compare(file,slash.resolve(`${__dirname}/../package01.noon`))
        })
        section("new", function ()
        {
            slash.unused(`${__dirname}/../some.thing.ugly`,function (file)
            {
                return compare(file,slash.resolve(`${__dirname}/../some.thing.ugly`))
            })
        })
        section("numbered", function ()
        {
            process.chdir(__dirname)
            slash.touch("num99.txt")
            slash.unused("num99.txt",function (file)
            {
                compare(file,slash.resolve(`${__dirname}/num01.txt`))
                return slash.remove("num99.txt")
            })
        })
        section("sync", function ()
        {
            compare(slash.unused(`${__dirname}/../package.noon`),slash.resolve(`${__dirname}/../package01.noon`))
            section("new", function ()
            {
                compare(slash.unused(`${__dirname}/../some.thing`),slash.resolve(`${__dirname}/../some.thing`))
                compare(slash.unused(`${__dirname}/../some`),slash.resolve(`${__dirname}/../some`))
            })
            section("dir", function ()
            {
                compare(slash.unused(__dirname),slash.resolve(__dirname + '01'))
            })
            section("numbered", function ()
            {
                process.chdir(__dirname)
                slash.touch("num88.txt")
                compare(slash.unused("num88.txt"),slash.resolve(`${__dirname}/num01.txt`))
                slash.remove("num88.txt")
            })
        })
    })
    section("tmpfile", function ()
    {
        compare(slash.tmpfile('txt'),function (a)
        {
            return /\.txt$/.test(a)
        })
        compare(slash.tmpfile(),function (a)
        {
            return /[a-f\d]+$/.test(a)
        })
    })
    section("remove", function ()
    {
        t = slash.touch(slash.tmpfile())
        compare(((slash.isFile(t) != null)),true)
        compare(((slash.remove(t) != null)),false)
        compare(((slash.isFile(t) != null)),false)
    })
}
module.exports["kslash"]._section_ = true
module.exports._test_ = true
module.exports
