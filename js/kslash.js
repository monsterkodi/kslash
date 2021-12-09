// koffee 1.20.0

/*
000   000   0000000  000       0000000    0000000  000   000    
000  000   000       000      000   000  000       000   000    
0000000    0000000   000      000000000  0000000   000000000    
000  000        000  000      000   000       000  000   000    
000   000  0000000   0000000  000   000  0000000   000   000
 */
var Slash, fs, os, path;

os = require('os');

fs = require('fs-extra');

path = require('path');

Slash = (function() {
    function Slash() {}

    Slash.logErrors = false;

    Slash.path = function(p) {
        if (!(p != null ? p.length : void 0)) {
            return Slash.error("Slash.path -- no path?");
        }
        if (Slash.win()) {
            p = path.normalize(p);
            p = p.replace(Slash.reg, '/');
        } else {
            p = p.replace(Slash.reg, '/');
            p = path.normalize(p);
        }
        if (p.endsWith(':.') && p.length === 3) {
            p = p.slice(0, 2);
        }
        if (p.endsWith(':') && p.length === 2) {
            p = p + '/';
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

    Slash.resolve = function(p) {
        if (!(p != null ? p.length : void 0)) {
            p = process.cwd();
        }
        if (arguments.length > 1) {
            p = Slash.join.apply(0, arguments);
        }
        p = Slash.unenv(Slash.untilde(p));
        if (Slash.isRelative(p)) {
            p = Slash.path(path.resolve(p));
        } else {
            p = Slash.path(p);
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
        var ref;
        file = Slash.removeLinePos(file);
        if ((pos == null) || (pos[0] == null) || (pos[0] === (ref = pos[1]) && ref === 0)) {
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

    Slash.dirlist = function(p, opt, cb) {
        return this.list(p, opt, cb);
    };

    Slash.list = function(p, opt, cb) {
        return require('./dirlist')(p, opt, cb);
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

    Slash.git = function(p, cb) {
        var ref;
        if ((p != null ? p.length : void 0) != null) {
            if ('function' === typeof cb) {
                Slash.dirExists(Slash.join(p, '.git'), function(stat) {
                    var ref;
                    if (stat) {
                        return cb(Slash.resolve(p));
                    } else if ((ref = Slash.removeDrive(p)) !== '.' && ref !== '/' && ref !== '') {
                        return Slash.git(Slash.dir(p), cb);
                    }
                });
            } else {
                while (p.length && ((ref = Slash.removeDrive(p)) !== '.' && ref !== '/' && ref !== '')) {
                    if (Slash.dirExists(Slash.join(p, '.git'))) {
                        return Slash.resolve(p);
                    }
                    p = Slash.dir(p);
                }
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

    Slash.touch = function(p) {
        var dir, err;
        try {
            dir = Slash.dir(p);
            if (!Slash.isDir(dir)) {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            }
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

    Slash.unused = function(p, cb) {
        var dir, ext, i, j, name, test;
        name = Slash.base(p);
        dir = Slash.dir(p);
        ext = Slash.ext(p);
        ext = ext && '.' + ext || '';
        if (/\d\d$/.test(name)) {
            name = name.slice(0, name.length - 2);
        }
        if ('function' === typeof cb) {
            return Slash.exists(p, function(stat) {
                var check, i, test;
                if (!stat) {
                    cb(Slash.resolve(p));
                    return;
                }
                i = 1;
                test = '';
                check = function() {
                    test = "" + name + (("" + i).padStart(2, '0')) + ext;
                    if (dir) {
                        test = Slash.join(dir, test);
                    }
                    return Slash.exists(test, function(stat) {
                        if (stat) {
                            i += 1;
                            return check();
                        } else {
                            return cb(Slash.resolve(test));
                        }
                    });
                };
                return check();
            });
        } else {
            if (!Slash.exists(p)) {
                return Slash.resolve(p);
            }
            for (i = j = 1; j <= 1000; i = ++j) {
                test = "" + name + (("" + i).padStart(2, '0')) + ext;
                if (dir) {
                    test = Slash.join(dir, test);
                }
                if (!Slash.exists(test)) {
                    return Slash.resolve(test);
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
                return this.fileExists(p, function(stat) {
                    var mode, ref;
                    mode = (ref = stat != null ? stat.mode : void 0) != null ? ref : 0x1b6;
                    return fs.writeFile(tmpfile, text, {
                        mode: mode
                    }, function(err) {
                        if (err) {
                            return cb(Slash.error("Slash.writeText - " + String(err)));
                        } else {
                            return fs.move(tmpfile, p, {
                                overwrite: true
                            }, function(err) {
                                if (err) {
                                    return cb(Slash.error(("Slash.writeText -- move " + tmpfile + " -> " + p) + String(err)));
                                } else {
                                    return cb(p);
                                }
                            });
                        }
                    });
                });
            } catch (error) {
                err = error;
                return cb(Slash.error("Slash.writeText --- " + String(err)));
            }
        } else {
            try {
                fs.writeFileSync(tmpfile, text);
                fs.moveSync(tmpfile, p, {
                    overwrite: true
                });
                return p;
            } catch (error) {
                err = error;
                return Slash.error("Slash.writeText -- " + String(err));
            }
        }
    };

    Slash.tmpfile = function(ext) {
        return Slash.join(os.tmpdir(), require('uuid').v1() + (ext && ("." + ext) || ''));
    };

    Slash.remove = function(p, cb) {
        if (cb) {
            return fs.remove(p, cb);
        } else {
            return fs.removeSync(p);
        }
    };

    Slash.reg = new RegExp("\\\\", 'g');

    Slash.win = function() {
        return path.sep === '\\';
    };

    Slash.error = function(msg) {
        if (this.logErrors) {
            console.error(msg);
        }
        return '';
    };

    return Slash;

})();

module.exports = Slash;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsia3NsYXNoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0FBQ1AsRUFBQSxHQUFPLE9BQUEsQ0FBUSxVQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFFRDs7O0lBRUYsS0FBQyxDQUFBLFNBQUQsR0FBWTs7SUFRWixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsQ0FBRDtRQUNILElBQStDLGNBQUksQ0FBQyxDQUFFLGdCQUF0RDtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksd0JBQVosRUFBUDs7UUFDQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBSDtZQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7WUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckIsRUFGUjtTQUFBLE1BQUE7WUFJSSxDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7WUFDSixDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBTFI7O1FBTUEsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLElBQVgsQ0FBQSxJQUFxQixDQUFDLENBQUMsTUFBRixLQUFZLENBQXBDO1lBQ0ksQ0FBQSxHQUFJLENBQUUsYUFEVjs7UUFFQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBWCxDQUFBLElBQW9CLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBbkM7WUFDSSxDQUFBLEdBQUksQ0FBQSxHQUFJLElBRFo7O2VBRUE7SUFaRzs7SUFjUCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtRQUNOLElBQWtELGNBQUksQ0FBQyxDQUFFLGdCQUF6RDtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksMkJBQVosRUFBUDs7UUFDQSxDQUFBLEdBQUksS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYO1FBQ0osSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUg7WUFDSSxJQUFHLENBQUMsQ0FBQyxNQUFGLElBQVksQ0FBWixJQUFrQixDQUFBLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxHQUFSLElBQVEsR0FBUixLQUFlLENBQUUsQ0FBQSxDQUFBLENBQWpCLENBQXJCO2dCQUNJLENBQUEsR0FBSSxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sR0FBUCxHQUFhLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBUixFQURyQjs7WUFFQSxDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmO1lBQ0osSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsR0FBWDtnQkFDSSxDQUFBLEdBQUssQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQUwsQ0FBQSxDQUFBLEdBQXFCLENBQUUsVUFEaEM7YUFKSjs7ZUFNQTtJQVRNOztJQWlCVixLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtRQUVOLElBQXFCLGNBQUksQ0FBQyxDQUFFLGdCQUE1QjtZQUFBLENBQUEsR0FBSSxPQUFPLENBQUMsR0FBUixDQUFBLEVBQUo7O1FBRUEsSUFBRyxTQUFTLENBQUMsTUFBVixHQUFtQixDQUF0QjtZQUNJLENBQUEsR0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQVgsQ0FBaUIsQ0FBakIsRUFBb0IsU0FBcEIsRUFEUjs7UUFHQSxDQUFBLEdBQUksS0FBSyxDQUFDLEtBQU4sQ0FBWSxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsQ0FBWjtRQUVKLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FBakIsQ0FBSDtZQUNJLENBQUEsR0FBSSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsQ0FBYixDQUFYLEVBRFI7U0FBQSxNQUFBO1lBR0ksQ0FBQSxHQUFJLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUhSOztlQUlBO0lBYk07O0lBcUJWLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxDQUFEO2VBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQWEsQ0FBQyxLQUFkLENBQW9CLEdBQXBCLENBQXdCLENBQUMsTUFBekIsQ0FBZ0MsU0FBQyxDQUFEO21CQUFPLENBQUMsQ0FBQztRQUFULENBQWhDO0lBQVA7O0lBRVIsS0FBQyxDQUFBLFVBQUQsR0FBYSxTQUFDLENBQUQ7QUFFVCxZQUFBO1FBQUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWDtRQUNKLE1BQUEsR0FBUyxLQUFLLENBQUMsS0FBTixDQUFZLENBQVo7UUFDVCxJQUFBLEdBQU8sTUFBTSxDQUFDO1FBRWQsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO1lBQ0ksSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLElBQUksQ0FBQyxNQUFuQjtnQkFDSSxRQUFBLEdBQVcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFJLENBQUMsTUFBTCxHQUFZLENBQXBCLEVBRGY7YUFBQSxNQUFBO2dCQUdJLFFBQUEsR0FBVyxJQUhmOztBQUlBLG1CQUFPLENBQUMsUUFBRCxFQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxFQUFjLElBQUksQ0FBQyxNQUFMLEdBQVksQ0FBMUIsQ0FBWixFQUxYO1NBQUEsTUFNSyxJQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBWCxHQUFvQixDQUF2QjtZQUNELElBQUcsTUFBTSxDQUFDLEdBQUksQ0FBQSxDQUFBLENBQVgsS0FBaUIsR0FBcEI7QUFDSSx1QkFBTyxDQUFDLENBQUUsU0FBSCxFQUFTLE1BQU0sQ0FBQyxHQUFJLENBQUEsQ0FBQSxDQUFwQixFQURYO2FBREM7U0FBQSxNQUdBLElBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFaLEtBQXNCLENBQXpCO1lBQ0QsSUFBRyxNQUFNLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBWixLQUFrQixHQUFyQjtBQUNJLHVCQUFPLENBQUMsR0FBRCxFQUFNLE1BQU0sQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFsQixFQURYO2FBREM7O2VBSUwsQ0FBQyxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FBRCxFQUFnQixFQUFoQjtJQW5CUzs7SUFxQmIsS0FBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLENBQUQ7QUFFVixlQUFPLEtBQUssQ0FBQyxVQUFOLENBQWlCLENBQWpCLENBQW9CLENBQUEsQ0FBQTtJQUZqQjs7SUFJZCxLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsQ0FBRDtlQUFPLEtBQUssQ0FBQyxXQUFOLENBQWtCLENBQWxCLENBQUEsS0FBd0I7SUFBL0I7O0lBRVQsS0FBQyxDQUFBLGFBQUQsR0FBZ0IsU0FBQyxDQUFEO0FBRVosWUFBQTtRQUFBLE1BQVEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FBakIsQ0FBUixFQUFDLFVBQUQsRUFBRztRQUNILEtBQUEsR0FBUSxNQUFBLENBQU8sQ0FBUCxDQUFTLENBQUMsS0FBVixDQUFnQixHQUFoQjtRQUNSLElBQTRCLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBM0M7WUFBQSxJQUFBLEdBQU8sUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQWYsRUFBUDs7UUFDQSxJQUE0QixLQUFLLENBQUMsTUFBTixHQUFlLENBQTNDO1lBQUEsSUFBQSxHQUFPLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmLEVBQVA7O1FBQ0EsQ0FBQSxHQUFJLENBQUEsR0FBSTtRQUNSLElBQVksTUFBTSxDQUFDLFNBQVAsQ0FBaUIsSUFBakIsQ0FBWjtZQUFBLENBQUEsR0FBSSxLQUFKOztRQUNBLElBQVksTUFBTSxDQUFDLFNBQVAsQ0FBaUIsSUFBakIsQ0FBWjtZQUFBLENBQUEsR0FBSSxLQUFKOztRQUNBLElBQWUsQ0FBQSxLQUFLLEVBQXBCO1lBQUEsQ0FBQSxHQUFJLENBQUEsR0FBSSxJQUFSOztlQUNBLENBQUUsQ0FBQSxHQUFJLEtBQU0sQ0FBQSxDQUFBLENBQVosRUFBZ0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVcsQ0FBWCxDQUFoQixFQUFnQyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBVyxDQUFYLENBQWhDO0lBVlk7O0lBWWhCLEtBQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxDQUFEO0FBRVgsWUFBQTtRQUFBLE1BQVUsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsQ0FBcEIsQ0FBVixFQUFDLFVBQUQsRUFBRyxVQUFILEVBQUs7ZUFDTCxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUQsRUFBSSxDQUFBLEdBQUUsQ0FBTixDQUFKO0lBSFc7O0lBS2YsS0FBQyxDQUFBLGFBQUQsR0FBZ0IsU0FBQyxDQUFEO2VBQU8sS0FBSyxDQUFDLGFBQU4sQ0FBb0IsQ0FBcEIsQ0FBdUIsQ0FBQSxDQUFBO0lBQTlCOztJQUNoQixLQUFDLENBQUEsWUFBRCxHQUFnQixTQUFDLENBQUQ7QUFDWixZQUFBO1FBQUEsTUFBUSxLQUFLLENBQUMsYUFBTixDQUFvQixDQUFwQixDQUFSLEVBQUMsVUFBRCxFQUFHO1FBQ0gsSUFBRyxDQUFBLEdBQUUsQ0FBTDttQkFBWSxDQUFBLEdBQUksR0FBSixHQUFVLEVBQXRCO1NBQUEsTUFBQTttQkFDSyxFQURMOztJQUZZOztJQUtoQixLQUFDLENBQUEsR0FBRCxHQUFZLFNBQUMsQ0FBRDtlQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsQ0FBYixDQUFlLENBQUMsS0FBaEIsQ0FBc0IsQ0FBdEI7SUFBUDs7SUFDWixLQUFDLENBQUEsUUFBRCxHQUFZLFNBQUMsQ0FBRDtlQUFPLENBQUMsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsQ0FBRCxFQUFxQixLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBckI7SUFBUDs7SUFDWixLQUFDLENBQUEsU0FBRCxHQUFZLFNBQUMsQ0FBRDtlQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBQVgsRUFBeUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQXpCO0lBQVA7O0lBQ1osS0FBQyxDQUFBLE9BQUQsR0FBWSxTQUFDLENBQUQsRUFBSSxHQUFKO2VBQVksS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsQ0FBQSxHQUFxQixDQUFDLEdBQUcsQ0FBQyxVQUFKLENBQWUsR0FBZixDQUFBLElBQXdCLEdBQXhCLElBQStCLENBQUEsR0FBQSxHQUFJLEdBQUosQ0FBaEM7SUFBakM7O0lBUVosS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFBO2VBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFQLENBQVksU0FBWixFQUF1QixLQUFLLENBQUMsSUFBN0IsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxHQUF4QztJQUFIOztJQUVQLEtBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUVWLFlBQUE7UUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDLGFBQU4sQ0FBb0IsSUFBcEI7UUFDUCxJQUFPLGFBQUosSUFBZ0IsZ0JBQWhCLElBQTJCLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBSixZQUFVLEdBQUksQ0FBQSxDQUFBLEVBQWQsT0FBQSxLQUFvQixDQUFwQixDQUE5QjttQkFDSSxLQURKO1NBQUEsTUFFSyxJQUFHLEdBQUksQ0FBQSxDQUFBLENBQVA7bUJBQ0QsSUFBQSxHQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFPLENBQVIsQ0FBSCxHQUFhLEdBQWIsR0FBZ0IsR0FBSSxDQUFBLENBQUEsQ0FBcEIsRUFETjtTQUFBLE1BQUE7bUJBR0QsSUFBQSxHQUFPLENBQUEsR0FBQSxHQUFHLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFPLENBQVIsQ0FBSCxFQUhOOztJQUxLOztJQVVkLEtBQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEdBQWI7UUFFWCxJQUFBLEdBQU8sS0FBSyxDQUFDLGFBQU4sQ0FBb0IsSUFBcEI7UUFDUCxJQUFlLENBQUksSUFBbkI7QUFBQSxtQkFBTyxLQUFQOztRQUNBLElBQTRCLENBQUksR0FBaEM7QUFBQSxtQkFBVSxJQUFELEdBQU0sR0FBTixHQUFTLEtBQWxCOztlQUNHLElBQUQsR0FBTSxHQUFOLEdBQVMsSUFBVCxHQUFjLEdBQWQsR0FBaUI7SUFMUjs7SUFhZixLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxFQUFUO2VBQWdCLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTixFQUFTLEdBQVQsRUFBYyxFQUFkO0lBQWhCOztJQUNWLEtBQUMsQ0FBQSxJQUFELEdBQVUsU0FBQyxDQUFELEVBQUksR0FBSixFQUFTLEVBQVQ7ZUFBZ0IsT0FBQSxDQUFRLFdBQVIsQ0FBQSxDQUFxQixDQUFyQixFQUF3QixHQUF4QixFQUE2QixFQUE3QjtJQUFoQjs7SUFRVixLQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsQ0FBRDtBQUVQLFlBQUE7UUFBQSxJQUFHLGNBQUksQ0FBQyxDQUFFLGdCQUFWO1lBQ0ksS0FBSyxDQUFDLEtBQU4sQ0FBWSw0QkFBWjtBQUNBLG1CQUFPLEdBRlg7O1FBSUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCO1FBQ0osSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLENBQVgsSUFBaUIsQ0FBRSxDQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVMsQ0FBVCxDQUFGLEtBQWlCLEdBQWxDLElBQTBDLENBQUUsQ0FBQSxDQUFDLENBQUMsTUFBRixHQUFTLENBQVQsQ0FBRixLQUFpQixHQUE5RDtZQUNJLENBQUEsR0FBSSxDQUFFLHdCQURWOztRQUVBLElBQUEsR0FBTyxDQUFDLENBQUQ7QUFDUCxlQUFNLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFBLEtBQWdCLEVBQXRCO1lBQ0ksSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBYjtZQUNBLENBQUEsR0FBSSxLQUFLLENBQUMsR0FBTixDQUFVLENBQVY7UUFGUjtlQUdBO0lBYk87O0lBcUJYLEtBQUMsQ0FBQSxJQUFELEdBQWEsU0FBQyxDQUFEO2VBQVMsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLENBQUMsUUFBTixDQUFlLENBQWYsQ0FBZCxFQUFpQyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBZixDQUFiLENBQWpDO0lBQVQ7O0lBQ2IsS0FBQyxDQUFBLElBQUQsR0FBYSxTQUFDLENBQUQ7ZUFBUyxJQUFJLENBQUMsUUFBTCxDQUFjLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBZixDQUFkO0lBQVQ7O0lBQ2IsS0FBQyxDQUFBLE9BQUQsR0FBYSxTQUFDLENBQUQ7ZUFBUyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBZixDQUFiO0lBQVQ7O0lBQ2IsS0FBQyxDQUFBLFFBQUQsR0FBYSxTQUFDLENBQUQsRUFBRyxDQUFIO2VBQVMsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLENBQUMsUUFBTixDQUFlLENBQWYsQ0FBZCxFQUFpQyxDQUFqQztJQUFUOztJQUNiLEtBQUMsQ0FBQSxVQUFELEdBQWEsU0FBQyxDQUFEO1FBQVMsQ0FBQSxHQUFJLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBZjtlQUFtQixDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsR0FBUixJQUFlLElBQUksQ0FBQyxVQUFMLENBQWdCLENBQWhCO0lBQS9DOztJQUNiLEtBQUMsQ0FBQSxVQUFELEdBQWEsU0FBQyxDQUFEO2VBQVMsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQjtJQUFiOztJQUNiLEtBQUMsQ0FBQSxPQUFELEdBQWEsU0FBQyxDQUFEO2VBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBZixDQUFiLENBQVg7SUFBVDs7SUFDYixLQUFDLENBQUEsU0FBRCxHQUFhLFNBQUMsQ0FBRDtlQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFmLENBQVg7SUFBVDs7SUFRYixLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsQ0FBRDtRQUVGLENBQUEsR0FBSSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFoQjtRQUNKLElBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLENBQUg7QUFBdUIsbUJBQU8sR0FBOUI7O1FBQ0EsQ0FBQSxHQUFJLElBQUksQ0FBQyxPQUFMLENBQWEsQ0FBYjtRQUNKLElBQUcsQ0FBQSxLQUFLLEdBQVI7QUFBaUIsbUJBQU8sR0FBeEI7O1FBQ0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWDtRQUNKLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxHQUFYLENBQUEsSUFBb0IsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUFuQztZQUNJLENBQUEsSUFBSyxJQURUOztlQUVBO0lBVEU7O0lBV04sS0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLENBQUQ7UUFFUCxJQUFHLGNBQUksQ0FBQyxDQUFFLGdCQUFWO0FBQ0ksbUJBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBWSw0QkFBWixFQURYOztRQUVBLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRixLQUFRLElBQVg7WUFDSSxLQUFLLENBQUMsS0FBTixDQUFZLDRCQUFBLEdBQTZCLENBQTdCLEdBQStCLEdBQTNDO0FBQ0EsbUJBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFDLENBQUMsTUFBRixDQUFTLENBQVQsQ0FBZixFQUZYOztRQUdBLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFYLENBQUg7WUFDSSxLQUFLLENBQUMsS0FBTixDQUFZLDZCQUFBLEdBQThCLENBQTlCLEdBQWdDLEdBQTVDO0FBQ0EsbUJBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFDLENBQUMsTUFBRixDQUFTLENBQVQsRUFBWSxDQUFDLENBQUMsTUFBRixHQUFTLENBQXJCLENBQWYsRUFGWDs7ZUFHQTtJQVZPOztJQVlYLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxDQUFEO0FBRUosWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVg7UUFFUCxJQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBVCxLQUFtQixDQUFuQixJQUF5QixJQUFJLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBVCxLQUFlLEdBQTNDO1lBQ0ksSUFBSSxDQUFDLEdBQUwsSUFBWSxJQURoQjs7UUFFQSxJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBVixLQUFvQixDQUFwQixJQUEwQixJQUFJLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBVixLQUFnQixHQUE3QztZQUNJLElBQUksQ0FBQyxJQUFMLElBQWEsSUFEakI7O2VBR0E7SUFUSTs7SUFpQlIsS0FBQyxDQUFBLElBQUQsR0FBZ0IsU0FBQTtlQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFYO0lBQUg7O0lBQ2hCLEtBQUMsQ0FBQSxLQUFELEdBQVksU0FBQyxDQUFEO0FBQU8sWUFBQTtrREFBYSxDQUFFLE9BQWYsQ0FBdUIsS0FBSyxDQUFDLElBQU4sQ0FBQSxDQUF2QixFQUFxQyxHQUFyQztJQUFQOztJQUNaLEtBQUMsQ0FBQSxPQUFELEdBQVksU0FBQyxDQUFEO0FBQU8sWUFBQTtrREFBYSxDQUFFLE9BQWYsQ0FBdUIsS0FBdkIsRUFBOEIsS0FBSyxDQUFDLElBQU4sQ0FBQSxDQUE5QjtJQUFQOztJQUNaLEtBQUMsQ0FBQSxLQUFELEdBQVksU0FBQyxDQUFEO0FBRVIsWUFBQTtRQUFBLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsRUFBZSxDQUFmO0FBQ0osZUFBTSxDQUFBLElBQUssQ0FBWDtBQUNJO0FBQUEsaUJBQUEsUUFBQTs7Z0JBQ0ksSUFBRyxDQUFBLEtBQUssQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFBLEdBQUUsQ0FBVixFQUFhLENBQUEsR0FBRSxDQUFGLEdBQUksQ0FBQyxDQUFDLE1BQW5CLENBQVI7b0JBQ0ksQ0FBQSxHQUFJLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBUixFQUFXLENBQVgsQ0FBQSxHQUFnQixDQUFoQixHQUFvQixDQUFDLENBQUMsS0FBRixDQUFRLENBQUEsR0FBRSxDQUFDLENBQUMsTUFBSixHQUFXLENBQW5CO0FBQ3hCLDBCQUZKOztBQURKO1lBSUEsQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBVixFQUFlLENBQUEsR0FBRSxDQUFqQjtRQUxSO2VBT0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYO0lBVlE7O0lBWVosS0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLEdBQUQsRUFBTSxFQUFOO0FBRVAsWUFBQTtRQUFBLElBQXNCLGVBQUksRUFBRSxDQUFFLGdCQUE5QjtZQUFBLEVBQUEsR0FBSyxPQUFPLENBQUMsR0FBUixDQUFBLEVBQUw7O1FBQ0EsR0FBQSxHQUFNLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZDtRQUNOLElBQWMsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixHQUFqQixDQUFsQjtBQUFBLG1CQUFPLElBQVA7O1FBQ0EsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLEVBQWQsQ0FBQSxLQUFxQixHQUF4QjtBQUNJLG1CQUFPLElBRFg7O1FBR0EsTUFBVyxLQUFLLENBQUMsVUFBTixDQUFpQixHQUFqQixDQUFYLEVBQUMsV0FBRCxFQUFLO1FBQ0wsT0FBVyxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFLLENBQUMsT0FBTixDQUFjLEVBQWQsQ0FBakIsQ0FBWCxFQUFDLFlBQUQsRUFBSztRQUNMLElBQUcsRUFBQSxJQUFPLEVBQVAsSUFBYyxFQUFBLEtBQU0sRUFBdkI7QUFDSSxtQkFBTyxJQURYOztlQUVBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxFQUFkLEVBQWtCLEVBQWxCLENBQVg7SUFaTzs7SUFjWCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtlQUFPLFVBQUEsR0FBVSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixDQUFEO0lBQWpCOztJQUVWLEtBQUMsQ0FBQSxRQUFELEdBQVcsU0FBQyxDQUFELEVBQUksQ0FBSjtlQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFBLEtBQW9CLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZDtJQUE5Qjs7SUFFWCxLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxPQUFGLENBQVUsV0FBVixFQUF1QixNQUF2QjtJQUFQOztJQUVULEtBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxDQUFEO1FBQ0wsQ0FBQSxHQUFJLFNBQUEsQ0FBVSxDQUFWO1FBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixFQUFpQixLQUFqQjtRQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsRUFBaUIsS0FBakI7ZUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLEVBQWlCLEtBQWpCO0lBSkM7O0lBWVQsS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLENBQUQ7QUFFRixZQUFBO1FBQUEsSUFBRyx1Q0FBSDtBQUVJLG1CQUFNLENBQUMsQ0FBQyxNQUFGLElBQWEsUUFBQSxLQUFLLENBQUMsV0FBTixDQUFrQixDQUFsQixFQUFBLEtBQTZCLEdBQTdCLElBQUEsR0FBQSxLQUFrQyxHQUFsQyxJQUFBLEdBQUEsS0FBdUMsRUFBdkMsQ0FBbkI7Z0JBRUksSUFBRyxLQUFLLENBQUMsU0FBTixDQUFpQixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFBYyxNQUFkLENBQWpCLENBQUg7QUFBc0QsMkJBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLEVBQTdEOztnQkFDQSxJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUFjLGNBQWQsQ0FBakIsQ0FBSDtBQUFzRCwyQkFBTyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsRUFBN0Q7O2dCQUNBLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWMsY0FBZCxDQUFqQixDQUFIO0FBQXNELDJCQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxFQUE3RDs7Z0JBQ0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVjtZQUxSLENBRko7O2VBUUE7SUFWRTs7SUFZTixLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsQ0FBRCxFQUFJLEVBQUo7QUFFRixZQUFBO1FBQUEsSUFBRyx1Q0FBSDtZQUVJLElBQUcsVUFBQSxLQUFjLE9BQU8sRUFBeEI7Z0JBQ0ksS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWMsTUFBZCxDQUFoQixFQUF1QyxTQUFDLElBQUQ7QUFDbkMsd0JBQUE7b0JBQUEsSUFBRyxJQUFIOytCQUFhLEVBQUEsQ0FBRyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsQ0FBSCxFQUFiO3FCQUFBLE1BQ0ssV0FBRyxLQUFLLENBQUMsV0FBTixDQUFrQixDQUFsQixFQUFBLEtBQTZCLEdBQTdCLElBQUEsR0FBQSxLQUFpQyxHQUFqQyxJQUFBLEdBQUEsS0FBcUMsRUFBeEM7K0JBQ0QsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFLLENBQUMsR0FBTixDQUFVLENBQVYsQ0FBVixFQUF3QixFQUF4QixFQURDOztnQkFGOEIsQ0FBdkMsRUFESjthQUFBLE1BQUE7QUFNSSx1QkFBTSxDQUFDLENBQUMsTUFBRixJQUFhLFFBQUEsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsQ0FBbEIsRUFBQSxLQUE2QixHQUE3QixJQUFBLEdBQUEsS0FBaUMsR0FBakMsSUFBQSxHQUFBLEtBQXFDLEVBQXJDLENBQW5CO29CQUVJLElBQUcsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWMsTUFBZCxDQUFoQixDQUFIO0FBQTZDLCtCQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxFQUFwRDs7b0JBQ0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVjtnQkFIUixDQU5KO2FBRko7O2VBWUE7SUFkRTs7SUFzQk4sS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLENBQUQsRUFBSSxFQUFKO0FBRUwsWUFBQTtRQUFBLElBQUcsVUFBQSxLQUFjLE9BQU8sRUFBeEI7QUFDSTtnQkFDSSxJQUFPLFNBQVA7b0JBQ0ksRUFBQSxDQUFBO0FBQ0EsMkJBRko7O2dCQUdBLENBQUEsR0FBSSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxhQUFOLENBQW9CLENBQXBCLENBQWQ7Z0JBQ0osRUFBRSxDQUFDLE1BQUgsQ0FBVSxDQUFWLEVBQWEsRUFBRSxDQUFDLElBQUgsR0FBVSxFQUFFLENBQUMsSUFBMUIsRUFBZ0MsU0FBQyxHQUFEO29CQUM1QixJQUFHLFdBQUg7K0JBQ0ksRUFBQSxDQUFBLEVBREo7cUJBQUEsTUFBQTsrQkFHSSxFQUFFLENBQUMsSUFBSCxDQUFRLENBQVIsRUFBVyxTQUFDLEdBQUQsRUFBTSxJQUFOOzRCQUNQLElBQUcsV0FBSDt1Q0FDSSxFQUFBLENBQUEsRUFESjs2QkFBQSxNQUFBO3VDQUdJLEVBQUEsQ0FBRyxJQUFILEVBSEo7O3dCQURPLENBQVgsRUFISjs7Z0JBRDRCLENBQWhDLEVBTEo7YUFBQSxhQUFBO2dCQWNNO2dCQUNILEtBQUssQ0FBQyxLQUFOLENBQVksa0JBQUEsR0FBcUIsTUFBQSxDQUFPLEdBQVAsQ0FBakMsRUFmSDthQURKO1NBQUEsTUFBQTtZQWtCSSxJQUFHLFNBQUg7QUFDSTtvQkFDSSxDQUFBLEdBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsYUFBTixDQUFvQixDQUFwQixDQUFkO29CQUNKLElBQUcsSUFBQSxHQUFPLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWixDQUFWO3dCQUNJLEVBQUUsQ0FBQyxVQUFILENBQWMsQ0FBZCxFQUFpQixFQUFFLENBQUMsSUFBcEI7QUFDQSwrQkFBTyxLQUZYO3FCQUZKO2lCQUFBLGFBQUE7b0JBS007b0JBQ0YsV0FBRyxHQUFHLENBQUMsS0FBSixLQUFhLFFBQWIsSUFBQSxHQUFBLEtBQXVCLFNBQTFCO0FBQ0ksK0JBQU8sS0FEWDs7b0JBRUEsS0FBSyxDQUFDLEtBQU4sQ0FBWSxrQkFBQSxHQUFxQixNQUFBLENBQU8sR0FBUCxDQUFqQyxFQVJKO2lCQURKO2FBbEJKOztlQTRCQTtJQTlCSzs7SUFnQ1QsS0FBQyxDQUFBLFVBQUQsR0FBYSxTQUFDLENBQUQsRUFBSSxFQUFKO0FBRVQsWUFBQTtRQUFBLElBQUcsVUFBQSxLQUFjLE9BQU8sRUFBeEI7bUJBQ0ksS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLEVBQWdCLFNBQUMsSUFBRDtnQkFDWixtQkFBRyxJQUFJLENBQUUsTUFBTixDQUFBLFVBQUg7MkJBQXVCLEVBQUEsQ0FBRyxJQUFILEVBQXZCO2lCQUFBLE1BQUE7MkJBQ0ssRUFBQSxDQUFBLEVBREw7O1lBRFksQ0FBaEIsRUFESjtTQUFBLE1BQUE7WUFLSSxJQUFHLElBQUEsR0FBTyxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsQ0FBVjtnQkFDSSxJQUFlLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBZjtBQUFBLDJCQUFPLEtBQVA7aUJBREo7YUFMSjs7SUFGUzs7SUFVYixLQUFDLENBQUEsU0FBRCxHQUFZLFNBQUMsQ0FBRCxFQUFJLEVBQUo7QUFFUixZQUFBO1FBQUEsSUFBRyxVQUFBLEtBQWMsT0FBTyxFQUF4QjttQkFDSSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsU0FBQyxJQUFEO2dCQUNaLG1CQUFHLElBQUksQ0FBRSxXQUFOLENBQUEsVUFBSDsyQkFBNEIsRUFBQSxDQUFHLElBQUgsRUFBNUI7aUJBQUEsTUFBQTsyQkFDSyxFQUFBLENBQUEsRUFETDs7WUFEWSxDQUFoQixFQURKO1NBQUEsTUFBQTtZQUtJLElBQUcsSUFBQSxHQUFPLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixDQUFWO2dCQUNJLElBQWUsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFmO0FBQUEsMkJBQU8sS0FBUDtpQkFESjthQUxKOztJQUZROztJQWdCWixLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsQ0FBRDtBQUVKLFlBQUE7QUFBQTtZQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVLENBQVY7WUFDTixJQUFHLENBQUksS0FBSyxDQUFDLEtBQU4sQ0FBWSxHQUFaLENBQVA7Z0JBQ0ksRUFBRSxDQUFDLFNBQUgsQ0FBYSxHQUFiLEVBQWtCO29CQUFBLFNBQUEsRUFBVSxJQUFWO2lCQUFsQixFQURKOztZQUVBLElBQUcsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQixDQUFQO2dCQUNJLEVBQUUsQ0FBQyxhQUFILENBQWlCLENBQWpCLEVBQW9CLEVBQXBCLEVBREo7O0FBRUEsbUJBQU8sRUFOWDtTQUFBLGFBQUE7WUFPTTtZQUNGLEtBQUssQ0FBQyxLQUFOLENBQVksaUJBQUEsR0FBb0IsTUFBQSxDQUFPLEdBQVAsQ0FBaEM7bUJBQ0EsTUFUSjs7SUFGSTs7SUFtQlIsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLENBQUQsRUFBSSxFQUFKO0FBRUwsWUFBQTtRQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7UUFDUCxHQUFBLEdBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWO1FBQ1AsR0FBQSxHQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVjtRQUNQLEdBQUEsR0FBTyxHQUFBLElBQVEsR0FBQSxHQUFJLEdBQVosSUFBbUI7UUFFMUIsSUFBRyxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsQ0FBSDtZQUNJLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxJQUFJLENBQUMsTUFBTCxHQUFZLENBQTFCLEVBRFg7O1FBR0EsSUFBRyxVQUFBLEtBQWMsT0FBTyxFQUF4QjttQkFFSSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsU0FBQyxJQUFEO0FBQ1osb0JBQUE7Z0JBQUEsSUFBRyxDQUFJLElBQVA7b0JBQ0ksRUFBQSxDQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFIO0FBQ0EsMkJBRko7O2dCQUdBLENBQUEsR0FBSTtnQkFDSixJQUFBLEdBQU87Z0JBQ1AsS0FBQSxHQUFRLFNBQUE7b0JBQ0osSUFBQSxHQUFPLEVBQUEsR0FBRyxJQUFILEdBQVMsQ0FBQyxDQUFBLEVBQUEsR0FBRyxDQUFILENBQU0sQ0FBQyxRQUFQLENBQWdCLENBQWhCLEVBQWtCLEdBQWxCLENBQUQsQ0FBVCxHQUFtQztvQkFDMUMsSUFBRyxHQUFIO3dCQUFZLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVgsRUFBZ0IsSUFBaEIsRUFBbkI7OzJCQUNBLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixFQUFtQixTQUFDLElBQUQ7d0JBQ2YsSUFBRyxJQUFIOzRCQUNJLENBQUEsSUFBSzttQ0FDTCxLQUFBLENBQUEsRUFGSjt5QkFBQSxNQUFBO21DQUlJLEVBQUEsQ0FBRyxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsQ0FBSCxFQUpKOztvQkFEZSxDQUFuQjtnQkFISTt1QkFTUixLQUFBLENBQUE7WUFmWSxDQUFoQixFQUZKO1NBQUEsTUFBQTtZQW1CSSxJQUFHLENBQUksS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLENBQVA7QUFBNEIsdUJBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLEVBQW5DOztBQUNBLGlCQUFTLDZCQUFUO2dCQUNJLElBQUEsR0FBTyxFQUFBLEdBQUcsSUFBSCxHQUFTLENBQUMsQ0FBQSxFQUFBLEdBQUcsQ0FBSCxDQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFrQixHQUFsQixDQUFELENBQVQsR0FBbUM7Z0JBQzFDLElBQUcsR0FBSDtvQkFBWSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLEVBQWdCLElBQWhCLEVBQW5COztnQkFDQSxJQUFHLENBQUksS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLENBQVA7QUFDSSwyQkFBTyxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFEWDs7QUFISixhQXBCSjs7SUFWSzs7SUEwQ1QsS0FBQyxDQUFBLEtBQUQsR0FBUyxTQUFDLENBQUQsRUFBSSxFQUFKO2VBQVcsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsRUFBbUIsRUFBbkI7SUFBWDs7SUFDVCxLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsQ0FBRCxFQUFJLEVBQUo7ZUFBVyxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQixFQUFvQixFQUFwQjtJQUFYOztJQUVULEtBQUMsQ0FBQSxVQUFELEdBQWEsU0FBQyxDQUFELEVBQUksRUFBSjtBQUVULFlBQUE7UUFBQSxJQUFHLFVBQUEsS0FBYyxPQUFPLEVBQXhCO0FBQ0k7dUJBQ0ksRUFBRSxDQUFDLE1BQUgsQ0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsQ0FBVixFQUE0QixFQUFFLENBQUMsSUFBSCxHQUFVLEVBQUUsQ0FBQyxJQUF6QyxFQUErQyxTQUFDLEdBQUQ7MkJBQzNDLEVBQUEsQ0FBTyxXQUFQO2dCQUQyQyxDQUEvQyxFQURKO2FBQUEsYUFBQTtnQkFHTTtnQkFDRixLQUFLLENBQUMsS0FBTixDQUFZLHNCQUFBLEdBQXlCLE1BQUEsQ0FBTyxHQUFQLENBQXJDO3VCQUNBLEVBQUEsQ0FBRyxLQUFILEVBTEo7YUFESjtTQUFBLE1BQUE7QUFRSTtnQkFDSSxFQUFFLENBQUMsVUFBSCxDQUFjLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFkLEVBQWdDLEVBQUUsQ0FBQyxJQUFILEdBQVUsRUFBRSxDQUFDLElBQTdDO0FBQ0EsdUJBQU8sS0FGWDthQUFBLGFBQUE7QUFJSSx1QkFBTyxNQUpYO2FBUko7O0lBRlM7O0lBc0JiLEtBQUMsQ0FBQSxPQUFELEdBQVU7O0lBRVYsS0FBQyxDQUFBLFFBQUQsR0FDSTtRQUFBLE9BQUEsRUFBUSxDQUFSO1FBQ0EsT0FBQSxFQUFRLENBRFI7UUFFQSxZQUFBLEVBQWEsQ0FGYjtRQUdBLFlBQUEsRUFBYSxDQUhiOzs7SUFXSixLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsQ0FBRDtBQUVMLFlBQUE7QUFBQTtZQUNJLElBQUcsQ0FBSSxLQUFLLENBQUMsT0FBYjtnQkFDSSxLQUFLLENBQUMsT0FBTixHQUFnQjtBQUNoQjtBQUFBLHFCQUFBLHFDQUFBOztvQkFDSSxLQUFLLENBQUMsT0FBUSxDQUFBLEdBQUEsQ0FBZCxHQUFxQjtBQUR6QjtnQkFFQSxLQUFLLENBQUMsT0FBUSxDQUFBLE9BQUEsQ0FBZCxHQUF5QixLQUo3Qjs7WUFNQSxHQUFBLEdBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWO1lBQ04sSUFBZSxHQUFBLElBQVEsNEJBQXZCO0FBQUEsdUJBQU8sS0FBUDs7WUFDQSxJQUFlLEtBQUssQ0FBQyxRQUFTLENBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFmLENBQWlCLENBQUMsV0FBbEIsQ0FBQSxDQUFBLENBQTlCO0FBQUEsdUJBQU8sS0FBUDs7WUFDQSxDQUFBLEdBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkO1lBQ0osSUFBZ0IsQ0FBSSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsQ0FBcEI7QUFBQSx1QkFBTyxNQUFQOztZQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsY0FBUjtBQUNYLG1CQUFPLENBQUksUUFBUSxDQUFDLGdCQUFULENBQTBCLENBQTFCLEVBYmY7U0FBQSxhQUFBO1lBY007WUFDRixLQUFLLENBQUMsS0FBTixDQUFZLGtCQUFBLEdBQXFCLE1BQUEsQ0FBTyxHQUFQLENBQWpDO21CQUNBLE1BaEJKOztJQUZLOztJQW9CVCxLQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsQ0FBRCxFQUFJLEVBQUo7QUFFUCxZQUFBO1FBQUEsSUFBRyxVQUFBLEtBQWMsT0FBTyxFQUF4QjtBQUNJO3VCQUNJLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWixFQUFlLE1BQWYsRUFBdUIsU0FBQyxHQUFELEVBQU0sSUFBTjsyQkFDbkIsRUFBQSxDQUFHLENBQUksR0FBSixJQUFZLElBQVosSUFBb0IsRUFBdkI7Z0JBRG1CLENBQXZCLEVBREo7YUFBQSxhQUFBO2dCQUdNO3VCQUNGLEVBQUEsQ0FBRyxLQUFLLENBQUMsS0FBTixDQUFZLG9CQUFBLEdBQXVCLE1BQUEsQ0FBTyxHQUFQLENBQW5DLENBQUgsRUFKSjthQURKO1NBQUEsTUFBQTtBQU9JO3VCQUNJLEVBQUUsQ0FBQyxZQUFILENBQWdCLENBQWhCLEVBQW1CLE1BQW5CLEVBREo7YUFBQSxhQUFBO2dCQUVNO3VCQUNGLEtBQUssQ0FBQyxLQUFOLENBQVksb0JBQUEsR0FBdUIsTUFBQSxDQUFPLEdBQVAsQ0FBbkMsRUFISjthQVBKOztJQUZPOztJQWNYLEtBQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxDQUFELEVBQUksSUFBSixFQUFVLEVBQVY7QUFFUixZQUFBO1FBQUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxPQUFOLENBQUE7UUFFVixJQUFHLFVBQUEsS0FBYyxPQUFPLEVBQXhCO0FBQ0k7dUJBQ0ksSUFBQyxDQUFBLFVBQUQsQ0FBWSxDQUFaLEVBQWUsU0FBQyxJQUFEO0FBRVgsd0JBQUE7b0JBQUEsSUFBQSw2REFBb0I7MkJBRXBCLEVBQUUsQ0FBQyxTQUFILENBQWEsT0FBYixFQUFzQixJQUF0QixFQUE0Qjt3QkFBQSxJQUFBLEVBQUssSUFBTDtxQkFBNUIsRUFBdUMsU0FBQyxHQUFEO3dCQUNuQyxJQUFHLEdBQUg7bUNBQ0ksRUFBQSxDQUFHLEtBQUssQ0FBQyxLQUFOLENBQVksb0JBQUEsR0FBdUIsTUFBQSxDQUFPLEdBQVAsQ0FBbkMsQ0FBSCxFQURKO3lCQUFBLE1BQUE7bUNBR0ksRUFBRSxDQUFDLElBQUgsQ0FBUSxPQUFSLEVBQWlCLENBQWpCLEVBQW9CO2dDQUFBLFNBQUEsRUFBVSxJQUFWOzZCQUFwQixFQUFvQyxTQUFDLEdBQUQ7Z0NBQ2hDLElBQUcsR0FBSDsyQ0FBWSxFQUFBLENBQUcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxDQUFBLDBCQUFBLEdBQTJCLE9BQTNCLEdBQW1DLE1BQW5DLEdBQXlDLENBQXpDLENBQUEsR0FBK0MsTUFBQSxDQUFPLEdBQVAsQ0FBM0QsQ0FBSCxFQUFaO2lDQUFBLE1BQUE7MkNBQ0ssRUFBQSxDQUFHLENBQUgsRUFETDs7NEJBRGdDLENBQXBDLEVBSEo7O29CQURtQyxDQUF2QztnQkFKVyxDQUFmLEVBREo7YUFBQSxhQUFBO2dCQVlNO3VCQUNGLEVBQUEsQ0FBRyxLQUFLLENBQUMsS0FBTixDQUFZLHNCQUFBLEdBQXlCLE1BQUEsQ0FBTyxHQUFQLENBQXJDLENBQUgsRUFiSjthQURKO1NBQUEsTUFBQTtBQWdCSTtnQkFDSSxFQUFFLENBQUMsYUFBSCxDQUFpQixPQUFqQixFQUEwQixJQUExQjtnQkFDQSxFQUFFLENBQUMsUUFBSCxDQUFZLE9BQVosRUFBcUIsQ0FBckIsRUFBd0I7b0JBQUEsU0FBQSxFQUFVLElBQVY7aUJBQXhCO3VCQUNBLEVBSEo7YUFBQSxhQUFBO2dCQUlNO3VCQUNGLEtBQUssQ0FBQyxLQUFOLENBQVkscUJBQUEsR0FBd0IsTUFBQSxDQUFPLEdBQVAsQ0FBcEMsRUFMSjthQWhCSjs7SUFKUTs7SUEyQlosS0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLEdBQUQ7ZUFFTixLQUFLLENBQUMsSUFBTixDQUFXLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBWCxFQUF3QixPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsRUFBaEIsQ0FBQSxDQUFBLEdBQXVCLENBQUMsR0FBQSxJQUFRLENBQUEsR0FBQSxHQUFJLEdBQUosQ0FBUixJQUFxQixFQUF0QixDQUEvQztJQUZNOztJQVVWLEtBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxDQUFELEVBQUksRUFBSjtRQUNMLElBQUcsRUFBSDttQkFBVyxFQUFFLENBQUMsTUFBSCxDQUFVLENBQVYsRUFBYSxFQUFiLEVBQVg7U0FBQSxNQUFBO21CQUNLLEVBQUUsQ0FBQyxVQUFILENBQWMsQ0FBZCxFQURMOztJQURLOztJQVVULEtBQUMsQ0FBQSxHQUFELEdBQU8sSUFBSSxNQUFKLENBQVcsTUFBWCxFQUFtQixHQUFuQjs7SUFFUCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUE7ZUFBRyxJQUFJLENBQUMsR0FBTCxLQUFZO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLEdBQUQ7UUFDSixJQUFHLElBQUMsQ0FBQSxTQUFKO1lBQVksT0FBQSxDQUFPLEtBQVAsQ0FBYSxHQUFiLEVBQVo7O2VBQ0E7SUFGSTs7Ozs7O0FBSVosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgICBcbjAwMCAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICBcbiMjI1xuXG5vcyAgID0gcmVxdWlyZSAnb3MnXG5mcyAgID0gcmVxdWlyZSAnZnMtZXh0cmEnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxuY2xhc3MgU2xhc2hcbiAgICBcbiAgICBAbG9nRXJyb3JzOiBmYWxzZVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAcGF0aDogKHApIC0+XG4gICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnBhdGggLS0gbm8gcGF0aD9cIiBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcCAgICAgXG4gICAgICAgICAgICBwID0gcC5yZXBsYWNlIFNsYXNoLnJlZywgJy8nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHAgPSBwLnJlcGxhY2UgU2xhc2gucmVnLCAnLydcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwICAgICAgICAgICAgXG4gICAgICAgIGlmIHAuZW5kc1dpdGgoJzouJykgYW5kIHAubGVuZ3RoID09IDNcbiAgICAgICAgICAgIHAgPSBwWy4uMV1cbiAgICAgICAgaWYgcC5lbmRzV2l0aCgnOicpIGFuZCBwLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICBwID0gcCArICcvJ1xuICAgICAgICBwXG4gICAgICAgIFxuICAgIEB1bnNsYXNoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gudW5zbGFzaCAtLSBubyBwYXRoP1wiIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBpZiBTbGFzaC53aW4oKVxuICAgICAgICAgICAgaWYgcC5sZW5ndGggPj0gMyBhbmQgcFswXSA9PSAnLycgPT0gcFsyXSBcbiAgICAgICAgICAgICAgICBwID0gcFsxXSArICc6JyArIHAuc2xpY2UgMlxuICAgICAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHBcbiAgICAgICAgICAgIGlmIHBbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcCA9ICBwWzBdLnRvVXBwZXJDYXNlKCkgKyBwWzEuLl1cbiAgICAgICAgcFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQHJlc29sdmU6IChwKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBwID0gcHJvY2Vzcy5jd2QoKSBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgIFxuICAgICAgICBpZiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgICAgICAgcCA9IFNsYXNoLmpvaW4uYXBwbHkgMCwgYXJndW1lbnRzXG4gICAgICAgIFxuICAgICAgICBwID0gU2xhc2gudW5lbnYgU2xhc2gudW50aWxkZSBwXG4gICAgICAgIFxuICAgICAgICBpZiBTbGFzaC5pc1JlbGF0aXZlIHBcbiAgICAgICAgICAgIHAgPSBTbGFzaC5wYXRoIHBhdGgucmVzb2x2ZSBwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgcFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc3BsaXQ6IChwKSAtPiBTbGFzaC5wYXRoKHApLnNwbGl0KCcvJykuZmlsdGVyIChlKSAtPiBlLmxlbmd0aFxuICAgIFxuICAgIEBzcGxpdERyaXZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgcGFyc2VkID0gU2xhc2gucGFyc2UgcFxuICAgICAgICByb290ID0gcGFyc2VkLnJvb3RcblxuICAgICAgICBpZiByb290Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGlmIHAubGVuZ3RoID4gcm9vdC5sZW5ndGhcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IHAuc2xpY2Uocm9vdC5sZW5ndGgtMSlcbiAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSAnLydcbiAgICAgICAgICAgIHJldHVybiBbZmlsZVBhdGggLCByb290LnNsaWNlIDAsIHJvb3QubGVuZ3RoLTJdXG4gICAgICAgIGVsc2UgaWYgcGFyc2VkLmRpci5sZW5ndGggPiAxXG4gICAgICAgICAgICBpZiBwYXJzZWQuZGlyWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHJldHVybiBbcFsyLi5dLCBwYXJzZWQuZGlyWzBdXVxuICAgICAgICBlbHNlIGlmIHBhcnNlZC5iYXNlLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICBpZiBwYXJzZWQuYmFzZVsxXSA9PSAnOidcbiAgICAgICAgICAgICAgICByZXR1cm4gWycvJywgcGFyc2VkLmJhc2VbMF1dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFtTbGFzaC5wYXRoKHApLCAnJ11cbiAgICAgICAgXG4gICAgQHJlbW92ZURyaXZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBTbGFzaC5zcGxpdERyaXZlKHApWzBdXG4gIFxuICAgIEBpc1Jvb3Q6IChwKSAtPiBTbGFzaC5yZW1vdmVEcml2ZShwKSA9PSAnLydcbiAgICAgICAgXG4gICAgQHNwbGl0RmlsZUxpbmU6IChwKSAtPiAgIyBmaWxlLnR4dDoxOjAgLS0+IFsnZmlsZS50eHQnLCAxLCAwXVxuICAgICAgICBcbiAgICAgICAgW2YsZF0gPSBTbGFzaC5zcGxpdERyaXZlIHBcbiAgICAgICAgc3BsaXQgPSBTdHJpbmcoZikuc3BsaXQgJzonXG4gICAgICAgIGxpbmUgPSBwYXJzZUludCBzcGxpdFsxXSBpZiBzcGxpdC5sZW5ndGggPiAxXG4gICAgICAgIGNsbW4gPSBwYXJzZUludCBzcGxpdFsyXSBpZiBzcGxpdC5sZW5ndGggPiAyXG4gICAgICAgIGwgPSBjID0gMFxuICAgICAgICBsID0gbGluZSBpZiBOdW1iZXIuaXNJbnRlZ2VyIGxpbmVcbiAgICAgICAgYyA9IGNsbW4gaWYgTnVtYmVyLmlzSW50ZWdlciBjbG1uXG4gICAgICAgIGQgPSBkICsgJzonIGlmIGQgIT0gJydcbiAgICAgICAgWyBkICsgc3BsaXRbMF0sIE1hdGgubWF4KGwsMSksICBNYXRoLm1heChjLDApIF1cbiAgICAgICAgXG4gICAgQHNwbGl0RmlsZVBvczogKHApIC0+ICMgZmlsZS50eHQ6MTozIC0tPiBbJ2ZpbGUudHh0JywgWzMsIDBdXVxuICAgIFxuICAgICAgICBbZixsLGNdID0gU2xhc2guc3BsaXRGaWxlTGluZSBwXG4gICAgICAgIFtmLCBbYywgbC0xXV1cbiAgICAgICAgXG4gICAgQHJlbW92ZUxpbmVQb3M6IChwKSAtPiBTbGFzaC5zcGxpdEZpbGVMaW5lKHApWzBdXG4gICAgQHJlbW92ZUNvbHVtbjogIChwKSAtPiBcbiAgICAgICAgW2YsbF0gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgaWYgbD4xIHRoZW4gZiArICc6JyArIGxcbiAgICAgICAgZWxzZSBmXG4gICAgICAgIFxuICAgIEBleHQ6ICAgICAgIChwKSAtPiBwYXRoLmV4dG5hbWUocCkuc2xpY2UgMVxuICAgIEBzcGxpdEV4dDogIChwKSAtPiBbU2xhc2gucmVtb3ZlRXh0KHApLCBTbGFzaC5leHQocCldXG4gICAgQHJlbW92ZUV4dDogKHApIC0+IFNsYXNoLmpvaW4gU2xhc2guZGlyKHApLCBTbGFzaC5iYXNlIHBcbiAgICBAc3dhcEV4dDogICAocCwgZXh0KSAtPiBTbGFzaC5yZW1vdmVFeHQocCkgKyAoZXh0LnN0YXJ0c1dpdGgoJy4nKSBhbmQgZXh0IG9yIFwiLiN7ZXh0fVwiKVxuICAgICAgICBcbiAgICAjICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBqb2luOiAtPiBbXS5tYXAuY2FsbChhcmd1bWVudHMsIFNsYXNoLnBhdGgpLmpvaW4gJy8nXG4gICAgXG4gICAgQGpvaW5GaWxlUG9zOiAoZmlsZSwgcG9zKSAtPiAjIFsnZmlsZS50eHQnLCBbMywgMF1dIC0tPiBmaWxlLnR4dDoxOjNcbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBTbGFzaC5yZW1vdmVMaW5lUG9zIGZpbGVcbiAgICAgICAgaWYgbm90IHBvcz8gb3Igbm90IHBvc1swXT8gb3IgcG9zWzBdID09IHBvc1sxXSA9PSAwXG4gICAgICAgICAgICBmaWxlXG4gICAgICAgIGVsc2UgaWYgcG9zWzBdXG4gICAgICAgICAgICBmaWxlICsgXCI6I3twb3NbMV0rMX06I3twb3NbMF19XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmlsZSArIFwiOiN7cG9zWzFdKzF9XCJcbiAgICAgICAgICAgICAgICBcbiAgICBAam9pbkZpbGVMaW5lOiAoZmlsZSwgbGluZSwgY29sKSAtPiAjICdmaWxlLnR4dCcsIDEsIDIgLS0+IGZpbGUudHh0OjE6MlxuICAgICAgICBcbiAgICAgICAgZmlsZSA9IFNsYXNoLnJlbW92ZUxpbmVQb3MgZmlsZVxuICAgICAgICByZXR1cm4gZmlsZSBpZiBub3QgbGluZVxuICAgICAgICByZXR1cm4gXCIje2ZpbGV9OiN7bGluZX1cIiBpZiBub3QgY29sXG4gICAgICAgIFwiI3tmaWxlfToje2xpbmV9OiN7Y29sfVwiXG4gICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBAZGlybGlzdDogKHAsIG9wdCwgY2IpIC0+IEBsaXN0IHAsIG9wdCwgY2JcbiAgICBAbGlzdDogICAgKHAsIG9wdCwgY2IpIC0+IHJlcXVpcmUoJy4vZGlybGlzdCcpIHAsIG9wdCwgY2JcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHBhdGhsaXN0OiAocCkgLT4gIyAnL3Jvb3QvZGlyL2ZpbGUudHh0JyAtLT4gWycvJywgJy9yb290JywgJy9yb290L2RpcicsICcvcm9vdC9kaXIvZmlsZS50eHQnXVxuICAgIFxuICAgICAgICBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLnBhdGhsaXN0IC0tIG5vIHBhdGg/XCIgXG4gICAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgICAgIFxuICAgICAgICBwID0gU2xhc2gubm9ybWFsaXplIHBcbiAgICAgICAgaWYgcC5sZW5ndGggPiAxIGFuZCBwW3AubGVuZ3RoLTFdID09ICcvJyBhbmQgcFtwLmxlbmd0aC0yXSAhPSAnOidcbiAgICAgICAgICAgIHAgPSBwWy4uLnAubGVuZ3RoLTFdIFxuICAgICAgICBsaXN0ID0gW3BdXG4gICAgICAgIHdoaWxlIFNsYXNoLmRpcihwKSAhPSAnJ1xuICAgICAgICAgICAgbGlzdC51bnNoaWZ0IFNsYXNoLmRpciBwXG4gICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbGlzdFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgICAgICAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAgICAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgMDAwICAwMDAgIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAwMDAgIDAwMCAgMDAwICAgXG4gICAgXG4gICAgQGJhc2U6ICAgICAgIChwKSAgIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocCksIHBhdGguZXh0bmFtZSBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIEBmaWxlOiAgICAgICAocCkgICAtPiBwYXRoLmJhc2VuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGV4dG5hbWU6ICAgIChwKSAgIC0+IHBhdGguZXh0bmFtZSBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIEBiYXNlbmFtZTogICAocCxlKSAtPiBwYXRoLmJhc2VuYW1lIFNsYXNoLnNhbml0aXplKHApLCBlXG4gICAgQGlzQWJzb2x1dGU6IChwKSAgIC0+IHAgPSBTbGFzaC5zYW5pdGl6ZShwKTsgcFsxXSA9PSAnOicgb3IgcGF0aC5pc0Fic29sdXRlIHBcbiAgICBAaXNSZWxhdGl2ZTogKHApICAgLT4gbm90IFNsYXNoLmlzQWJzb2x1dGUgcFxuICAgIEBkaXJuYW1lOiAgICAocCkgICAtPiBTbGFzaC5wYXRoIHBhdGguZGlybmFtZSBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIEBub3JtYWxpemU6ICAocCkgICAtPiBTbGFzaC5wYXRoIFNsYXNoLnNhbml0aXplKHApXG4gICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBkaXI6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC5ub3JtYWxpemUgcFxuICAgICAgICBpZiBTbGFzaC5pc1Jvb3QgcCB0aGVuIHJldHVybiAnJ1xuICAgICAgICBwID0gcGF0aC5kaXJuYW1lIHBcbiAgICAgICAgaWYgcCA9PSAnLicgdGhlbiByZXR1cm4gJydcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBpZiBwLmVuZHNXaXRoKCc6JykgYW5kIHAubGVuZ3RoID09IDJcbiAgICAgICAgICAgIHAgKz0gJy8nXG4gICAgICAgIHBcbiAgICAgICAgXG4gICAgQHNhbml0aXplOiAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC5zYW5pdGl6ZSAtLSBubyBwYXRoP1wiIFxuICAgICAgICBpZiBwWzBdID09ICdcXG4nXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcImxlYWRpbmcgbmV3bGluZSBpbiBwYXRoISAnI3twfSdcIlxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLnNhbml0aXplIHAuc3Vic3RyIDFcbiAgICAgICAgaWYgcC5lbmRzV2l0aCAnXFxuJ1xuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJ0cmFpbGluZyBuZXdsaW5lIGluIHBhdGghICcje3B9J1wiXG4gICAgICAgICAgICByZXR1cm4gU2xhc2guc2FuaXRpemUgcC5zdWJzdHIgMCwgcC5sZW5ndGgtMVxuICAgICAgICBwXG4gICAgXG4gICAgQHBhcnNlOiAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBkaWN0ID0gcGF0aC5wYXJzZSBwXG4gICAgICAgIFxuICAgICAgICBpZiBkaWN0LmRpci5sZW5ndGggPT0gMiBhbmQgZGljdC5kaXJbMV0gPT0gJzonXG4gICAgICAgICAgICBkaWN0LmRpciArPSAnLydcbiAgICAgICAgaWYgZGljdC5yb290Lmxlbmd0aCA9PSAyIGFuZCBkaWN0LnJvb3RbMV0gPT0gJzonXG4gICAgICAgICAgICBkaWN0LnJvb3QgKz0gJy8nXG4gICAgICAgICAgICBcbiAgICAgICAgZGljdFxuICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgQGhvbWU6ICAgICAgICAgIC0+IFNsYXNoLnBhdGggb3MuaG9tZWRpcigpXG4gICAgQHRpbGRlOiAgICAgKHApIC0+IFNsYXNoLnBhdGgocCk/LnJlcGxhY2UgU2xhc2guaG9tZSgpLCAnfidcbiAgICBAdW50aWxkZTogICAocCkgLT4gU2xhc2gucGF0aChwKT8ucmVwbGFjZSAvXlxcfi8sIFNsYXNoLmhvbWUoKVxuICAgIEB1bmVudjogICAgIChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGkgPSBwLmluZGV4T2YgJyQnLCAwXG4gICAgICAgIHdoaWxlIGkgPj0gMFxuICAgICAgICAgICAgZm9yIGssdiBvZiBwcm9jZXNzLmVudlxuICAgICAgICAgICAgICAgIGlmIGsgPT0gcC5zbGljZSBpKzEsIGkrMStrLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBwID0gcC5zbGljZSgwLCBpKSArIHYgKyBwLnNsaWNlKGkray5sZW5ndGgrMSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGkgPSBwLmluZGV4T2YgJyQnLCBpKzFcbiAgICAgICAgICAgIFxuICAgICAgICBTbGFzaC5wYXRoIHBcbiAgICAgICAgXG4gICAgQHJlbGF0aXZlOiAocmVsLCB0bykgLT5cbiAgICAgICAgXG4gICAgICAgIHRvID0gcHJvY2Vzcy5jd2QoKSBpZiBub3QgdG8/Lmxlbmd0aFxuICAgICAgICByZWwgPSBTbGFzaC5yZXNvbHZlIHJlbFxuICAgICAgICByZXR1cm4gcmVsIGlmIG5vdCBTbGFzaC5pc0Fic29sdXRlIHJlbFxuICAgICAgICBpZiBTbGFzaC5yZXNvbHZlKHRvKSA9PSByZWxcbiAgICAgICAgICAgIHJldHVybiAnLidcblxuICAgICAgICBbcmwsIHJkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcmVsXG4gICAgICAgIFt0bywgdGRdID0gU2xhc2guc3BsaXREcml2ZSBTbGFzaC5yZXNvbHZlIHRvXG4gICAgICAgIGlmIHJkIGFuZCB0ZCBhbmQgcmQgIT0gdGRcbiAgICAgICAgICAgIHJldHVybiByZWxcbiAgICAgICAgU2xhc2gucGF0aCBwYXRoLnJlbGF0aXZlIHRvLCBybFxuICAgICAgICBcbiAgICBAZmlsZVVybDogKHApIC0+IFwiZmlsZTovLy8je1NsYXNoLmVuY29kZSBwfVwiXG5cbiAgICBAc2FtZVBhdGg6IChhLCBiKSAtPiBTbGFzaC5yZXNvbHZlKGEpID09IFNsYXNoLnJlc29sdmUoYilcblxuICAgIEBlc2NhcGU6IChwKSAtPiBwLnJlcGxhY2UgLyhbXFxgXFxcIl0pL2csICdcXFxcJDEnXG5cbiAgICBAZW5jb2RlOiAocCkgLT5cbiAgICAgICAgcCA9IGVuY29kZVVSSSBwXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcIy9nLCBcIiUyM1wiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJi9nLCBcIiUyNlwiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJy9nLCBcIiUyN1wiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAgIDAwMCAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAwMDAgICAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHBrZzogKHApIC0+XG4gICAgXG4gICAgICAgIGlmIHA/Lmxlbmd0aD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nLCAnLycsICcnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyAgU2xhc2guam9pbiBwLCAnLmdpdCcgICAgICAgICB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2Uubm9vbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLmpzb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBudWxsXG5cbiAgICBAZ2l0OiAocCwgY2IpIC0+XG5cbiAgICAgICAgaWYgcD8ubGVuZ3RoP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgICAgIFNsYXNoLmRpckV4aXN0cyBTbGFzaC5qb2luKHAsICcuZ2l0JyksIChzdGF0KSAtPiBcbiAgICAgICAgICAgICAgICAgICAgaWYgc3RhdCB0aGVuIGNiIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nICcvJyAnJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIFNsYXNoLmdpdCBTbGFzaC5kaXIocCksIGNiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nICcvJyAnJ11cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyBTbGFzaC5qb2luIHAsICcuZ2l0JyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBleGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpZiBub3QgcD9cbiAgICAgICAgICAgICAgICAgICAgY2IoKSBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzIHAsIGZzLlJfT0sgfCBmcy5GX09LLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5zdGF0IHAsIChlcnIsIHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBzdGF0XG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guZXhpc3RzIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHA/XG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5yZXNvbHZlIFNsYXNoLnJlbW92ZUxpbmVQb3MgcFxuICAgICAgICAgICAgICAgICAgICBpZiBzdGF0ID0gZnMuc3RhdFN5bmMocClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgcCwgZnMuUl9PS1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRcbiAgICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAgICAgaWYgZXJyLmNvZGUgaW4gWydFTk9FTlQnLCAnRU5PVERJUiddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmV4aXN0cyAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICBudWxsICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICBAZmlsZUV4aXN0czogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIFNsYXNoLmV4aXN0cyBwLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBzdGF0Py5pc0ZpbGUoKSB0aGVuIGNiIHN0YXRcbiAgICAgICAgICAgICAgICBlbHNlIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdCA9IFNsYXNoLmV4aXN0cyBwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXQgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgIFxuICAgIEBkaXJFeGlzdHM6IChwLCBjYikgLT5cblxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRGlyZWN0b3J5KCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEB0b3VjaDogKHApIC0+XG5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBkaXIgPSBTbGFzaC5kaXIgcFxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLmlzRGlyIGRpclxuICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyBkaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgICAgICBpZiBub3QgU2xhc2guZmlsZUV4aXN0cyBwXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBwLCAnJ1xuICAgICAgICAgICAgcmV0dXJuIHBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLnRvdWNoIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEB1bnVzZWQ6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIG5hbWUgPSBTbGFzaC5iYXNlIHBcbiAgICAgICAgZGlyICA9IFNsYXNoLmRpciBwXG4gICAgICAgIGV4dCAgPSBTbGFzaC5leHQgcFxuICAgICAgICBleHQgID0gZXh0IGFuZCAnLicrZXh0IG9yICcnXG4gICAgICAgIFxuICAgICAgICBpZiAvXFxkXFxkJC8udGVzdCBuYW1lXG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zbGljZSAwLCBuYW1lLmxlbmd0aC0yXG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgbm90IHN0YXQgXG4gICAgICAgICAgICAgICAgICAgIGNiIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBpID0gMVxuICAgICAgICAgICAgICAgIHRlc3QgPSAnJ1xuICAgICAgICAgICAgICAgIGNoZWNrID0gLT5cbiAgICAgICAgICAgICAgICAgICAgdGVzdCA9IFwiI3tuYW1lfSN7XCIje2l9XCIucGFkU3RhcnQoMiAnMCcpfSN7ZXh0fVwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGRpciB0aGVuIHRlc3QgPSBTbGFzaC5qb2luIGRpciwgdGVzdFxuICAgICAgICAgICAgICAgICAgICBTbGFzaC5leGlzdHMgdGVzdCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBzdGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2soKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIFNsYXNoLnJlc29sdmUgdGVzdFxuICAgICAgICAgICAgICAgIGNoZWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLmV4aXN0cyhwKSB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgIGZvciBpIGluIFsxLi4xMDAwXVxuICAgICAgICAgICAgICAgIHRlc3QgPSBcIiN7bmFtZX0je1wiI3tpfVwiLnBhZFN0YXJ0KDIgJzAnKX0je2V4dH1cIlxuICAgICAgICAgICAgICAgIGlmIGRpciB0aGVuIHRlc3QgPSBTbGFzaC5qb2luIGRpciwgdGVzdFxuICAgICAgICAgICAgICAgIGlmIG5vdCBTbGFzaC5leGlzdHMgdGVzdFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU2xhc2gucmVzb2x2ZSB0ZXN0XG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAgIFxuICAgIFxuICAgIEBpc0RpcjogIChwLCBjYikgLT4gU2xhc2guZGlyRXhpc3RzIHAsIGNiXG4gICAgQGlzRmlsZTogKHAsIGNiKSAtPiBTbGFzaC5maWxlRXhpc3RzIHAsIGNiXG4gICAgXG4gICAgQGlzV3JpdGFibGU6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3MgU2xhc2gucmVzb2x2ZShwKSwgZnMuUl9PSyB8IGZzLldfT0ssIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNiIG5vdCBlcnI/XG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmlzV3JpdGFibGUgLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgICAgICAgICBjYiBmYWxzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIFNsYXNoLnJlc29sdmUocCksIGZzLlJfT0sgfCBmcy5XX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuICAgIFxuICAgIEB0ZXh0ZXh0OiBudWxsXG4gICAgXG4gICAgQHRleHRiYXNlOiBcbiAgICAgICAgcHJvZmlsZToxXG4gICAgICAgIGxpY2Vuc2U6MVxuICAgICAgICAnLmdpdGlnbm9yZSc6MVxuICAgICAgICAnLm5wbWlnbm9yZSc6MVxuICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBpc1RleHQ6IChwKSAtPlxuICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGlmIG5vdCBTbGFzaC50ZXh0ZXh0XG4gICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dCA9IHt9XG4gICAgICAgICAgICAgICAgZm9yIGV4dCBpbiByZXF1aXJlICd0ZXh0ZXh0ZW5zaW9ucydcbiAgICAgICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dFtleHRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIFNsYXNoLnRleHRleHRbJ2NyeXB0J10gPSB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4dCA9IFNsYXNoLmV4dCBwXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBleHQgYW5kIFNsYXNoLnRleHRleHRbZXh0XT8gXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBTbGFzaC50ZXh0YmFzZVtTbGFzaC5iYXNlbmFtZShwKS50b0xvd2VyQ2FzZSgpXVxuICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBTbGFzaC5pc0ZpbGUgcFxuICAgICAgICAgICAgaXNCaW5hcnkgPSByZXF1aXJlICdpc2JpbmFyeWZpbGUnXG4gICAgICAgICAgICByZXR1cm4gbm90IGlzQmluYXJ5LmlzQmluYXJ5RmlsZVN5bmMgcFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guaXNUZXh0IC0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIFxuICAgIEByZWFkVGV4dDogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlIHAsICd1dGY4JywgKGVyciwgdGV4dCkgLT4gXG4gICAgICAgICAgICAgICAgICAgIGNiIG5vdCBlcnIgYW5kIHRleHQgb3IgJydcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gucmVhZFRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMgcCwgJ3V0ZjgnXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLnJlYWRUZXh0IC0tIFwiICsgU3RyaW5nKGVycilcblxuICAgIEB3cml0ZVRleHQ6IChwLCB0ZXh0LCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIHRtcGZpbGUgPSBTbGFzaC50bXBmaWxlKClcbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBAZmlsZUV4aXN0cyBwLCAoc3RhdCkgLT4gIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IHN0YXQ/Lm1vZGUgPyAwbzY2NlxuICAgIFxuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUgdG1wZmlsZSwgdGV4dCwgbW9kZTptb2RlLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLm1vdmUgdG1wZmlsZSwgcCwgb3ZlcndyaXRlOnRydWUsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGVyciB0aGVuIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0tIG1vdmUgI3t0bXBmaWxlfSAtPiAje3B9XCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGNiIHBcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0tLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgdG1wZmlsZSwgdGV4dFxuICAgICAgICAgICAgICAgIGZzLm1vdmVTeW5jIHRtcGZpbGUsIHAsIG92ZXJ3cml0ZTp0cnVlXG4gICAgICAgICAgICAgICAgcFxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICBcbiAgICBAdG1wZmlsZTogKGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBTbGFzaC5qb2luIG9zLnRtcGRpcigpLCByZXF1aXJlKCd1dWlkJykudjEoKSArIChleHQgYW5kIFwiLiN7ZXh0fVwiIG9yICcnKVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAcmVtb3ZlOiAocCwgY2IpIC0+IFxuICAgICAgICBpZiBjYiB0aGVuIGZzLnJlbW92ZSBwLCBjYlxuICAgICAgICBlbHNlIGZzLnJlbW92ZVN5bmMgcFxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEByZWcgPSBuZXcgUmVnRXhwIFwiXFxcXFxcXFxcIiwgJ2cnXG5cbiAgICBAd2luOiAtPiBwYXRoLnNlcCA9PSAnXFxcXCdcbiAgICBcbiAgICBAZXJyb3I6IChtc2cpIC0+IFxuICAgICAgICBpZiBAbG9nRXJyb3JzIHRoZW4gZXJyb3IgbXNnIFxuICAgICAgICAnJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNsYXNoXG4iXX0=
//# sourceURL=../coffee/kslash.coffee