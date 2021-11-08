// koffee 1.18.0

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

    Slash.resolve = function(p) {
        if (!(p != null ? p.length : void 0)) {
            p = process.cwd();
        }
        p = Slash.unenv(Slash.untilde(p));
        if (Slash.isRelative(p)) {
            p = Slash.path(path.resolve(p));
        } else {
            p = Slash.path(p);
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

    Slash.git = function(p, cb) {
        var ref;
        if ((p != null ? p.length : void 0) != null) {
            if ('function' === typeof cb) {
                Slash.dirExists(Slash.join(p, '.git'), function(stat) {
                    var ref;
                    if (valid(stat)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsia3NsYXNoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0FBQ1AsRUFBQSxHQUFPLE9BQUEsQ0FBUSxVQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFFRDs7O0lBRUYsS0FBQyxDQUFBLFNBQUQsR0FBWTs7SUFRWixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsQ0FBRDtRQUNILElBQStDLGNBQUksQ0FBQyxDQUFFLGdCQUF0RDtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksd0JBQVosRUFBUDs7UUFDQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBSDtZQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7WUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckIsRUFGUjtTQUFBLE1BQUE7WUFJSSxDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7WUFDSixDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBTFI7O1FBTUEsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLElBQVgsQ0FBQSxJQUFxQixDQUFDLENBQUMsTUFBRixLQUFZLENBQXBDO1lBQ0ksQ0FBQSxHQUFJLENBQUUsYUFEVjs7UUFFQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBWCxDQUFBLElBQW9CLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBbkM7WUFDSSxDQUFBLEdBQUksQ0FBQSxHQUFJLElBRFo7O2VBRUE7SUFaRzs7SUFjUCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtRQUNOLElBQWtELGNBQUksQ0FBQyxD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Q0FBckMsQ0FBSCxFQWJKO2FBREo7U0FBQSxNQUFBO0FBZ0JJO2dCQUNJLEVBQUUsQ0FBQyxhQUFILENBQWlCLE9BQWpCLEVBQTBCLElBQTFCO2dCQUNBLEVBQUUsQ0FBQyxRQUFILENBQVksT0FBWixFQUFxQixDQUFyQixFQUF3QjtvQkFBQSxTQUFBLEVBQVUsSUFBVjtpQkFBeEI7dUJBQ0EsRUFISjthQUFBLGFBQUE7Z0JBSU07dUJBQ0YsS0FBSyxDQUFDLEtBQU4sQ0FBWSxxQkFBQSxHQUF3QixNQUFBLENBQU8sR0FBUCxDQUFwQyxFQUxKO2FBaEJKOztJQUpROztJQTJCWixLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRDtlQUVOLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBRSxDQUFDLE1BQUgsQ0FBQSxDQUFYLEVBQXdCLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxFQUFoQixDQUFBLENBQUEsR0FBdUIsQ0FBQyxHQUFBLElBQVEsQ0FBQSxHQUFBLEdBQUksR0FBSixDQUFSLElBQXFCLEVBQXRCLENBQS9DO0lBRk07O0lBVVYsS0FBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLE1BQUosQ0FBVyxNQUFYLEVBQW1CLEdBQW5COztJQUVQLEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQTtlQUFHLElBQUksQ0FBQyxHQUFMLEtBQVk7SUFBZjs7SUFFTixLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsR0FBRDtRQUNKLElBQUcsSUFBQyxDQUFBLFNBQUo7WUFBWSxPQUFBLENBQU8sS0FBUCxDQUFhLEdBQWIsRUFBWjs7ZUFDQTtJQUZJOzs7Ozs7QUFJWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuIyMjXG5cbm9zICAgPSByZXF1aXJlICdvcydcbmZzICAgPSByZXF1aXJlICdmcy1leHRyYSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5jbGFzcyBTbGFzaFxuICAgIFxuICAgIEBsb2dFcnJvcnM6IGZhbHNlXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBwYXRoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aCAtLSBubyBwYXRoP1wiIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgaWYgU2xhc2gud2luKClcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwICAgICBcbiAgICAgICAgICAgIHAgPSBwLnJlcGxhY2UgU2xhc2gucmVnLCAnLydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcCA9IHAucmVwbGFjZSBTbGFzaC5yZWcsICcvJ1xuICAgICAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHAgICAgICAgICAgICBcbiAgICAgICAgaWYgcC5lbmRzV2l0aCgnOi4nKSBhbmQgcC5sZW5ndGggPT0gM1xuICAgICAgICAgICAgcCA9IHBbLi4xXVxuICAgICAgICBpZiBwLmVuZHNXaXRoKCc6JykgYW5kIHAubGVuZ3RoID09IDJcbiAgICAgICAgICAgIHAgPSBwICsgJy8nXG4gICAgICAgIHBcbiAgICAgICAgXG4gICAgQHVuc2xhc2g6IChwKSAtPlxuICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC51bnNsYXNoIC0tIG5vIHBhdGg/XCIgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICBpZiBwLmxlbmd0aCA+PSAzIGFuZCBwWzBdID09ICcvJyA9PSBwWzJdIFxuICAgICAgICAgICAgICAgIHAgPSBwWzFdICsgJzonICsgcC5zbGljZSAyXG4gICAgICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcFxuICAgICAgICAgICAgaWYgcFsxXSA9PSAnOidcbiAgICAgICAgICAgICAgICBwID0gIHBbMF0udG9VcHBlckNhc2UoKSArIHBbMS4uXVxuICAgICAgICBwXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzcGxpdDogKHApIC0+IFNsYXNoLnBhdGgocCkuc3BsaXQoJy8nKS5maWx0ZXIgKGUpIC0+IGUubGVuZ3RoXG4gICAgXG4gICAgQHNwbGl0RHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBwYXJzZWQgPSBTbGFzaC5wYXJzZSBwXG4gICAgICAgIHJvb3QgPSBwYXJzZWQucm9vdFxuXG4gICAgICAgIGlmIHJvb3QubGVuZ3RoID4gMVxuICAgICAgICAgICAgaWYgcC5sZW5ndGggPiByb290Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gcC5zbGljZShyb290Lmxlbmd0aC0xKVxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9ICcvJ1xuICAgICAgICAgICAgcmV0dXJuIFtmaWxlUGF0aCAsIHJvb3Quc2xpY2UgMCwgcm9vdC5sZW5ndGgtMl1cbiAgICAgICAgZWxzZSBpZiBwYXJzZWQuZGlyLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGlmIHBhcnNlZC5kaXJbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtwWzIuLl0sIHBhcnNlZC5kaXJbMF1dXG4gICAgICAgIGVsc2UgaWYgcGFyc2VkLmJhc2UubGVuZ3RoID09IDJcbiAgICAgICAgICAgIGlmIHBhcnNlZC5iYXNlWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHJldHVybiBbJy8nLCBwYXJzZWQuYmFzZVswXV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgW1NsYXNoLnBhdGgocCksICcnXVxuICAgICAgICBcbiAgICBAcmVtb3ZlRHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFNsYXNoLnNwbGl0RHJpdmUocClbMF1cbiAgXG4gICAgQGlzUm9vdDogKHApIC0+IFNsYXNoLnJlbW92ZURyaXZlKHApID09ICcvJ1xuICAgICAgICBcbiAgICBAc3BsaXRGaWxlTGluZTogKHApIC0+ICAjIGZpbGUudHh0OjE6MCAtLT4gWydmaWxlLnR4dCcsIDEsIDBdXG4gICAgICAgIFxuICAgICAgICBbZixkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcFxuICAgICAgICBzcGxpdCA9IFN0cmluZyhmKS5zcGxpdCAnOidcbiAgICAgICAgbGluZSA9IHBhcnNlSW50IHNwbGl0WzFdIGlmIHNwbGl0Lmxlbmd0aCA+IDFcbiAgICAgICAgY2xtbiA9IHBhcnNlSW50IHNwbGl0WzJdIGlmIHNwbGl0Lmxlbmd0aCA+IDJcbiAgICAgICAgbCA9IGMgPSAwXG4gICAgICAgIGwgPSBsaW5lIGlmIE51bWJlci5pc0ludGVnZXIgbGluZVxuICAgICAgICBjID0gY2xtbiBpZiBOdW1iZXIuaXNJbnRlZ2VyIGNsbW5cbiAgICAgICAgZCA9IGQgKyAnOicgaWYgZCAhPSAnJ1xuICAgICAgICBbIGQgKyBzcGxpdFswXSwgTWF0aC5tYXgobCwxKSwgIE1hdGgubWF4KGMsMCkgXVxuICAgICAgICBcbiAgICBAc3BsaXRGaWxlUG9zOiAocCkgLT4gIyBmaWxlLnR4dDoxOjMgLS0+IFsnZmlsZS50eHQnLCBbMywgMF1dXG4gICAgXG4gICAgICAgIFtmLGwsY10gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgW2YsIFtjLCBsLTFdXVxuICAgICAgICBcbiAgICBAcmVtb3ZlTGluZVBvczogKHApIC0+IFNsYXNoLnNwbGl0RmlsZUxpbmUocClbMF1cbiAgICBAcmVtb3ZlQ29sdW1uOiAgKHApIC0+IFxuICAgICAgICBbZixsXSA9IFNsYXNoLnNwbGl0RmlsZUxpbmUgcFxuICAgICAgICBpZiBsPjEgdGhlbiBmICsgJzonICsgbFxuICAgICAgICBlbHNlIGZcbiAgICAgICAgXG4gICAgQGV4dDogICAgICAgKHApIC0+IHBhdGguZXh0bmFtZShwKS5zbGljZSAxXG4gICAgQHNwbGl0RXh0OiAgKHApIC0+IFtTbGFzaC5yZW1vdmVFeHQocCksIFNsYXNoLmV4dChwKV1cbiAgICBAcmVtb3ZlRXh0OiAocCkgLT4gU2xhc2guam9pbiBTbGFzaC5kaXIocCksIFNsYXNoLmJhc2UgcFxuICAgIEBzd2FwRXh0OiAgIChwLCBleHQpIC0+IFNsYXNoLnJlbW92ZUV4dChwKSArIChleHQuc3RhcnRzV2l0aCgnLicpIGFuZCBleHQgb3IgXCIuI3tleHR9XCIpXG4gICAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGpvaW46IC0+IFtdLm1hcC5jYWxsKGFyZ3VtZW50cywgU2xhc2gucGF0aCkuam9pbiAnLydcbiAgICBcbiAgICBAam9pbkZpbGVQb3M6IChmaWxlLCBwb3MpIC0+ICMgWydmaWxlLnR4dCcsIFszLCAwXV0gLS0+IGZpbGUudHh0OjE6M1xuICAgICAgICBcbiAgICAgICAgZmlsZSA9IFNsYXNoLnJlbW92ZUxpbmVQb3MgZmlsZVxuICAgICAgICBpZiBub3QgcG9zPyBvciBub3QgcG9zWzBdPyBvciBwb3NbMF0gPT0gcG9zWzFdID09IDBcbiAgICAgICAgICAgIGZpbGVcbiAgICAgICAgZWxzZSBpZiBwb3NbMF1cbiAgICAgICAgICAgIGZpbGUgKyBcIjoje3Bvc1sxXSsxfToje3Bvc1swXX1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICsgXCI6I3twb3NbMV0rMX1cIlxuICAgICAgICAgICAgICAgIFxuICAgIEBqb2luRmlsZUxpbmU6IChmaWxlLCBsaW5lLCBjb2wpIC0+ICMgJ2ZpbGUudHh0JywgMSwgMiAtLT4gZmlsZS50eHQ6MToyXG4gICAgICAgIFxuICAgICAgICBmaWxlID0gU2xhc2gucmVtb3ZlTGluZVBvcyBmaWxlXG4gICAgICAgIHJldHVybiBmaWxlIGlmIG5vdCBsaW5lXG4gICAgICAgIHJldHVybiBcIiN7ZmlsZX06I3tsaW5lfVwiIGlmIG5vdCBjb2xcbiAgICAgICAgXCIje2ZpbGV9OiN7bGluZX06I3tjb2x9XCJcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBkaXJsaXN0OiAocCwgb3B0LCBjYikgLT4gQGxpc3QgcCwgb3B0LCBjYlxuICAgIEBsaXN0OiAgICAocCwgb3B0LCBjYikgLT4gcmVxdWlyZSgnLi9kaXJsaXN0JykgcCwgb3B0LCBjYlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBAcGF0aGxpc3Q6IChwKSAtPiAjICcvcm9vdC9kaXIvZmlsZS50eHQnIC0tPiBbJy8nLCAnL3Jvb3QnLCAnL3Jvb3QvZGlyJywgJy9yb290L2Rpci9maWxlLnR4dCddXG4gICAgXG4gICAgICAgIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aGxpc3QgLS0gbm8gcGF0aD9cIiBcbiAgICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC5ub3JtYWxpemUgcFxuICAgICAgICBpZiBwLmxlbmd0aCA+IDEgYW5kIHBbcC5sZW5ndGgtMV0gPT0gJy8nIGFuZCBwW3AubGVuZ3RoLTJdICE9ICc6J1xuICAgICAgICAgICAgcCA9IHBbLi4ucC5sZW5ndGgtMV0gXG4gICAgICAgIGxpc3QgPSBbcF1cbiAgICAgICAgd2hpbGUgU2xhc2guZGlyKHApICE9ICcnXG4gICAgICAgICAgICBsaXN0LnVuc2hpZnQgU2xhc2guZGlyIHBcbiAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBsaXN0XG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgICAgICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAgICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAgICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwIDAwMCAgMDAwICAwMDAgICBcbiAgICBcbiAgICBAYmFzZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGZpbGU6ICAgICAgIChwKSAgIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZXh0bmFtZTogICAgKHApICAgLT4gcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGJhc2VuYW1lOiAgIChwLGUpIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocCksIGVcbiAgICBAaXNBYnNvbHV0ZTogKHApICAgLT4gcCA9IFNsYXNoLnNhbml0aXplKHApOyBwWzFdID09ICc6JyBvciBwYXRoLmlzQWJzb2x1dGUgcFxuICAgIEBpc1JlbGF0aXZlOiAocCkgICAtPiBub3QgU2xhc2guaXNBYnNvbHV0ZSBwXG4gICAgQGRpcm5hbWU6ICAgIChwKSAgIC0+IFNsYXNoLnBhdGggcGF0aC5kaXJuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQG5vcm1hbGl6ZTogIChwKSAgIC0+IFNsYXNoLnBhdGggU2xhc2guc2FuaXRpemUocClcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGRpcjogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLm5vcm1hbGl6ZSBwXG4gICAgICAgIGlmIFNsYXNoLmlzUm9vdCBwIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIHAgPSBwYXRoLmRpcm5hbWUgcFxuICAgICAgICBpZiBwID09ICcuJyB0aGVuIHJldHVybiAnJ1xuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIGlmIHAuZW5kc1dpdGgoJzonKSBhbmQgcC5sZW5ndGggPT0gMlxuICAgICAgICAgICAgcCArPSAnLydcbiAgICAgICAgcFxuICAgICAgICBcbiAgICBAc2FuaXRpemU6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnNhbml0aXplIC0tIG5vIHBhdGg/XCIgXG4gICAgICAgIGlmIHBbMF0gPT0gJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwibGVhZGluZyBuZXdsaW5lIGluIHBhdGghICcje3B9J1wiXG4gICAgICAgICAgICByZXR1cm4gU2xhc2guc2FuaXRpemUgcC5zdWJzdHIgMVxuICAgICAgICBpZiBwLmVuZHNXaXRoICdcXG4nXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcInRyYWlsaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAwLCBwLmxlbmd0aC0xXG4gICAgICAgIHBcbiAgICBcbiAgICBAcGFyc2U6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGRpY3QgPSBwYXRoLnBhcnNlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIGRpY3QuZGlyLmxlbmd0aCA9PSAyIGFuZCBkaWN0LmRpclsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3QuZGlyICs9ICcvJ1xuICAgICAgICBpZiBkaWN0LnJvb3QubGVuZ3RoID09IDIgYW5kIGRpY3Qucm9vdFsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3Qucm9vdCArPSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICBkaWN0XG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAaG9tZTogICAgICAgICAgLT4gU2xhc2gucGF0aCBvcy5ob21lZGlyKClcbiAgICBAdGlsZGU6ICAgICAocCkgLT4gU2xhc2gucGF0aChwKT8ucmVwbGFjZSBTbGFzaC5ob21lKCksICd+J1xuICAgIEB1bnRpbGRlOiAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIC9eXFx+LywgU2xhc2guaG9tZSgpXG4gICAgQHVuZW52OiAgICAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIDBcbiAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgICBmb3Igayx2IG9mIHByb2Nlc3MuZW52XG4gICAgICAgICAgICAgICAgaWYgayA9PSBwLnNsaWNlIGkrMSwgaSsxK2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHAgPSBwLnNsaWNlKDAsIGkpICsgdiArIHAuc2xpY2UoaStrLmxlbmd0aCsxKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIGkrMVxuICAgICAgICAgICAgXG4gICAgICAgIFNsYXNoLnBhdGggcFxuICAgIFxuICAgIEByZXNvbHZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHAgPSBwcm9jZXNzLmN3ZCgpIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC51bmVudiBTbGFzaC51bnRpbGRlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIFNsYXNoLmlzUmVsYXRpdmUgcFxuICAgICAgICAgICAgcCA9IFNsYXNoLnBhdGggcGF0aC5yZXNvbHZlIHBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBwXG4gICAgXG4gICAgQHJlbGF0aXZlOiAocmVsLCB0bykgLT5cbiAgICAgICAgXG4gICAgICAgIHRvID0gcHJvY2Vzcy5jd2QoKSBpZiBub3QgdG8/Lmxlbmd0aFxuICAgICAgICByZWwgPSBTbGFzaC5yZXNvbHZlIHJlbFxuICAgICAgICByZXR1cm4gcmVsIGlmIG5vdCBTbGFzaC5pc0Fic29sdXRlIHJlbFxuICAgICAgICBpZiBTbGFzaC5yZXNvbHZlKHRvKSA9PSByZWxcbiAgICAgICAgICAgIHJldHVybiAnLidcblxuICAgICAgICBbcmwsIHJkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcmVsXG4gICAgICAgIFt0bywgdGRdID0gU2xhc2guc3BsaXREcml2ZSBTbGFzaC5yZXNvbHZlIHRvXG4gICAgICAgIGlmIHJkIGFuZCB0ZCBhbmQgcmQgIT0gdGRcbiAgICAgICAgICAgIHJldHVybiByZWxcbiAgICAgICAgU2xhc2gucGF0aCBwYXRoLnJlbGF0aXZlIHRvLCBybFxuICAgICAgICBcbiAgICBAZmlsZVVybDogKHApIC0+IFwiZmlsZTovLy8je1NsYXNoLmVuY29kZSBwfVwiXG5cbiAgICBAc2FtZVBhdGg6IChhLCBiKSAtPiBTbGFzaC5yZXNvbHZlKGEpID09IFNsYXNoLnJlc29sdmUoYilcblxuICAgIEBlc2NhcGU6IChwKSAtPiBwLnJlcGxhY2UgLyhbXFxgXFxcIl0pL2csICdcXFxcJDEnXG5cbiAgICBAZW5jb2RlOiAocCkgLT5cbiAgICAgICAgcCA9IGVuY29kZVVSSSBwXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcIy9nLCBcIiUyM1wiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJi9nLCBcIiUyNlwiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJy9nLCBcIiUyN1wiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAgIDAwMCAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAwMDAgICAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHBrZzogKHApIC0+XG4gICAgXG4gICAgICAgIGlmIHA/Lmxlbmd0aD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nLCAnLycsICcnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyAgU2xhc2guam9pbiBwLCAnLmdpdCcgICAgICAgICB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2Uubm9vbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLmpzb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBudWxsXG5cbiAgICBAZ2l0OiAocCwgY2IpIC0+XG5cbiAgICAgICAgaWYgcD8ubGVuZ3RoP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgICAgIFNsYXNoLmRpckV4aXN0cyBTbGFzaC5qb2luKHAsICcuZ2l0JyksIChzdGF0KSAtPiBcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsaWQgc3RhdCB0aGVuIGNiIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nICcvJyAnJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIFNsYXNoLmdpdCBTbGFzaC5kaXIocCksIGNiXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nICcvJyAnJ11cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyBTbGFzaC5qb2luIHAsICcuZ2l0JyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBleGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpZiBub3QgcD9cbiAgICAgICAgICAgICAgICAgICAgY2IoKSBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzIHAsIGZzLlJfT0sgfCBmcy5GX09LLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5zdGF0IHAsIChlcnIsIHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBzdGF0XG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guZXhpc3RzIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHA/XG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5yZXNvbHZlIFNsYXNoLnJlbW92ZUxpbmVQb3MgcFxuICAgICAgICAgICAgICAgICAgICBpZiBzdGF0ID0gZnMuc3RhdFN5bmMocClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgcCwgZnMuUl9PS1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRcbiAgICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAgICAgaWYgZXJyLmNvZGUgaW4gWydFTk9FTlQnLCAnRU5PVERJUiddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmV4aXN0cyAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICBudWxsICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICBAZmlsZUV4aXN0czogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIFNsYXNoLmV4aXN0cyBwLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBzdGF0Py5pc0ZpbGUoKSB0aGVuIGNiIHN0YXRcbiAgICAgICAgICAgICAgICBlbHNlIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdCA9IFNsYXNoLmV4aXN0cyBwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXQgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgIFxuICAgIEBkaXJFeGlzdHM6IChwLCBjYikgLT5cblxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRGlyZWN0b3J5KCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEB0b3VjaDogKHApIC0+XG5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBkaXIgPSBTbGFzaC5kaXIgcFxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLmlzRGlyIGRpclxuICAgICAgICAgICAgICAgIGZzLm1rZGlyU3luYyBkaXIsIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgICAgICBpZiBub3QgU2xhc2guZmlsZUV4aXN0cyBwXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBwLCAnJ1xuICAgICAgICAgICAgcmV0dXJuIHBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLnRvdWNoIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEB1bnVzZWQ6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIG5hbWUgPSBTbGFzaC5iYXNlIHBcbiAgICAgICAgZGlyICA9IFNsYXNoLmRpciBwXG4gICAgICAgIGV4dCAgPSBTbGFzaC5leHQgcFxuICAgICAgICBleHQgID0gZXh0IGFuZCAnLicrZXh0IG9yICcnXG4gICAgICAgIFxuICAgICAgICBpZiAvXFxkXFxkJC8udGVzdCBuYW1lXG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zbGljZSAwLCBuYW1lLmxlbmd0aC0yXG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgbm90IHN0YXQgXG4gICAgICAgICAgICAgICAgICAgIGNiIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBpID0gMVxuICAgICAgICAgICAgICAgIHRlc3QgPSAnJ1xuICAgICAgICAgICAgICAgIGNoZWNrID0gLT5cbiAgICAgICAgICAgICAgICAgICAgdGVzdCA9IFwiI3tuYW1lfSN7XCIje2l9XCIucGFkU3RhcnQoMiAnMCcpfSN7ZXh0fVwiXG4gICAgICAgICAgICAgICAgICAgIGlmIGRpciB0aGVuIHRlc3QgPSBTbGFzaC5qb2luIGRpciwgdGVzdFxuICAgICAgICAgICAgICAgICAgICBTbGFzaC5leGlzdHMgdGVzdCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBzdGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2soKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIFNsYXNoLnJlc29sdmUgdGVzdFxuICAgICAgICAgICAgICAgIGNoZWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLmV4aXN0cyhwKSB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgIGZvciBpIGluIFsxLi4xMDAwXVxuICAgICAgICAgICAgICAgIHRlc3QgPSBcIiN7bmFtZX0je1wiI3tpfVwiLnBhZFN0YXJ0KDIgJzAnKX0je2V4dH1cIlxuICAgICAgICAgICAgICAgIGlmIGRpciB0aGVuIHRlc3QgPSBTbGFzaC5qb2luIGRpciwgdGVzdFxuICAgICAgICAgICAgICAgIGlmIG5vdCBTbGFzaC5leGlzdHMgdGVzdFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU2xhc2gucmVzb2x2ZSB0ZXN0XG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgIDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAgIFxuICAgIFxuICAgIEBpc0RpcjogIChwLCBjYikgLT4gU2xhc2guZGlyRXhpc3RzIHAsIGNiXG4gICAgQGlzRmlsZTogKHAsIGNiKSAtPiBTbGFzaC5maWxlRXhpc3RzIHAsIGNiXG4gICAgXG4gICAgQGlzV3JpdGFibGU6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3MgU2xhc2gucmVzb2x2ZShwKSwgZnMuUl9PSyB8IGZzLldfT0ssIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNiIG5vdCBlcnI/XG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmlzV3JpdGFibGUgLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgICAgICAgICBjYiBmYWxzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIFNsYXNoLnJlc29sdmUocCksIGZzLlJfT0sgfCBmcy5XX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuICAgIFxuICAgIEB0ZXh0ZXh0OiBudWxsXG4gICAgXG4gICAgQHRleHRiYXNlOiBcbiAgICAgICAgcHJvZmlsZToxXG4gICAgICAgIGxpY2Vuc2U6MVxuICAgICAgICAnLmdpdGlnbm9yZSc6MVxuICAgICAgICAnLm5wbWlnbm9yZSc6MVxuICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBpc1RleHQ6IChwKSAtPlxuICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGlmIG5vdCBTbGFzaC50ZXh0ZXh0XG4gICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dCA9IHt9XG4gICAgICAgICAgICAgICAgZm9yIGV4dCBpbiByZXF1aXJlICd0ZXh0ZXh0ZW5zaW9ucydcbiAgICAgICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dFtleHRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIFNsYXNoLnRleHRleHRbJ2NyeXB0J10gPSB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4dCA9IFNsYXNoLmV4dCBwXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBleHQgYW5kIFNsYXNoLnRleHRleHRbZXh0XT8gXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBTbGFzaC50ZXh0YmFzZVtTbGFzaC5iYXNlbmFtZShwKS50b0xvd2VyQ2FzZSgpXVxuICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBTbGFzaC5pc0ZpbGUgcFxuICAgICAgICAgICAgaXNCaW5hcnkgPSByZXF1aXJlICdpc2JpbmFyeWZpbGUnXG4gICAgICAgICAgICByZXR1cm4gbm90IGlzQmluYXJ5LmlzQmluYXJ5RmlsZVN5bmMgcFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guaXNUZXh0IC0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIFxuICAgIEByZWFkVGV4dDogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlIHAsICd1dGY4JywgKGVyciwgdGV4dCkgLT4gXG4gICAgICAgICAgICAgICAgICAgIGNiIG5vdCBlcnIgYW5kIHRleHQgb3IgJydcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gucmVhZFRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMgcCwgJ3V0ZjgnXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLnJlYWRUZXh0IC0tIFwiICsgU3RyaW5nKGVycilcblxuICAgIEB3cml0ZVRleHQ6IChwLCB0ZXh0LCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIHRtcGZpbGUgPSBTbGFzaC50bXBmaWxlKClcbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBAZmlsZUV4aXN0cyBwLCAoc3RhdCkgLT4gIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IHN0YXQ/Lm1vZGUgPyAwbzY2NlxuICAgIFxuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUgdG1wZmlsZSwgdGV4dCwgbW9kZTptb2RlLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLm1vdmUgdG1wZmlsZSwgcCwgb3ZlcndyaXRlOnRydWUsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGVyciB0aGVuIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0tIG1vdmUgI3t0bXBmaWxlfSAtPiAje3B9XCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGNiIHBcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0tLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgdG1wZmlsZSwgdGV4dFxuICAgICAgICAgICAgICAgIGZzLm1vdmVTeW5jIHRtcGZpbGUsIHAsIG92ZXJ3cml0ZTp0cnVlXG4gICAgICAgICAgICAgICAgcFxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICBcbiAgICBAdG1wZmlsZTogKGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBTbGFzaC5qb2luIG9zLnRtcGRpcigpLCByZXF1aXJlKCd1dWlkJykudjEoKSArIChleHQgYW5kIFwiLiN7ZXh0fVwiIG9yICcnKVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEByZWcgPSBuZXcgUmVnRXhwIFwiXFxcXFxcXFxcIiwgJ2cnXG5cbiAgICBAd2luOiAtPiBwYXRoLnNlcCA9PSAnXFxcXCdcbiAgICBcbiAgICBAZXJyb3I6IChtc2cpIC0+IFxuICAgICAgICBpZiBAbG9nRXJyb3JzIHRoZW4gZXJyb3IgbXNnIFxuICAgICAgICAnJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNsYXNoXG4iXX0=
//# sourceURL=../coffee/kslash.coffee