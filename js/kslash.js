// koffee 1.4.0

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
                                    return cb(Slash.error("Slash.writeText -- " + String(err)));
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

    Slash.tmpfile = function() {
        return require('tmp-filepath')();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0FBQ1AsRUFBQSxHQUFPLE9BQUEsQ0FBUSxVQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFFRDs7O0lBRUYsS0FBQyxDQUFBLFNBQUQsR0FBWTs7SUFRWixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsQ0FBRDtRQUNILElBQStDLGNBQUksQ0FBQyxDQUFFLGdCQUF0RDtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksd0JBQVosRUFBUDs7UUFDQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBSDtZQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7WUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7WUFDSixJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBWCxDQUFBLElBQXFCLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBcEM7Z0JBQ0ksQ0FBQSxHQUFJLENBQUUsYUFEVjthQUhKO1NBQUEsTUFBQTtZQU1JLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQUssQ0FBQyxHQUFoQixFQUFxQixHQUFyQjtZQUNKLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsRUFQUjs7ZUFRQTtJQVZHOztJQVlQLEtBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxDQUFEO1FBQ04sSUFBa0QsY0FBSSxDQUFDLENBQUUsZ0JBQXpEO0FBQUEsbUJBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBWSwyQkFBWixFQUFQOztRQUNBLENBQUEsR0FBSSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7UUFDSixJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEs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QXJDLENBQUgsRUFiSjthQURKO1NBQUEsTUFBQTtBQWdCSTtnQkFDSSxFQUFFLENBQUMsYUFBSCxDQUFpQixPQUFqQixFQUEwQixJQUExQjtnQkFDQSxFQUFFLENBQUMsUUFBSCxDQUFZLE9BQVosRUFBcUIsQ0FBckIsRUFBd0I7b0JBQUEsU0FBQSxFQUFVLElBQVY7aUJBQXhCO3VCQUNBLEVBSEo7YUFBQSxhQUFBO2dCQUlNO3VCQUNGLEtBQUssQ0FBQyxLQUFOLENBQVkscUJBQUEsR0FBd0IsTUFBQSxDQUFPLEdBQVAsQ0FBcEMsRUFMSjthQWhCSjs7SUFKUTs7SUEyQlosS0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2VBQUcsT0FBQSxDQUFRLGNBQVIsQ0FBQSxDQUFBO0lBQUg7O0lBUVYsS0FBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLE1BQUosQ0FBVyxNQUFYLEVBQW1CLEdBQW5COztJQUVQLEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQTtlQUFHLElBQUksQ0FBQyxHQUFMLEtBQVk7SUFBZjs7SUFFTixLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsR0FBRDtRQUNKLElBQUcsSUFBQyxDQUFBLFNBQUo7WUFBWSxPQUFBLENBQU8sS0FBUCxDQUFhLEdBQWIsRUFBWjs7ZUFDQTtJQUZJOzs7Ozs7QUFJWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuIyMjXG5cbm9zICAgPSByZXF1aXJlICdvcydcbmZzICAgPSByZXF1aXJlICdmcy1leHRyYScgXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxuY2xhc3MgU2xhc2hcbiAgICBcbiAgICBAbG9nRXJyb3JzOiBmYWxzZVxuXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAcGF0aDogKHApIC0+XG4gICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnBhdGggLS0gbm8gcGF0aD9cIiBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcCAgICAgXG4gICAgICAgICAgICBwID0gcC5yZXBsYWNlIFNsYXNoLnJlZywgJy8nXG4gICAgICAgICAgICBpZiBwLmVuZHNXaXRoKCc6LicpIGFuZCBwLmxlbmd0aCA9PSAzXG4gICAgICAgICAgICAgICAgcCA9IHBbLi4xXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwID0gcC5yZXBsYWNlIFNsYXNoLnJlZywgJy8nXG4gICAgICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcCAgICAgICAgICAgIFxuICAgICAgICBwXG4gICAgICAgIFxuICAgIEB1bnNsYXNoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gudW5zbGFzaCAtLSBubyBwYXRoP1wiIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBpZiBTbGFzaC53aW4oKVxuICAgICAgICAgICAgaWYgcC5sZW5ndGggPj0gMyBhbmQgcFswXSA9PSAnLycgPT0gcFsyXSBcbiAgICAgICAgICAgICAgICBwID0gcFsxXSArICc6JyArIHAuc2xpY2UgMlxuICAgICAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHBcbiAgICAgICAgICAgIGlmIHBbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcCA9ICBwWzBdLnRvVXBwZXJDYXNlKCkgKyBwWzEuLl1cbiAgICAgICAgcFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc3BsaXQ6IChwKSAtPiBTbGFzaC5wYXRoKHApLnNwbGl0KCcvJykuZmlsdGVyIChlKSAtPiBlLmxlbmd0aFxuICAgIFxuICAgIEBzcGxpdERyaXZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgcGFyc2VkID0gU2xhc2gucGFyc2UgcFxuICAgICAgICByb290ID0gcGFyc2VkLnJvb3RcblxuICAgICAgICBpZiByb290Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGlmIHAubGVuZ3RoID4gcm9vdC5sZW5ndGhcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IHAuc2xpY2Uocm9vdC5sZW5ndGgtMSlcbiAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSAnLydcbiAgICAgICAgICAgIHJldHVybiBbZmlsZVBhdGggLCByb290LnNsaWNlIDAsIHJvb3QubGVuZ3RoLTJdXG4gICAgICAgIGVsc2UgaWYgcGFyc2VkLmRpci5sZW5ndGggPiAxXG4gICAgICAgICAgICBpZiBwYXJzZWQuZGlyWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHJldHVybiBbcFsyLi5dLCBwYXJzZWQuZGlyWzBdXVxuICAgICAgICBlbHNlIGlmIHBhcnNlZC5iYXNlLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICBpZiBwYXJzZWQuYmFzZVsxXSA9PSAnOidcbiAgICAgICAgICAgICAgICByZXR1cm4gWycvJywgcGFyc2VkLmJhc2VbMF1dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFtTbGFzaC5wYXRoKHApLCAnJ11cbiAgICAgICAgXG4gICAgQHJlbW92ZURyaXZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBTbGFzaC5zcGxpdERyaXZlKHApWzBdXG4gIFxuICAgIEBpc1Jvb3Q6IChwKSAtPiBTbGFzaC5yZW1vdmVEcml2ZShwKSA9PSAnLydcbiAgICAgICAgXG4gICAgQHNwbGl0RmlsZUxpbmU6IChwKSAtPiAgIyBmaWxlLnR4dDoxOjAgLS0+IFsnZmlsZS50eHQnLCAxLCAwXVxuICAgICAgICBcbiAgICAgICAgW2YsZF0gPSBTbGFzaC5zcGxpdERyaXZlIHBcbiAgICAgICAgc3BsaXQgPSBTdHJpbmcoZikuc3BsaXQgJzonXG4gICAgICAgIGxpbmUgPSBwYXJzZUludCBzcGxpdFsxXSBpZiBzcGxpdC5sZW5ndGggPiAxXG4gICAgICAgIGNsbW4gPSBwYXJzZUludCBzcGxpdFsyXSBpZiBzcGxpdC5sZW5ndGggPiAyXG4gICAgICAgIGwgPSBjID0gMFxuICAgICAgICBsID0gbGluZSBpZiBOdW1iZXIuaXNJbnRlZ2VyIGxpbmVcbiAgICAgICAgYyA9IGNsbW4gaWYgTnVtYmVyLmlzSW50ZWdlciBjbG1uXG4gICAgICAgIGQgPSBkICsgJzonIGlmIGQgIT0gJydcbiAgICAgICAgWyBkICsgc3BsaXRbMF0sIE1hdGgubWF4KGwsMSksICBNYXRoLm1heChjLDApIF1cbiAgICAgICAgXG4gICAgQHNwbGl0RmlsZVBvczogKHApIC0+ICMgZmlsZS50eHQ6MTozIC0tPiBbJ2ZpbGUudHh0JywgWzMsIDBdXVxuICAgIFxuICAgICAgICBbZixsLGNdID0gU2xhc2guc3BsaXRGaWxlTGluZSBwXG4gICAgICAgIFtmLCBbYywgbC0xXV1cbiAgICAgICAgXG4gICAgQHJlbW92ZUxpbmVQb3M6IChwKSAtPiBTbGFzaC5zcGxpdEZpbGVMaW5lKHApWzBdXG4gICAgQHJlbW92ZUNvbHVtbjogIChwKSAtPiBcbiAgICAgICAgW2YsbF0gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgaWYgbD4xIHRoZW4gZiArICc6JyArIGxcbiAgICAgICAgZWxzZSBmXG4gICAgICAgIFxuICAgIEBleHQ6ICAgICAgIChwKSAtPiBwYXRoLmV4dG5hbWUocCkuc2xpY2UgMVxuICAgIEBzcGxpdEV4dDogIChwKSAtPiBbU2xhc2gucmVtb3ZlRXh0KHApLCBTbGFzaC5leHQocCldXG4gICAgQHJlbW92ZUV4dDogKHApIC0+IFNsYXNoLmpvaW4gU2xhc2guZGlyKHApLCBTbGFzaC5iYXNlIHBcbiAgICBAc3dhcEV4dDogICAocCwgZXh0KSAtPiBTbGFzaC5yZW1vdmVFeHQocCkgKyAoZXh0LnN0YXJ0c1dpdGgoJy4nKSBhbmQgZXh0IG9yIFwiLiN7ZXh0fVwiKVxuICAgICAgICBcbiAgICAjICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBqb2luOiAtPiBbXS5tYXAuY2FsbChhcmd1bWVudHMsIFNsYXNoLnBhdGgpLmpvaW4gJy8nXG4gICAgXG4gICAgQGpvaW5GaWxlUG9zOiAoZmlsZSwgcG9zKSAtPiAjIFsnZmlsZS50eHQnLCBbMywgMF1dIC0tPiBmaWxlLnR4dDoxOjNcbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBTbGFzaC5yZW1vdmVMaW5lUG9zIGZpbGVcbiAgICAgICAgaWYgbm90IHBvcz8gb3Igbm90IHBvc1swXT9cbiAgICAgICAgICAgIGZpbGVcbiAgICAgICAgZWxzZSBpZiBwb3NbMF1cbiAgICAgICAgICAgIGZpbGUgKyBcIjoje3Bvc1sxXSsxfToje3Bvc1swXX1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICsgXCI6I3twb3NbMV0rMX1cIlxuICAgICAgICAgICAgICAgIFxuICAgIEBqb2luRmlsZUxpbmU6IChmaWxlLCBsaW5lLCBjb2wpIC0+ICMgJ2ZpbGUudHh0JywgMSwgMiAtLT4gZmlsZS50eHQ6MToyXG4gICAgICAgIFxuICAgICAgICBmaWxlID0gU2xhc2gucmVtb3ZlTGluZVBvcyBmaWxlXG4gICAgICAgIHJldHVybiBmaWxlIGlmIG5vdCBsaW5lXG4gICAgICAgIHJldHVybiBcIiN7ZmlsZX06I3tsaW5lfVwiIGlmIG5vdCBjb2xcbiAgICAgICAgXCIje2ZpbGV9OiN7bGluZX06I3tjb2x9XCJcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBAcGF0aGxpc3Q6IChwKSAtPiAjICcvcm9vdC9kaXIvZmlsZS50eHQnIC0tPiBbJy8nLCAnL3Jvb3QnLCAnL3Jvb3QvZGlyJywgJy9yb290L2Rpci9maWxlLnR4dCddXG4gICAgXG4gICAgICAgIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aGxpc3QgLS0gbm8gcGF0aD9cIiBcbiAgICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC5ub3JtYWxpemUgcFxuICAgICAgICBpZiBwLmxlbmd0aCA+IDEgYW5kIHBbcC5sZW5ndGgtMV0gPT0gJy8nIGFuZCBwW3AubGVuZ3RoLTJdICE9ICc6J1xuICAgICAgICAgICAgcCA9IHBbLi4ucC5sZW5ndGgtMV0gXG4gICAgICAgIGxpc3QgPSBbcF1cbiAgICAgICAgd2hpbGUgU2xhc2guZGlyKHApICE9ICcnXG4gICAgICAgICAgICBsaXN0LnVuc2hpZnQgU2xhc2guZGlyIHBcbiAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBsaXN0XG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgICAgICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAgICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgICAgICAgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwIDAwMCAgMDAwICAwMDAgICBcbiAgICBcbiAgICBAYmFzZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGZpbGU6ICAgICAgIChwKSAgIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZXh0bmFtZTogICAgKHApICAgLT4gcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGJhc2VuYW1lOiAgIChwLGUpIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocCksIGVcbiAgICBAaXNBYnNvbHV0ZTogKHApICAgLT4gcCA9IFNsYXNoLnNhbml0aXplKHApOyBwWzFdID09ICc6JyBvciBwYXRoLmlzQWJzb2x1dGUgcFxuICAgIEBpc1JlbGF0aXZlOiAocCkgICAtPiBub3QgU2xhc2guaXNBYnNvbHV0ZSBwXG4gICAgQGRpcm5hbWU6ICAgIChwKSAgIC0+IFNsYXNoLnBhdGggcGF0aC5kaXJuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQG5vcm1hbGl6ZTogIChwKSAgIC0+IFNsYXNoLnBhdGggU2xhc2guc2FuaXRpemUocClcbiAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGRpcjogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLm5vcm1hbGl6ZSBwXG4gICAgICAgIGlmIFNsYXNoLmlzUm9vdCBwIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIHAgPSBwYXRoLmRpcm5hbWUgcFxuICAgICAgICBpZiBwID09ICcuJyB0aGVuIHJldHVybiAnJ1xuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIGlmIHAuZW5kc1dpdGgoJzonKSBhbmQgcC5sZW5ndGggPT0gMlxuICAgICAgICAgICAgcCArPSAnLydcbiAgICAgICAgcFxuICAgICAgICBcbiAgICBAc2FuaXRpemU6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnNhbml0aXplIC0tIG5vIHBhdGg/XCIgXG4gICAgICAgIGlmIHBbMF0gPT0gJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwibGVhZGluZyBuZXdsaW5lIGluIHBhdGghICcje3B9J1wiXG4gICAgICAgICAgICByZXR1cm4gU2xhc2guc2FuaXRpemUgcC5zdWJzdHIgMVxuICAgICAgICBpZiBwLmVuZHNXaXRoICdcXG4nXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcInRyYWlsaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAwLCBwLmxlbmd0aC0xXG4gICAgICAgIHBcbiAgICBcbiAgICBAcGFyc2U6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGRpY3QgPSBwYXRoLnBhcnNlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIGRpY3QuZGlyLmxlbmd0aCA9PSAyIGFuZCBkaWN0LmRpclsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3QuZGlyICs9ICcvJ1xuICAgICAgICBpZiBkaWN0LnJvb3QubGVuZ3RoID09IDIgYW5kIGRpY3Qucm9vdFsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3Qucm9vdCArPSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICBkaWN0XG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAaG9tZTogICAgICAgICAgLT4gU2xhc2gucGF0aCBvcy5ob21lZGlyKClcbiAgICBAdGlsZGU6ICAgICAocCkgLT4gU2xhc2gucGF0aChwKT8ucmVwbGFjZSBTbGFzaC5ob21lKCksICd+J1xuICAgIEB1bnRpbGRlOiAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIC9eXFx+LywgU2xhc2guaG9tZSgpXG4gICAgQHVuZW52OiAgICAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIDBcbiAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgICBmb3Igayx2IG9mIHByb2Nlc3MuZW52XG4gICAgICAgICAgICAgICAgaWYgayA9PSBwLnNsaWNlIGkrMSwgaSsxK2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHAgPSBwLnNsaWNlKDAsIGkpICsgdiArIHAuc2xpY2UoaStrLmxlbmd0aCsxKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIGkrMVxuICAgICAgICAgICAgXG4gICAgICAgIFNsYXNoLnBhdGggcFxuICAgIFxuICAgIEByZXNvbHZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHAgPSBwcm9jZXNzLmN3ZCgpIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC51bmVudiBTbGFzaC51bnRpbGRlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIFNsYXNoLmlzUmVsYXRpdmUgcFxuICAgICAgICAgICAgcCA9IFNsYXNoLnBhdGggcGF0aC5yZXNvbHZlIHBcbiAgICAgICAgcFxuICAgIFxuICAgIEByZWxhdGl2ZTogKHJlbCwgdG8pIC0+XG4gICAgICAgIFxuICAgICAgICB0byA9IHByb2Nlc3MuY3dkKCkgaWYgbm90IHRvPy5sZW5ndGhcbiAgICAgICAgcmVsID0gU2xhc2gucmVzb2x2ZSByZWxcbiAgICAgICAgcmV0dXJuIHJlbCBpZiBub3QgU2xhc2guaXNBYnNvbHV0ZSByZWxcbiAgICAgICAgaWYgU2xhc2gucmVzb2x2ZSh0bykgPT0gcmVsXG4gICAgICAgICAgICByZXR1cm4gJy4nXG5cbiAgICAgICAgW3JsLCByZF0gPSBTbGFzaC5zcGxpdERyaXZlIHJlbFxuICAgICAgICBbdG8sIHRkXSA9IFNsYXNoLnNwbGl0RHJpdmUgU2xhc2gucmVzb2x2ZSB0b1xuICAgICAgICBpZiByZCBhbmQgdGQgYW5kIHJkICE9IHRkXG4gICAgICAgICAgICByZXR1cm4gcmVsXG4gICAgICAgIFNsYXNoLnBhdGggcGF0aC5yZWxhdGl2ZSB0bywgcmxcbiAgICAgICAgXG4gICAgQGZpbGVVcmw6IChwKSAtPiBcImZpbGU6Ly8vI3tTbGFzaC5lbmNvZGUgcH1cIlxuXG4gICAgQHNhbWVQYXRoOiAoYSwgYikgLT4gU2xhc2gucmVzb2x2ZShhKSA9PSBTbGFzaC5yZXNvbHZlKGIpXG5cbiAgICBAZXNjYXBlOiAocCkgLT4gcC5yZXBsYWNlIC8oW1xcYFxcXCJdKS9nLCAnXFxcXCQxJ1xuXG4gICAgQGVuY29kZTogKHApIC0+XG4gICAgICAgIHAgPSBlbmNvZGVVUkkgcFxuICAgICAgICBwID0gcC5yZXBsYWNlIC9cXCMvZywgXCIlMjNcIlxuICAgICAgICBwID0gcC5yZXBsYWNlIC9cXCYvZywgXCIlMjZcIlxuICAgICAgICBwID0gcC5yZXBsYWNlIC9cXCcvZywgXCIlMjdcIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgICAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgICAwMDAgICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBwa2c6IChwKSAtPlxuICAgIFxuICAgICAgICBpZiBwPy5sZW5ndGg/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlIHAubGVuZ3RoIGFuZCBTbGFzaC5yZW1vdmVEcml2ZShwKSBub3QgaW4gWycuJywgJy8nLCAnJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5kaXJFeGlzdHMgIFNsYXNoLmpvaW4gcCwgJy5naXQnICAgICAgICAgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLm5vb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmZpbGVFeGlzdHMgU2xhc2guam9pbiBwLCAncGFja2FnZS5qc29uJyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbnVsbFxuXG4gICAgQGdpdDogKHApIC0+XG5cbiAgICAgICAgaWYgcD8ubGVuZ3RoP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSBwLmxlbmd0aCBhbmQgU2xhc2gucmVtb3ZlRHJpdmUocCkgbm90IGluIFsnLicsICcvJywgJyddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZGlyRXhpc3RzIFNsYXNoLmpvaW4gcCwgJy5naXQnIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBudWxsXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBAZXhpc3RzOiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgaWYgbm90IHA/XG4gICAgICAgICAgICAgICAgICAgIGNiKCkgXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5yZXNvbHZlIFNsYXNoLnJlbW92ZUxpbmVQb3MgcFxuICAgICAgICAgICAgICAgIGZzLmFjY2VzcyBwLCBmcy5SX09LIHwgZnMuRl9PSywgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKSBcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZnMuc3RhdCBwLCAoZXJyLCBzdGF0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2Igc3RhdFxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmV4aXN0cyAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBwP1xuICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBTbGFzaC5yZW1vdmVMaW5lUG9zIHBcbiAgICAgICAgICAgICAgICAgICAgaWYgc3RhdCA9IGZzLnN0YXRTeW5jKHApXG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIHAsIGZzLlJfT0tcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0XG4gICAgICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgICAgIGlmIGVyci5jb2RlIGluIFsnRU5PRU5UJywgJ0VOT1RESVInXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5leGlzdHMgLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgbnVsbCAgICAgXG4gICAgICAgIFxuICAgIEB0b3VjaDogKHApIC0+XG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyBTbGFzaC5kaXJuYW1lKHApLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLmZpbGVFeGlzdHMgcFxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgcCwgJydcbiAgICAgICAgICAgIHJldHVybiBwXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC50b3VjaCAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgQGZpbGVFeGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdD8uaXNGaWxlKCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNGaWxlKClcblxuICAgIEBkaXJFeGlzdHM6IChwLCBjYikgLT5cblxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRGlyZWN0b3J5KCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgXG4gICAgQGlzRGlyOiAgKHAsIGNiKSAtPiBTbGFzaC5kaXJFeGlzdHMgcCwgY2JcbiAgICBAaXNGaWxlOiAocCwgY2IpIC0+IFNsYXNoLmZpbGVFeGlzdHMgcCwgY2JcbiAgICBcbiAgICBAaXNXcml0YWJsZTogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2VzcyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PSywgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgY2Igbm90IGVycj9cbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guaXNXcml0YWJsZSAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICAgICAgICAgIGNiIGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgU2xhc2gucmVzb2x2ZShwKSwgZnMuUl9PSyB8IGZzLldfT0tcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgIEB1c2VyRGF0YTogLT5cbiAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICAgICAgaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlY3Ryb24ucmVtb3RlLmFwcC5nZXRQYXRoICd1c2VyRGF0YSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlY3Ryb24uYXBwLmdldFBhdGggJ3VzZXJEYXRhJ1xuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGlmIHBrZ0RpciA9IFNsYXNoLnBrZyBfX2Rpcm5hbWVcbiAgICAgICAgICAgICAgICAgICAgcGtnID0gcmVxdWlyZSBzbGFzaC5qb2luIHBrZ0RpciwgJ3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgICAgICAgICAgeyBzZHMgfSA9IHJlcXVpcmUgJy4va3hrJ1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gc2RzLmZpbmQudmFsdWUgcGtnLCAnbmFtZSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNsYXNoLnJlc29sdmUgXCJ+L0FwcERhdGEvUm9hbWluZy8je25hbWV9XCJcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gU2xhc2gucmVzb2x2ZSBcIn4vQXBwRGF0YS9Sb2FtaW5nL1wiXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuICAgIFxuICAgIEB0ZXh0ZXh0OiBudWxsXG4gICAgXG4gICAgQHRleHRiYXNlOiBcbiAgICAgICAgcHJvZmlsZToxXG4gICAgICAgIGxpY2Vuc2U6MVxuICAgICAgICAnLmdpdGlnbm9yZSc6MVxuICAgICAgICAnLm5wbWlnbm9yZSc6MVxuICAgIFxuICAgIEBpc1RleHQ6IChwKSAtPlxuICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGlmIG5vdCBTbGFzaC50ZXh0ZXh0XG4gICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dCA9IHt9XG4gICAgICAgICAgICAgICAgZm9yIGV4dCBpbiByZXF1aXJlICd0ZXh0ZXh0ZW5zaW9ucydcbiAgICAgICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dFtleHRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIFNsYXNoLnRleHRleHRbJ2NyeXB0J10gPSB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4dCA9IFNsYXNoLmV4dCBwXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBleHQgYW5kIFNsYXNoLnRleHRleHRbZXh0XT8gXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBTbGFzaC50ZXh0YmFzZVtTbGFzaC5iYXNlbmFtZShwKS50b0xvd2VyQ2FzZSgpXVxuICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBTbGFzaC5pc0ZpbGUgcFxuICAgICAgICAgICAgaXNCaW5hcnkgPSByZXF1aXJlICdpc2JpbmFyeWZpbGUnXG4gICAgICAgICAgICByZXR1cm4gbm90IGlzQmluYXJ5LmlzQmluYXJ5RmlsZVN5bmMgcFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guaXNUZXh0IC0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIFxuICAgIEByZWFkVGV4dDogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlIHAsICd1dGY4JywgKGVyciwgdGV4dCkgLT4gXG4gICAgICAgICAgICAgICAgICAgIGNiIG5vdCBlcnIgYW5kIHRleHQgb3IgJydcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gucmVhZFRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMgcCwgJ3V0ZjgnXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLnJlYWRUZXh0IC0tIFwiICsgU3RyaW5nKGVycilcblxuICAgIEB3cml0ZVRleHQ6IChwLCB0ZXh0LCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIHRtcGZpbGUgPSBTbGFzaC50bXBmaWxlKClcbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBAZmlsZUV4aXN0cyBwLCAoc3RhdCkgLT4gIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IHN0YXQ/Lm1vZGUgPyAwbzY2NlxuICAgIFxuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGUgdG1wZmlsZSwgdGV4dCwgbW9kZTptb2RlLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLm1vdmUgdG1wZmlsZSwgcCwgb3ZlcndyaXRlOnRydWUsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGVyciB0aGVuIGNiIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBjYiBwXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBjYiBTbGFzaC5lcnJvciBcIlNsYXNoLndyaXRlVGV4dCAtLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIHRtcGZpbGUsIHRleHRcbiAgICAgICAgICAgICAgICBmcy5tb3ZlU3luYyB0bXBmaWxlLCBwLCBvdmVyd3JpdGU6dHJ1ZVxuICAgICAgICAgICAgICAgIHBcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gud3JpdGVUZXh0IC0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgXG4gICAgQHRtcGZpbGU6IC0+IHJlcXVpcmUoJ3RtcC1maWxlcGF0aCcpKClcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAgICAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgICAgICAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAcmVnID0gbmV3IFJlZ0V4cCBcIlxcXFxcXFxcXCIsICdnJ1xuXG4gICAgQHdpbjogLT4gcGF0aC5zZXAgPT0gJ1xcXFwnXG4gICAgXG4gICAgQGVycm9yOiAobXNnKSAtPiBcbiAgICAgICAgaWYgQGxvZ0Vycm9ycyB0aGVuIGVycm9yIG1zZyBcbiAgICAgICAgJydcblxubW9kdWxlLmV4cG9ydHMgPSBTbGFzaFxuIl19
//# sourceURL=../coffee/kslash.coffee