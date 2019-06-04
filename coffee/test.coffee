# 000000000  00000000   0000000  000000000
#    000     000       000          000
#    000     0000000   0000000      000
#    000     000            000     000
#    000     00000000  0000000      000

slash = require '../'
chai = require 'chai'
chai.should()
expect = chai.expect

describe 'kslash', ->
    
    # 0000000    000  00000000   
    # 000   000  000  000   000  
    # 000   000  000  0000000    
    # 000   000  000  000   000  
    # 0000000    000  000   000  
    
    it 'dir', ->
        
        (slash.dir '/some/path/file.txt').should.eql '/some/path'
        
        (slash.dir '/some/dir/').should.eql '/some'
        
        if slash.win()
            (slash.dir 'C:\\Back\\').should.eql 'C:/'
        
        (slash.dir '../..').should.eql '..'

        (slash.dir '/').should.eql ''

        (slash.dir '.').should.eql ''
        
        (slash.dir '..').should.eql ''
        
        (slash.dir '~').should.eql ''

        (slash.dir './').should.eql ''
        
        (slash.dir '../').should.eql ''
        
        (slash.dir '~/').should.eql ''
        
        if slash.win()
            (slash.dir 'C:/').should.eql ''
        
    # 00000000    0000000   000000000  000   000  000      000   0000000  000000000  
    # 000   000  000   000     000     000   000  000      000  000          000     
    # 00000000   000000000     000     000000000  000      000  0000000      000     
    # 000        000   000     000     000   000  000      000       000     000     
    # 000        000   000     000     000   000  0000000  000  0000000      000     
    
    it 'pathlist', ->
        
        (slash.pathlist '/some/path.txt').should.eql ['/', '/some', '/some/path.txt']

        (slash.pathlist '/').should.eql ['/']
        
        (slash.pathlist '').should.eql []
        
        if slash.win()
            (slash.pathlist 'C:\\Back\\Slash\\').should.eql ['C:/', 'C:/Back', 'C:/Back/Slash/']

        (slash.pathlist '~').should.eql ['~']
                    
    # 0000000     0000000    0000000  00000000  
    # 000   000  000   000  000       000       
    # 0000000    000000000  0000000   0000000   
    # 000   000  000   000       000  000       
    # 0000000    000   000  0000000   00000000  
    
    it 'base', -> 
        
        (slash.base '/some/path.txt').should.eql 'path'
            
    # 00000000    0000000   000000000  000   000  
    # 000   000  000   000     000     000   000  
    # 00000000   000000000     000     000000000  
    # 000        000   000     000     000   000  
    # 000        000   000     000     000   000  
    
    it 'path', ->
        
        return if not slash.win()
        
        (slash.path "C:\\Back\\Slash\\Crap").should.eql "C:/Back/Slash/Crap"
        
        (slash.path "C:\\Back\\Slash\\Crap\\..\\..\\To\\The\\..\\Future").should.eql "C:/Back/To/Future"
        
    #       000   0000000   000  000   000  
    #       000  000   000  000  0000  000  
    #       000  000   000  000  000 0 000  
    # 000   000  000   000  000  000  0000  
    #  0000000    0000000   000  000   000  
    
    it 'join', ->
        
        (slash.join 'a', 'b', 'c').should.eql 'a/b/c'
        
        return if not slash.win()
        
        (slash.join 'C:\\FOO', '.\\BAR', 'that\\sucks').should.eql 'C:/FOO/BAR/that/sucks'

    # 000   000   0000000   00     00  00000000  
    # 000   000  000   000  000   000  000       
    # 000000000  000   000  000000000  0000000   
    # 000   000  000   000  000 0 000  000       
    # 000   000   0000000   000   000  00000000  
    
    it 'home', ->
        
        if slash.win()
            home = slash.path process.env['HOMEDRIVE'] + process.env['HOMEPATH']
        else
            home = process.env['HOME']
            
        (slash.home()).should.eql home
        
        (slash.tilde home).should.eql '~'

        (slash.tilde home + '/sub').should.eql '~/sub'
        
        (slash.untilde '~/sub').should.eql home + '/sub'

    # 000   000  000   000  00000000  000   000  000   000  
    # 000   000  0000  000  000       0000  000  000   000  
    # 000   000  000 0 000  0000000   000 0 000   000 000   
    # 000   000  000  0000  000       000  0000     000     
    #  0000000   000   000  00000000  000   000      0      
    
    it 'unenv', ->
        
        (slash.unenv 'C:/$Recycle.bin').should.eql 'C:/$Recycle.bin'

        return if not slash.win()

        (slash.unenv '$HOME/test').should.eql slash.path(process.env['HOME']) + '/test'

    # 000   000  000   000   0000000  000       0000000    0000000  000   000  
    # 000   000  0000  000  000       000      000   000  000       000   000  
    # 000   000  000 0 000  0000000   000      000000000  0000000   000000000  
    # 000   000  000  0000       000  000      000   000       000  000   000  
    #  0000000   000   000  0000000   0000000  000   000  0000000   000   000  
    
    it 'unslash', ->
        
        return if not slash.win()

        (slash.unslash '/c/test').should.eql 'C:\\test'
        
    # 00000000   00000000   0000000   0000000   000      000   000  00000000  
    # 000   000  000       000       000   000  000      000   000  000       
    # 0000000    0000000   0000000   000   000  000       000 000   0000000   
    # 000   000  000            000  000   000  000         000     000       
    # 000   000  00000000  0000000    0000000   0000000      0      00000000  
    
    it 'resolve', ->
        
        (slash.resolve '~').should.eql slash.home()

    # 00000000   00000000  000       0000000   000000000  000  000   000  00000000  
    # 000   000  000       000      000   000     000     000  000   000  000       
    # 0000000    0000000   000      000000000     000     000   000 000   0000000   
    # 000   000  000       000      000   000     000     000     000     000       
    # 000   000  00000000  0000000  000   000     000     000      0      00000000  
    
    it 'relative', ->
        
        (slash.relative 'C:\\test\\some\\path.txt', 'C:\\test\\some\\other\\path').should.eql '../../path.txt'
    
        (slash.relative 'C:\\some\\path', 'C:/some/path').should.eql '.'

        (slash.relative 'C:/Users/kodi/s/konrad/app/js/coffee.js', 'C:/Users/kodi/s/konrad').should.eql 'app/js/coffee.js'

        if slash.win()
            
            (slash.relative 'C:/some/path/on.c', 'D:/path/on.d').should.eql 'C:/some/path/on.c'
            
            (slash.relative 'C:\\some\\path\\on.c', 'D:\\path\\on.d').should.eql 'C:/some/path/on.c'
        
    # 00000000    0000000   00000000    0000000  00000000  
    # 000   000  000   000  000   000  000       000       
    # 00000000   000000000  0000000    0000000   0000000   
    # 000        000   000  000   000       000  000       
    # 000        000   000  000   000  0000000   00000000  
    
    it 'parse', ->
        
        return if not slash.win()
        (slash.parse('c:').root).should.eql 'c:/'

        (slash.parse('c:').dir).should.eql 'c:/'
        
    #  0000000  00000000   000      000  000000000  
    # 000       000   000  000      000     000     
    # 0000000   00000000   000      000     000     
    #      000  000        000      000     000     
    # 0000000   000        0000000  000     000     
    
    it 'split', ->
        
        (slash.split '/c/users/home/').should.eql ['c', 'users', 'home']
        
        (slash.split 'd/users/home').should.eql ['d', 'users', 'home']
        
        (slash.split 'c:/some/path').should.eql ['c:', 'some', 'path']
        
        (slash.split 'd:\\some\\path\\').should.eql ['d:', 'some', 'path']
            
    #  0000000  00000000   000      000  000000000  0000000    00000000   000  000   000  00000000  
    # 000       000   000  000      000     000     000   000  000   000  000  000   000  000       
    # 0000000   00000000   000      000     000     000   000  0000000    000   000 000   0000000   
    #      000  000        000      000     000     000   000  000   000  000     000     000       
    # 0000000   000        0000000  000     000     0000000    000   000  000      0      00000000  
    
    it 'splitDrive', ->
        
        (slash.splitDrive '/some/path').should.eql ['/some/path', '']
        
        return if not slash.win()
        
        (slash.splitDrive 'c:/some/path').should.eql ['/some/path', 'c']
        
        (slash.splitDrive 'c:\\some\\path').should.eql ['/some/path', 'c']

        (slash.splitDrive 'c:\\').should.eql ['/', 'c']
        
        (slash.splitDrive 'c:').should.eql ['/', 'c']
        
    # 00000000   00000000  00     00   0000000   000   000  00000000  0000000    00000000   000  000   000  00000000  
    # 000   000  000       000   000  000   000  000   000  000       000   000  000   000  000  000   000  000       
    # 0000000    0000000   000000000  000   000   000 000   0000000   000   000  0000000    000   000 000   0000000   
    # 000   000  000       000 0 000  000   000     000     000       000   000  000   000  000     000     000       
    # 000   000  00000000  000   000   0000000       0      00000000  0000000    000   000  000      0      00000000  
    
    it 'removeDrive', ->
        
        (slash.removeDrive '/some/path').should.eql '/some/path'

        return if not slash.win()
        
        (slash.removeDrive 'c:/some/path').should.eql '/some/path'

        (slash.removeDrive 'c:\\some\\path').should.eql '/some/path'

        (slash.removeDrive 'c:/').should.eql '/'

        (slash.removeDrive 'c:\\').should.eql '/'
        
        (slash.removeDrive 'c:').should.eql '/'

    #  0000000  00000000   000      000  000000000  00000000  000  000      00000000  000      000  000   000  00000000  
    # 000       000   000  000      000     000     000       000  000      000       000      000  0000  000  000       
    # 0000000   00000000   000      000     000     000000    000  000      0000000   000      000  000 0 000  0000000   
    #      000  000        000      000     000     000       000  000      000       000      000  000  0000  000       
    # 0000000   000        0000000  000     000     000       000  0000000  00000000  0000000  000  000   000  00000000  
    
    it 'splitFileLine', ->

        (slash.splitFileLine '/some/path').should.eql ['/some/path', 1, 0]
        
        (slash.splitFileLine '/some/path:123').should.eql ['/some/path', 123, 0]

        (slash.splitFileLine '/some/path:123:15').should.eql ['/some/path', 123, 15]

        return if not slash.win()
        
        (slash.splitFileLine 'c:/some/path:123').should.eql ['c:/some/path', 123, 0]

        (slash.splitFileLine 'c:/some/path:123:15').should.eql ['c:/some/path', 123, 15]

    #  0000000  00000000   000      000  000000000  00000000  000  000      00000000  00000000    0000000    0000000  
    # 000       000   000  000      000     000     000       000  000      000       000   000  000   000  000       
    # 0000000   00000000   000      000     000     000000    000  000      0000000   00000000   000   000  0000000   
    #      000  000        000      000     000     000       000  000      000       000        000   000       000  
    # 0000000   000        0000000  000     000     000       000  0000000  00000000  000         0000000   0000000   
    
    it 'splitFilePos', ->

        (slash.splitFilePos '/some/path').should.eql ['/some/path', [0, 0]]

        (slash.splitFilePos '/some/path:123').should.eql ['/some/path', [0, 122]]

        (slash.splitFilePos '/some/path:123:15').should.eql ['/some/path', [15, 122]]

        return if not slash.win()
        
        (slash.splitFilePos 'c:/some/path:123').should.eql ['c:/some/path', [0, 122]]

        (slash.splitFilePos 'c:/some/path:123:15').should.eql ['c:/some/path', [15, 122]]

    #       000   0000000   000  000   000  00000000  000  000      00000000  00000000    0000000    0000000  
    #       000  000   000  000  0000  000  000       000  000      000       000   000  000   000  000       
    #       000  000   000  000  000 0 000  000000    000  000      0000000   00000000   000   000  0000000   
    # 000   000  000   000  000  000  0000  000       000  000      000       000        000   000       000  
    #  0000000    0000000   000  000   000  000       000  0000000  00000000  000         0000000   0000000   
    
    it 'joinFilePos', ->

        (slash.joinFilePos '/some/path', [0,0]).should.eql '/some/path:1'

        (slash.joinFilePos '/some/path', [0,4]).should.eql '/some/path:5'
        
        (slash.joinFilePos '/some/path', [1,5]).should.eql '/some/path:6:1'
        
        (slash.joinFilePos '/some/path').should.eql '/some/path'

        (slash.joinFilePos '/some/path', []).should.eql '/some/path'
        
    # 00000000  000   000  000   0000000  000000000   0000000  
    # 000        000 000   000  000          000     000       
    # 0000000     00000    000  0000000      000     0000000   
    # 000        000 000   000       000     000          000  
    # 00000000  000   000  000  0000000      000     0000000   
    
    it 'exists', ->

        (slash.exists __dirname).should.exist

        (slash.exists __filename).should.exist
        
        (slash.exists __filename + 'foo').should.eql false
        
    it 'exists async', (done) ->
        
        slash.exists __filename, (stat) ->
            (stat).should.exist
            done()

    it 'exist async not', (done) ->
        
        slash.exists __filename + 'foo', (stat) ->
            expect(stat).to.not.exist
            done()
            
    it 'fileExists', ->

        (slash.fileExists __filename).should.exist

        expect(slash.fileExists __dirname).to.not.exist
        
    it 'dirExists', ->
        
        (slash.dirExists __dirname).should.exist

        expect(slash.dirExists __filename).to.not.exist

    # 00000000   000   000   0000000   
    # 000   000  000  000   000        
    # 00000000   0000000    000  0000  
    # 000        000  000   000   000  
    # 000        000   000   0000000   
    
    it 'pkg', ->
        
        (slash.pkg __dirname).should.exist

        (slash.pkg __filename).should.exist

        expect(slash.pkg 'C:\\').to.not.exist
        
        expect(slash.pkg 'C:').to.not.exist
        
    # 000   0000000  00000000   00000000  000       0000000   000000000  000  000   000  00000000  
    # 000  000       000   000  000       000      000   000     000     000  000   000  000       
    # 000  0000000   0000000    0000000   000      000000000     000     000   000 000   0000000   
    # 000       000  000   000  000       000      000   000     000     000     000     000       
    # 000  0000000   000   000  00000000  0000000  000   000     000     000      0      00000000  
    
    it 'isRelative', ->
        
        (slash.isRelative __dirname).should.eql false
        
        (slash.isRelative '.').should.eql true
        
        (slash.isRelative '..').should.eql true
        
        (slash.isRelative '.././bla../../fark').should.eql true

        return if not slash.win()
        
        (slash.isRelative 'C:\\blafark').should.eql false

        (slash.isRelative '..\\blafark').should.eql true
        
    #  0000000   0000000   000   000  000  000000000  000  0000000  00000000  
    # 000       000   000  0000  000  000     000     000     000   000       
    # 0000000   000000000  000 0 000  000     000     000    000    0000000   
    #      000  000   000  000  0000  000     000     000   000     000       
    # 0000000   000   000  000   000  000     000     000  0000000  00000000  
    
    it 'sanitize', ->
        
        (slash.sanitize 'a.b\n').should.eql 'a.b'

        (slash.sanitize '\n\n c . d  \n\n\n').should.eql ' c . d  '
            
    # 000   0000000  000000000  00000000  000   000  000000000  
    # 000  000          000     000        000 000      000     
    # 000  0000000      000     0000000     00000       000     
    # 000       000     000     000        000 000      000     
    # 000  0000000      000     00000000  000   000     000     
    
    it 'isText', ->
        
        (slash.isText __dirname + '../package.noon').should.eql true

        (slash.isText __dirname + '../img/kslash.png').should.eql false
            
    # 00000000   00000000   0000000   0000000    000000000  00000000  000   000  000000000  
    # 000   000  000       000   000  000   000     000     000        000 000      000     
    # 0000000    0000000   000000000  000   000     000     0000000     00000       000     
    # 000   000  000       000   000  000   000     000     000        000 000      000     
    # 000   000  00000000  000   000  0000000       000     00000000  000   000     000     
    
    it 'readText', ->
        
        (slash.readText __dirname + '/../package.noon').split('\n')[0].should.eql 'name            kslash'

        (slash.readText __dirname + '/dir/filedoesntexist').should.eql ''

    it 'readText callback', (done) ->
        slash.readText __dirname + '/../package.noon', (text) ->
            text.split('\n')[0].should.eql 'name            kslash'
            done()

    it 'readText callback fail', (done) ->
        slash.readText __dirname + '/dir/filedoesntexist', (text) ->
            text.should.eql ''
            done()
        
            