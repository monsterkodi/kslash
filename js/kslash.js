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
        if (this.logErrors) {
            console.error(msg);
        }
        return '';
    };

    return Slash;

})();

module.exports = Slash;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0FBQ1AsRUFBQSxHQUFPLE9BQUEsQ0FBUSxJQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFFRDs7O0lBRUYsS0FBQyxDQUFBLFNBQUQsR0FBWTs7SUFRWixLQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsQ0FBRDtRQUNILElBQStDLGNBQUksQ0FBQyxDQUFFLGdCQUF0RDtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksd0JBQVosRUFBUDs7UUFDQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBSDtZQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWY7WUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7WUFDSixJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBWCxDQUFBLElBQXFCLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBcEM7Z0JBQ0ksQ0FBQSxHQUFJLENBQUUsYUFEVjthQUhKO1NBQUEsTUFBQTtZQU1JLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQUssQ0FBQyxHQUFoQixFQUFxQixHQUFyQjtZQUNKLENBQUEsR0FBSSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsRUFQUjs7ZUFRQTtJQVZHOztJQVlQLEtBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxDQUFEO1FBQ04sSUFBa0QsY0FBSSxDQUFDLENBQUUsZ0JBQXpEO0FBQUEsbUJBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBWSwyQkFBWixFQUFQOztRQUNBLENBQUEsR0FBSSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7UUFDSixJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEs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QWMsT0FBZCxFQUF1QixDQUF2QjtnQkFDQSxFQUFFLENBQUMsTUFBSCxDQUFVLE9BQVYsRUFBbUIsU0FBQSxHQUFBLENBQW5CO3VCQUNBLEVBSko7YUFBQSxhQUFBO2dCQUtNO3VCQUNGLEtBQUssQ0FBQyxLQUFOLENBQVkscUJBQUEsR0FBd0IsTUFBQSxDQUFPLEdBQVAsQ0FBcEMsRUFOSjthQWJKOztJQUpROztJQXlCWixLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7ZUFBRyxPQUFBLENBQVEsY0FBUixDQUFBLENBQUE7SUFBSDs7SUFRVixLQUFDLENBQUEsR0FBRCxHQUFPLElBQUksTUFBSixDQUFXLE1BQVgsRUFBbUIsR0FBbkI7O0lBRVAsS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFBO2VBQUcsSUFBSSxDQUFDLEdBQUwsS0FBWTtJQUFmOztJQUVOLEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxHQUFEO1FBQ0osSUFBRyxJQUFDLENBQUEsU0FBSjtZQUFZLE9BQUEsQ0FBTyxLQUFQLENBQWEsR0FBYixFQUFaOztlQUNBO0lBRkk7Ozs7OztBQUlaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAgXG4wMDAgIDAwMCAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgXG4jIyNcblxub3MgICA9IHJlcXVpcmUgJ29zJ1xuZnMgICA9IHJlcXVpcmUgJ2ZzJyBcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5jbGFzcyBTbGFzaFxuICAgIFxuICAgIEBsb2dFcnJvcnM6IGZhbHNlXG5cbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBwYXRoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aCAtLSBubyBwYXRoP1wiIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgaWYgU2xhc2gud2luKClcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwICAgICBcbiAgICAgICAgICAgIHAgPSBwLnJlcGxhY2UgU2xhc2gucmVnLCAnLydcbiAgICAgICAgICAgIGlmIHAuZW5kc1dpdGgoJzouJykgYW5kIHAubGVuZ3RoID09IDNcbiAgICAgICAgICAgICAgICBwID0gcFsuLjFdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHAgPSBwLnJlcGxhY2UgU2xhc2gucmVnLCAnLydcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwICAgICAgICAgICAgXG4gICAgICAgIHBcbiAgICAgICAgXG4gICAgQHVuc2xhc2g6IChwKSAtPlxuICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC51bnNsYXNoIC0tIG5vIHBhdGg/XCIgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIGlmIFNsYXNoLndpbigpXG4gICAgICAgICAgICBpZiBwLmxlbmd0aCA+PSAzIGFuZCBwWzBdID09ICcvJyA9PSBwWzJdIFxuICAgICAgICAgICAgICAgIHAgPSBwWzFdICsgJzonICsgcC5zbGljZSAyXG4gICAgICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcFxuICAgICAgICAgICAgaWYgcFsxXSA9PSAnOidcbiAgICAgICAgICAgICAgICBwID0gIHBbMF0udG9VcHBlckNhc2UoKSArIHBbMS4uXVxuICAgICAgICBwXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzcGxpdDogKHApIC0+IFNsYXNoLnBhdGgocCkuc3BsaXQoJy8nKS5maWx0ZXIgKGUpIC0+IGUubGVuZ3RoXG4gICAgXG4gICAgQHNwbGl0RHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBwYXJzZWQgPSBTbGFzaC5wYXJzZSBwXG4gICAgICAgIHJvb3QgPSBwYXJzZWQucm9vdFxuXG4gICAgICAgIGlmIHJvb3QubGVuZ3RoID4gMVxuICAgICAgICAgICAgaWYgcC5sZW5ndGggPiByb290Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gcC5zbGljZShyb290Lmxlbmd0aC0xKVxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9ICcvJ1xuICAgICAgICAgICAgcmV0dXJuIFtmaWxlUGF0aCAsIHJvb3Quc2xpY2UgMCwgcm9vdC5sZW5ndGgtMl1cbiAgICAgICAgZWxzZSBpZiBwYXJzZWQuZGlyLmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGlmIHBhcnNlZC5kaXJbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtwWzIuLl0sIHBhcnNlZC5kaXJbMF1dXG4gICAgICAgIGVsc2UgaWYgcGFyc2VkLmJhc2UubGVuZ3RoID09IDJcbiAgICAgICAgICAgIGlmIHBhcnNlZC5iYXNlWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHJldHVybiBbJy8nLCBwYXJzZWQuYmFzZVswXV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgW1NsYXNoLnBhdGgocCksICcnXVxuICAgICAgICBcbiAgICBAcmVtb3ZlRHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFNsYXNoLnNwbGl0RHJpdmUocClbMF1cbiAgXG4gICAgQGlzUm9vdDogKHApIC0+IFNsYXNoLnJlbW92ZURyaXZlKHApID09ICcvJ1xuICAgICAgICBcbiAgICBAc3BsaXRGaWxlTGluZTogKHApIC0+ICAjIGZpbGUudHh0OjE6MCAtLT4gWydmaWxlLnR4dCcsIDEsIDBdXG4gICAgICAgIFxuICAgICAgICBbZixkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcFxuICAgICAgICBzcGxpdCA9IFN0cmluZyhmKS5zcGxpdCAnOidcbiAgICAgICAgbGluZSA9IHBhcnNlSW50IHNwbGl0WzFdIGlmIHNwbGl0Lmxlbmd0aCA+IDFcbiAgICAgICAgY2xtbiA9IHBhcnNlSW50IHNwbGl0WzJdIGlmIHNwbGl0Lmxlbmd0aCA+IDJcbiAgICAgICAgbCA9IGMgPSAwXG4gICAgICAgIGwgPSBsaW5lIGlmIE51bWJlci5pc0ludGVnZXIgbGluZVxuICAgICAgICBjID0gY2xtbiBpZiBOdW1iZXIuaXNJbnRlZ2VyIGNsbW5cbiAgICAgICAgZCA9IGQgKyAnOicgaWYgZCAhPSAnJ1xuICAgICAgICBbIGQgKyBzcGxpdFswXSwgTWF0aC5tYXgobCwxKSwgIE1hdGgubWF4KGMsMCkgXVxuICAgICAgICBcbiAgICBAc3BsaXRGaWxlUG9zOiAocCkgLT4gIyBmaWxlLnR4dDoxOjMgLS0+IFsnZmlsZS50eHQnLCBbMywgMF1dXG4gICAgXG4gICAgICAgIFtmLGwsY10gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgW2YsIFtjLCBsLTFdXVxuICAgICAgICBcbiAgICBAcmVtb3ZlTGluZVBvczogKHApIC0+IFNsYXNoLnNwbGl0RmlsZUxpbmUocClbMF1cbiAgICBAcmVtb3ZlQ29sdW1uOiAgKHApIC0+IFxuICAgICAgICBbZixsXSA9IFNsYXNoLnNwbGl0RmlsZUxpbmUgcFxuICAgICAgICBpZiBsPjEgdGhlbiBmICsgJzonICsgbFxuICAgICAgICBlbHNlIGZcbiAgICAgICAgXG4gICAgQGV4dDogICAgICAgKHApIC0+IHBhdGguZXh0bmFtZShwKS5zbGljZSAxXG4gICAgQHNwbGl0RXh0OiAgKHApIC0+IFtTbGFzaC5yZW1vdmVFeHQocCksIFNsYXNoLmV4dChwKV1cbiAgICBAcmVtb3ZlRXh0OiAocCkgLT4gU2xhc2guam9pbiBTbGFzaC5kaXIocCksIFNsYXNoLmJhc2UgcFxuICAgIEBzd2FwRXh0OiAgIChwLCBleHQpIC0+IFNsYXNoLnJlbW92ZUV4dChwKSArIChleHQuc3RhcnRzV2l0aCgnLicpIGFuZCBleHQgb3IgXCIuI3tleHR9XCIpXG4gICAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGpvaW46IC0+IFtdLm1hcC5jYWxsKGFyZ3VtZW50cywgU2xhc2gucGF0aCkuam9pbiAnLydcbiAgICBcbiAgICBAam9pbkZpbGVQb3M6IChmaWxlLCBwb3MpIC0+ICMgWydmaWxlLnR4dCcsIFszLCAwXV0gLS0+IGZpbGUudHh0OjE6M1xuICAgICAgICBcbiAgICAgICAgZmlsZSA9IFNsYXNoLnJlbW92ZUxpbmVQb3MgZmlsZVxuICAgICAgICBpZiBub3QgcG9zPyBvciBub3QgcG9zWzBdP1xuICAgICAgICAgICAgZmlsZVxuICAgICAgICBlbHNlIGlmIHBvc1swXVxuICAgICAgICAgICAgZmlsZSArIFwiOiN7cG9zWzFdKzF9OiN7cG9zWzBdfVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGUgKyBcIjoje3Bvc1sxXSsxfVwiXG4gICAgICAgICAgICAgICAgXG4gICAgQGpvaW5GaWxlTGluZTogKGZpbGUsIGxpbmUsIGNvbCkgLT4gIyAnZmlsZS50eHQnLCAxLCAyIC0tPiBmaWxlLnR4dDoxOjJcbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBTbGFzaC5yZW1vdmVMaW5lUG9zIGZpbGVcbiAgICAgICAgcmV0dXJuIGZpbGUgaWYgbm90IGxpbmVcbiAgICAgICAgcmV0dXJuIFwiI3tmaWxlfToje2xpbmV9XCIgaWYgbm90IGNvbFxuICAgICAgICBcIiN7ZmlsZX06I3tsaW5lfToje2NvbH1cIlxuICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBwYXRobGlzdDogKHApIC0+ICMgJy9yb290L2Rpci9maWxlLnR4dCcgLS0+IFsnLycsICcvcm9vdCcsICcvcm9vdC9kaXInLCAnL3Jvb3QvZGlyL2ZpbGUudHh0J11cbiAgICBcbiAgICAgICAgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5wYXRobGlzdCAtLSBubyBwYXRoP1wiIFxuICAgICAgICAgICAgcmV0dXJuIFtdXG4gICAgICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLm5vcm1hbGl6ZSBwXG4gICAgICAgIGlmIHAubGVuZ3RoID4gMSBhbmQgcFtwLmxlbmd0aC0xXSA9PSAnLycgYW5kIHBbcC5sZW5ndGgtMl0gIT0gJzonXG4gICAgICAgICAgICBwID0gcFsuLi5wLmxlbmd0aC0xXSBcbiAgICAgICAgbGlzdCA9IFtwXVxuICAgICAgICB3aGlsZSBTbGFzaC5kaXIocCkgIT0gJydcbiAgICAgICAgICAgIGxpc3QudW5zaGlmdCBTbGFzaC5kaXIgcFxuICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIGxpc3RcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgICAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgMDAwICAwMDAgIDAwMCAgIFxuICAgIFxuICAgIEBiYXNlOiAgICAgICAocCkgICAtPiBwYXRoLmJhc2VuYW1lIFNsYXNoLnNhbml0aXplKHApLCBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZmlsZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIEBleHRuYW1lOiAgICAocCkgICAtPiBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAYmFzZW5hbWU6ICAgKHAsZSkgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgZVxuICAgIEBpc0Fic29sdXRlOiAocCkgICAtPiBwID0gU2xhc2guc2FuaXRpemUocCk7IHBbMV0gPT0gJzonIG9yIHBhdGguaXNBYnNvbHV0ZSBwXG4gICAgQGlzUmVsYXRpdmU6IChwKSAgIC0+IG5vdCBTbGFzaC5pc0Fic29sdXRlIHBcbiAgICBAZGlybmFtZTogICAgKHApICAgLT4gU2xhc2gucGF0aCBwYXRoLmRpcm5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAbm9ybWFsaXplOiAgKHApICAgLT4gU2xhc2gucGF0aCBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAZGlyOiAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBwID0gU2xhc2gubm9ybWFsaXplIHBcbiAgICAgICAgaWYgU2xhc2guaXNSb290IHAgdGhlbiByZXR1cm4gJydcbiAgICAgICAgcCA9IHBhdGguZGlybmFtZSBwXG4gICAgICAgIGlmIHAgPT0gJy4nIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgaWYgcC5lbmRzV2l0aCgnOicpIGFuZCBwLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICBwICs9ICcvJ1xuICAgICAgICBwXG4gICAgICAgIFxuICAgIEBzYW5pdGl6ZTogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2guc2FuaXRpemUgLS0gbm8gcGF0aD9cIiBcbiAgICAgICAgaWYgcFswXSA9PSAnXFxuJ1xuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJsZWFkaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAxXG4gICAgICAgIGlmIHAuZW5kc1dpdGggJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwidHJhaWxpbmcgbmV3bGluZSBpbiBwYXRoISAnI3twfSdcIlxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLnNhbml0aXplIHAuc3Vic3RyIDAsIHAubGVuZ3RoLTFcbiAgICAgICAgcFxuICAgIFxuICAgIEBwYXJzZTogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgZGljdCA9IHBhdGgucGFyc2UgcFxuICAgICAgICBcbiAgICAgICAgaWYgZGljdC5kaXIubGVuZ3RoID09IDIgYW5kIGRpY3QuZGlyWzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5kaXIgKz0gJy8nXG4gICAgICAgIGlmIGRpY3Qucm9vdC5sZW5ndGggPT0gMiBhbmQgZGljdC5yb290WzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5yb290ICs9ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgIGRpY3RcbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBob21lOiAgICAgICAgICAtPiBTbGFzaC5wYXRoIG9zLmhvbWVkaXIoKVxuICAgIEB0aWxkZTogICAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIFNsYXNoLmhvbWUoKSwgJ34nXG4gICAgQHVudGlsZGU6ICAgKHApIC0+IFNsYXNoLnBhdGgocCk/LnJlcGxhY2UgL15cXH4vLCBTbGFzaC5ob21lKClcbiAgICBAdW5lbnY6ICAgICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpID0gcC5pbmRleE9mICckJywgMFxuICAgICAgICB3aGlsZSBpID49IDBcbiAgICAgICAgICAgIGZvciBrLHYgb2YgcHJvY2Vzcy5lbnZcbiAgICAgICAgICAgICAgICBpZiBrID09IHAuc2xpY2UgaSsxLCBpKzEray5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcCA9IHAuc2xpY2UoMCwgaSkgKyB2ICsgcC5zbGljZShpK2subGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpID0gcC5pbmRleE9mICckJywgaSsxXG4gICAgICAgICAgICBcbiAgICAgICAgU2xhc2gucGF0aCBwXG4gICAgXG4gICAgQHJlc29sdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcCA9IHByb2Nlc3MuY3dkKCkgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBcbiAgICAgICAgcCA9IFNsYXNoLnVuZW52IFNsYXNoLnVudGlsZGUgcFxuICAgICAgICBcbiAgICAgICAgaWYgU2xhc2guaXNSZWxhdGl2ZSBwXG4gICAgICAgICAgICBwID0gU2xhc2gucGF0aCBwYXRoLnJlc29sdmUgcFxuICAgICAgICBwXG4gICAgXG4gICAgQHJlbGF0aXZlOiAocmVsLCB0bykgLT5cbiAgICAgICAgXG4gICAgICAgIHRvID0gcHJvY2Vzcy5jd2QoKSBpZiBub3QgdG8/Lmxlbmd0aFxuICAgICAgICByZWwgPSBTbGFzaC5yZXNvbHZlIHJlbFxuICAgICAgICByZXR1cm4gcmVsIGlmIG5vdCBTbGFzaC5pc0Fic29sdXRlIHJlbFxuICAgICAgICBpZiBTbGFzaC5yZXNvbHZlKHRvKSA9PSByZWxcbiAgICAgICAgICAgIHJldHVybiAnLidcblxuICAgICAgICBbcmwsIHJkXSA9IFNsYXNoLnNwbGl0RHJpdmUgcmVsXG4gICAgICAgIFt0bywgdGRdID0gU2xhc2guc3BsaXREcml2ZSBTbGFzaC5yZXNvbHZlIHRvXG4gICAgICAgIGlmIHJkIGFuZCB0ZCBhbmQgcmQgIT0gdGRcbiAgICAgICAgICAgIHJldHVybiByZWxcbiAgICAgICAgU2xhc2gucGF0aCBwYXRoLnJlbGF0aXZlIHRvLCBybFxuICAgICAgICBcbiAgICBAZmlsZVVybDogKHApIC0+IFwiZmlsZTovLy8je1NsYXNoLmVuY29kZSBwfVwiXG5cbiAgICBAc2FtZVBhdGg6IChhLCBiKSAtPiBTbGFzaC5yZXNvbHZlKGEpID09IFNsYXNoLnJlc29sdmUoYilcblxuICAgIEBlc2NhcGU6IChwKSAtPiBwLnJlcGxhY2UgLyhbXFxgXFxcIl0pL2csICdcXFxcJDEnXG5cbiAgICBAZW5jb2RlOiAocCkgLT5cbiAgICAgICAgcCA9IGVuY29kZVVSSSBwXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcIy9nLCBcIiUyM1wiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJi9nLCBcIiUyNlwiXG4gICAgICAgIHAgPSBwLnJlcGxhY2UgL1xcJy9nLCBcIiUyN1wiXG5cbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAgIDAwMCAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAwMDAgICAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHBrZzogKHApIC0+XG4gICAgXG4gICAgICAgIGlmIHA/Lmxlbmd0aD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nLCAnLycsICcnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyAgU2xhc2guam9pbiBwLCAnLmdpdCcgICAgICAgICB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2Uubm9vbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLmpzb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBudWxsXG5cbiAgICBAZ2l0OiAocCkgLT5cblxuICAgICAgICBpZiBwPy5sZW5ndGg/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlIHAubGVuZ3RoIGFuZCBTbGFzaC5yZW1vdmVEcml2ZShwKSBub3QgaW4gWycuJywgJy8nLCAnJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5kaXJFeGlzdHMgU2xhc2guam9pbiBwLCAnLmdpdCcgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBleGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpZiBub3QgcD9cbiAgICAgICAgICAgICAgICAgICAgY2IoKSBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzIHAsIGZzLlJfT0sgfCBmcy5GX09LLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5zdGF0IHAsIChlcnIsIHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYiBzdGF0XG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guZXhpc3RzIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHA/XG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5yZXNvbHZlIFNsYXNoLnJlbW92ZUxpbmVQb3MgcFxuICAgICAgICAgICAgICAgICAgICBpZiBzdGF0ID0gZnMuc3RhdFN5bmMocClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgcCwgZnMuUl9PS1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRcbiAgICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAgICAgaWYgZXJyLmNvZGUgaW4gWydFTk9FTlQnLCAnRU5PVERJUiddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmV4aXN0cyAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICBudWxsICAgICBcbiAgICAgICAgXG4gICAgQHRvdWNoOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZnMubWtkaXJTeW5jIFNsYXNoLmRpcm5hbWUocCksIHJlY3Vyc2l2ZTp0cnVlXG4gICAgICAgICAgICBpZiBub3QgU2xhc2guZmlsZUV4aXN0cyBwXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBwLCAnJ1xuICAgICAgICAgICAgcmV0dXJuIHBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLnRvdWNoIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICBcbiAgICBAZmlsZUV4aXN0czogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIFNsYXNoLmV4aXN0cyBwLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBzdGF0Py5pc0ZpbGUoKSB0aGVuIGNiIHN0YXRcbiAgICAgICAgICAgICAgICBlbHNlIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdCA9IFNsYXNoLmV4aXN0cyBwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXQgaWYgc3RhdC5pc0ZpbGUoKVxuXG4gICAgQGRpckV4aXN0czogKHAsIGNiKSAtPlxuXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdD8uaXNEaXJlY3RvcnkoKSB0aGVuIGNiIHN0YXRcbiAgICAgICAgICAgICAgICBlbHNlIGNiKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdCA9IFNsYXNoLmV4aXN0cyBwXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXQgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICBcbiAgICBAaXNEaXI6ICAocCwgY2IpIC0+IFNsYXNoLmRpckV4aXN0cyBwLCBjYlxuICAgIEBpc0ZpbGU6IChwLCBjYikgLT4gU2xhc2guZmlsZUV4aXN0cyBwLCBjYlxuICAgIFxuICAgIEBpc1dyaXRhYmxlOiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzIFNsYXNoLnJlc29sdmUocCksIGZzLlJfT0sgfCBmcy5XX09LLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICBjYiBub3QgZXJyP1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5pc1dyaXRhYmxlIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgICAgICAgICAgY2IgZmFsc2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PS1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQHVzZXJEYXRhOiAtPlxuICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgICAgICBpZiBwcm9jZXNzLnR5cGUgPT0gJ3JlbmRlcmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVjdHJvbi5yZW1vdGUuYXBwLmdldFBhdGggJ3VzZXJEYXRhJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVjdHJvbi5hcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgaWYgcGtnRGlyID0gU2xhc2gucGtnIF9fZGlybmFtZVxuICAgICAgICAgICAgICAgICAgICBwa2cgPSByZXF1aXJlIHNsYXNoLmpvaW4gcGtnRGlyLCAncGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgICAgICAgICB7IHNkcyB9ID0gcmVxdWlyZSAnLi9reGsnXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBzZHMuZmluZC52YWx1ZSBwa2csICduYW1lJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU2xhc2gucmVzb2x2ZSBcIn4vQXBwRGF0YS9Sb2FtaW5nLyN7bmFtZX1cIlxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBTbGFzaC5yZXNvbHZlIFwifi9BcHBEYXRhL1JvYW1pbmcvXCJcblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4gICAgXG4gICAgQHRleHRleHQ6IG51bGxcbiAgICBcbiAgICBAdGV4dGJhc2U6IFxuICAgICAgICBwcm9maWxlOjFcbiAgICAgICAgbGljZW5zZToxXG4gICAgICAgICcuZ2l0aWdub3JlJzoxXG4gICAgICAgICcubnBtaWdub3JlJzoxXG4gICAgXG4gICAgQGlzVGV4dDogKHApIC0+XG4gICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLnRleHRleHRcbiAgICAgICAgICAgICAgICBTbGFzaC50ZXh0ZXh0ID0ge31cbiAgICAgICAgICAgICAgICBmb3IgZXh0IGluIHJlcXVpcmUgJ3RleHRleHRlbnNpb25zJ1xuICAgICAgICAgICAgICAgICAgICBTbGFzaC50ZXh0ZXh0W2V4dF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dFsnY3J5cHQnXSA9IHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXh0ID0gU2xhc2guZXh0IHBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGV4dCBhbmQgU2xhc2gudGV4dGV4dFtleHRdPyBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIFNsYXNoLnRleHRiYXNlW1NsYXNoLmJhc2VuYW1lKHApLnRvTG93ZXJDYXNlKCldXG4gICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IFNsYXNoLmlzRmlsZSBwXG4gICAgICAgICAgICBpc0JpbmFyeSA9IHJlcXVpcmUgJ2lzYmluYXJ5ZmlsZSdcbiAgICAgICAgICAgIHJldHVybiBub3QgaXNCaW5hcnkuaXNCaW5hcnlGaWxlU3luYyBwXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5pc1RleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgQHJlYWRUZXh0OiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGUgcCwgJ3V0ZjgnLCAoZXJyLCB0ZXh0KSAtPiBcbiAgICAgICAgICAgICAgICAgICAgY2Igbm90IGVyciBhbmQgdGV4dCBvciAnJ1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC5yZWFkVGV4dCAtLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyBwLCAndXRmOCdcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gucmVhZFRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuXG4gICAgQHdyaXRlVGV4dDogKHAsIHRleHQsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgdG1wZmlsZSA9IFNsYXNoLnRtcGZpbGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZSB0bXBmaWxlLCB0ZXh0LCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnIgXG4gICAgICAgICAgICAgICAgICAgICAgICBjYiBTbGFzaC5lcnJvciBcIlNsYXNoLndyaXRlVGV4dCAtIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVuYW1lIHRtcGZpbGUsIHAsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZXJyIHRoZW4gY2IgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgY2IgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLnVubGluayB0bXBmaWxlLCAtPlxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgY2IgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyB0bXBmaWxlLCB0ZXh0XG4gICAgICAgICAgICAgICAgZnMucmVuYW1lU3luYyB0bXBmaWxlLCBwXG4gICAgICAgICAgICAgICAgZnMudW5saW5rIHRtcGZpbGUsIC0+XG4gICAgICAgICAgICAgICAgcFxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC53cml0ZVRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICBcbiAgICBAdG1wZmlsZTogLT4gcmVxdWlyZSgndG1wLWZpbGVwYXRoJykoKVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEByZWcgPSBuZXcgUmVnRXhwIFwiXFxcXFxcXFxcIiwgJ2cnXG5cbiAgICBAd2luOiAtPiBwYXRoLnNlcCA9PSAnXFxcXCdcbiAgICBcbiAgICBAZXJyb3I6IChtc2cpIC0+IFxuICAgICAgICBpZiBAbG9nRXJyb3JzIHRoZW4gZXJyb3IgbXNnIFxuICAgICAgICAnJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNsYXNoXG4iXX0=
//# sourceURL=../coffee/kslash.coffee