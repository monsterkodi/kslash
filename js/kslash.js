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
                        var childp;
                        if (err) {
                            return cb(Slash.error("Slash.writeText - " + String(err)));
                        } else {
                            if (slash.win()) {
                                fs.cp(tmpfile, p, function(err) {
                                    if (err) {
                                        return cb(Slash.error(("Slash.writeText -- cp " + tmpfile + " -> " + p) + String(err)));
                                    } else {
                                        return cb(p);
                                    }
                                });
                            } else {
                                childp = require('child_process');
                                childp.exec("cp " + tmpfile + " " + p, function(err) {
                                    if (err) {
                                        return cb(Slash.error(("Slash.writeText -- cp " + tmpfile + " -> " + p) + String(err)));
                                    } else {
                                        return cb(p);
                                    }
                                });
                            }
                            return fs.unlink(tmpfile, function(err) {});
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
                fs.cpSync(tmpfile, p);
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

    Slash.fs = fs;

    Slash.watch = fs.watch;

    Slash.error = function(msg) {
        if (this.logErrors) {
            console.error(msg);
        }
        return '';
    };

    return Slash;

})();

module.exports = Slash;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsia3NsYXNoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0FBQ1AsRUFBQSxHQUFPLE9BQUEsQ0FBUSxVQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFFRDs7O0lBRUYsS0FBQyxDQUFBLFNBQUQsR0FBWTs7SUFRWixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsQ0FBRDtRQUNILElBQStDLGNBQUksQ0FBQyxDQUFFLGdCQUF0RDtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksd0JBQVosRUFBUDs7UUFDQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBSDtZQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7WUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckIsRUFGUjtTQUFBLE1BQUE7WUFJSSxDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7WUFDSixDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBTFI7O1FBTUEsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLElBQVgsQ0FBQSxJQUFxQixDQUFDLENBQUMsTUFBRixLQUFZLENBQXBDO1lBQ0ksQ0FBQSxHQUFJLENBQUUsYUFEVjs7UUFFQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBWCxDQUFBLElBQW9CLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBbkM7WUFDSSxDQUFBLEdBQUksQ0FBQSxHQUFJLElBRFo7O2VBRUE7SUFaRzs7SUFjUCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtRQUNOLElBQWtELGNBQUksQ0FBQyxD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QUF0QixDQUEvQztJQUZNOztJQVVWLEtBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxDQUFELEVBQUksRUFBSjtRQUNMLElBQUcsRUFBSDttQkFBVyxFQUFFLENBQUMsTUFBSCxDQUFVLENBQVYsRUFBYSxFQUFiLEVBQVg7U0FBQSxNQUFBO21CQUNLLEVBQUUsQ0FBQyxVQUFILENBQWMsQ0FBZCxFQURMOztJQURLOztJQVVULEtBQUMsQ0FBQSxHQUFELEdBQU8sSUFBSSxNQUFKLENBQVcsTUFBWCxFQUFtQixHQUFuQjs7SUFFUCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUE7ZUFBRyxJQUFJLENBQUMsR0FBTCxLQUFZO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEVBQUQsR0FBSzs7SUFDTCxLQUFDLENBQUEsS0FBRCxHQUFRLEVBQUUsQ0FBQzs7SUFFWCxLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsR0FBRDtRQUNKLElBQUcsSUFBQyxDQUFBLFNBQUo7WUFBWSxPQUFBLENBQU8sS0FBUCxDQUFhLEdBQWIsRUFBWjs7ZUFDQTtJQUZJOzs7Ozs7QUFJWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuIyMjXG5cbm9zICAgPSByZXF1aXJlICdvcydcbmZzICAgPSByZXF1aXJlICdmcy1leHRyYSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5jbGFzcyBTbGFzaFxuICAgIFxuICAgIEBsb2dFcnJvcnM6IGZhbHNlXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBwYXRoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aCAtLSBubyBwYXRoP1wiIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgaWYgU2xhc2gud2luKClcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwICAgICBcbiAgICAgICAgICAgIHAgPSBwLnJlcGxhY2UgU2xhc2gucmVnLCAnLydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcCA9IHAucmVwbGFjZSBTbGFzaC5yZWcsICcvJ1xuICAgICAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHAgICAgICAgICAgICBcbiAgICAgICAgaWYgcC5lbmRzV2l0aCgnOi4nKSBhbmQgcC5sZW5ndGggPT0gM1xuICAgICAgICAgICAgcCA9IHBbLi4xXVxuICAgICAgICBpZiBwLmVuZHNXaXRoKCc6JykgYW5kIHAubGVuZ3RoID09IDJcbiAgICAgICAgICAgIHAgPSBwICsgJy8nXG4gICAgICAgIHBcbiAgICAgICAgXG4gICAgQHVuc2xhc2g6IChwKSAtPlxuICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC51bnNsYXNoIC0tIG5vIHBhdGg/XCIgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICBpZiBwLmxlbmd0aCA+PSAzIGFuZCBwWzBdID09ICcvJyA9PSBwWzJdIFxuICAgICAgICAgICAgICAgIHAgPSBwWzFdICsgJzonICsgcC5zbGljZSAyXG4gICAgICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcFxuICAgICAgICAgICAgaWYgcFsxXSA9PSAnOidcbiAgICAgICAgICAgICAgICBwID0gIHBbMF0udG9VcHBlckNhc2UoKSArIHBbMS4uXVxuICAgICAgICBwXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAcmVzb2x2ZTogKHApIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHAgPSBwcm9jZXNzLmN3ZCgpIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICAgICAgICBwID0gU2xhc2guam9pbi5hcHBseSAwLCBhcmd1bWVudHNcbiAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC51bmVudiBTbGFzaC51bnRpbGRlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIFNsYXNoLmlzUmVsYXRpdmUgcFxuICAgICAgICAgICAgcCA9IFNsYXNoLnBhdGggcGF0aC5yZXNvbHZlIHBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBwXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzcGxpdDogKHApIC0+IFNsYXNoLnBhdGgocCkuc3BsaXQoJy8nKS5maWx0ZXIgKGUpIC0+IGUubGVuZ3RoXG4gICAgXG4gICAgQHNwbGl0RHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBwYXJzZWQgPSBTbGFzaC5wYXJzZSBwXG4gICAgICAgIHJvb3QgPSBwYXJzZWQucm9vdFxuXG4gICAgICAgIGlmIHJvb3QubGVuZ3RoID4gMVxuICAgICAgICAgICAgaWYgcC5sZW5ndGggPiByb290Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gcC5zbGljZShyb290Lmxlbmd0aC0xKVxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9ICcvJ1xuICAgICAgICAgICAgcmV0dXJuIFtmaWxlUGF0aCAsIHJvb3Quc2xpY2UgMCwgcm9vdC5sZW5ndGgtMl1cbiAgICAgICAgZWxzZSBpZiBwYXJzZWQuZGlyLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGlmIHBhcnNlZC5kaXJbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtwWzIuLl0sIHBhcnNlZC5kaXJbMF1dXG4gICAgICAgIGVsc2UgaWYgcGFyc2VkLmJhc2UubGVuZ3RoID09IDJcbiAgICAgICAgICAgIGlmIHBhcnNlZC5iYXNlWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHJldHVybiBbJy8nLCBwYXJzZWQuYmFzZVswXV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgW1NsYXNoLnBhdGgocCksICcnXVxuICAgICAgICBcbiAgICBAcmVtb3ZlRHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFNsYXNoLnNwbGl0RHJpdmUocClbMF1cbiAgXG4gICAgQGlzUm9vdDogKHApIC0+IFNsYXNoLnJlbW92ZURyaXZlKHApID09ICcvJ1xuICAgICAgICBcbiAgICBAc3BsaXRGaWxlTGluZTogKHApIC0+ICAjIGZpbGUudHh0OjE6MCAtLT4gWydmaWxlLnR4dCcsIDEsIDBdXG4gICAgICAgIFxuICAgICAgICBbZixkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcFxuICAgICAgICBzcGxpdCA9IFN0cmluZyhmKS5zcGxpdCAnOidcbiAgICAgICAgbGluZSA9IHBhcnNlSW50IHNwbGl0WzFdIGlmIHNwbGl0Lmxlbmd0aCA+IDFcbiAgICAgICAgY2xtbiA9IHBhcnNlSW50IHNwbGl0WzJdIGlmIHNwbGl0Lmxlbmd0aCA+IDJcbiAgICAgICAgbCA9IGMgPSAwXG4gICAgICAgIGwgPSBsaW5lIGlmIE51bWJlci5pc0ludGVnZXIgbGluZVxuICAgICAgICBjID0gY2xtbiBpZiBOdW1iZXIuaXNJbnRlZ2VyIGNsbW5cbiAgICAgICAgZCA9IGQgKyAnOicgaWYgZCAhPSAnJ1xuICAgICAgICBbIGQgKyBzcGxpdFswXSwgTWF0aC5tYXgobCwxKSwgIE1hdGgubWF4KGMsMCkgXVxuICAgICAgICBcbiAgICBAc3BsaXRGaWxlUG9zOiAocCkgLT4gIyBmaWxlLnR4dDoxOjMgLS0+IFsnZmlsZS50eHQnLCBbMywgMF1dXG4gICAgXG4gICAgICAgIFtmLGwsY10gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgW2YsIFtjLCBsLTFdXVxuICAgICAgICBcbiAgICBAcmVtb3ZlTGluZVBvczogKHApIC0+IFNsYXNoLnNwbGl0RmlsZUxpbmUocClbMF1cbiAgICBAcmVtb3ZlQ29sdW1uOiAgKHApIC0+IFxuICAgICAgICBbZixsXSA9IFNsYXNoLnNwbGl0RmlsZUxpbmUgcFxuICAgICAgICBpZiBsPjEgdGhlbiBmICsgJzonICsgbFxuICAgICAgICBlbHNlIGZcbiAgICAgICAgXG4gICAgQGV4dDogICAgICAgKHApIC0+IHBhdGguZXh0bmFtZShwKS5zbGljZSAxXG4gICAgQHNwbGl0RXh0OiAgKHApIC0+IFtTbGFzaC5yZW1vdmVFeHQocCksIFNsYXNoLmV4dChwKV1cbiAgICBAcmVtb3ZlRXh0OiAocCkgLT4gU2xhc2guam9pbiBTbGFzaC5kaXIocCksIFNsYXNoLmJhc2UgcFxuICAgIEBzd2FwRXh0OiAgIChwLCBleHQpIC0+IFNsYXNoLnJlbW92ZUV4dChwKSArIChleHQuc3RhcnRzV2l0aCgnLicpIGFuZCBleHQgb3IgXCIuI3tleHR9XCIpXG4gICAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGpvaW46IC0+IFtdLm1hcC5jYWxsKGFyZ3VtZW50cywgU2xhc2gucGF0aCkuam9pbiAnLydcbiAgICBcbiAgICBAam9pbkZpbGVQb3M6IChmaWxlLCBwb3MpIC0+ICMgWydmaWxlLnR4dCcsIFszLCAwXV0gLS0+IGZpbGUudHh0OjE6M1xuICAgICAgICBcbiAgICAgICAgZmlsZSA9IFNsYXNoLnJlbW92ZUxpbmVQb3MgZmlsZVxuICAgICAgICBpZiBub3QgcG9zPyBvciBub3QgcG9zWzBdPyBvciBwb3NbMF0gPT0gcG9zWzFdID09IDBcbiAgICAgICAgICAgIGZpbGVcbiAgICAgICAgZWxzZSBpZiBwb3NbMF1cbiAgICAgICAgICAgIGZpbGUgKyBcIjoje3Bvc1sxXSsxfToje3Bvc1swXX1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICsgXCI6I3twb3NbMV0rMX1cIlxuICAgICAgICAgICAgICAgIFxuICAgIEBqb2luRmlsZUxpbmU6IChmaWxlLCBsaW5lLCBjb2wpIC0+ICMgJ2ZpbGUudHh0JywgMSwgMiAtLT4gZmlsZS50eHQ6MToyXG4gICAgICAgIFxuICAgICAgICBmaWxlID0gU2xhc2gucmVtb3ZlTGluZVBvcyBmaWxlXG4gICAgICAgIHJldHVybiBmaWxlIGlmIG5vdCBsaW5lXG4gICAgICAgIHJldHVybiBcIiN7ZmlsZX06I3tsaW5lfVwiIGlmIG5vdCBjb2xcbiAgICAgICAgXCIje2ZpbGV9OiN7bGluZX06I3tjb2x9XCJcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBkaXJsaXN0OiAocCwgb3B0LCBjYikgLT4gQGxpc3QgcCwgb3B0LCBjYlxuICAgIEBsaXN0OiAgICAocCwgb3B0LCBjYikgLT4gcmVxdWlyZSgnLi9kaXJsaXN0JykgcCwgb3B0LCBjYlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBAcGF0aGxpc3Q6IChwKSAtPiAjICcvcm9vdC9kaXIvZmlsZS50eHQnIC0tPiBbJy8nLCAnL3Jvb3QnLCAnL3Jvb3QvZGlyJywgJy9yb290L2Rpci9maWxlLnR4dCddXG4gICAgXG4gICAgICAgIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aGxpc3QgLS0gbm8gcGF0aD9cIiBcbiAgICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC5ub3JtYWxpemUgcFxuICAgICAgICBpZiBwLmxlbmd0aCA+IDEgYW5kIHBbcC5sZW5ndGgtMV0gPT0gJy8nIGFuZCBwW3AubGVuZ3RoLTJdICE9ICc6J1xuICAgICAgICAgICAgcCA9IHBbLi4ucC5sZW5ndGgtMV0gXG4gICAgICAgIGxpc3QgPSBbcF1cbiAgICAgICAgd2hpbGUgU2xhc2guZGlyKHApICE9ICcnXG4gICAgICAgICAgICBsaXN0LnVuc2hpZnQgU2xhc2guZGlyIHBcbiAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBsaXN0XG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgICAgICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAgICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAgICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwIDAwMCAgMDAwICAwMDAgICBcbiAgICBcbiAgICBAYmFzZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGZpbGU6ICAgICAgIChwKSAgIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZXh0bmFtZTogICAgKHApICAgLT4gcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGJhc2VuYW1lOiAgIChwLGUpIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocCksIGVcbiAgICBAaXNBYnNvbHV0ZTogKHApICAgLT4gcCA9IFNsYXNoLnNhbml0aXplKHApOyBwWzFdID09ICc6JyBvciBwYXRoLmlzQWJzb2x1dGUgcFxuICAgIEBpc1JlbGF0aXZlOiAocCkgICAtPiBub3QgU2xhc2guaXNBYnNvbHV0ZSBwXG4gICAgQGRpcm5hbWU6ICAgIChwKSAgIC0+IFNsYXNoLnBhdGggcGF0aC5kaXJuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQG5vcm1hbGl6ZTogIChwKSAgIC0+IFNsYXNoLnBhdGggU2xhc2guc2FuaXRpemUocClcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGRpcjogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLm5vcm1hbGl6ZSBwXG4gICAgICAgIGlmIFNsYXNoLmlzUm9vdCBwIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIHAgPSBwYXRoLmRpcm5hbWUgcFxuICAgICAgICBpZiBwID09ICcuJyB0aGVuIHJldHVybiAnJ1xuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIGlmIHAuZW5kc1dpdGgoJzonKSBhbmQgcC5sZW5ndGggPT0gMlxuICAgICAgICAgICAgcCArPSAnLydcbiAgICAgICAgcFxuICAgICAgICBcbiAgICBAc2FuaXRpemU6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnNhbml0aXplIC0tIG5vIHBhdGg/XCIgXG4gICAgICAgIGlmIHBbMF0gPT0gJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwibGVhZGluZyBuZXdsaW5lIGluIHBhdGghICcje3B9J1wiXG4gICAgICAgICAgICByZXR1cm4gU2xhc2guc2FuaXRpemUgcC5zdWJzdHIgMVxuICAgICAgICBpZiBwLmVuZHNXaXRoICdcXG4nXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcInRyYWlsaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAwLCBwLmxlbmd0aC0xXG4gICAgICAgIHBcbiAgICBcbiAgICBAcGFyc2U6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGRpY3QgPSBwYXRoLnBhcnNlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIGRpY3QuZGlyLmxlbmd0aCA9PSAyIGFuZCBkaWN0LmRpclsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3QuZGlyICs9ICcvJ1xuICAgICAgICBpZiBkaWN0LnJvb3QubGVuZ3RoID09IDIgYW5kIGRpY3Qucm9vdFsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3Qucm9vdCArPSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICBkaWN0XG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAaG9tZTogICAgICAgICAgLT4gU2xhc2gucGF0aCBvcy5ob21lZGlyKClcbiAgICBAdGlsZGU6ICAgICAocCkgLT4gU2xhc2gucGF0aChwKT8ucmVwbGFjZSBTbGFzaC5ob21lKCksICd+J1xuICAgIEB1bnRpbGRlOiAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIC9eXFx+LywgU2xhc2guaG9tZSgpXG4gICAgQHVuZW52OiAgICAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIDBcbiAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgICBmb3Igayx2IG9mIHByb2Nlc3MuZW52XG4gICAgICAgICAgICAgICAgaWYgayA9PSBwLnNsaWNlIGkrMSwgaSsxK2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHAgPSBwLnNsaWNlKDAsIGkpICsgdiArIHAuc2xpY2UoaStrLmxlbmd0aCsxKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIGkrMVxuICAgICAgICAgICAgXG4gICAgICAgIFNsYXNoLnBhdGggcFxuICAgICAgICBcbiAgICBAcmVsYXRpdmU6IChyZWwsIHRvKSAtPlxuICAgICAgICBcbiAgICAgICAgdG8gPSBwcm9jZXNzLmN3ZCgpIGlmIG5vdCB0bz8ubGVuZ3RoXG4gICAgICAgIHJlbCA9IFNsYXNoLnJlc29sdmUgcmVsXG4gICAgICAgIHJldHVybiByZWwgaWYgbm90IFNsYXNoLmlzQWJzb2x1dGUgcmVsXG4gICAgICAgIGlmIFNsYXNoLnJlc29sdmUodG8pID09IHJlbFxuICAgICAgICAgICAgcmV0dXJuICcuJ1xuXG4gICAgICAgIFtybCwgcmRdID0gU2xhc2guc3BsaXREcml2ZSByZWxcbiAgICAgICAgW3RvLCB0ZF0gPSBTbGFzaC5zcGxpdERyaXZlIFNsYXNoLnJlc29sdmUgdG9cbiAgICAgICAgaWYgcmQgYW5kIHRkIGFuZCByZCAhPSB0ZFxuICAgICAgICAgICAgcmV0dXJuIHJlbFxuICAgICAgICBTbGFzaC5wYXRoIHBhdGgucmVsYXRpdmUgdG8sIHJsXG4gICAgICAgIFxuICAgIEBmaWxlVXJsOiAocCkgLT4gXCJmaWxlOi8vLyN7U2xhc2guZW5jb2RlIHB9XCJcblxuICAgIEBzYW1lUGF0aDogKGEsIGIpIC0+IFNsYXNoLnJlc29sdmUoYSkgPT0gU2xhc2gucmVzb2x2ZShiKVxuXG4gICAgQGVzY2FwZTogKHApIC0+IHAucmVwbGFjZSAvKFtcXGBcXFwiXSkvZywgJ1xcXFwkMSdcblxuICAgIEBlbmNvZGU6IChwKSAtPlxuICAgICAgICBwID0gZW5jb2RlVVJJIHBcbiAgICAgICAgcCA9IHAucmVwbGFjZSAvXFwjL2csIFwiJTIzXCJcbiAgICAgICAgcCA9IHAucmVwbGFjZSAvXFwmL2csIFwiJTI2XCJcbiAgICAgICAgcCA9IHAucmVwbGFjZSAvXFwnL2csIFwiJTI3XCJcblxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMDAgICAgMDAwICAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAcGtnOiAocCkgLT5cbiAgICBcbiAgICAgICAgaWYgcD8ubGVuZ3RoP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSBwLmxlbmd0aCBhbmQgU2xhc2gucmVtb3ZlRHJpdmUocCkgbm90IGluIFsnLicsICcvJywgJyddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZGlyRXhpc3RzICBTbGFzaC5qb2luIHAsICcuZ2l0JyAgICAgICAgIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmZpbGVFeGlzdHMgU2xhc2guam9pbiBwLCAncGFja2FnZS5ub29uJyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2UuanNvbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIG51bGxcblxuICAgIEBnaXQ6IChwLCBjYikgLT5cblxuICAgICAgICBpZiBwPy5sZW5ndGg/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICAgICAgU2xhc2guZGlyRXhpc3RzIFNsYXNoLmpvaW4ocCwgJy5naXQnKSwgKHN0YXQpIC0+IFxuICAgICAgICAgICAgICAgICAgICBpZiBzdGF0IHRoZW4gY2IgU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgU2xhc2gucmVtb3ZlRHJpdmUocCkgbm90IGluIFsnLicgJy8nICcnXVxuICAgICAgICAgICAgICAgICAgICAgICAgU2xhc2guZ2l0IFNsYXNoLmRpcihwKSwgY2JcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB3aGlsZSBwLmxlbmd0aCBhbmQgU2xhc2gucmVtb3ZlRHJpdmUocCkgbm90IGluIFsnLicgJy8nICcnXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgU2xhc2guZGlyRXhpc3RzIFNsYXNoLmpvaW4gcCwgJy5naXQnIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbnVsbFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgQGV4aXN0czogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGlmIG5vdCBwP1xuICAgICAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBTbGFzaC5yZW1vdmVMaW5lUG9zIHBcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3MgcCwgZnMuUl9PSyB8IGZzLkZfT0ssIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKCkgXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnN0YXQgcCwgKGVyciwgc3RhdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIHN0YXRcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5leGlzdHMgLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgcD9cbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICAgICAgICAgIGlmIHN0YXQgPSBmcy5zdGF0U3luYyhwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBwLCBmcy5SX09LXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdFxuICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICBpZiBlcnIuY29kZSBpbiBbJ0VOT0VOVCcsICdFTk9URElSJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guZXhpc3RzIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgIG51bGwgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgIEBmaWxlRXhpc3RzOiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRmlsZSgpIHRoZW4gY2Igc3RhdFxuICAgICAgICAgICAgICAgIGVsc2UgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBzdGF0ID0gU2xhc2guZXhpc3RzIHBcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdCBpZiBzdGF0LmlzRmlsZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgQGRpckV4aXN0czogKHAsIGNiKSAtPlxuXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdD8uaXNEaXJlY3RvcnkoKSB0aGVuIGNiIHN0YXRcbiAgICAgICAgICAgICAgICBlbHNlIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdCA9IFNsYXNoLmV4aXN0cyBwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXQgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQHRvdWNoOiAocCkgLT5cblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGRpciA9IFNsYXNoLmRpciBwXG4gICAgICAgICAgICBpZiBub3QgU2xhc2guaXNEaXIgZGlyXG4gICAgICAgICAgICAgICAgZnMubWtkaXJTeW5jIGRpciwgcmVjdXJzaXZlOnRydWVcbiAgICAgICAgICAgIGlmIG5vdCBTbGFzaC5maWxlRXhpc3RzIHBcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIHAsICcnXG4gICAgICAgICAgICByZXR1cm4gcFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gudG91Y2ggLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgQHVudXNlZDogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgbmFtZSA9IFNsYXNoLmJhc2UgcFxuICAgICAgICBkaXIgID0gU2xhc2guZGlyIHBcbiAgICAgICAgZXh0ICA9IFNsYXNoLmV4dCBwXG4gICAgICAgIGV4dCAgPSBleHQgYW5kICcuJytleHQgb3IgJydcbiAgICAgICAgXG4gICAgICAgIGlmIC9cXGRcXGQkLy50ZXN0IG5hbWVcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnNsaWNlIDAsIG5hbWUubGVuZ3RoLTJcbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFNsYXNoLmV4aXN0cyBwLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBub3Qgc3RhdCBcbiAgICAgICAgICAgICAgICAgICAgY2IgU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIGkgPSAxXG4gICAgICAgICAgICAgICAgdGVzdCA9ICcnXG4gICAgICAgICAgICAgICAgY2hlY2sgPSAtPlxuICAgICAgICAgICAgICAgICAgICB0ZXN0ID0gXCIje25hbWV9I3tcIiN7aX1cIi5wYWRTdGFydCgyICcwJyl9I3tleHR9XCJcbiAgICAgICAgICAgICAgICAgICAgaWYgZGlyIHRoZW4gdGVzdCA9IFNsYXNoLmpvaW4gZGlyLCB0ZXN0XG4gICAgICAgICAgICAgICAgICAgIFNsYXNoLmV4aXN0cyB0ZXN0LCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVjaygpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IgU2xhc2gucmVzb2x2ZSB0ZXN0XG4gICAgICAgICAgICAgICAgY2hlY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBub3QgU2xhc2guZXhpc3RzKHApIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgZm9yIGkgaW4gWzEuLjEwMDBdXG4gICAgICAgICAgICAgICAgdGVzdCA9IFwiI3tuYW1lfSN7XCIje2l9XCIucGFkU3RhcnQoMiAnMCcpfSN7ZXh0fVwiXG4gICAgICAgICAgICAgICAgaWYgZGlyIHRoZW4gdGVzdCA9IFNsYXNoLmpvaW4gZGlyLCB0ZXN0XG4gICAgICAgICAgICAgICAgaWYgbm90IFNsYXNoLmV4aXN0cyB0ZXN0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTbGFzaC5yZXNvbHZlIHRlc3RcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgIDAwMCAgXG4gICAgXG4gICAgQGlzRGlyOiAgKHAsIGNiKSAtPiBTbGFzaC5kaXJFeGlzdHMgcCwgY2JcbiAgICBAaXNGaWxlOiAocCwgY2IpIC0+IFNsYXNoLmZpbGVFeGlzdHMgcCwgY2JcbiAgICBcbiAgICBAaXNXcml0YWJsZTogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2VzcyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PSywgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgY2Igbm90IGVycj9cbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guaXNXcml0YWJsZSAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICAgICAgICAgIGNiIGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgU2xhc2gucmVzb2x2ZShwKSwgZnMuUl9PSyB8IGZzLldfT0tcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4gICAgXG4gICAgQHRleHRleHQ6IG51bGxcbiAgICBcbiAgICBAdGV4dGJhc2U6IFxuICAgICAgICBwcm9maWxlOjFcbiAgICAgICAgbGljZW5zZToxXG4gICAgICAgICcuZ2l0aWdub3JlJzoxXG4gICAgICAgICcubnBtaWdub3JlJzoxXG4gICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGlzVGV4dDogKHApIC0+XG4gICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLnRleHRleHRcbiAgICAgICAgICAgICAgICBTbGFzaC50ZXh0ZXh0ID0ge31cbiAgICAgICAgICAgICAgICBmb3IgZXh0IGluIHJlcXVpcmUgJ3RleHRleHRlbnNpb25zJ1xuICAgICAgICAgICAgICAgICAgICBTbGFzaC50ZXh0ZXh0W2V4dF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dFsnY3J5cHQnXSA9IHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXh0ID0gU2xhc2guZXh0IHBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGV4dCBhbmQgU2xhc2gudGV4dGV4dFtleHRdPyBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIFNsYXNoLnRleHRiYXNlW1NsYXNoLmJhc2VuYW1lKHApLnRvTG93ZXJDYXNlKCldXG4gICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IFNsYXNoLmlzRmlsZSBwXG4gICAgICAgICAgICBpc0JpbmFyeSA9IHJlcXVpcmUgJ2lzYmluYXJ5ZmlsZSdcbiAgICAgICAgICAgIHJldHVybiBub3QgaXNCaW5hcnkuaXNCaW5hcnlGaWxlU3luYyBwXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5pc1RleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgQHJlYWRUZXh0OiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGUgcCwgJ3V0ZjgnLCAoZXJyLCB0ZXh0KSAtPiBcbiAgICAgICAgICAgICAgICAgICAgY2Igbm90IGVyciBhbmQgdGV4dCBvciAnJ1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC5yZWFkVGV4dCAtLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyBwLCAndXRmOCdcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gucmVhZFRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuXG4gICAgQHdyaXRlVGV4dDogKHAsIHRleHQsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgdG1wZmlsZSA9IFNsYXNoLnRtcGZpbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIEBmaWxlRXhpc3RzIHAsIChzdGF0KSAtPiAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gc3RhdD8ubW9kZSA/IDBvNjY2XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZSB0bXBmaWxlLCB0ZXh0LCBtb2RlOm1vZGUsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBlcnIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnMuY3AgdG1wZmlsZSwgcCwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGVyciB0aGVuIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0tIGNwICN7dG1wZmlsZX0gLT4gI3twfVwiICsgU3RyaW5nKGVycilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgY2IgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRwLmV4ZWMgXCJjcCAje3RtcGZpbGV9ICN7cH1cIiwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGVyciB0aGVuIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0tIGNwICN7dG1wZmlsZX0gLT4gI3twfVwiICsgU3RyaW5nKGVycilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgY2IgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcy51bmxpbmsgdG1wZmlsZSwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBmcy5yZW5hbWUgdG1wZmlsZSwgcCwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBpZiBlcnIgdGhlbiBjYiBTbGFzaC5lcnJvciBcIlNsYXNoLndyaXRlVGV4dCAtLSBtb3ZlICN7dG1wZmlsZX0gLT4gI3twfVwiICsgU3RyaW5nKGVycilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBlbHNlIGNiIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBmcy5tb3ZlIHRtcGZpbGUsIHAsIG92ZXJ3cml0ZTp0cnVlLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGlmIGVyciB0aGVuIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0tIG1vdmUgI3t0bXBmaWxlfSAtPiAje3B9XCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGVsc2UgY2IgcFxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyB0bXBmaWxlLCB0ZXh0XG4gICAgICAgICAgICAgICAgIyBmcy5tb3ZlU3luYyB0bXBmaWxlLCBwLCBvdmVyd3JpdGU6dHJ1ZVxuICAgICAgICAgICAgICAgICMgZnMucmVuYW1lU3luYyB0bXBmaWxlLCBwXG4gICAgICAgICAgICAgICAgZnMuY3BTeW5jIHRtcGZpbGUsIHBcbiAgICAgICAgICAgICAgICBwXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLndyaXRlVGV4dCAtLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgIFxuICAgIEB0bXBmaWxlOiAoZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIFNsYXNoLmpvaW4gb3MudG1wZGlyKCksIHJlcXVpcmUoJ3V1aWQnKS52MSgpICsgKGV4dCBhbmQgXCIuI3tleHR9XCIgb3IgJycpXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwICAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEByZW1vdmU6IChwLCBjYikgLT4gXG4gICAgICAgIGlmIGNiIHRoZW4gZnMucmVtb3ZlIHAsIGNiXG4gICAgICAgIGVsc2UgZnMucmVtb3ZlU3luYyBwXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQHJlZyA9IG5ldyBSZWdFeHAgXCJcXFxcXFxcXFwiLCAnZydcblxuICAgIEB3aW46IC0+IHBhdGguc2VwID09ICdcXFxcJ1xuICAgIFxuICAgIEBmczogZnNcbiAgICBAd2F0Y2g6IGZzLndhdGNoXG4gICAgXG4gICAgQGVycm9yOiAobXNnKSAtPiBcbiAgICAgICAgaWYgQGxvZ0Vycm9ycyB0aGVuIGVycm9yIG1zZyBcbiAgICAgICAgJydcblxubW9kdWxlLmV4cG9ydHMgPSBTbGFzaFxuIl19
//# sourceURL=../coffee/kslash.coffee