// koffee 1.3.0

/*
000   000   0000000  000       0000000    0000000  000   000    
000  000   000       000      000   000  000       000   000    
0000000    0000000   000      000000000  0000000   000000000    
000  000        000  000      000   000       000  000   000    
000   000  0000000   0000000  000   000  0000000   000   000
 */
var Slash, fs, os, path;

os = require('os');

fs = require('fs');

path = require('path');

Slash = (function() {
    function Slash() {}

    Slash.path = function(p) {
        if (!(p != null ? p.length : void 0)) {
            return Slash.error("Slash.path -- no path?");
        }
        if (Slash.win()) {
            p = path.normalize(p);
            p = p.replace(Slash.reg, '/');
            if (p.endsWith(':.') && p.length === 3) {
                p = p.slice(0, 2);
            }
        } else {
            p = p.replace(Slash.reg, '/');
            p = path.normalize(p);
        }
        return p;
    };

    Slash.unslash = function(p) {
        if (!(p != null ? p.length : void 0)) {
            return Slash.error("Slash.unslash -- no path?");
        }
        p = Slash.path(p);
        if (Slash.win()) {
            if (p.length >= 3 && (p[0] === '/' && '/' === p[2])) {
                p = p[1] + ':' + p.slice(2);
            }
            p = path.normalize(p);
            if (p[1] === ':') {
                p = p[0].toUpperCase() + p.slice(1);
            }
        }
        return p;
    };

    Slash.split = function(p) {
        return Slash.path(p).split('/').filter(function(e) {
            return e.length;
        });
    };

    Slash.splitDrive = function(p) {
        var filePath, parsed, root;
        p = Slash.path(p);
        parsed = Slash.parse(p);
        root = parsed.root;
        if (root.length > 1) {
            if (p.length > root.length) {
                filePath = p.slice(root.length - 1);
            } else {
                filePath = '/';
            }
            return [filePath, root.slice(0, root.length - 2)];
        } else if (parsed.dir.length > 1) {
            if (parsed.dir[1] === ':') {
                return [p.slice(2), parsed.dir[0]];
            }
        } else if (parsed.base.length === 2) {
            if (parsed.base[1] === ':') {
                return ['/', parsed.base[0]];
            }
        }
        return [Slash.path(p), ''];
    };

    Slash.removeDrive = function(p) {
        return Slash.splitDrive(p)[0];
    };

    Slash.isRoot = function(p) {
        return Slash.removeDrive(p) === '/';
    };

    Slash.splitFileLine = function(p) {
        var c, clmn, d, f, l, line, ref, split;
        ref = Slash.splitDrive(p), f = ref[0], d = ref[1];
        split = String(f).split(':');
        if (split.length > 1) {
            line = parseInt(split[1]);
        }
        if (split.length > 2) {
            clmn = parseInt(split[2]);
        }
        l = c = 0;
        if (Number.isInteger(line)) {
            l = line;
        }
        if (Number.isInteger(clmn)) {
            c = clmn;
        }
        if (d !== '') {
            d = d + ':';
        }
        return [d + split[0], Math.max(l, 1), Math.max(c, 0)];
    };

    Slash.splitFilePos = function(p) {
        var c, f, l, ref;
        ref = Slash.splitFileLine(p), f = ref[0], l = ref[1], c = ref[2];
        return [f, [c, l - 1]];
    };

    Slash.removeLinePos = function(p) {
        return Slash.splitFileLine(p)[0];
    };

    Slash.removeColumn = function(p) {
        var f, l, ref;
        ref = Slash.splitFileLine(p), f = ref[0], l = ref[1];
        if (l > 1) {
            return f + ':' + l;
        } else {
            return f;
        }
    };

    Slash.ext = function(p) {
        return path.extname(p).slice(1);
    };

    Slash.splitExt = function(p) {
        return [Slash.removeExt(p), Slash.ext(p)];
    };

    Slash.removeExt = function(p) {
        return Slash.join(Slash.dir(p), Slash.base(p));
    };

    Slash.swapExt = function(p, ext) {
        return Slash.removeExt(p) + (ext.startsWith('.') && ext || ("." + ext));
    };

    Slash.join = function() {
        return [].map.call(arguments, Slash.path).join('/');
    };

    Slash.joinFilePos = function(file, pos) {
        file = Slash.removeLinePos(file);
        if ((pos == null) || (pos[0] == null)) {
            return file;
        } else if (pos[0]) {
            return file + (":" + (pos[1] + 1) + ":" + pos[0]);
        } else {
            return file + (":" + (pos[1] + 1));
        }
    };

    Slash.joinFileLine = function(file, line, col) {
        file = Slash.removeLinePos(file);
        if (!line) {
            return file;
        }
        if (!col) {
            return file + ":" + line;
        }
        return file + ":" + line + ":" + col;
    };

    Slash.pathlist = function(p) {
        var list;
        if (!(p != null ? p.length : void 0)) {
            Slash.error("Slash.pathlist -- no path?");
            return [];
        }
        p = Slash.normalize(p);
        if (p.length > 1 && p[p.length - 1] === '/' && p[p.length - 2] !== ':') {
            p = p.slice(0, p.length - 1);
        }
        list = [p];
        while (Slash.dir(p) !== '') {
            list.unshift(Slash.dir(p));
            p = Slash.dir(p);
        }
        return list;
    };

    Slash.base = function(p) {
        return path.basename(Slash.sanitize(p), path.extname(Slash.sanitize(p)));
    };

    Slash.file = function(p) {
        return path.basename(Slash.sanitize(p));
    };

    Slash.extname = function(p) {
        return path.extname(Slash.sanitize(p));
    };

    Slash.basename = function(p, e) {
        return path.basename(Slash.sanitize(p), e);
    };

    Slash.isAbsolute = function(p) {
        p = Slash.sanitize(p);
        return p[1] === ':' || path.isAbsolute(p);
    };

    Slash.isRelative = function(p) {
        return !Slash.isAbsolute(p);
    };

    Slash.dirname = function(p) {
        return Slash.path(path.dirname(Slash.sanitize(p)));
    };

    Slash.normalize = function(p) {
        return Slash.path(Slash.sanitize(p));
    };

    Slash.dir = function(p) {
        p = Slash.normalize(p);
        if (Slash.isRoot(p)) {
            return '';
        }
        p = path.dirname(p);
        if (p === '.') {
            return '';
        }
        p = Slash.path(p);
        if (p.endsWith(':') && p.length === 2) {
            p += '/';
        }
        return p;
    };

    Slash.sanitize = function(p) {
        if (!(p != null ? p.length : void 0)) {
            return Slash.error("Slash.sanitize -- no path?");
        }
        if (p[0] === '\n') {
            Slash.error("leading newline in path! '" + p + "'");
            return Slash.sanitize(p.substr(1));
        }
        if (p.endsWith('\n')) {
            Slash.error("trailing newline in path! '" + p + "'");
            return Slash.sanitize(p.substr(0, p.length - 1));
        }
        return p;
    };

    Slash.parse = function(p) {
        var dict;
        dict = path.parse(p);
        if (dict.dir.length === 2 && dict.dir[1] === ':') {
            dict.dir += '/';
        }
        if (dict.root.length === 2 && dict.root[1] === ':') {
            dict.root += '/';
        }
        return dict;
    };

    Slash.home = function() {
        return Slash.path(os.homedir());
    };

    Slash.tilde = function(p) {
        var ref;
        return (ref = Slash.path(p)) != null ? ref.replace(Slash.home(), '~') : void 0;
    };

    Slash.untilde = function(p) {
        var ref;
        return (ref = Slash.path(p)) != null ? ref.replace(/^\~/, Slash.home()) : void 0;
    };

    Slash.unenv = function(p) {
        var i, k, ref, v;
        i = p.indexOf('$', 0);
        while (i >= 0) {
            ref = process.env;
            for (k in ref) {
                v = ref[k];
                if (k === p.slice(i + 1, i + 1 + k.length)) {
                    p = p.slice(0, i) + v + p.slice(i + k.length + 1);
                    break;
                }
            }
            i = p.indexOf('$', i + 1);
        }
        return Slash.path(p);
    };

    Slash.resolve = function(p) {
        if (!(p != null ? p.length : void 0)) {
            p = process.cwd();
        }
        p = Slash.unenv(Slash.untilde(p));
        if (Slash.isRelative(p)) {
            p = Slash.path(path.resolve(p));
        }
        return p;
    };

    Slash.relative = function(rel, to) {
        var rd, ref, ref1, rl, td;
        if (!(to != null ? to.length : void 0)) {
            to = process.cwd();
        }
        rel = Slash.resolve(rel);
        if (!Slash.isAbsolute(rel)) {
            return rel;
        }
        if (Slash.resolve(to) === rel) {
            return '.';
        }
        ref = Slash.splitDrive(rel), rl = ref[0], rd = ref[1];
        ref1 = Slash.splitDrive(Slash.resolve(to)), to = ref1[0], td = ref1[1];
        if (rd && td && rd !== td) {
            return rel;
        }
        return Slash.path(path.relative(to, rl));
    };

    Slash.fileUrl = function(p) {
        return "file:///" + (Slash.encode(p));
    };

    Slash.samePath = function(a, b) {
        return Slash.resolve(a) === Slash.resolve(b);
    };

    Slash.escape = function(p) {
        return p.replace(/([\`\"])/g, '\\$1');
    };

    Slash.encode = function(p) {
        p = encodeURI(p);
        p = p.replace(/\#/g, "%23");
        p = p.replace(/\&/g, "%26");
        return p = p.replace(/\'/g, "%27");
    };

    Slash.pkg = function(p) {
        var ref;
        if ((p != null ? p.length : void 0) != null) {
            while (p.length && ((ref = Slash.removeDrive(p)) !== '.' && ref !== '/' && ref !== '')) {
                if (Slash.dirExists(Slash.join(p, '.git'))) {
                    return Slash.resolve(p);
                }
                if (Slash.fileExists(Slash.join(p, 'package.noon'))) {
                    return Slash.resolve(p);
                }
                if (Slash.fileExists(Slash.join(p, 'package.json'))) {
                    return Slash.resolve(p);
                }
                p = Slash.dir(p);
            }
        }
        return null;
    };

    Slash.git = function(p) {
        var ref;
        if ((p != null ? p.length : void 0) != null) {
            while (p.length && ((ref = Slash.removeDrive(p)) !== '.' && ref !== '/' && ref !== '')) {
                if (Slash.dirExists(Slash.join(p, '.git'))) {
                    return Slash.resolve(p);
                }
                p = Slash.dir(p);
            }
        }
        return null;
    };

    Slash.exists = function(p, cb) {
        var err, ref, stat;
        if ('function' === typeof cb) {
            try {
                if (p == null) {
                    cb();
                    return;
                }
                p = Slash.resolve(Slash.removeLinePos(p));
                fs.access(p, fs.R_OK | fs.F_OK, function(err) {
                    if (err != null) {
                        return cb();
                    } else {
                        return fs.stat(p, function(err, stat) {
                            if (err != null) {
                                return cb();
                            } else {
                                return cb(stat);
                            }
                        });
                    }
                });
            } catch (error) {
                err = error;
                Slash.error("Slash.exists -- " + String(err));
            }
        } else {
            if (p != null) {
                try {
                    p = Slash.resolve(Slash.removeLinePos(p));
                    if (stat = fs.statSync(p)) {
                        fs.accessSync(p, fs.R_OK);
                        return stat;
                    }
                } catch (error) {
                    err = error;
                    if ((ref = err.code) === 'ENOENT' || ref === 'ENOTDIR') {
                        return null;
                    }
                    Slash.error("Slash.exists -- " + String(err));
                }
            }
        }
        return null;
    };

    Slash.touch = function(p) {
        var err;
        try {
            fs.mkdirSync(Slash.dirname(p), {
                recursive: true
            });
            if (!Slash.fileExists(p)) {
                fs.writeFileSync(p, '');
            }
            return p;
        } catch (error) {
            err = error;
            Slash.error("Slash.touch -- " + String(err));
            return false;
        }
    };

    Slash.fileExists = function(p, cb) {
        var stat;
        if ('function' === typeof cb) {
            return Slash.exists(p, function(stat) {
                if (stat != null ? stat.isFile() : void 0) {
                    return cb(stat);
                } else {
                    return cb();
                }
            });
        } else {
            if (stat = Slash.exists(p)) {
                if (stat.isFile()) {
                    return stat;
                }
            }
        }
    };

    Slash.dirExists = function(p, cb) {
        var stat;
        if ('function' === typeof cb) {
            return Slash.exists(p, function(stat) {
                if (stat != null ? stat.isDirectory() : void 0) {
                    return cb(stat);
                } else {
                    return cb();
                }
            });
        } else {
            if (stat = Slash.exists(p)) {
                if (stat.isDirectory()) {
                    return stat;
                }
            }
        }
    };

    Slash.isDir = function(p, cb) {
        return Slash.dirExists(p, cb);
    };

    Slash.isFile = function(p, cb) {
        return Slash.fileExists(p, cb);
    };

    Slash.isWritable = function(p, cb) {
        var err;
        if ('function' === typeof cb) {
            try {
                return fs.access(Slash.resolve(p), fs.R_OK | fs.W_OK, function(err) {
                    return cb(err == null);
                });
            } catch (error) {
                err = error;
                Slash.error("Slash.isWritable -- " + String(err));
                return cb(false);
            }
        } else {
            try {
                fs.accessSync(Slash.resolve(p), fs.R_OK | fs.W_OK);
                return true;
            } catch (error) {
                return false;
            }
        }
    };

    Slash.userData = function() {
        var electron, err, name, pkg, pkgDir, sds;
        try {
            electron = require('electron');
            if (process.type === 'renderer') {
                return electron.remote.app.getPath('userData');
            } else {
                return electron.app.getPath('userData');
            }
        } catch (error) {
            err = error;
            try {
                if (pkgDir = Slash.pkg(__dirname)) {
                    pkg = require(slash.join(pkgDir, 'package.json'));
                    sds = require('./kxk').sds;
                    name = sds.find.value(pkg, 'name');
                    return Slash.resolve("~/AppData/Roaming/" + name);
                }
            } catch (error) {
                err = error;
                console.error(err);
            }
        }
        return Slash.resolve("~/AppData/Roaming/");
    };

    Slash.textext = null;

    Slash.textbase = {
        profile: 1,
        license: 1,
        '.gitignore': 1,
        '.npmignore': 1
    };

    Slash.isText = function(p) {
        var err, ext, isBinary, j, len, ref;
        try {
            if (!Slash.textext) {
                Slash.textext = {};
                ref = require('textextensions');
                for (j = 0, len = ref.length; j < len; j++) {
                    ext = ref[j];
                    Slash.textext[ext] = true;
                }
                Slash.textext['crypt'] = true;
            }
            ext = Slash.ext(p);
            if (ext && (Slash.textext[ext] != null)) {
                return true;
            }
            if (Slash.textbase[Slash.basename(p).toLowerCase()]) {
                return true;
            }
            p = Slash.resolve(p);
            if (!Slash.isFile(p)) {
                return false;
            }
            isBinary = require('isbinaryfile');
            return !isBinary.isBinaryFileSync(p);
        } catch (error) {
            err = error;
            Slash.error("Slash.isText -- " + String(err));
            return false;
        }
    };

    Slash.readText = function(p, cb) {
        var err;
        if ('function' === typeof cb) {
            try {
                return fs.readFile(p, 'utf8', function(err, text) {
                    return cb(!err && text || '');
                });
            } catch (error) {
                err = error;
                return cb(Slash.error("Slash.readText -- " + String(err)));
            }
        } else {
            try {
                return fs.readFileSync(p, 'utf8');
            } catch (error) {
                err = error;
                return Slash.error("Slash.readText -- " + String(err));
            }
        }
    };

    Slash.writeText = function(p, text, cb) {
        var err, tmpfile;
        tmpfile = Slash.tmpfile();
        if ('function' === typeof cb) {
            try {
                return fs.writeFile(tmpfile, text, function(err) {
                    if (err) {
                        return cb(Slash.error("Slash.writeText - " + String(err)));
                    } else {
                        return fs.rename(tmpfile, p, function(err) {
                            if (err) {
                                cb(Slash.error("Slash.writeText -- " + String(err)));
                            } else {
                                cb(p);
                            }
                            return fs.unlink(tmpfile, function() {});
                        });
                    }
                });
            } catch (error) {
                err = error;
                return cb(Slash.error("Slash.writeText --- " + String(err)));
            }
        } else {
            try {
                fs.writeFileSync(tmpfile, text);
                fs.renameSync(tmpfile, p);
                fs.unlink(tmpfile, function() {});
                return p;
            } catch (error) {
                err = error;
                return Slash.error("Slash.writeText -- " + String(err));
            }
        }
    };

    Slash.tmpfile = function() {
        return require('tmp-filepath')();
    };

    Slash.reg = new RegExp("\\\\", 'g');

    Slash.win = function() {
        return path.sep === '\\';
    };

    Slash.error = function(msg) {
        console.log(msg);
        return '';
    };

    return Slash;

})();

module.exports = Slash;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0FBQ1AsRUFBQSxHQUFPLE9BQUEsQ0FBUSxJQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFFRDs7O0lBUUYsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLENBQUQ7UUFDSCxJQUErQyxjQUFJLENBQUMsQ0FBRSxnQkFBdEQ7QUFBQSxtQkFBTyxLQUFLLENBQUMsS0FBTixDQUFZLHdCQUFaLEVBQVA7O1FBQ0EsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUg7WUFDSSxDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmO1lBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBSyxDQUFDLEdBQWhCLEVBQXFCLEdBQXJCO1lBQ0osSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLElBQVgsQ0FBQSxJQUFxQixDQUFDLENBQUMsTUFBRixLQUFZLENBQXBDO2dCQUNJLENBQUEsR0FBSSxDQUFFLGFBRFY7YUFISjtTQUFBLE1BQUE7WUFNSSxDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7WUFDSixDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBUFI7O2VBUUE7SUFWRzs7SUFZUCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtRQUNOLElBQWtELGNBQUksQ0FBQyxDQUFFLGdCQUF6RDtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksMkJBQVosRUFBUDs7UUFDQSxDQUFBLEdBQUksS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYO1FBQ0osSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUg7WUFDSSxJQUFHLENBQUMsQ0FBQyxN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RUFBRSxDQUFDLE1BQUgsQ0FBVSxPQUFWLEVBQW1CLFNBQUEsR0FBQSxDQUFuQjt1QkFDQSxFQUpKO2FBQUEsYUFBQTtnQkFLTTt1QkFDRixLQUFLLENBQUMsS0FBTixDQUFZLHFCQUFBLEdBQXdCLE1BQUEsQ0FBTyxHQUFQLENBQXBDLEVBTko7YUFiSjs7SUFKUTs7SUF5QlosS0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2VBQUcsT0FBQSxDQUFRLGNBQVIsQ0FBQSxDQUFBO0lBQUg7O0lBUVYsS0FBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLE1BQUosQ0FBVyxNQUFYLEVBQW1CLEdBQW5COztJQUVQLEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQTtlQUFHLElBQUksQ0FBQyxHQUFMLEtBQVk7SUFBZjs7SUFFTixLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsR0FBRDtRQUFTLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWjtlQUFpQjtJQUExQjs7Ozs7O0FBRVosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgICBcbjAwMCAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICBcbiMjI1xuXG5vcyAgID0gcmVxdWlyZSAnb3MnXG5mcyAgID0gcmVxdWlyZSAnZnMnIFxucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbmNsYXNzIFNsYXNoXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBwYXRoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aCAtLSBubyBwYXRoP1wiIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgaWYgU2xhc2gud2luKClcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwICAgICBcbiAgICAgICAgICAgIHAgPSBwLnJlcGxhY2UgU2xhc2gucmVnLCAnLydcbiAgICAgICAgICAgIGlmIHAuZW5kc1dpdGgoJzouJykgYW5kIHAubGVuZ3RoID09IDNcbiAgICAgICAgICAgICAgICBwID0gcFsuLjFdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHAgPSBwLnJlcGxhY2UgU2xhc2gucmVnLCAnLydcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwICAgICAgICAgICAgXG4gICAgICAgIHBcbiAgICAgICAgXG4gICAgQHVuc2xhc2g6IChwKSAtPlxuICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC51bnNsYXNoIC0tIG5vIHBhdGg/XCIgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICBpZiBwLmxlbmd0aCA+PSAzIGFuZCBwWzBdID09ICcvJyA9PSBwWzJdIFxuICAgICAgICAgICAgICAgIHAgPSBwWzFdICsgJzonICsgcC5zbGljZSAyXG4gICAgICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcFxuICAgICAgICAgICAgaWYgcFsxXSA9PSAnOidcbiAgICAgICAgICAgICAgICBwID0gIHBbMF0udG9VcHBlckNhc2UoKSArIHBbMS4uXVxuICAgICAgICBwXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzcGxpdDogKHApIC0+IFNsYXNoLnBhdGgocCkuc3BsaXQoJy8nKS5maWx0ZXIgKGUpIC0+IGUubGVuZ3RoXG4gICAgXG4gICAgQHNwbGl0RHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBwYXJzZWQgPSBTbGFzaC5wYXJzZSBwXG4gICAgICAgIHJvb3QgPSBwYXJzZWQucm9vdFxuXG4gICAgICAgIGlmIHJvb3QubGVuZ3RoID4gMVxuICAgICAgICAgICAgaWYgcC5sZW5ndGggPiByb290Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gcC5zbGljZShyb290Lmxlbmd0aC0xKVxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9ICcvJ1xuICAgICAgICAgICAgcmV0dXJuIFtmaWxlUGF0aCAsIHJvb3Quc2xpY2UgMCwgcm9vdC5sZW5ndGgtMl1cbiAgICAgICAgZWxzZSBpZiBwYXJzZWQuZGlyLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGlmIHBhcnNlZC5kaXJbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtwWzIuLl0sIHBhcnNlZC5kaXJbMF1dXG4gICAgICAgIGVsc2UgaWYgcGFyc2VkLmJhc2UubGVuZ3RoID09IDJcbiAgICAgICAgICAgIGlmIHBhcnNlZC5iYXNlWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHJldHVybiBbJy8nLCBwYXJzZWQuYmFzZVswXV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgW1NsYXNoLnBhdGgocCksICcnXVxuICAgICAgICBcbiAgICBAcmVtb3ZlRHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFNsYXNoLnNwbGl0RHJpdmUocClbMF1cbiAgXG4gICAgQGlzUm9vdDogKHApIC0+IFNsYXNoLnJlbW92ZURyaXZlKHApID09ICcvJ1xuICAgICAgICBcbiAgICBAc3BsaXRGaWxlTGluZTogKHApIC0+ICAjIGZpbGUudHh0OjE6MCAtLT4gWydmaWxlLnR4dCcsIDEsIDBdXG4gICAgICAgIFxuICAgICAgICBbZixkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcFxuICAgICAgICBzcGxpdCA9IFN0cmluZyhmKS5zcGxpdCAnOidcbiAgICAgICAgbGluZSA9IHBhcnNlSW50IHNwbGl0WzFdIGlmIHNwbGl0Lmxlbmd0aCA+IDFcbiAgICAgICAgY2xtbiA9IHBhcnNlSW50IHNwbGl0WzJdIGlmIHNwbGl0Lmxlbmd0aCA+IDJcbiAgICAgICAgbCA9IGMgPSAwXG4gICAgICAgIGwgPSBsaW5lIGlmIE51bWJlci5pc0ludGVnZXIgbGluZVxuICAgICAgICBjID0gY2xtbiBpZiBOdW1iZXIuaXNJbnRlZ2VyIGNsbW5cbiAgICAgICAgZCA9IGQgKyAnOicgaWYgZCAhPSAnJ1xuICAgICAgICBbIGQgKyBzcGxpdFswXSwgTWF0aC5tYXgobCwxKSwgIE1hdGgubWF4KGMsMCkgXVxuICAgICAgICBcbiAgICBAc3BsaXRGaWxlUG9zOiAocCkgLT4gIyBmaWxlLnR4dDoxOjMgLS0+IFsnZmlsZS50eHQnLCBbMywgMF1dXG4gICAgXG4gICAgICAgIFtmLGwsY10gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgW2YsIFtjLCBsLTFdXVxuICAgICAgICBcbiAgICBAcmVtb3ZlTGluZVBvczogKHApIC0+IFNsYXNoLnNwbGl0RmlsZUxpbmUocClbMF1cbiAgICBAcmVtb3ZlQ29sdW1uOiAgKHApIC0+IFxuICAgICAgICBbZixsXSA9IFNsYXNoLnNwbGl0RmlsZUxpbmUgcFxuICAgICAgICBpZiBsPjEgdGhlbiBmICsgJzonICsgbFxuICAgICAgICBlbHNlIGZcbiAgICAgICAgXG4gICAgQGV4dDogICAgICAgKHApIC0+IHBhdGguZXh0bmFtZShwKS5zbGljZSAxXG4gICAgQHNwbGl0RXh0OiAgKHApIC0+IFtTbGFzaC5yZW1vdmVFeHQocCksIFNsYXNoLmV4dChwKV1cbiAgICBAcmVtb3ZlRXh0OiAocCkgLT4gU2xhc2guam9pbiBTbGFzaC5kaXIocCksIFNsYXNoLmJhc2UgcFxuICAgIEBzd2FwRXh0OiAgIChwLCBleHQpIC0+IFNsYXNoLnJlbW92ZUV4dChwKSArIChleHQuc3RhcnRzV2l0aCgnLicpIGFuZCBleHQgb3IgXCIuI3tleHR9XCIpXG4gICAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGpvaW46IC0+IFtdLm1hcC5jYWxsKGFyZ3VtZW50cywgU2xhc2gucGF0aCkuam9pbiAnLydcbiAgICBcbiAgICBAam9pbkZpbGVQb3M6IChmaWxlLCBwb3MpIC0+ICMgWydmaWxlLnR4dCcsIFszLCAwXV0gLS0+IGZpbGUudHh0OjE6M1xuICAgICAgICBcbiAgICAgICAgZmlsZSA9IFNsYXNoLnJlbW92ZUxpbmVQb3MgZmlsZVxuICAgICAgICBpZiBub3QgcG9zPyBvciBub3QgcG9zWzBdP1xuICAgICAgICAgICAgZmlsZVxuICAgICAgICBlbHNlIGlmIHBvc1swXVxuICAgICAgICAgICAgZmlsZSArIFwiOiN7cG9zWzFdKzF9OiN7cG9zWzBdfVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGUgKyBcIjoje3Bvc1sxXSsxfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgQGpvaW5GaWxlTGluZTogKGZpbGUsIGxpbmUsIGNvbCkgLT4gIyAnZmlsZS50eHQnLCAxLCAyIC0tPiBmaWxlLnR4dDoxOjJcbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBTbGFzaC5yZW1vdmVMaW5lUG9zIGZpbGVcbiAgICAgICAgcmV0dXJuIGZpbGUgaWYgbm90IGxpbmVcbiAgICAgICAgcmV0dXJuIFwiI3tmaWxlfToje2xpbmV9XCIgaWYgbm90IGNvbFxuICAgICAgICBcIiN7ZmlsZX06I3tsaW5lfToje2NvbH1cIlxuICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBwYXRobGlzdDogKHApIC0+ICMgJy9yb290L2Rpci9maWxlLnR4dCcgLS0+IFsnLycsICcvcm9vdCcsICcvcm9vdC9kaXInLCAnL3Jvb3QvZGlyL2ZpbGUudHh0J11cbiAgICBcbiAgICAgICAgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5wYXRobGlzdCAtLSBubyBwYXRoP1wiIFxuICAgICAgICAgICAgcmV0dXJuIFtdXG4gICAgICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLm5vcm1hbGl6ZSBwXG4gICAgICAgIGlmIHAubGVuZ3RoID4gMSBhbmQgcFtwLmxlbmd0aC0xXSA9PSAnLycgYW5kIHBbcC5sZW5ndGgtMl0gIT0gJzonXG4gICAgICAgICAgICBwID0gcFsuLi5wLmxlbmd0aC0xXSBcbiAgICAgICAgbGlzdCA9IFtwXVxuICAgICAgICB3aGlsZSBTbGFzaC5kaXIocCkgIT0gJydcbiAgICAgICAgICAgIGxpc3QudW5zaGlmdCBTbGFzaC5kaXIgcFxuICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIGxpc3RcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgICAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgMDAwICAwMDAgIDAwMCAgIFxuICAgIFxuICAgIEBiYXNlOiAgICAgICAocCkgICAtPiBwYXRoLmJhc2VuYW1lIFNsYXNoLnNhbml0aXplKHApLCBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZmlsZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIEBleHRuYW1lOiAgICAocCkgICAtPiBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAYmFzZW5hbWU6ICAgKHAsZSkgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgZVxuICAgIEBpc0Fic29sdXRlOiAocCkgICAtPiBwID0gU2xhc2guc2FuaXRpemUocCk7IHBbMV0gPT0gJzonIG9yIHBhdGguaXNBYnNvbHV0ZSBwXG4gICAgQGlzUmVsYXRpdmU6IChwKSAgIC0+IG5vdCBTbGFzaC5pc0Fic29sdXRlIHBcbiAgICBAZGlybmFtZTogICAgKHApICAgLT4gU2xhc2gucGF0aCBwYXRoLmRpcm5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAbm9ybWFsaXplOiAgKHApICAgLT4gU2xhc2gucGF0aCBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAZGlyOiAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBwID0gU2xhc2gubm9ybWFsaXplIHBcbiAgICAgICAgaWYgU2xhc2guaXNSb290IHAgdGhlbiByZXR1cm4gJydcbiAgICAgICAgcCA9IHBhdGguZGlybmFtZSBwXG4gICAgICAgIGlmIHAgPT0gJy4nIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgaWYgcC5lbmRzV2l0aCgnOicpIGFuZCBwLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICBwICs9ICcvJ1xuICAgICAgICBwXG4gICAgICAgIFxuICAgIEBzYW5pdGl6ZTogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2guc2FuaXRpemUgLS0gbm8gcGF0aD9cIiBcbiAgICAgICAgaWYgcFswXSA9PSAnXFxuJ1xuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJsZWFkaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAxXG4gICAgICAgIGlmIHAuZW5kc1dpdGggJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwidHJhaWxpbmcgbmV3bGluZSBpbiBwYXRoISAnI3twfSdcIlxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLnNhbml0aXplIHAuc3Vic3RyIDAsIHAubGVuZ3RoLTFcbiAgICAgICAgcFxuICAgIFxuICAgIEBwYXJzZTogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgZGljdCA9IHBhdGgucGFyc2UgcFxuICAgICAgICBcbiAgICAgICAgaWYgZGljdC5kaXIubGVuZ3RoID09IDIgYW5kIGRpY3QuZGlyWzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5kaXIgKz0gJy8nXG4gICAgICAgIGlmIGRpY3Qucm9vdC5sZW5ndGggPT0gMiBhbmQgZGljdC5yb290WzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5yb290ICs9ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgIGRpY3RcbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBob21lOiAgICAgICAgICAtPiBTbGFzaC5wYXRoIG9zLmhvbWVkaXIoKVxuICAgIEB0aWxkZTogICAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIFNsYXNoLmhvbWUoKSwgJ34nXG4gICAgQHVudGlsZGU6ICAgKHApIC0+IFNsYXNoLnBhdGgocCk/LnJlcGxhY2UgL15cXH4vLCBTbGFzaC5ob21lKClcbiAgICBAdW5lbnY6ICAgICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpID0gcC5pbmRleE9mICckJywgMFxuICAgICAgICB3aGlsZSBpID49IDBcbiAgICAgICAgICAgIGZvciBrLHYgb2YgcHJvY2Vzcy5lbnZcbiAgICAgICAgICAgICAgICBpZiBrID09IHAuc2xpY2UgaSsxLCBpKzEray5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcCA9IHAuc2xpY2UoMCwgaSkgKyB2ICsgcC5zbGljZShpK2subGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpID0gcC5pbmRleE9mICckJywgaSsxXG4gICAgICAgICAgICBcbiAgICAgICAgU2xhc2gucGF0aCBwXG4gICAgXG4gICAgQHJlc29sdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcCA9IHByb2Nlc3MuY3dkKCkgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLnVuZW52IFNsYXNoLnVudGlsZGUgcFxuICAgICAgICBcbiAgICAgICAgaWYgU2xhc2guaXNSZWxhdGl2ZSBwXG4gICAgICAgICAgICBwID0gU2xhc2gucGF0aCBwYXRoLnJlc29sdmUgcFxuICAgICAgICBwXG4gICAgXG4gICAgQHJlbGF0aXZlOiAocmVsLCB0bykgLT5cbiAgICAgICAgXG4gICAgICAgIHRvID0gcHJvY2Vzcy5jd2QoKSBpZiBub3QgdG8/Lmxlbmd0aFxuICAgICAgICByZWwgPSBTbGFzaC5yZXNvbHZlIHJlbFxuICAgICAgICByZXR1cm4gcmVsIGlmIG5vdCBTbGFzaC5pc0Fic29sdXRlIHJlbFxuICAgICAgICBpZiBTbGFzaC5yZXNvbHZlKHRvKSA9PSByZWxcbiAgICAgICAgICAgIHJldHVybiAnLidcblxuICAgICAgICBbcmwsIHJkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcmVsXG4gICAgICAgIFt0bywgdGRdID0gU2xhc2guc3BsaXREcml2ZSBTbGFzaC5yZXNvbHZlIHRvXG4gICAgICAgIGlmIHJkIGFuZCB0ZCBhbmQgcmQgIT0gdGRcbiAgICAgICAgICAgIHJldHVybiByZWxcbiAgICAgICAgU2xhc2gucGF0aCBwYXRoLnJlbGF0aXZlIHRvLCBybFxuICAgICAgICBcbiAgICBAZmlsZVVybDogKHApIC0+IFwiZmlsZTovLy8je1NsYXNoLmVuY29kZSBwfVwiXG5cbiAgICBAc2FtZVBhdGg6IChhLCBiKSAtPiBTbGFzaC5yZXNvbHZlKGEpID09IFNsYXNoLnJlc29sdmUoYilcblxuICAgIEBlc2NhcGU6IChwKSAtPiBwLnJlcGxhY2UgLyhbXFxgXFxcIl0pL2csICdcXFxcJDEnXG5cbiAgICBAZW5jb2RlOiAocCkgLT5cbiAgICAgICAgcCA9IGVuY29kZVVSSSBwXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcIy9nLCBcIiUyM1wiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJi9nLCBcIiUyNlwiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJy9nLCBcIiUyN1wiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAgIDAwMCAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAwMDAgICAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHBrZzogKHApIC0+XG4gICAgXG4gICAgICAgIGlmIHA/Lmxlbmd0aD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nLCAnLycsICcnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyAgU2xhc2guam9pbiBwLCAnLmdpdCcgICAgICAgICB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2Uubm9vbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLmpzb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBudWxsXG5cbiAgICBAZ2l0OiAocCkgLT5cblxuICAgICAgICBpZiBwPy5sZW5ndGg/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlIHAubGVuZ3RoIGFuZCBTbGFzaC5yZW1vdmVEcml2ZShwKSBub3QgaW4gWycuJywgJy8nLCAnJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5kaXJFeGlzdHMgU2xhc2guam9pbiBwLCAnLmdpdCcgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBleGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpZiBub3QgcD9cbiAgICAgICAgICAgICAgICAgICAgY2IoKSBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzIHAsIGZzLlJfT0sgfCBmcy5GX09LLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5zdGF0IHAsIChlcnIsIHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBzdGF0XG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guZXhpc3RzIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHA/XG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5yZXNvbHZlIFNsYXNoLnJlbW92ZUxpbmVQb3MgcFxuICAgICAgICAgICAgICAgICAgICBpZiBzdGF0ID0gZnMuc3RhdFN5bmMocClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgcCwgZnMuUl9PS1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRcbiAgICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAgICAgaWYgZXJyLmNvZGUgaW4gWydFTk9FTlQnLCAnRU5PVERJUiddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmV4aXN0cyAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICBudWxsICAgICBcbiAgICAgICAgXG4gICAgQHRvdWNoOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZnMubWtkaXJTeW5jIFNsYXNoLmRpcm5hbWUocCksIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgICAgICBpZiBub3QgU2xhc2guZmlsZUV4aXN0cyBwXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBwLCAnJ1xuICAgICAgICAgICAgcmV0dXJuIHBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLnRvdWNoIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICBcbiAgICBAZmlsZUV4aXN0czogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIFNsYXNoLmV4aXN0cyBwLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBzdGF0Py5pc0ZpbGUoKSB0aGVuIGNiIHN0YXRcbiAgICAgICAgICAgICAgICBlbHNlIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdCA9IFNsYXNoLmV4aXN0cyBwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXQgaWYgc3RhdC5pc0ZpbGUoKVxuXG4gICAgQGRpckV4aXN0czogKHAsIGNiKSAtPlxuXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdD8uaXNEaXJlY3RvcnkoKSB0aGVuIGNiIHN0YXRcbiAgICAgICAgICAgICAgICBlbHNlIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdCA9IFNsYXNoLmV4aXN0cyBwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXQgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICBcbiAgICBAaXNEaXI6ICAocCwgY2IpIC0+IFNsYXNoLmRpckV4aXN0cyBwLCBjYlxuICAgIEBpc0ZpbGU6IChwLCBjYikgLT4gU2xhc2guZmlsZUV4aXN0cyBwLCBjYlxuICAgIFxuICAgIEBpc1dyaXRhYmxlOiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzIFNsYXNoLnJlc29sdmUocCksIGZzLlJfT0sgfCBmcy5XX09LLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICBjYiBub3QgZXJyP1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5pc1dyaXRhYmxlIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgICAgICAgICAgY2IgZmFsc2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PS1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQHVzZXJEYXRhOiAtPlxuICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgICAgICBpZiBwcm9jZXNzLnR5cGUgPT0gJ3JlbmRlcmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVjdHJvbi5yZW1vdGUuYXBwLmdldFBhdGggJ3VzZXJEYXRhJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVjdHJvbi5hcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgaWYgcGtnRGlyID0gU2xhc2gucGtnIF9fZGlybmFtZVxuICAgICAgICAgICAgICAgICAgICBwa2cgPSByZXF1aXJlIHNsYXNoLmpvaW4gcGtnRGlyLCAncGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgICAgICAgICB7IHNkcyB9ID0gcmVxdWlyZSAnLi9reGsnXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBzZHMuZmluZC52YWx1ZSBwa2csICduYW1lJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU2xhc2gucmVzb2x2ZSBcIn4vQXBwRGF0YS9Sb2FtaW5nLyN7bmFtZX1cIlxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBTbGFzaC5yZXNvbHZlIFwifi9BcHBEYXRhL1JvYW1pbmcvXCJcblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4gICAgXG4gICAgQHRleHRleHQ6IG51bGxcbiAgICBcbiAgICBAdGV4dGJhc2U6IFxuICAgICAgICBwcm9maWxlOjFcbiAgICAgICAgbGljZW5zZToxXG4gICAgICAgICcuZ2l0aWdub3JlJzoxXG4gICAgICAgICcubnBtaWdub3JlJzoxXG4gICAgXG4gICAgQGlzVGV4dDogKHApIC0+XG4gICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLnRleHRleHRcbiAgICAgICAgICAgICAgICBTbGFzaC50ZXh0ZXh0ID0ge31cbiAgICAgICAgICAgICAgICBmb3IgZXh0IGluIHJlcXVpcmUgJ3RleHRleHRlbnNpb25zJ1xuICAgICAgICAgICAgICAgICAgICBTbGFzaC50ZXh0ZXh0W2V4dF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dFsnY3J5cHQnXSA9IHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXh0ID0gU2xhc2guZXh0IHBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGV4dCBhbmQgU2xhc2gudGV4dGV4dFtleHRdPyBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIFNsYXNoLnRleHRiYXNlW1NsYXNoLmJhc2VuYW1lKHApLnRvTG93ZXJDYXNlKCldXG4gICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IFNsYXNoLmlzRmlsZSBwXG4gICAgICAgICAgICBpc0JpbmFyeSA9IHJlcXVpcmUgJ2lzYmluYXJ5ZmlsZSdcbiAgICAgICAgICAgIHJldHVybiBub3QgaXNCaW5hcnkuaXNCaW5hcnlGaWxlU3luYyBwXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5pc1RleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgQHJlYWRUZXh0OiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGUgcCwgJ3V0ZjgnLCAoZXJyLCB0ZXh0KSAtPiBcbiAgICAgICAgICAgICAgICAgICAgY2Igbm90IGVyciBhbmQgdGV4dCBvciAnJ1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC5yZWFkVGV4dCAtLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyBwLCAndXRmOCdcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gucmVhZFRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuXG4gICAgQHdyaXRlVGV4dDogKHAsIHRleHQsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgdG1wZmlsZSA9IFNsYXNoLnRtcGZpbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZSB0bXBmaWxlLCB0ZXh0LCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnIgXG4gICAgICAgICAgICAgICAgICAgICAgICBjYiBTbGFzaC5lcnJvciBcIlNsYXNoLndyaXRlVGV4dCAtIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVuYW1lIHRtcGZpbGUsIHAsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyIHRoZW4gY2IgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgY2IgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLnVubGluayB0bXBmaWxlLCAtPlxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyB0bXBmaWxlLCB0ZXh0XG4gICAgICAgICAgICAgICAgZnMucmVuYW1lU3luYyB0bXBmaWxlLCBwXG4gICAgICAgICAgICAgICAgZnMudW5saW5rIHRtcGZpbGUsIC0+XG4gICAgICAgICAgICAgICAgcFxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICBcbiAgICBAdG1wZmlsZTogLT4gcmVxdWlyZSgndG1wLWZpbGVwYXRoJykoKVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEByZWcgPSBuZXcgUmVnRXhwIFwiXFxcXFxcXFxcIiwgJ2cnXG5cbiAgICBAd2luOiAtPiBwYXRoLnNlcCA9PSAnXFxcXCdcbiAgICBcbiAgICBAZXJyb3I6IChtc2cpIC0+IGNvbnNvbGUubG9nIG1zZzsgJydcblxubW9kdWxlLmV4cG9ydHMgPSBTbGFzaFxuIl19
//# sourceURL=../coffee/kslash.coffee