// koffee 1.14.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsia3NsYXNoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0FBQ1AsRUFBQSxHQUFPLE9BQUEsQ0FBUSxVQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFFRDs7O0lBRUYsS0FBQyxDQUFBLFNBQUQsR0FBWTs7SUFRWixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsQ0FBRDtRQUNILElBQStDLGNBQUksQ0FBQyxDQUFFLGdCQUF0RDtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksd0JBQVosRUFBUDs7UUFDQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBSDtZQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7WUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckIsRUFGUjtTQUFBLE1BQUE7WUFJSSxDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7WUFDSixDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBTFI7O1FBTUEsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLElBQVgsQ0FBQSxJQUFxQixDQUFDLENBQUMsTUFBRixLQUFZLENBQXBDO1lBQ0ksQ0FBQSxHQUFJLENBQUUsYUFEVjs7UUFFQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBWCxDQUFBLElBQW9CLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBbkM7WUFDSSxDQUFBLEdBQUksQ0FBQSxHQUFJLElBRFo7O2VBRUE7SUFaRzs7SUFjUCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtRQUNOLElBQWtELGNBQUksQ0FBQyxD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OztJQUVQLEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQTtlQUFHLElBQUksQ0FBQyxHQUFMLEtBQVk7SUFBZjs7SUFFTixLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsR0FBRDtRQUNKLElBQUcsSUFBQyxDQUFBLFNBQUo7WUFBWSxPQUFBLENBQU8sS0FBUCxDQUFhLEdBQWIsRUFBWjs7ZUFDQTtJQUZJOzs7Ozs7QUFJWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuIyMjXG5cbm9zICAgPSByZXF1aXJlICdvcydcbmZzICAgPSByZXF1aXJlICdmcy1leHRyYSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5jbGFzcyBTbGFzaFxuICAgIFxuICAgIEBsb2dFcnJvcnM6IGZhbHNlXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBwYXRoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aCAtLSBubyBwYXRoP1wiIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgaWYgU2xhc2gud2luKClcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwICAgICBcbiAgICAgICAgICAgIHAgPSBwLnJlcGxhY2UgU2xhc2gucmVnLCAnLydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcCA9IHAucmVwbGFjZSBTbGFzaC5yZWcsICcvJ1xuICAgICAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHAgICAgICAgICAgICBcbiAgICAgICAgaWYgcC5lbmRzV2l0aCgnOi4nKSBhbmQgcC5sZW5ndGggPT0gM1xuICAgICAgICAgICAgcCA9IHBbLi4xXVxuICAgICAgICBpZiBwLmVuZHNXaXRoKCc6JykgYW5kIHAubGVuZ3RoID09IDJcbiAgICAgICAgICAgIHAgPSBwICsgJy8nXG4gICAgICAgIHBcbiAgICAgICAgXG4gICAgQHVuc2xhc2g6IChwKSAtPlxuICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC51bnNsYXNoIC0tIG5vIHBhdGg/XCIgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICBpZiBwLmxlbmd0aCA+PSAzIGFuZCBwWzBdID09ICcvJyA9PSBwWzJdIFxuICAgICAgICAgICAgICAgIHAgPSBwWzFdICsgJzonICsgcC5zbGljZSAyXG4gICAgICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcFxuICAgICAgICAgICAgaWYgcFsxXSA9PSAnOidcbiAgICAgICAgICAgICAgICBwID0gIHBbMF0udG9VcHBlckNhc2UoKSArIHBbMS4uXVxuICAgICAgICBwXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzcGxpdDogKHApIC0+IFNsYXNoLnBhdGgocCkuc3BsaXQoJy8nKS5maWx0ZXIgKGUpIC0+IGUubGVuZ3RoXG4gICAgXG4gICAgQHNwbGl0RHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBwYXJzZWQgPSBTbGFzaC5wYXJzZSBwXG4gICAgICAgIHJvb3QgPSBwYXJzZWQucm9vdFxuXG4gICAgICAgIGlmIHJvb3QubGVuZ3RoID4gMVxuICAgICAgICAgICAgaWYgcC5sZW5ndGggPiByb290Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gcC5zbGljZShyb290Lmxlbmd0aC0xKVxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9ICcvJ1xuICAgICAgICAgICAgcmV0dXJuIFtmaWxlUGF0aCAsIHJvb3Quc2xpY2UgMCwgcm9vdC5sZW5ndGgtMl1cbiAgICAgICAgZWxzZSBpZiBwYXJzZWQuZGlyLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGlmIHBhcnNlZC5kaXJbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtwWzIuLl0sIHBhcnNlZC5kaXJbMF1dXG4gICAgICAgIGVsc2UgaWYgcGFyc2VkLmJhc2UubGVuZ3RoID09IDJcbiAgICAgICAgICAgIGlmIHBhcnNlZC5iYXNlWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHJldHVybiBbJy8nLCBwYXJzZWQuYmFzZVswXV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgW1NsYXNoLnBhdGgocCksICcnXVxuICAgICAgICBcbiAgICBAcmVtb3ZlRHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFNsYXNoLnNwbGl0RHJpdmUocClbMF1cbiAgXG4gICAgQGlzUm9vdDogKHApIC0+IFNsYXNoLnJlbW92ZURyaXZlKHApID09ICcvJ1xuICAgICAgICBcbiAgICBAc3BsaXRGaWxlTGluZTogKHApIC0+ICAjIGZpbGUudHh0OjE6MCAtLT4gWydmaWxlLnR4dCcsIDEsIDBdXG4gICAgICAgIFxuICAgICAgICBbZixkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcFxuICAgICAgICBzcGxpdCA9IFN0cmluZyhmKS5zcGxpdCAnOidcbiAgICAgICAgbGluZSA9IHBhcnNlSW50IHNwbGl0WzFdIGlmIHNwbGl0Lmxlbmd0aCA+IDFcbiAgICAgICAgY2xtbiA9IHBhcnNlSW50IHNwbGl0WzJdIGlmIHNwbGl0Lmxlbmd0aCA+IDJcbiAgICAgICAgbCA9IGMgPSAwXG4gICAgICAgIGwgPSBsaW5lIGlmIE51bWJlci5pc0ludGVnZXIgbGluZVxuICAgICAgICBjID0gY2xtbiBpZiBOdW1iZXIuaXNJbnRlZ2VyIGNsbW5cbiAgICAgICAgZCA9IGQgKyAnOicgaWYgZCAhPSAnJ1xuICAgICAgICBbIGQgKyBzcGxpdFswXSwgTWF0aC5tYXgobCwxKSwgIE1hdGgubWF4KGMsMCkgXVxuICAgICAgICBcbiAgICBAc3BsaXRGaWxlUG9zOiAocCkgLT4gIyBmaWxlLnR4dDoxOjMgLS0+IFsnZmlsZS50eHQnLCBbMywgMF1dXG4gICAgXG4gICAgICAgIFtmLGwsY10gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgW2YsIFtjLCBsLTFdXVxuICAgICAgICBcbiAgICBAcmVtb3ZlTGluZVBvczogKHApIC0+IFNsYXNoLnNwbGl0RmlsZUxpbmUocClbMF1cbiAgICBAcmVtb3ZlQ29sdW1uOiAgKHApIC0+IFxuICAgICAgICBbZixsXSA9IFNsYXNoLnNwbGl0RmlsZUxpbmUgcFxuICAgICAgICBpZiBsPjEgdGhlbiBmICsgJzonICsgbFxuICAgICAgICBlbHNlIGZcbiAgICAgICAgXG4gICAgQGV4dDogICAgICAgKHApIC0+IHBhdGguZXh0bmFtZShwKS5zbGljZSAxXG4gICAgQHNwbGl0RXh0OiAgKHApIC0+IFtTbGFzaC5yZW1vdmVFeHQocCksIFNsYXNoLmV4dChwKV1cbiAgICBAcmVtb3ZlRXh0OiAocCkgLT4gU2xhc2guam9pbiBTbGFzaC5kaXIocCksIFNsYXNoLmJhc2UgcFxuICAgIEBzd2FwRXh0OiAgIChwLCBleHQpIC0+IFNsYXNoLnJlbW92ZUV4dChwKSArIChleHQuc3RhcnRzV2l0aCgnLicpIGFuZCBleHQgb3IgXCIuI3tleHR9XCIpXG4gICAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGpvaW46IC0+IFtdLm1hcC5jYWxsKGFyZ3VtZW50cywgU2xhc2gucGF0aCkuam9pbiAnLydcbiAgICBcbiAgICBAam9pbkZpbGVQb3M6IChmaWxlLCBwb3MpIC0+ICMgWydmaWxlLnR4dCcsIFszLCAwXV0gLS0+IGZpbGUudHh0OjE6M1xuICAgICAgICBcbiAgICAgICAgZmlsZSA9IFNsYXNoLnJlbW92ZUxpbmVQb3MgZmlsZVxuICAgICAgICBpZiBub3QgcG9zPyBvciBub3QgcG9zWzBdP1xuICAgICAgICAgICAgZmlsZVxuICAgICAgICBlbHNlIGlmIHBvc1swXVxuICAgICAgICAgICAgZmlsZSArIFwiOiN7cG9zWzFdKzF9OiN7cG9zWzBdfVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGUgKyBcIjoje3Bvc1sxXSsxfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgQGpvaW5GaWxlTGluZTogKGZpbGUsIGxpbmUsIGNvbCkgLT4gIyAnZmlsZS50eHQnLCAxLCAyIC0tPiBmaWxlLnR4dDoxOjJcbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBTbGFzaC5yZW1vdmVMaW5lUG9zIGZpbGVcbiAgICAgICAgcmV0dXJuIGZpbGUgaWYgbm90IGxpbmVcbiAgICAgICAgcmV0dXJuIFwiI3tmaWxlfToje2xpbmV9XCIgaWYgbm90IGNvbFxuICAgICAgICBcIiN7ZmlsZX06I3tsaW5lfToje2NvbH1cIlxuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGRpcmxpc3Q6IChwLCBvcHQsIGNiKSAtPiBAbGlzdCBwLCBvcHQsIGNiXG4gICAgQGxpc3Q6ICAgIChwLCBvcHQsIGNiKSAtPiByZXF1aXJlKCcuL2Rpcmxpc3QnKSBwLCBvcHQsIGNiXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBwYXRobGlzdDogKHApIC0+ICMgJy9yb290L2Rpci9maWxlLnR4dCcgLS0+IFsnLycsICcvcm9vdCcsICcvcm9vdC9kaXInLCAnL3Jvb3QvZGlyL2ZpbGUudHh0J11cbiAgICBcbiAgICAgICAgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5wYXRobGlzdCAtLSBubyBwYXRoP1wiIFxuICAgICAgICAgICAgcmV0dXJuIFtdXG4gICAgICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLm5vcm1hbGl6ZSBwXG4gICAgICAgIGlmIHAubGVuZ3RoID4gMSBhbmQgcFtwLmxlbmd0aC0xXSA9PSAnLycgYW5kIHBbcC5sZW5ndGgtMl0gIT0gJzonXG4gICAgICAgICAgICBwID0gcFsuLi5wLmxlbmd0aC0xXSBcbiAgICAgICAgbGlzdCA9IFtwXVxuICAgICAgICB3aGlsZSBTbGFzaC5kaXIocCkgIT0gJydcbiAgICAgICAgICAgIGxpc3QudW5zaGlmdCBTbGFzaC5kaXIgcFxuICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIGxpc3RcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgICAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgMDAwICAwMDAgIDAwMCAgIFxuICAgIFxuICAgIEBiYXNlOiAgICAgICAocCkgICAtPiBwYXRoLmJhc2VuYW1lIFNsYXNoLnNhbml0aXplKHApLCBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZmlsZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIEBleHRuYW1lOiAgICAocCkgICAtPiBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAYmFzZW5hbWU6ICAgKHAsZSkgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgZVxuICAgIEBpc0Fic29sdXRlOiAocCkgICAtPiBwID0gU2xhc2guc2FuaXRpemUocCk7IHBbMV0gPT0gJzonIG9yIHBhdGguaXNBYnNvbHV0ZSBwXG4gICAgQGlzUmVsYXRpdmU6IChwKSAgIC0+IG5vdCBTbGFzaC5pc0Fic29sdXRlIHBcbiAgICBAZGlybmFtZTogICAgKHApICAgLT4gU2xhc2gucGF0aCBwYXRoLmRpcm5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAbm9ybWFsaXplOiAgKHApICAgLT4gU2xhc2gucGF0aCBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAZGlyOiAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBwID0gU2xhc2gubm9ybWFsaXplIHBcbiAgICAgICAgaWYgU2xhc2guaXNSb290IHAgdGhlbiByZXR1cm4gJydcbiAgICAgICAgcCA9IHBhdGguZGlybmFtZSBwXG4gICAgICAgIGlmIHAgPT0gJy4nIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgaWYgcC5lbmRzV2l0aCgnOicpIGFuZCBwLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICBwICs9ICcvJ1xuICAgICAgICBwXG4gICAgICAgIFxuICAgIEBzYW5pdGl6ZTogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2guc2FuaXRpemUgLS0gbm8gcGF0aD9cIiBcbiAgICAgICAgaWYgcFswXSA9PSAnXFxuJ1xuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJsZWFkaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAxXG4gICAgICAgIGlmIHAuZW5kc1dpdGggJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwidHJhaWxpbmcgbmV3bGluZSBpbiBwYXRoISAnI3twfSdcIlxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLnNhbml0aXplIHAuc3Vic3RyIDAsIHAubGVuZ3RoLTFcbiAgICAgICAgcFxuICAgIFxuICAgIEBwYXJzZTogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgZGljdCA9IHBhdGgucGFyc2UgcFxuICAgICAgICBcbiAgICAgICAgaWYgZGljdC5kaXIubGVuZ3RoID09IDIgYW5kIGRpY3QuZGlyWzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5kaXIgKz0gJy8nXG4gICAgICAgIGlmIGRpY3Qucm9vdC5sZW5ndGggPT0gMiBhbmQgZGljdC5yb290WzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5yb290ICs9ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgIGRpY3RcbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBob21lOiAgICAgICAgICAtPiBTbGFzaC5wYXRoIG9zLmhvbWVkaXIoKVxuICAgIEB0aWxkZTogICAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIFNsYXNoLmhvbWUoKSwgJ34nXG4gICAgQHVudGlsZGU6ICAgKHApIC0+IFNsYXNoLnBhdGgocCk/LnJlcGxhY2UgL15cXH4vLCBTbGFzaC5ob21lKClcbiAgICBAdW5lbnY6ICAgICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpID0gcC5pbmRleE9mICckJywgMFxuICAgICAgICB3aGlsZSBpID49IDBcbiAgICAgICAgICAgIGZvciBrLHYgb2YgcHJvY2Vzcy5lbnZcbiAgICAgICAgICAgICAgICBpZiBrID09IHAuc2xpY2UgaSsxLCBpKzEray5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcCA9IHAuc2xpY2UoMCwgaSkgKyB2ICsgcC5zbGljZShpK2subGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpID0gcC5pbmRleE9mICckJywgaSsxXG4gICAgICAgICAgICBcbiAgICAgICAgU2xhc2gucGF0aCBwXG4gICAgXG4gICAgQHJlc29sdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcCA9IHByb2Nlc3MuY3dkKCkgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLnVuZW52IFNsYXNoLnVudGlsZGUgcFxuICAgICAgICBcbiAgICAgICAgaWYgU2xhc2guaXNSZWxhdGl2ZSBwXG4gICAgICAgICAgICBwID0gU2xhc2gucGF0aCBwYXRoLnJlc29sdmUgcFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIHBcbiAgICBcbiAgICBAcmVsYXRpdmU6IChyZWwsIHRvKSAtPlxuICAgICAgICBcbiAgICAgICAgdG8gPSBwcm9jZXNzLmN3ZCgpIGlmIG5vdCB0bz8ubGVuZ3RoXG4gICAgICAgIHJlbCA9IFNsYXNoLnJlc29sdmUgcmVsXG4gICAgICAgIHJldHVybiByZWwgaWYgbm90IFNsYXNoLmlzQWJzb2x1dGUgcmVsXG4gICAgICAgIGlmIFNsYXNoLnJlc29sdmUodG8pID09IHJlbFxuICAgICAgICAgICAgcmV0dXJuICcuJ1xuXG4gICAgICAgIFtybCwgcmRdID0gU2xhc2guc3BsaXREcml2ZSByZWxcbiAgICAgICAgW3RvLCB0ZF0gPSBTbGFzaC5zcGxpdERyaXZlIFNsYXNoLnJlc29sdmUgdG9cbiAgICAgICAgaWYgcmQgYW5kIHRkIGFuZCByZCAhPSB0ZFxuICAgICAgICAgICAgcmV0dXJuIHJlbFxuICAgICAgICBTbGFzaC5wYXRoIHBhdGgucmVsYXRpdmUgdG8sIHJsXG4gICAgICAgIFxuICAgIEBmaWxlVXJsOiAocCkgLT4gXCJmaWxlOi8vLyN7U2xhc2guZW5jb2RlIHB9XCJcblxuICAgIEBzYW1lUGF0aDogKGEsIGIpIC0+IFNsYXNoLnJlc29sdmUoYSkgPT0gU2xhc2gucmVzb2x2ZShiKVxuXG4gICAgQGVzY2FwZTogKHApIC0+IHAucmVwbGFjZSAvKFtcXGBcXFwiXSkvZywgJ1xcXFwkMSdcblxuICAgIEBlbmNvZGU6IChwKSAtPlxuICAgICAgICBwID0gZW5jb2RlVVJJIHBcbiAgICAgICAgcCA9IHAucmVwbGFjZSAvXFwjL2csIFwiJTIzXCJcbiAgICAgICAgcCA9IHAucmVwbGFjZSAvXFwmL2csIFwiJTI2XCJcbiAgICAgICAgcCA9IHAucmVwbGFjZSAvXFwnL2csIFwiJTI3XCJcblxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMDAgICAgMDAwICAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAcGtnOiAocCkgLT5cbiAgICBcbiAgICAgICAgaWYgcD8ubGVuZ3RoP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSBwLmxlbmd0aCBhbmQgU2xhc2gucmVtb3ZlRHJpdmUocCkgbm90IGluIFsnLicsICcvJywgJyddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZGlyRXhpc3RzICBTbGFzaC5qb2luIHAsICcuZ2l0JyAgICAgICAgIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmZpbGVFeGlzdHMgU2xhc2guam9pbiBwLCAncGFja2FnZS5ub29uJyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2UuanNvbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIG51bGxcblxuICAgIEBnaXQ6IChwKSAtPlxuXG4gICAgICAgIGlmIHA/Lmxlbmd0aD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nLCAnLycsICcnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyBTbGFzaC5qb2luIHAsICcuZ2l0JyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbnVsbFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgQGV4aXN0czogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGlmIG5vdCBwP1xuICAgICAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBTbGFzaC5yZW1vdmVMaW5lUG9zIHBcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3MgcCwgZnMuUl9PSyB8IGZzLkZfT0ssIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKCkgXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnN0YXQgcCwgKGVyciwgc3RhdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIHN0YXRcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5leGlzdHMgLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgcD9cbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICAgICAgICAgIGlmIHN0YXQgPSBmcy5zdGF0U3luYyhwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBwLCBmcy5SX09LXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdFxuICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICBpZiBlcnIuY29kZSBpbiBbJ0VOT0VOVCcsICdFTk9URElSJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guZXhpc3RzIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgIG51bGwgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgIEBmaWxlRXhpc3RzOiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRmlsZSgpIHRoZW4gY2Igc3RhdFxuICAgICAgICAgICAgICAgIGVsc2UgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBzdGF0ID0gU2xhc2guZXhpc3RzIHBcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdCBpZiBzdGF0LmlzRmlsZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgQGRpckV4aXN0czogKHAsIGNiKSAtPlxuXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdD8uaXNEaXJlY3RvcnkoKSB0aGVuIGNiIHN0YXRcbiAgICAgICAgICAgICAgICBlbHNlIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdCA9IFNsYXNoLmV4aXN0cyBwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXQgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgICAgMDAwICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQHRvdWNoOiAocCkgLT5cblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGRpciA9IFNsYXNoLmRpciBwXG4gICAgICAgICAgICBpZiBub3QgU2xhc2guaXNEaXIgZGlyXG4gICAgICAgICAgICAgICAgZnMubWtkaXJTeW5jIGRpciwgcmVjdXJzaXZlOnRydWVcbiAgICAgICAgICAgIGlmIG5vdCBTbGFzaC5maWxlRXhpc3RzIHBcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIHAsICcnXG4gICAgICAgICAgICByZXR1cm4gcFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gudG91Y2ggLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgQHVudXNlZDogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgbmFtZSA9IFNsYXNoLmJhc2UgcFxuICAgICAgICBkaXIgID0gU2xhc2guZGlyIHBcbiAgICAgICAgZXh0ICA9IFNsYXNoLmV4dCBwXG4gICAgICAgIGV4dCAgPSBleHQgYW5kICcuJytleHQgb3IgJydcbiAgICAgICAgXG4gICAgICAgIGlmIC9cXGRcXGQkLy50ZXN0IG5hbWVcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnNsaWNlIDAsIG5hbWUubGVuZ3RoLTJcbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFNsYXNoLmV4aXN0cyBwLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBub3Qgc3RhdCBcbiAgICAgICAgICAgICAgICAgICAgY2IgU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIGkgPSAxXG4gICAgICAgICAgICAgICAgdGVzdCA9ICcnXG4gICAgICAgICAgICAgICAgY2hlY2sgPSAtPlxuICAgICAgICAgICAgICAgICAgICB0ZXN0ID0gXCIje25hbWV9I3tcIiN7aX1cIi5wYWRTdGFydCgyICcwJyl9I3tleHR9XCJcbiAgICAgICAgICAgICAgICAgICAgaWYgZGlyIHRoZW4gdGVzdCA9IFNsYXNoLmpvaW4gZGlyLCB0ZXN0XG4gICAgICAgICAgICAgICAgICAgIFNsYXNoLmV4aXN0cyB0ZXN0LCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVjaygpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IgU2xhc2gucmVzb2x2ZSB0ZXN0XG4gICAgICAgICAgICAgICAgY2hlY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBub3QgU2xhc2guZXhpc3RzKHApIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgZm9yIGkgaW4gWzEuLjEwMDBdXG4gICAgICAgICAgICAgICAgdGVzdCA9IFwiI3tuYW1lfSN7XCIje2l9XCIucGFkU3RhcnQoMiAnMCcpfSN7ZXh0fVwiXG4gICAgICAgICAgICAgICAgaWYgZGlyIHRoZW4gdGVzdCA9IFNsYXNoLmpvaW4gZGlyLCB0ZXN0XG4gICAgICAgICAgICAgICAgaWYgbm90IFNsYXNoLmV4aXN0cyB0ZXN0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTbGFzaC5yZXNvbHZlIHRlc3RcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgIDAwMCAgXG4gICAgXG4gICAgQGlzRGlyOiAgKHAsIGNiKSAtPiBTbGFzaC5kaXJFeGlzdHMgcCwgY2JcbiAgICBAaXNGaWxlOiAocCwgY2IpIC0+IFNsYXNoLmZpbGVFeGlzdHMgcCwgY2JcbiAgICBcbiAgICBAaXNXcml0YWJsZTogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2VzcyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PSywgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgY2Igbm90IGVycj9cbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guaXNXcml0YWJsZSAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICAgICAgICAgIGNiIGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgU2xhc2gucmVzb2x2ZShwKSwgZnMuUl9PSyB8IGZzLldfT0tcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4gICAgXG4gICAgQHRleHRleHQ6IG51bGxcbiAgICBcbiAgICBAdGV4dGJhc2U6IFxuICAgICAgICBwcm9maWxlOjFcbiAgICAgICAgbGljZW5zZToxXG4gICAgICAgICcuZ2l0aWdub3JlJzoxXG4gICAgICAgICcubnBtaWdub3JlJzoxXG4gICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGlzVGV4dDogKHApIC0+XG4gICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLnRleHRleHRcbiAgICAgICAgICAgICAgICBTbGFzaC50ZXh0ZXh0ID0ge31cbiAgICAgICAgICAgICAgICBmb3IgZXh0IGluIHJlcXVpcmUgJ3RleHRleHRlbnNpb25zJ1xuICAgICAgICAgICAgICAgICAgICBTbGFzaC50ZXh0ZXh0W2V4dF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dFsnY3J5cHQnXSA9IHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXh0ID0gU2xhc2guZXh0IHBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGV4dCBhbmQgU2xhc2gudGV4dGV4dFtleHRdPyBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIFNsYXNoLnRleHRiYXNlW1NsYXNoLmJhc2VuYW1lKHApLnRvTG93ZXJDYXNlKCldXG4gICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IFNsYXNoLmlzRmlsZSBwXG4gICAgICAgICAgICBpc0JpbmFyeSA9IHJlcXVpcmUgJ2lzYmluYXJ5ZmlsZSdcbiAgICAgICAgICAgIHJldHVybiBub3QgaXNCaW5hcnkuaXNCaW5hcnlGaWxlU3luYyBwXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5pc1RleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgQHJlYWRUZXh0OiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGUgcCwgJ3V0ZjgnLCAoZXJyLCB0ZXh0KSAtPiBcbiAgICAgICAgICAgICAgICAgICAgY2Igbm90IGVyciBhbmQgdGV4dCBvciAnJ1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC5yZWFkVGV4dCAtLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyBwLCAndXRmOCdcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gucmVhZFRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuXG4gICAgQHdyaXRlVGV4dDogKHAsIHRleHQsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgdG1wZmlsZSA9IFNsYXNoLnRtcGZpbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIEBmaWxlRXhpc3RzIHAsIChzdGF0KSAtPiAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gc3RhdD8ubW9kZSA/IDBvNjY2XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZSB0bXBmaWxlLCB0ZXh0LCBtb2RlOm1vZGUsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBlcnIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnMubW92ZSB0bXBmaWxlLCBwLCBvdmVyd3JpdGU6dHJ1ZSwgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyIHRoZW4gY2IgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0gbW92ZSAje3RtcGZpbGV9IC0+ICN7cH1cIiArIFN0cmluZyhlcnIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgY2IgcFxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyB0bXBmaWxlLCB0ZXh0XG4gICAgICAgICAgICAgICAgZnMubW92ZVN5bmMgdG1wZmlsZSwgcCwgb3ZlcndyaXRlOnRydWVcbiAgICAgICAgICAgICAgICBwXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLndyaXRlVGV4dCAtLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgIFxuICAgIEB0bXBmaWxlOiAoZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIFNsYXNoLmpvaW4gb3MudG1wZGlyKCksIHJlcXVpcmUoJ3V1aWQnKS52MSgpICsgKGV4dCBhbmQgXCIuI3tleHR9XCIgb3IgJycpXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQHJlZyA9IG5ldyBSZWdFeHAgXCJcXFxcXFxcXFwiLCAnZydcblxuICAgIEB3aW46IC0+IHBhdGguc2VwID09ICdcXFxcJ1xuICAgIFxuICAgIEBlcnJvcjogKG1zZykgLT4gXG4gICAgICAgIGlmIEBsb2dFcnJvcnMgdGhlbiBlcnJvciBtc2cgXG4gICAgICAgICcnXG5cbm1vZHVsZS5leHBvcnRzID0gU2xhc2hcbiJdfQ==
//# sourceURL=../coffee/kslash.coffee