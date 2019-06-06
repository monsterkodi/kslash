// koffee 0.56.0

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
        return Slash.path(p);
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
            if (Slash.textbase[Slash.basename(f).toLowerCase()]) {
                return true;
            }
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
                    return cb((err == null) && text || '');
                });
            } catch (error) {
                err = error;
                return Slash.error("Slash.readText -- " + String(err));
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

    Slash.reg = new RegExp("\\\\", 'g');

    Slash.win = function() {
        return path.sep === '\\';
    };

    Slash.error = function(msg) {
        return '';
    };

    return Slash;

})();

module.exports = Slash;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0FBQ1AsRUFBQSxHQUFPLE9BQUEsQ0FBUSxJQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFFRDs7O0lBUUYsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLENBQUQ7UUFDSCxJQUErQyxjQUFJLENBQUMsQ0FBRSxnQkFBdEQ7QUFBQSxtQkFBTyxLQUFLLENBQUMsS0FBTixDQUFZLHdCQUFaLEVBQVA7O1FBQ0EsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUg7WUFDSSxDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmO1lBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBSyxDQUFDLEdBQWhCLEVBQXFCLEdBQXJCO1lBQ0osSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLElBQVgsQ0FBQSxJQUFxQixDQUFDLENBQUMsTUFBRixLQUFZLENBQXBDO2dCQUNJLENBQUEsR0FBSSxDQUFFLGFBRFY7YUFISjtTQUFBLE1BQUE7WUFNSSxDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsR0FBaEIsRUFBcUIsR0FBckI7WUFDSixDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBUFI7O2VBUUE7SUFWRzs7SUFZUCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtRQUNOLElBQWtELGNBQUksQ0FBQyxDQUFFLGdCQUF6RDtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksMkJBQVosRUFBUDs7UUFDQSxDQUFBLEdBQUksS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYO1FBQ0osSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUg7WUFDSSxJQUFHLENBQUMsQ0FBQyxNQUFGLElBQVksQ0FBWixJQUFrQixDQUFBLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxHQUFSLElBQVEsR0FBUixLQUFlLENBQUUsQ0FBQSxDQUFBLENBQWpCLENBQXJCO2dCQUNJLENBQUEsR0FBSSxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sR0FBUCxHQUFhLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBUixFQURyQjs7WUFFQSxDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmO1lBQ0osSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsR0FBWDtnQkFDSSxDQUFBLEdBQUssQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQUwsQ0FBQSxDQUFBLEdBQXFCLENBQUUsVUFEaEM7YUFKSjs7ZUFNQTtJQVRNOztJQWlCVixLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsQ0FBRDtlQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUFhLENBQUMsS0FBZCxDQUFvQixHQUFwQixDQUF3QixDQUFDLE1BQXpCLENBQWdDLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUM7UUFBVCxDQUFoQztJQUFQOztJQUVSLEtBQUMsQ0FBQSxVQUFELEdBQWEsU0FBQyxDQUFEO0FBRVQsWUFBQTtRQUFBLENBQUEsR0FBSSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7UUFDSixNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQU4sQ0FBWSxDQUFaO1FBQ1QsSUFBQSxHQUFPLE1BQU0sQ0FBQztRQUVkLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFqQjtZQUNJLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxJQUFJLENBQUMsTUFBbkI7Z0JBQ0ksUUFBQSxHQUFXLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBSSxDQUFDLE1BQUwsR0FBWSxDQUFwQixFQURmO2FBQUEsTUFBQTtnQkFHSSxRQUFBLEdBQVcsSUFIZjs7QUFJQSxtQkFBTyxDQUFDLFFBQUQsRUFBWSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBYyxJQUFJLENBQUMsTUFBTCxHQUFZLENBQTFCLENBQVosRUFMWDtTQUFBLE1BTUssSUFBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQVgsR0FBb0IsQ0FBdkI7WUFDRCxJQUFHLE1BQU0sQ0FBQyxHQUFJLENBQUEsQ0FBQSxDQUFYLEtBQWlCLEdBQXBCO0FBQ0ksdUJBQU8sQ0FBQyxDQUFFLFNBQUgsRUFBUyxNQUFNLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBcEIsRUFEWDthQURDO1NBQUEsTUFHQSxJQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBWixLQUFzQixDQUF6QjtZQUNELElBQUcsTUFBTSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQVosS0FBa0IsR0FBckI7QUFDSSx1QkFBTyxDQUFDLEdBQUQsRUFBTSxNQUFNLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBbEIsRUFEWDthQURDOztlQUlMLENBQUMsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQUQsRUFBZ0IsRUFBaEI7SUFuQlM7O0lBcUJiLEtBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxDQUFEO0FBRVYsZUFBTyxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQixDQUFvQixDQUFBLENBQUE7SUFGakI7O0lBSWQsS0FBQyxDQUFBLE1BQUQsR0FBUyxTQUFDLENBQUQ7ZUFBTyxLQUFLLENBQUMsV0FBTixDQUFrQixDQUFsQixDQUFBLEtBQXdCO0lBQS9COztJQUVULEtBQUMsQ0FBQSxhQUFELEdBQWdCLFNBQUMsQ0FBRDtBQUVaLFlBQUE7UUFBQSxNQUFRLEtBQUssQ0FBQyxVQUFOLENBQWlCLENBQWpCLENBQVIsRUFBQyxVQUFELEVBQUc7UUFDSCxLQUFBLEdBQVEsTUFBQSxDQUFPLENBQVAsQ0FBUyxDQUFDLEtBQVYsQ0FBZ0IsR0FBaEI7UUFDUixJQUE0QixLQUFLLENBQUMsTUFBTixHQUFlLENBQTNDO1lBQUEsSUFBQSxHQUFPLFFBQUEsQ0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmLEVBQVA7O1FBQ0EsSUFBNEIsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUEzQztZQUFBLElBQUEsR0FBTyxRQUFBLENBQVMsS0FBTSxDQUFBLENBQUEsQ0FBZixFQUFQOztRQUNBLENBQUEsR0FBSSxDQUFBLEdBQUk7UUFDUixJQUFZLE1BQU0sQ0FBQyxTQUFQLENBQWlCLElBQWpCLENBQVo7WUFBQSxDQUFBLEdBQUksS0FBSjs7UUFDQSxJQUFZLE1BQU0sQ0FBQyxTQUFQLENBQWlCLElBQWpCLENBQVo7WUFBQSxDQUFBLEdBQUksS0FBSjs7UUFDQSxJQUFlLENBQUEsS0FBSyxFQUFwQjtZQUFBLENBQUEsR0FBSSxDQUFBLEdBQUksSUFBUjs7ZUFDQSxDQUFFLENBQUEsR0FBSSxLQUFNLENBQUEsQ0FBQSxDQUFaLEVBQWdCLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFXLENBQVgsQ0FBaEIsRUFBZ0MsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVcsQ0FBWCxDQUFoQztJQVZZOztJQVloQixLQUFDLENBQUEsWUFBRCxHQUFlLFNBQUMsQ0FBRDtBQUVYLFlBQUE7UUFBQSxNQUFVLEtBQUssQ0FBQyxhQUFOLENBQW9CLENBQXBCLENBQVYsRUFBQyxVQUFELEVBQUcsVUFBSCxFQUFLO2VBQ0wsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFELEVBQUksQ0FBQSxHQUFFLENBQU4sQ0FBSjtJQUhXOztJQUtmLEtBQUMsQ0FBQSxhQUFELEdBQWdCLFNBQUMsQ0FBRDtlQUFPLEtBQUssQ0FBQyxhQUFOLENBQW9CLENBQXBCLENBQXVCLENBQUEsQ0FBQTtJQUE5Qjs7SUFDaEIsS0FBQyxDQUFBLFlBQUQsR0FBZ0IsU0FBQyxDQUFEO0FBQ1osWUFBQTtRQUFBLE1BQVEsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsQ0FBcEIsQ0FBUixFQUFDLFVBQUQsRUFBRztRQUNILElBQUcsQ0FBQSxHQUFFLENBQUw7bUJBQVksQ0FBQSxHQUFJLEdBQUosR0FBVSxFQUF0QjtTQUFBLE1BQUE7bUJBQ0ssRUFETDs7SUFGWTs7SUFLaEIsS0FBQyxDQUFBLEdBQUQsR0FBWSxTQUFDLENBQUQ7ZUFBTyxJQUFJLENBQUMsT0FBTCxDQUFhLENBQWIsQ0FBZSxDQUFDLEtBQWhCLENBQXNCLENBQXRCO0lBQVA7O0lBQ1osS0FBQyxDQUFBLFFBQUQsR0FBWSxTQUFDLENBQUQ7ZUFBTyxDQUFDLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLENBQUQsRUFBcUIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBQXJCO0lBQVA7O0lBQ1osS0FBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLENBQUQ7ZUFBTyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFYLEVBQXlCLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUF6QjtJQUFQOztJQUNaLEtBQUMsQ0FBQSxPQUFELEdBQVksU0FBQyxDQUFELEVBQUksR0FBSjtlQUFZLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCLENBQUEsR0FBcUIsQ0FBQyxHQUFHLENBQUMsVUFBSixDQUFlLEdBQWYsQ0FBQSxJQUF3QixHQUF4QixJQUErQixDQUFBLEdBQUEsR0FBSSxHQUFKLENBQWhDO0lBQWpDOztJQVFaLEtBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtlQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBUCxDQUFZLFNBQVosRUFBdUIsS0FBSyxDQUFDLElBQTdCLENBQWtDLENBQUMsSUFBbkMsQ0FBd0MsR0FBeEM7SUFBSDs7SUFFUCxLQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsSUFBRCxFQUFPLEdBQVA7UUFFVixJQUFBLEdBQU8sS0FBSyxDQUFDLGFBQU4sQ0FBb0IsSUFBcEI7UUFDUCxJQUFPLGFBQUosSUFBZ0IsZ0JBQW5CO21CQUNJLEtBREo7U0FBQSxNQUVLLElBQUcsR0FBSSxDQUFBLENBQUEsQ0FBUDttQkFDRCxJQUFBLEdBQU8sQ0FBQSxHQUFBLEdBQUcsQ0FBQyxHQUFJLENBQUEsQ0FBQSxDQUFKLEdBQU8sQ0FBUixDQUFILEdBQWEsR0FBYixHQUFnQixHQUFJLENBQUEsQ0FBQSxDQUFwQixFQUROO1NBQUEsTUFBQTttQkFHRCxJQUFBLEdBQU8sQ0FBQSxHQUFBLEdBQUcsQ0FBQyxHQUFJLENBQUEsQ0FBQSxDQUFKLEdBQU8sQ0FBUixDQUFILEVBSE47O0lBTEs7O0lBVWQsS0FBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsR0FBYjtRQUVYLElBQUEsR0FBTyxLQUFLLENBQUMsYUFBTixDQUFvQixJQUFwQjtRQUNQLElBQWUsQ0FBSSxJQUFuQjtBQUFBLG1CQUFPLEtBQVA7O1FBQ0EsSUFBNEIsQ0FBSSxHQUFoQztBQUFBLG1CQUFVLElBQUQsR0FBTSxHQUFOLEdBQVMsS0FBbEI7O2VBQ0csSUFBRCxHQUFNLEdBQU4sR0FBUyxJQUFULEdBQWMsR0FBZCxHQUFpQjtJQUxSOztJQWFmLEtBQUMsQ0FBQSxRQUFELEdBQVcsU0FBQyxDQUFEO0FBRVAsWUFBQTtRQUFBLElBQUcsY0FBSSxDQUFDLENBQUUsZ0JBQVY7WUFDSSxLQUFLLENBQUMsS0FBTixDQUFZLDRCQUFaO0FBQ0EsbUJBQU8sR0FGWDs7UUFJQSxDQUFBLEdBQUksS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEI7UUFDSixJQUFHLENBQUMsQ0FBQyxNQUFGLEdBQVcsQ0FBWCxJQUFpQixDQUFFLENBQUEsQ0FBQyxDQUFDLE1BQUYsR0FBUyxDQUFULENBQUYsS0FBaUIsR0FBbEMsSUFBMEMsQ0FBRSxDQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVMsQ0FBVCxDQUFGLEtBQWlCLEdBQTlEO1lBQ0ksQ0FBQSxHQUFJLENBQUUsd0JBRFY7O1FBRUEsSUFBQSxHQUFPLENBQUMsQ0FBRDtBQUNQLGVBQU0sS0FBSyxDQUFDLEdBQU4sQ0FBVSxDQUFWLENBQUEsS0FBZ0IsRUFBdEI7WUFDSSxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFiO1lBQ0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVjtRQUZSO2VBR0E7SUFiTzs7SUFxQlgsS0FBQyxDQUFBLElBQUQsR0FBYSxTQUFDLENBQUQ7ZUFBUyxJQUFJLENBQUMsUUFBTCxDQUFjLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBZixDQUFkLEVBQWlDLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFmLENBQWIsQ0FBakM7SUFBVDs7SUFDYixLQUFDLENBQUEsSUFBRCxHQUFhLFNBQUMsQ0FBRDtlQUFTLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFmLENBQWQ7SUFBVDs7SUFDYixLQUFDLENBQUEsT0FBRCxHQUFhLFNBQUMsQ0FBRDtlQUFTLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFmLENBQWI7SUFBVDs7SUFDYixLQUFDLENBQUEsUUFBRCxHQUFhLFNBQUMsQ0FBRCxFQUFHLENBQUg7ZUFBUyxJQUFJLENBQUMsUUFBTCxDQUFjLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBZixDQUFkLEVBQWlDLENBQWpDO0lBQVQ7O0lBQ2IsS0FBQyxDQUFBLFVBQUQsR0FBYSxTQUFDLENBQUQ7UUFBUyxDQUFBLEdBQUksS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFmO2VBQW1CLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxHQUFSLElBQWUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsQ0FBaEI7SUFBL0M7O0lBQ2IsS0FBQyxDQUFBLFVBQUQsR0FBYSxTQUFDLENBQUQ7ZUFBUyxDQUFJLEtBQUssQ0FBQyxVQUFOLENBQWlCLENBQWpCO0lBQWI7O0lBQ2IsS0FBQyxDQUFBLE9BQUQsR0FBYSxTQUFDLENBQUQ7ZUFBUyxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFmLENBQWIsQ0FBWDtJQUFUOztJQUNiLEtBQUMsQ0FBQSxTQUFELEdBQWEsU0FBQyxDQUFEO2VBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFlLENBQWYsQ0FBWDtJQUFUOztJQVFiLEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxDQUFEO1FBRUYsQ0FBQSxHQUFJLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQWhCO1FBQ0osSUFBRyxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsQ0FBSDtBQUF1QixtQkFBTyxHQUE5Qjs7UUFDQSxDQUFBLEdBQUksSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFiO1FBQ0osSUFBRyxDQUFBLEtBQUssR0FBUjtBQUFpQixtQkFBTyxHQUF4Qjs7ZUFDQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7SUFORTs7SUFRTixLQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsQ0FBRDtRQUVQLElBQUcsY0FBSSxDQUFDLENBQUUsZ0JBQVY7QUFDSSxtQkFBTyxLQUFLLENBQUMsS0FBTixDQUFZLDRCQUFaLEVBRFg7O1FBRUEsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsSUFBWDtZQUNJLEtBQUssQ0FBQyxLQUFOLENBQVksNEJBQUEsR0FBNkIsQ0FBN0IsR0FBK0IsR0FBM0M7QUFDQSxtQkFBTyxLQUFLLENBQUMsUUFBTixDQUFlLENBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBVCxDQUFmLEVBRlg7O1FBR0EsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLElBQVgsQ0FBSDtZQUNJLEtBQUssQ0FBQyxLQUFOLENBQVksNkJBQUEsR0FBOEIsQ0FBOUIsR0FBZ0MsR0FBNUM7QUFDQSxtQkFBTyxLQUFLLENBQUMsUUFBTixDQUFlLENBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBVCxFQUFZLENBQUMsQ0FBQyxNQUFGLEdBQVMsQ0FBckIsQ0FBZixFQUZYOztlQUdBO0lBVk87O0lBWVgsS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLENBQUQ7QUFFSixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWDtRQUVQLElBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFULEtBQW1CLENBQW5CLElBQXlCLElBQUksQ0FBQyxHQUFJLENBQUEsQ0FBQSxDQUFULEtBQWUsR0FBM0M7WUFDSSxJQUFJLENBQUMsR0FBTCxJQUFZLElBRGhCOztRQUVBLElBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFWLEtBQW9CLENBQXBCLElBQTBCLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFWLEtBQWdCLEdBQTdDO1lBQ0ksSUFBSSxDQUFDLElBQUwsSUFBYSxJQURqQjs7ZUFHQTtJQVRJOztJQWlCUixLQUFDLENBQUEsSUFBRCxHQUFnQixTQUFBO2VBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFFLENBQUMsT0FBSCxDQUFBLENBQVg7SUFBSDs7SUFDaEIsS0FBQyxDQUFBLEtBQUQsR0FBWSxTQUFDLENBQUQ7QUFBTyxZQUFBO2tEQUFhLENBQUUsT0FBZixDQUF1QixLQUFLLENBQUMsSUFBTixDQUFBLENBQXZCLEVBQXFDLEdBQXJDO0lBQVA7O0lBQ1osS0FBQyxDQUFBLE9BQUQsR0FBWSxTQUFDLENBQUQ7QUFBTyxZQUFBO2tEQUFhLENBQUUsT0FBZixDQUF1QixLQUF2QixFQUE4QixLQUFLLENBQUMsSUFBTixDQUFBLENBQTlCO0lBQVA7O0lBQ1osS0FBQyxDQUFBLEtBQUQsR0FBWSxTQUFDLENBQUQ7QUFFUixZQUFBO1FBQUEsQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBVixFQUFlLENBQWY7QUFDSixlQUFNLENBQUEsSUFBSyxDQUFYO0FBQ0k7QUFBQSxpQkFBQSxRQUFBOztnQkFDSSxJQUFHLENBQUEsS0FBSyxDQUFDLENBQUMsS0FBRixDQUFRLENBQUEsR0FBRSxDQUFWLEVBQWEsQ0FBQSxHQUFFLENBQUYsR0FBSSxDQUFDLENBQUMsTUFBbkIsQ0FBUjtvQkFDSSxDQUFBLEdBQUksQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFSLEVBQVcsQ0FBWCxDQUFBLEdBQWdCLENBQWhCLEdBQW9CLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBQSxHQUFFLENBQUMsQ0FBQyxNQUFKLEdBQVcsQ0FBbkI7QUFDeEIsMEJBRko7O0FBREo7WUFJQSxDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxHQUFWLEVBQWUsQ0FBQSxHQUFFLENBQWpCO1FBTFI7ZUFPQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7SUFWUTs7SUFZWixLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtRQUVOLElBQXFCLGNBQUksQ0FBQyxDQUFFLGdCQUE1QjtZQUFBLENBQUEsR0FBSSxPQUFPLENBQUMsR0FBUixDQUFBLEVBQUo7O1FBRUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLENBQVo7UUFFSixJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLENBQWpCLENBQUg7WUFDSSxDQUFBLEdBQUksS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsT0FBTCxDQUFhLENBQWIsQ0FBWCxFQURSOztlQUVBO0lBUk07O0lBVVYsS0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLEdBQUQsRUFBTSxFQUFOO0FBRVAsWUFBQTtRQUFBLElBQXNCLGVBQUksRUFBRSxDQUFFLGdCQUE5QjtZQUFBLEVBQUEsR0FBSyxPQUFPLENBQUMsR0FBUixDQUFBLEVBQUw7O1FBQ0EsR0FBQSxHQUFNLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZDtRQUNOLElBQWMsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixHQUFqQixDQUFsQjtBQUFBLG1CQUFPLElBQVA7O1FBQ0EsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLEVBQWQsQ0FBQSxLQUFxQixHQUF4QjtBQUNJLG1CQUFPLElBRFg7O1FBR0EsTUFBVyxLQUFLLENBQUMsVUFBTixDQUFpQixHQUFqQixDQUFYLEVBQUMsV0FBRCxFQUFLO1FBQ0wsT0FBVyxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFLLENBQUMsT0FBTixDQUFjLEVBQWQsQ0FBakIsQ0FBWCxFQUFDLFlBQUQsRUFBSztRQUNMLElBQUcsRUFBQSxJQUFPLEVBQVAsSUFBYyxFQUFBLEtBQU0sRUFBdkI7QUFDSSxtQkFBTyxJQURYOztlQUVBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxFQUFkLEVBQWtCLEVBQWxCLENBQVg7SUFaTzs7SUFjWCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtlQUFPLFVBQUEsR0FBVSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixDQUFEO0lBQWpCOztJQUVWLEtBQUMsQ0FBQSxRQUFELEdBQVcsU0FBQyxDQUFELEVBQUksQ0FBSjtlQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFBLEtBQW9CLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZDtJQUE5Qjs7SUFFWCxLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxPQUFGLENBQVUsV0FBVixFQUF1QixNQUF2QjtJQUFQOztJQUVULEtBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxDQUFEO1FBQ0wsQ0FBQSxHQUFJLFNBQUEsQ0FBVSxDQUFWO1FBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixFQUFpQixLQUFqQjtRQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsRUFBaUIsS0FBakI7ZUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLEVBQWlCLEtBQWpCO0lBSkM7O0lBWVQsS0FBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLENBQUQ7QUFFRixZQUFBO1FBQUEsSUFBRyx1Q0FBSDtBQUVJLG1CQUFNLENBQUMsQ0FBQyxNQUFGLElBQWEsUUFBQSxLQUFLLENBQUMsV0FBTixDQUFrQixDQUFsQixFQUFBLEtBQTZCLEdBQTdCLElBQUEsR0FBQSxLQUFrQyxHQUFsQyxJQUFBLEdBQUEsS0FBdUMsRUFBdkMsQ0FBbkI7Z0JBRUksSUFBRyxLQUFLLENBQUMsU0FBTixDQUFpQixLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFBYyxNQUFkLENBQWpCLENBQUg7QUFBc0QsMkJBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLEVBQTdEOztnQkFDQSxJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUFjLGNBQWQsQ0FBakIsQ0FBSDtBQUFzRCwyQkFBTyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsRUFBN0Q7O2dCQUNBLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWMsY0FBZCxDQUFqQixDQUFIO0FBQXNELDJCQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxFQUE3RDs7Z0JBQ0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVjtZQUxSLENBRko7O2VBUUE7SUFWRTs7SUFZTixLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsQ0FBRDtBQUVGLFlBQUE7UUFBQSxJQUFHLHVDQUFIO0FBRUksbUJBQU0sQ0FBQyxDQUFDLE1BQUYsSUFBYSxRQUFBLEtBQUssQ0FBQyxXQUFOLENBQWtCLENBQWxCLEVBQUEsS0FBNkIsR0FBN0IsSUFBQSxHQUFBLEtBQWtDLEdBQWxDLElBQUEsR0FBQSxLQUF1QyxFQUF2QyxDQUFuQjtnQkFFSSxJQUFHLEtBQUssQ0FBQyxTQUFOLENBQWdCLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUFjLE1BQWQsQ0FBaEIsQ0FBSDtBQUE2QywyQkFBTyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsRUFBcEQ7O2dCQUNBLENBQUEsR0FBSSxLQUFLLENBQUMsR0FBTixDQUFVLENBQVY7WUFIUixDQUZKOztlQU1BO0lBUkU7O0lBZ0JOLEtBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxDQUFELEVBQUksRUFBSjtBQUVMLFlBQUE7UUFBQSxJQUFHLFVBQUEsS0FBYyxPQUFPLEVBQXhCO0FBQ0k7Z0JBQ0ksSUFBTyxTQUFQO29CQUNJLEVBQUEsQ0FBQTtBQUNBLDJCQUZKOztnQkFHQSxDQUFBLEdBQUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsYUFBTixDQUFvQixDQUFwQixDQUFkO2dCQUNKLEVBQUUsQ0FBQyxNQUFILENBQVUsQ0FBVixFQUFhLEVBQUUsQ0FBQyxJQUFILEdBQVUsRUFBRSxDQUFDLElBQTFCLEVBQWdDLFNBQUMsR0FBRDtvQkFDNUIsSUFBRyxXQUFIOytCQUNJLEVBQUEsQ0FBQSxFQURKO3FCQUFBLE1BQUE7K0JBR0ksRUFBRSxDQUFDLElBQUgsQ0FBUSxDQUFSLEVBQVcsU0FBQyxHQUFELEVBQU0sSUFBTjs0QkFDUCxJQUFHLFdBQUg7dUNBQ0ksRUFBQSxDQUFBLEVBREo7NkJBQUEsTUFBQTt1Q0FHSSxFQUFBLENBQUcsSUFBSCxFQUhKOzt3QkFETyxDQUFYLEVBSEo7O2dCQUQ0QixDQUFoQyxFQUxKO2FBQUEsYUFBQTtnQkFjTTtnQkFDSCxLQUFLLENBQUMsS0FBTixDQUFZLGtCQUFBLEdBQXFCLE1BQUEsQ0FBTyxHQUFQLENBQWpDLEVBZkg7YUFESjtTQUFBLE1BQUE7WUFrQkksSUFBRyxTQUFIO0FBQ0k7b0JBQ0ksQ0FBQSxHQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsQ0FBcEIsQ0FBZDtvQkFDSixJQUFHLElBQUEsR0FBTyxFQUFFLENBQUMsUUFBSCxDQUFZLENBQVosQ0FBVjt3QkFDSSxFQUFFLENBQUMsVUFBSCxDQUFjLENBQWQsRUFBaUIsRUFBRSxDQUFDLElBQXBCO0FBQ0EsK0JBQU8sS0FGWDtxQkFGSjtpQkFBQSxhQUFBO29CQUtNO29CQUNGLFdBQUcsR0FBRyxDQUFDLEtBQUosS0FBYSxRQUFiLElBQUEsR0FBQSxLQUF1QixTQUExQjtBQUNJLCtCQUFPLEtBRFg7O29CQUVBLEtBQUssQ0FBQyxLQUFOLENBQVksa0JBQUEsR0FBcUIsTUFBQSxDQUFPLEdBQVAsQ0FBakMsRUFSSjtpQkFESjthQWxCSjs7ZUE0QkE7SUE5Qks7O0lBZ0NULEtBQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxDQUFEO0FBRUosWUFBQTtBQUFBO1lBQ0ksRUFBRSxDQUFDLFNBQUgsQ0FBYSxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsQ0FBYixFQUErQjtnQkFBQSxTQUFBLEVBQVUsSUFBVjthQUEvQjtZQUNBLElBQUcsQ0FBSSxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQixDQUFQO2dCQUNJLEVBQUUsQ0FBQyxhQUFILENBQWlCLENBQWpCLEVBQW9CLEVBQXBCLEVBREo7O0FBRUEsbUJBQU8sRUFKWDtTQUFBLGFBQUE7WUFLTTtZQUNGLEtBQUssQ0FBQyxLQUFOLENBQVksaUJBQUEsR0FBb0IsTUFBQSxDQUFPLEdBQVAsQ0FBaEM7bUJBQ0EsTUFQSjs7SUFGSTs7SUFXUixLQUFDLENBQUEsVUFBRCxHQUFhLFNBQUMsQ0FBRCxFQUFJLEVBQUo7QUFFVCxZQUFBO1FBQUEsSUFBRyxVQUFBLEtBQWMsT0FBTyxFQUF4QjttQkFDSSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsU0FBQyxJQUFEO2dCQUNaLG1CQUFHLElBQUksQ0FBRSxNQUFOLENBQUEsVUFBSDsyQkFBdUIsRUFBQSxDQUFHLElBQUgsRUFBdkI7aUJBQUEsTUFBQTsyQkFDSyxFQUFBLENBQUEsRUFETDs7WUFEWSxDQUFoQixFQURKO1NBQUEsTUFBQTtZQUtJLElBQUcsSUFBQSxHQUFPLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixDQUFWO2dCQUNJLElBQWUsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFmO0FBQUEsMkJBQU8sS0FBUDtpQkFESjthQUxKOztJQUZTOztJQVViLEtBQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxDQUFELEVBQUksRUFBSjtBQUVSLFlBQUE7UUFBQSxJQUFHLFVBQUEsS0FBYyxPQUFPLEVBQXhCO21CQUNJLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixFQUFnQixTQUFDLElBQUQ7Z0JBQ1osbUJBQUcsSUFBSSxDQUFFLFdBQU4sQ0FBQSxVQUFIOzJCQUE0QixFQUFBLENBQUcsSUFBSCxFQUE1QjtpQkFBQSxNQUFBOzJCQUNLLEVBQUEsQ0FBQSxFQURMOztZQURZLENBQWhCLEVBREo7U0FBQSxNQUFBO1lBS0ksSUFBRyxJQUFBLEdBQU8sS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLENBQVY7Z0JBQ0ksSUFBZSxJQUFJLENBQUMsV0FBTCxDQUFBLENBQWY7QUFBQSwyQkFBTyxLQUFQO2lCQURKO2FBTEo7O0lBRlE7O0lBVVosS0FBQyxDQUFBLEtBQUQsR0FBUyxTQUFDLENBQUQsRUFBSSxFQUFKO2VBQVcsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBaEIsRUFBbUIsRUFBbkI7SUFBWDs7SUFDVCxLQUFDLENBQUEsTUFBRCxHQUFTLFNBQUMsQ0FBRCxFQUFJLEVBQUo7ZUFBVyxLQUFLLENBQUMsVUFBTixDQUFpQixDQUFqQixFQUFvQixFQUFwQjtJQUFYOztJQUVULEtBQUMsQ0FBQSxVQUFELEdBQWEsU0FBQyxDQUFELEVBQUksRUFBSjtBQUVULFlBQUE7UUFBQSxJQUFHLFVBQUEsS0FBYyxPQUFPLEVBQXhCO0FBQ0k7dUJBQ0ksRUFBRSxDQUFDLE1BQUgsQ0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsQ0FBVixFQUE0QixFQUFFLENBQUMsSUFBSCxHQUFVLEVBQUUsQ0FBQyxJQUF6QyxFQUErQyxTQUFDLEdBQUQ7MkJBQzNDLEVBQUEsQ0FBTyxXQUFQO2dCQUQyQyxDQUEvQyxFQURKO2FBQUEsYUFBQTtnQkFHTTtnQkFDRixLQUFLLENBQUMsS0FBTixDQUFZLHNCQUFBLEdBQXlCLE1BQUEsQ0FBTyxHQUFQLENBQXJDO3VCQUNBLEVBQUEsQ0FBRyxLQUFILEVBTEo7YUFESjtTQUFBLE1BQUE7QUFRSTtnQkFDSSxFQUFFLENBQUMsVUFBSCxDQUFjLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFkLEVBQWdDLEVBQUUsQ0FBQyxJQUFILEdBQVUsRUFBRSxDQUFDLElBQTdDO0FBQ0EsdUJBQU8sS0FGWDthQUFBLGFBQUE7QUFJSSx1QkFBTyxNQUpYO2FBUko7O0lBRlM7O0lBZ0JiLEtBQUMsQ0FBQSxRQUFELEdBQVcsU0FBQTtBQUVQLFlBQUE7QUFBQTtZQUNJLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtZQUNYLElBQUcsT0FBTyxDQUFDLElBQVIsS0FBZ0IsVUFBbkI7QUFDSSx1QkFBTyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFwQixDQUE0QixVQUE1QixFQURYO2FBQUEsTUFBQTtBQUdJLHVCQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBYixDQUFxQixVQUFyQixFQUhYO2FBRko7U0FBQSxhQUFBO1lBTU07QUFDRjtnQkFDSSxJQUFHLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQVYsQ0FBWjtvQkFDSSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxFQUFtQixjQUFuQixDQUFSO29CQUNKLE1BQVEsT0FBQSxDQUFRLE9BQVI7b0JBQ1YsSUFBQSxHQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBVCxDQUFlLEdBQWYsRUFBb0IsTUFBcEI7QUFDUCwyQkFBTyxLQUFLLENBQUMsT0FBTixDQUFjLG9CQUFBLEdBQXFCLElBQW5DLEVBSlg7aUJBREo7YUFBQSxhQUFBO2dCQU1NO2dCQUNILE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQVBIO2FBUEo7O0FBZ0JBLGVBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxvQkFBZDtJQWxCQTs7SUEwQlgsS0FBQyxDQUFBLE9BQUQsR0FBVTs7SUFFVixLQUFDLENBQUEsUUFBRCxHQUNJO1FBQUEsT0FBQSxFQUFRLENBQVI7UUFDQSxPQUFBLEVBQVEsQ0FEUjtRQUVBLFlBQUEsRUFBYSxDQUZiO1FBR0EsWUFBQSxFQUFhLENBSGI7OztJQUtKLEtBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxDQUFEO0FBRUwsWUFBQTtBQUFBO1lBQ0ksSUFBRyxDQUFJLEtBQUssQ0FBQyxPQUFiO2dCQUNJLEtBQUssQ0FBQyxPQUFOLEdBQWdCO0FBQ2hCO0FBQUEscUJBQUEscUNBQUE7O29CQUNJLEtBQUssQ0FBQyxPQUFRLENBQUEsR0FBQSxDQUFkLEdBQXFCO0FBRHpCO2dCQUVBLEtBQUssQ0FBQyxPQUFRLENBQUEsT0FBQSxDQUFkLEdBQTBCLEtBSjlCOztZQU1BLEdBQUEsR0FBTSxLQUFLLENBQUMsR0FBTixDQUFVLENBQVY7WUFDTixJQUFlLEdBQUEsSUFBUSw0QkFBdkI7QUFBQSx1QkFBTyxLQUFQOztZQUNBLElBQWUsS0FBSyxDQUFDLFFBQVMsQ0FBQSxLQUFLLENBQUMsUUFBTixDQUFlLENBQWYsQ0FBaUIsQ0FBQyxXQUFsQixDQUFBLENBQUEsQ0FBOUI7QUFBQSx1QkFBTyxLQUFQOztZQUNBLElBQWdCLENBQUksS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLENBQXBCO0FBQUEsdUJBQU8sTUFBUDs7WUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGNBQVI7QUFDWCxtQkFBTyxDQUFJLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixDQUExQixFQVpmO1NBQUEsYUFBQTtZQWFNO1lBQ0YsS0FBSyxDQUFDLEtBQU4sQ0FBWSxrQkFBQSxHQUFxQixNQUFBLENBQU8sR0FBUCxDQUFqQzttQkFDQSxNQWZKOztJQUZLOztJQW1CVCxLQUFDLENBQUEsUUFBRCxHQUFXLFNBQUMsQ0FBRCxFQUFJLEVBQUo7QUFFUCxZQUFBO1FBQUEsSUFBRyxVQUFBLEtBQWMsT0FBTyxFQUF4QjtBQUNJO3VCQUNJLEVBQUUsQ0FBQyxRQUFILENBQVksQ0FBWixFQUFlLE1BQWYsRUFBdUIsU0FBQyxHQUFELEVBQU0sSUFBTjsyQkFDbkIsRUFBQSxDQUFPLGFBQUosSUFBYSxJQUFiLElBQXFCLEVBQXhCO2dCQURtQixDQUF2QixFQURKO2FBQUEsYUFBQTtnQkFHTTtBQUNGLHVCQUFPLEtBQUssQ0FBQyxLQUFOLENBQVksb0JBQUEsR0FBdUIsTUFBQSxDQUFPLEdBQVAsQ0FBbkMsRUFKWDthQURKO1NBQUEsTUFBQTtBQU9JO3VCQUNJLEVBQUUsQ0FBQyxZQUFILENBQWdCLENBQWhCLEVBQW1CLE1BQW5CLEVBREo7YUFBQSxhQUFBO2dCQUVNO0FBQ0YsdUJBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBWSxvQkFBQSxHQUF1QixNQUFBLENBQU8sR0FBUCxDQUFuQyxFQUhYO2FBUEo7O0lBRk87O0lBb0JYLEtBQUMsQ0FBQSxHQUFELEdBQU8sSUFBSSxNQUFKLENBQVcsTUFBWCxFQUFtQixHQUFuQjs7SUFFUCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUE7ZUFBRyxJQUFJLENBQUMsR0FBTCxLQUFZO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLEdBQUQ7ZUFBUztJQUFUOzs7Ozs7QUFFWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuIyMjXG5cbm9zICAgPSByZXF1aXJlICdvcydcbmZzICAgPSByZXF1aXJlICdmcycgXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxuY2xhc3MgU2xhc2hcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQHBhdGg6IChwKSAtPlxuICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC5wYXRoIC0tIG5vIHBhdGg/XCIgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBpZiBTbGFzaC53aW4oKVxuICAgICAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHAgICAgIFxuICAgICAgICAgICAgcCA9IHAucmVwbGFjZSBTbGFzaC5yZWcsICcvJ1xuICAgICAgICAgICAgaWYgcC5lbmRzV2l0aCgnOi4nKSBhbmQgcC5sZW5ndGggPT0gM1xuICAgICAgICAgICAgICAgIHAgPSBwWy4uMV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcCA9IHAucmVwbGFjZSBTbGFzaC5yZWcsICcvJ1xuICAgICAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHAgICAgICAgICAgICBcbiAgICAgICAgcFxuICAgICAgICBcbiAgICBAdW5zbGFzaDogKHApIC0+XG4gICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnVuc2xhc2ggLS0gbm8gcGF0aD9cIiBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgaWYgU2xhc2gud2luKClcbiAgICAgICAgICAgIGlmIHAubGVuZ3RoID49IDMgYW5kIHBbMF0gPT0gJy8nID09IHBbMl0gXG4gICAgICAgICAgICAgICAgcCA9IHBbMV0gKyAnOicgKyBwLnNsaWNlIDJcbiAgICAgICAgICAgIHAgPSBwYXRoLm5vcm1hbGl6ZSBwXG4gICAgICAgICAgICBpZiBwWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHAgPSAgcFswXS50b1VwcGVyQ2FzZSgpICsgcFsxLi5dXG4gICAgICAgIHBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHNwbGl0OiAocCkgLT4gU2xhc2gucGF0aChwKS5zcGxpdCgnLycpLmZpbHRlciAoZSkgLT4gZS5sZW5ndGhcbiAgICBcbiAgICBAc3BsaXREcml2ZTogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBwID0gU2xhc2gucGF0aCBwXG4gICAgICAgIHBhcnNlZCA9IFNsYXNoLnBhcnNlIHBcbiAgICAgICAgcm9vdCA9IHBhcnNlZC5yb290XG5cbiAgICAgICAgaWYgcm9vdC5sZW5ndGggPiAxXG4gICAgICAgICAgICBpZiBwLmxlbmd0aCA+IHJvb3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSBwLnNsaWNlKHJvb3QubGVuZ3RoLTEpXG4gICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gJy8nXG4gICAgICAgICAgICByZXR1cm4gW2ZpbGVQYXRoICwgcm9vdC5zbGljZSAwLCByb290Lmxlbmd0aC0yXVxuICAgICAgICBlbHNlIGlmIHBhcnNlZC5kaXIubGVuZ3RoID4gMVxuICAgICAgICAgICAgaWYgcGFyc2VkLmRpclsxXSA9PSAnOidcbiAgICAgICAgICAgICAgICByZXR1cm4gW3BbMi4uXSwgcGFyc2VkLmRpclswXV1cbiAgICAgICAgZWxzZSBpZiBwYXJzZWQuYmFzZS5sZW5ndGggPT0gMlxuICAgICAgICAgICAgaWYgcGFyc2VkLmJhc2VbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsnLycsIHBhcnNlZC5iYXNlWzBdXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBbU2xhc2gucGF0aChwKSwgJyddXG4gICAgICAgIFxuICAgIEByZW1vdmVEcml2ZTogKHApIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gU2xhc2guc3BsaXREcml2ZShwKVswXVxuICBcbiAgICBAaXNSb290OiAocCkgLT4gU2xhc2gucmVtb3ZlRHJpdmUocCkgPT0gJy8nXG4gICAgICAgIFxuICAgIEBzcGxpdEZpbGVMaW5lOiAocCkgLT4gICMgZmlsZS50eHQ6MTowIC0tPiBbJ2ZpbGUudHh0JywgMSwgMF1cbiAgICAgICAgXG4gICAgICAgIFtmLGRdID0gU2xhc2guc3BsaXREcml2ZSBwXG4gICAgICAgIHNwbGl0ID0gU3RyaW5nKGYpLnNwbGl0ICc6J1xuICAgICAgICBsaW5lID0gcGFyc2VJbnQgc3BsaXRbMV0gaWYgc3BsaXQubGVuZ3RoID4gMVxuICAgICAgICBjbG1uID0gcGFyc2VJbnQgc3BsaXRbMl0gaWYgc3BsaXQubGVuZ3RoID4gMlxuICAgICAgICBsID0gYyA9IDBcbiAgICAgICAgbCA9IGxpbmUgaWYgTnVtYmVyLmlzSW50ZWdlciBsaW5lXG4gICAgICAgIGMgPSBjbG1uIGlmIE51bWJlci5pc0ludGVnZXIgY2xtblxuICAgICAgICBkID0gZCArICc6JyBpZiBkICE9ICcnXG4gICAgICAgIFsgZCArIHNwbGl0WzBdLCBNYXRoLm1heChsLDEpLCAgTWF0aC5tYXgoYywwKSBdXG4gICAgICAgIFxuICAgIEBzcGxpdEZpbGVQb3M6IChwKSAtPiAjIGZpbGUudHh0OjE6MyAtLT4gWydmaWxlLnR4dCcsIFszLCAwXV1cbiAgICBcbiAgICAgICAgW2YsbCxjXSA9IFNsYXNoLnNwbGl0RmlsZUxpbmUgcFxuICAgICAgICBbZiwgW2MsIGwtMV1dXG4gICAgICAgIFxuICAgIEByZW1vdmVMaW5lUG9zOiAocCkgLT4gU2xhc2guc3BsaXRGaWxlTGluZShwKVswXVxuICAgIEByZW1vdmVDb2x1bW46ICAocCkgLT4gXG4gICAgICAgIFtmLGxdID0gU2xhc2guc3BsaXRGaWxlTGluZSBwXG4gICAgICAgIGlmIGw+MSB0aGVuIGYgKyAnOicgKyBsXG4gICAgICAgIGVsc2UgZlxuICAgICAgICBcbiAgICBAZXh0OiAgICAgICAocCkgLT4gcGF0aC5leHRuYW1lKHApLnNsaWNlIDFcbiAgICBAc3BsaXRFeHQ6ICAocCkgLT4gW1NsYXNoLnJlbW92ZUV4dChwKSwgU2xhc2guZXh0KHApXVxuICAgIEByZW1vdmVFeHQ6IChwKSAtPiBTbGFzaC5qb2luIFNsYXNoLmRpcihwKSwgU2xhc2guYmFzZSBwXG4gICAgQHN3YXBFeHQ6ICAgKHAsIGV4dCkgLT4gU2xhc2gucmVtb3ZlRXh0KHApICsgKGV4dC5zdGFydHNXaXRoKCcuJykgYW5kIGV4dCBvciBcIi4je2V4dH1cIilcbiAgICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAam9pbjogLT4gW10ubWFwLmNhbGwoYXJndW1lbnRzLCBTbGFzaC5wYXRoKS5qb2luICcvJ1xuICAgIFxuICAgIEBqb2luRmlsZVBvczogKGZpbGUsIHBvcykgLT4gIyBbJ2ZpbGUudHh0JywgWzMsIDBdXSAtLT4gZmlsZS50eHQ6MTozXG4gICAgICAgIFxuICAgICAgICBmaWxlID0gU2xhc2gucmVtb3ZlTGluZVBvcyBmaWxlXG4gICAgICAgIGlmIG5vdCBwb3M/IG9yIG5vdCBwb3NbMF0/XG4gICAgICAgICAgICBmaWxlXG4gICAgICAgIGVsc2UgaWYgcG9zWzBdXG4gICAgICAgICAgICBmaWxlICsgXCI6I3twb3NbMV0rMX06I3twb3NbMF19XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmlsZSArIFwiOiN7cG9zWzFdKzF9XCJcbiAgICAgICAgICAgICAgICBcbiAgICBAam9pbkZpbGVMaW5lOiAoZmlsZSwgbGluZSwgY29sKSAtPiAjICdmaWxlLnR4dCcsIDEsIDIgLS0+IGZpbGUudHh0OjE6MlxuICAgICAgICBcbiAgICAgICAgZmlsZSA9IFNsYXNoLnJlbW92ZUxpbmVQb3MgZmlsZVxuICAgICAgICByZXR1cm4gZmlsZSBpZiBub3QgbGluZVxuICAgICAgICByZXR1cm4gXCIje2ZpbGV9OiN7bGluZX1cIiBpZiBub3QgY29sXG4gICAgICAgIFwiI3tmaWxlfToje2xpbmV9OiN7Y29sfVwiXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHBhdGhsaXN0OiAocCkgLT4gIyAnL3Jvb3QvZGlyL2ZpbGUudHh0JyAtLT4gWycvJywgJy9yb290JywgJy9yb290L2RpcicsICcvcm9vdC9kaXIvZmlsZS50eHQnXVxuICAgIFxuICAgICAgICBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLnBhdGhsaXN0IC0tIG5vIHBhdGg/XCIgXG4gICAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgICAgIFxuICAgICAgICBwID0gU2xhc2gubm9ybWFsaXplIHBcbiAgICAgICAgaWYgcC5sZW5ndGggPiAxIGFuZCBwW3AubGVuZ3RoLTFdID09ICcvJyBhbmQgcFtwLmxlbmd0aC0yXSAhPSAnOidcbiAgICAgICAgICAgIHAgPSBwWy4uLnAubGVuZ3RoLTFdIFxuICAgICAgICBsaXN0ID0gW3BdXG4gICAgICAgIHdoaWxlIFNsYXNoLmRpcihwKSAhPSAnJ1xuICAgICAgICAgICAgbGlzdC51bnNoaWZ0IFNsYXNoLmRpcihwKVxuICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIGxpc3RcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgICAgICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgMDAwICAwMDAgIDAwMCAgIFxuICAgIFxuICAgIEBiYXNlOiAgICAgICAocCkgICAtPiBwYXRoLmJhc2VuYW1lIFNsYXNoLnNhbml0aXplKHApLCBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZmlsZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIEBleHRuYW1lOiAgICAocCkgICAtPiBwYXRoLmV4dG5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAYmFzZW5hbWU6ICAgKHAsZSkgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgZVxuICAgIEBpc0Fic29sdXRlOiAocCkgICAtPiBwID0gU2xhc2guc2FuaXRpemUocCk7IHBbMV0gPT0gJzonIG9yIHBhdGguaXNBYnNvbHV0ZSBwXG4gICAgQGlzUmVsYXRpdmU6IChwKSAgIC0+IG5vdCBTbGFzaC5pc0Fic29sdXRlIHBcbiAgICBAZGlybmFtZTogICAgKHApICAgLT4gU2xhc2gucGF0aCBwYXRoLmRpcm5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAbm9ybWFsaXplOiAgKHApICAgLT4gU2xhc2gucGF0aCBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAZGlyOiAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBwID0gU2xhc2gubm9ybWFsaXplIHBcbiAgICAgICAgaWYgU2xhc2guaXNSb290IHAgdGhlbiByZXR1cm4gJydcbiAgICAgICAgcCA9IHBhdGguZGlybmFtZSBwXG4gICAgICAgIGlmIHAgPT0gJy4nIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIFNsYXNoLnBhdGggcFxuICAgICAgICBcbiAgICBAc2FuaXRpemU6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnNhbml0aXplIC0tIG5vIHBhdGg/XCIgXG4gICAgICAgIGlmIHBbMF0gPT0gJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwibGVhZGluZyBuZXdsaW5lIGluIHBhdGghICcje3B9J1wiXG4gICAgICAgICAgICByZXR1cm4gU2xhc2guc2FuaXRpemUgcC5zdWJzdHIgMVxuICAgICAgICBpZiBwLmVuZHNXaXRoICdcXG4nXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcInRyYWlsaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAwLCBwLmxlbmd0aC0xXG4gICAgICAgIHBcbiAgICBcbiAgICBAcGFyc2U6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGRpY3QgPSBwYXRoLnBhcnNlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIGRpY3QuZGlyLmxlbmd0aCA9PSAyIGFuZCBkaWN0LmRpclsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3QuZGlyICs9ICcvJ1xuICAgICAgICBpZiBkaWN0LnJvb3QubGVuZ3RoID09IDIgYW5kIGRpY3Qucm9vdFsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3Qucm9vdCArPSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICBkaWN0XG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAaG9tZTogICAgICAgICAgLT4gU2xhc2gucGF0aCBvcy5ob21lZGlyKClcbiAgICBAdGlsZGU6ICAgICAocCkgLT4gU2xhc2gucGF0aChwKT8ucmVwbGFjZSBTbGFzaC5ob21lKCksICd+J1xuICAgIEB1bnRpbGRlOiAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIC9eXFx+LywgU2xhc2guaG9tZSgpXG4gICAgQHVuZW52OiAgICAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIDBcbiAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgICBmb3Igayx2IG9mIHByb2Nlc3MuZW52XG4gICAgICAgICAgICAgICAgaWYgayA9PSBwLnNsaWNlIGkrMSwgaSsxK2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHAgPSBwLnNsaWNlKDAsIGkpICsgdiArIHAuc2xpY2UoaStrLmxlbmd0aCsxKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIGkrMVxuICAgICAgICAgICAgXG4gICAgICAgIFNsYXNoLnBhdGggcFxuICAgIFxuICAgIEByZXNvbHZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHAgPSBwcm9jZXNzLmN3ZCgpIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC51bmVudiBTbGFzaC51bnRpbGRlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIFNsYXNoLmlzUmVsYXRpdmUgcFxuICAgICAgICAgICAgcCA9IFNsYXNoLnBhdGggcGF0aC5yZXNvbHZlIHBcbiAgICAgICAgcFxuICAgIFxuICAgIEByZWxhdGl2ZTogKHJlbCwgdG8pIC0+XG4gICAgICAgIFxuICAgICAgICB0byA9IHByb2Nlc3MuY3dkKCkgaWYgbm90IHRvPy5sZW5ndGhcbiAgICAgICAgcmVsID0gU2xhc2gucmVzb2x2ZSByZWxcbiAgICAgICAgcmV0dXJuIHJlbCBpZiBub3QgU2xhc2guaXNBYnNvbHV0ZSByZWxcbiAgICAgICAgaWYgU2xhc2gucmVzb2x2ZSh0bykgPT0gcmVsXG4gICAgICAgICAgICByZXR1cm4gJy4nXG5cbiAgICAgICAgW3JsLCByZF0gPSBTbGFzaC5zcGxpdERyaXZlIHJlbFxuICAgICAgICBbdG8sIHRkXSA9IFNsYXNoLnNwbGl0RHJpdmUgU2xhc2gucmVzb2x2ZSB0b1xuICAgICAgICBpZiByZCBhbmQgdGQgYW5kIHJkICE9IHRkXG4gICAgICAgICAgICByZXR1cm4gcmVsXG4gICAgICAgIFNsYXNoLnBhdGggcGF0aC5yZWxhdGl2ZSB0bywgcmxcbiAgICAgICAgXG4gICAgQGZpbGVVcmw6IChwKSAtPiBcImZpbGU6Ly8vI3tTbGFzaC5lbmNvZGUgcH1cIlxuXG4gICAgQHNhbWVQYXRoOiAoYSwgYikgLT4gU2xhc2gucmVzb2x2ZShhKSA9PSBTbGFzaC5yZXNvbHZlKGIpXG5cbiAgICBAZXNjYXBlOiAocCkgLT4gcC5yZXBsYWNlIC8oW1xcYFxcXCJdKS9nLCAnXFxcXCQxJ1xuXG4gICAgQGVuY29kZTogKHApIC0+XG4gICAgICAgIHAgPSBlbmNvZGVVUkkgcFxuICAgICAgICBwID0gcC5yZXBsYWNlIC9cXCMvZywgXCIlMjNcIlxuICAgICAgICBwID0gcC5yZXBsYWNlIC9cXCYvZywgXCIlMjZcIlxuICAgICAgICBwID0gcC5yZXBsYWNlIC9cXCcvZywgXCIlMjdcIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgICAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgICAwMDAgICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBwa2c6IChwKSAtPlxuICAgIFxuICAgICAgICBpZiBwPy5sZW5ndGg/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlIHAubGVuZ3RoIGFuZCBTbGFzaC5yZW1vdmVEcml2ZShwKSBub3QgaW4gWycuJywgJy8nLCAnJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5kaXJFeGlzdHMgIFNsYXNoLmpvaW4gcCwgJy5naXQnICAgICAgICAgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLm5vb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmZpbGVFeGlzdHMgU2xhc2guam9pbiBwLCAncGFja2FnZS5qc29uJyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbnVsbFxuXG4gICAgQGdpdDogKHApIC0+XG5cbiAgICAgICAgaWYgcD8ubGVuZ3RoP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSBwLmxlbmd0aCBhbmQgU2xhc2gucmVtb3ZlRHJpdmUocCkgbm90IGluIFsnLicsICcvJywgJyddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZGlyRXhpc3RzIFNsYXNoLmpvaW4gcCwgJy5naXQnIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBudWxsXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBAZXhpc3RzOiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgaWYgbm90IHA/XG4gICAgICAgICAgICAgICAgICAgIGNiKCkgXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5yZXNvbHZlIFNsYXNoLnJlbW92ZUxpbmVQb3MgcFxuICAgICAgICAgICAgICAgIGZzLmFjY2VzcyBwLCBmcy5SX09LIHwgZnMuRl9PSywgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgZXJyP1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKSBcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZnMuc3RhdCBwLCAoZXJyLCBzdGF0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2Igc3RhdFxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmV4aXN0cyAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBwP1xuICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBTbGFzaC5yZW1vdmVMaW5lUG9zIHBcbiAgICAgICAgICAgICAgICAgICAgaWYgc3RhdCA9IGZzLnN0YXRTeW5jKHApXG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIHAsIGZzLlJfT0tcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0XG4gICAgICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgICAgIGlmIGVyci5jb2RlIGluIFsnRU5PRU5UJywgJ0VOT1RESVInXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5leGlzdHMgLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgbnVsbCAgICAgXG4gICAgICAgIFxuICAgIEB0b3VjaDogKHApIC0+XG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyBTbGFzaC5kaXJuYW1lKHApLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICAgICAgaWYgbm90IFNsYXNoLmZpbGVFeGlzdHMgcFxuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgcCwgJydcbiAgICAgICAgICAgIHJldHVybiBwXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC50b3VjaCAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgQGZpbGVFeGlzdHM6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBTbGFzaC5leGlzdHMgcCwgKHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdD8uaXNGaWxlKCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNGaWxlKClcblxuICAgIEBkaXJFeGlzdHM6IChwLCBjYikgLT5cblxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRGlyZWN0b3J5KCkgdGhlbiBjYiBzdGF0XG4gICAgICAgICAgICAgICAgZWxzZSBjYigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQgPSBTbGFzaC5leGlzdHMgcFxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0IGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgXG4gICAgQGlzRGlyOiAgKHAsIGNiKSAtPiBTbGFzaC5kaXJFeGlzdHMgcCwgY2JcbiAgICBAaXNGaWxlOiAocCwgY2IpIC0+IFNsYXNoLmZpbGVFeGlzdHMgcCwgY2JcbiAgICBcbiAgICBAaXNXcml0YWJsZTogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2VzcyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PSywgKGVycikgLT5cbiAgICAgICAgICAgICAgICAgICAgY2Igbm90IGVycj9cbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guaXNXcml0YWJsZSAtLSBcIiArIFN0cmluZyhlcnIpIFxuICAgICAgICAgICAgICAgIGNiIGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgU2xhc2gucmVzb2x2ZShwKSwgZnMuUl9PSyB8IGZzLldfT0tcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgIEB1c2VyRGF0YTogLT5cbiAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBlbGVjdHJvbiA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuICAgICAgICAgICAgaWYgcHJvY2Vzcy50eXBlID09ICdyZW5kZXJlcidcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlY3Ryb24ucmVtb3RlLmFwcC5nZXRQYXRoICd1c2VyRGF0YSdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlY3Ryb24uYXBwLmdldFBhdGggJ3VzZXJEYXRhJ1xuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGlmIHBrZ0RpciA9IFNsYXNoLnBrZyBfX2Rpcm5hbWVcbiAgICAgICAgICAgICAgICAgICAgcGtnID0gcmVxdWlyZSBzbGFzaC5qb2luIHBrZ0RpciwgJ3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgICAgICAgICAgeyBzZHMgfSA9IHJlcXVpcmUgJy4va3hrJ1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gc2RzLmZpbmQudmFsdWUgcGtnLCAnbmFtZSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNsYXNoLnJlc29sdmUgXCJ+L0FwcERhdGEvUm9hbWluZy8je25hbWV9XCJcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gU2xhc2gucmVzb2x2ZSBcIn4vQXBwRGF0YS9Sb2FtaW5nL1wiXG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuICAgIFxuICAgIEB0ZXh0ZXh0OiBudWxsXG4gICAgXG4gICAgQHRleHRiYXNlOiBcbiAgICAgICAgcHJvZmlsZToxXG4gICAgICAgIGxpY2Vuc2U6MVxuICAgICAgICAnLmdpdGlnbm9yZSc6MVxuICAgICAgICAnLm5wbWlnbm9yZSc6MVxuICAgIFxuICAgIEBpc1RleHQ6IChwKSAtPlxuICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGlmIG5vdCBTbGFzaC50ZXh0ZXh0XG4gICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dCA9IHt9XG4gICAgICAgICAgICAgICAgZm9yIGV4dCBpbiByZXF1aXJlICd0ZXh0ZXh0ZW5zaW9ucydcbiAgICAgICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dFtleHRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIFNsYXNoLnRleHRleHRbJ2NyeXB0J10gID0gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHQgPSBTbGFzaC5leHQgcFxuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgZXh0IGFuZCBTbGFzaC50ZXh0ZXh0W2V4dF0/IFxuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgU2xhc2gudGV4dGJhc2VbU2xhc2guYmFzZW5hbWUoZikudG9Mb3dlckNhc2UoKV1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgU2xhc2guaXNGaWxlIHBcbiAgICAgICAgICAgIGlzQmluYXJ5ID0gcmVxdWlyZSAnaXNiaW5hcnlmaWxlJ1xuICAgICAgICAgICAgcmV0dXJuIG5vdCBpc0JpbmFyeS5pc0JpbmFyeUZpbGVTeW5jIHBcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmlzVGV4dCAtLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICBcbiAgICBAcmVhZFRleHQ6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZSBwLCAndXRmOCcsIChlcnIsIHRleHQpIC0+IFxuICAgICAgICAgICAgICAgICAgICBjYiBub3QgZXJyPyBhbmQgdGV4dCBvciAnJ1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gucmVhZFRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMgcCwgJ3V0ZjgnXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC5yZWFkVGV4dCAtLSBcIiArIFN0cmluZyhlcnIpXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgICAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQHJlZyA9IG5ldyBSZWdFeHAgXCJcXFxcXFxcXFwiLCAnZydcblxuICAgIEB3aW46IC0+IHBhdGguc2VwID09ICdcXFxcJ1xuICAgIFxuICAgIEBlcnJvcjogKG1zZykgLT4gJydcblxubW9kdWxlLmV4cG9ydHMgPSBTbGFzaFxuIl19
//# sourceURL=../coffee/kslash.coffee