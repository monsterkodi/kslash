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

    Slash.reg = new RegExp("\\\\", 'g');

    Slash.win = function() {
        return path.sep === '\\';
    };

    Slash.error = function(msg) {
        return '';
    };

    Slash.path = function(p) {
        if ((p == null) || p.length === 0) {
            return Slash.error("Slash.path -- no path? " + p);
        }
        p = path.normalize(p);
        p = p.replace(Slash.reg, '/');
        return p;
    };

    Slash.unslash = function(p) {
        if ((p == null) || p.length === 0) {
            return Slash.error("Slash.unslash -- no path? " + p);
        }
        p = Slash.path(p);
        if (Slash.win()) {
            if (p.length >= 3 && (p[0] === '/' && '/' === p[2])) {
                p = p[1] + ':' + p.slice(2);
            }
            p = path.normalize(p);
            if (p[1] === ':') {
                p = p.splice(0, 1, p[0].toUpperCase());
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
        var filePath, root;
        if (Slash.win()) {
            root = Slash.parse(p).root;
            if (root.length > 1) {
                if (p.length > root.length) {
                    filePath = Slash.path(p.slice(root.length - 1));
                } else {
                    filePath = '/';
                }
                return [filePath, root.slice(0, root.length - 2)];
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
        if ((pos == null) || (pos[0] == null)) {
            return file;
        } else if (pos[0]) {
            return file + (":" + (pos[1] + 1) + ":" + pos[0]);
        } else {
            return file + (":" + (pos[1] + 1));
        }
    };

    Slash.joinFileLine = function(file, line, col) {
        if (line == null) {
            return file;
        }
        if (col == null) {
            return file + ":" + line;
        }
        return file + ":" + line + ":" + col;
    };

    Slash.pathlist = function(p) {
        var list;
        if (!(p != null ? p.length : void 0)) {
            return [];
        }
        p = Slash.path(Slash.sanitize(p));
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
        return path.isAbsolute(Slash.sanitize(p));
    };

    Slash.isRelative = function(p) {
        return !Slash.isAbsolute(Slash.sanitize(p));
    };

    Slash.dirname = function(p) {
        return Slash.path(path.dirname(Slash.sanitize(p)));
    };

    Slash.normalize = function(p) {
        return Slash.path(path.normalize(Slash.sanitize(p)));
    };

    Slash.dir = function(p) {
        p = Slash.sanitize(p);
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
            return Slash.error('empty path!');
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
        return Slash.path(path.resolve(Slash.unenv(Slash.untilde(p))));
    };

    Slash.relative = function(rel, to) {
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
        return Slash.path(path.relative(Slash.resolve(to), rel));
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
            return;
        }
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
                    return false;
                }
                console.error(err);
            }
        }
        return null;
    };

    Slash.touch = function(p) {
        fs.mkdirSync(Slash.dirname(p), {
            recursive: true
        });
        if (!Slash.fileExists(p)) {
            return fs.writeFileSync(p, '');
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
        if ('function' === typeof cb) {
            return fs.access(Slash.resolve(p), fs.R_OK | fs.W_OK, function(err) {
                return cb(err == null);
            });
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

    Slash.isText = function(f) {
        var ext, isBinary, j, len, ref;
        if (!Slash.textext) {
            Slash.textext = {};
            ref = require('textextensions');
            for (j = 0, len = ref.length; j < len; j++) {
                ext = ref[j];
                Slash.textext[ext] = true;
            }
            Slash.textext['crypt'] = true;
        }
        ext = Slash.ext(f);
        if (ext && (Slash.textext[ext] != null)) {
            return true;
        }
        if (Slash.textbase[Slash.basename(f).toLowerCase()]) {
            return true;
        }
        if (!Slash.isFile(f)) {
            return false;
        }
        isBinary = require('isbinaryfile');
        return !isBinary.isBinaryFileSync(f);
    };

    Slash.readText = function(f, cb) {
        var err;
        if ('function' === typeof cb) {
            return fs.readFile(f, 'utf8', function(err, text) {
                return cb((err == null) && text || '');
            });
        } else {
            try {
                return fs.readFileSync(f, 'utf8');
            } catch (error) {
                err = error;
                return '';
            }
        }
    };

    return Slash;

})();

module.exports = Slash;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQVcsT0FBQSxDQUFRLElBQVI7O0FBQ1gsRUFBQSxHQUFXLE9BQUEsQ0FBUSxJQUFSOztBQUNYLElBQUEsR0FBVyxPQUFBLENBQVEsTUFBUjs7QUFFTDs7O0lBRUYsS0FBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLE1BQUosQ0FBVyxNQUFYLEVBQW1CLEdBQW5COztJQUVQLEtBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQTtlQUFHLElBQUksQ0FBQyxHQUFMLEtBQVk7SUFBZjs7SUFFTixLQUFDLENBQUEsS0FBRCxHQUFRLFNBQUMsR0FBRDtlQUdKO0lBSEk7O0lBV1IsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLENBQUQ7UUFDSCxJQUF3RCxXQUFKLElBQVUsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUExRTtBQUFBLG1CQUFPLEtBQUssQ0FBQyxLQUFOLENBQVkseUJBQUEsR0FBMEIsQ0FBdEMsRUFBUDs7UUFDQSxDQUFBLEdBQUksSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmO1FBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBSyxDQUFDLEdBQWhCLEVBQXFCLEdBQXJCO2VBQ0o7SUFKRzs7SUFNUCxLQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsQ0FBRDtRQUNOLElBQTJELFdBQUosSUFBVSxDQUFDLENBQUMsTUFBRixLQUFZLENBQTdFO0FBQUEsbUJBQU8sS0FBSyxDQUFDLEtBQU4sQ0FBWSw0QkFBQSxHQUE2QixDQUF6QyxFQUFQOztRQUNBLENBQUEsR0FBSSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7UUFDSixJQUFHLEtBQUssQ0FBQyxHQUFOLENBQUEsQ0FBSDtZQUNJLElBQUcsQ0FBQyxDQUFDLE1BQUYsSUFBWSxDQUFaLElBQWtCLENBQUEsQ0FBRSxDQUFBLENBQUEs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QUUsQ0FBQyxRQUFILENBQVksQ0FBWixFQUFlLE1BQWYsRUFBdUIsU0FBQyxHQUFELEVBQU0sSUFBTjt1QkFDbkIsRUFBQSxDQUFPLGFBQUosSUFBYSxJQUFiLElBQXFCLEVBQXhCO1lBRG1CLENBQXZCLEVBREo7U0FBQSxNQUFBO0FBSUk7dUJBQ0ksRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBbkIsRUFESjthQUFBLGFBQUE7Z0JBRU07dUJBQ0YsR0FISjthQUpKOztJQUZPOzs7Ozs7QUFXZixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuIyMjXG5cbm9zICAgICAgID0gcmVxdWlyZSAnb3MnXG5mcyAgICAgICA9IHJlcXVpcmUgJ2ZzJyBcbnBhdGggICAgID0gcmVxdWlyZSAncGF0aCdcblxuY2xhc3MgU2xhc2hcblxuICAgIEByZWcgPSBuZXcgUmVnRXhwIFwiXFxcXFxcXFxcIiwgJ2cnXG5cbiAgICBAd2luOiAtPiBwYXRoLnNlcCA9PSAnXFxcXCdcbiAgICBcbiAgICBAZXJyb3I6IChtc2cpIC0+XG4gICAgICAgICMgZXJyb3IgPSByZXF1aXJlICcuL2Vycm9yJ1xuICAgICAgICAjIGVycm9yIG1zZ1xuICAgICAgICAnJ1xuICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQHBhdGg6IChwKSAtPlxuICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC5wYXRoIC0tIG5vIHBhdGg/ICN7cH1cIiBpZiBub3QgcD8gb3IgcC5sZW5ndGggPT0gMFxuICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcFxuICAgICAgICBwID0gcC5yZXBsYWNlIFNsYXNoLnJlZywgJy8nXG4gICAgICAgIHBcblxuICAgIEB1bnNsYXNoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gudW5zbGFzaCAtLSBubyBwYXRoPyAje3B9XCIgaWYgbm90IHA/IG9yIHAubGVuZ3RoID09IDBcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBpZiBTbGFzaC53aW4oKVxuICAgICAgICAgICAgaWYgcC5sZW5ndGggPj0gMyBhbmQgcFswXSA9PSAnLycgPT0gcFsyXSBcbiAgICAgICAgICAgICAgICBwID0gcFsxXSArICc6JyArIHAuc2xpY2UgMlxuICAgICAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHBcbiAgICAgICAgICAgIGlmIHBbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcCA9IHAuc3BsaWNlIDAsIDEsIHBbMF0udG9VcHBlckNhc2UoKVxuICAgICAgICBwXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzcGxpdDogKHApIC0+IFNsYXNoLnBhdGgocCkuc3BsaXQoJy8nKS5maWx0ZXIgKGUpIC0+IGUubGVuZ3RoXG4gICAgXG4gICAgQHNwbGl0RHJpdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgU2xhc2gud2luKClcbiAgICAgICAgICAgIHJvb3QgPSBTbGFzaC5wYXJzZShwKS5yb290XG5cbiAgICAgICAgICAgIGlmIHJvb3QubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIGlmIHAubGVuZ3RoID4gcm9vdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGggPSBTbGFzaC5wYXRoIHAuc2xpY2Uocm9vdC5sZW5ndGgtMSlcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCA9ICcvJ1xuICAgICAgICAgICAgICAgIHJldHVybiBbZmlsZVBhdGggLCByb290LnNsaWNlIDAsIHJvb3QubGVuZ3RoLTJdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFtTbGFzaC5wYXRoKHApLCAnJ11cbiAgICAgICAgXG4gICAgQHJlbW92ZURyaXZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBTbGFzaC5zcGxpdERyaXZlKHApWzBdXG4gIFxuICAgIEBpc1Jvb3Q6IChwKSAtPiBTbGFzaC5yZW1vdmVEcml2ZShwKSA9PSAnLydcbiAgICAgICAgXG4gICAgQHNwbGl0RmlsZUxpbmU6IChwKSAtPiAgIyBmaWxlLnR4dDoxOjAgLS0+IFsnZmlsZS50eHQnLCAxLCAwXVxuICAgICAgICBcbiAgICAgICAgW2YsZF0gPSBTbGFzaC5zcGxpdERyaXZlIHBcbiAgICAgICAgc3BsaXQgPSBTdHJpbmcoZikuc3BsaXQgJzonXG4gICAgICAgIGxpbmUgPSBwYXJzZUludCBzcGxpdFsxXSBpZiBzcGxpdC5sZW5ndGggPiAxXG4gICAgICAgIGNsbW4gPSBwYXJzZUludCBzcGxpdFsyXSBpZiBzcGxpdC5sZW5ndGggPiAyXG4gICAgICAgIGwgPSBjID0gMFxuICAgICAgICBsID0gbGluZSBpZiBOdW1iZXIuaXNJbnRlZ2VyIGxpbmVcbiAgICAgICAgYyA9IGNsbW4gaWYgTnVtYmVyLmlzSW50ZWdlciBjbG1uXG4gICAgICAgIGQgPSBkICsgJzonIGlmIGQgIT0gJydcbiAgICAgICAgWyBkICsgc3BsaXRbMF0sIE1hdGgubWF4KGwsMSksICBNYXRoLm1heChjLDApIF1cbiAgICAgICAgXG4gICAgQHNwbGl0RmlsZVBvczogKHApIC0+ICMgZmlsZS50eHQ6MTozIC0tPiBbJ2ZpbGUudHh0JywgWzMsIDBdXVxuICAgIFxuICAgICAgICBbZixsLGNdID0gU2xhc2guc3BsaXRGaWxlTGluZSBwXG4gICAgICAgIFtmLCBbYywgbC0xXV1cbiAgICAgICAgXG4gICAgQHJlbW92ZUxpbmVQb3M6IChwKSAtPiBTbGFzaC5zcGxpdEZpbGVMaW5lKHApWzBdXG4gICAgQHJlbW92ZUNvbHVtbjogIChwKSAtPiBcbiAgICAgICAgW2YsbF0gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgaWYgbD4xIHRoZW4gZiArICc6JyArIGxcbiAgICAgICAgZWxzZSBmXG4gICAgICAgIFxuICAgIEBleHQ6ICAgICAgIChwKSAtPiBwYXRoLmV4dG5hbWUocCkuc2xpY2UgMVxuICAgIEBzcGxpdEV4dDogIChwKSAtPiBbU2xhc2gucmVtb3ZlRXh0KHApLCBTbGFzaC5leHQocCldXG4gICAgQHJlbW92ZUV4dDogKHApIC0+IFNsYXNoLmpvaW4gU2xhc2guZGlyKHApLCBTbGFzaC5iYXNlIHBcbiAgICBAc3dhcEV4dDogICAocCwgZXh0KSAtPiBTbGFzaC5yZW1vdmVFeHQocCkgKyAoZXh0LnN0YXJ0c1dpdGgoJy4nKSBhbmQgZXh0IG9yIFwiLiN7ZXh0fVwiKVxuICAgICAgICBcbiAgICAjICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBqb2luOiAtPiBbXS5tYXAuY2FsbChhcmd1bWVudHMsIFNsYXNoLnBhdGgpLmpvaW4gJy8nXG4gICAgXG4gICAgQGpvaW5GaWxlUG9zOiAoZmlsZSwgcG9zKSAtPiAjIFsnZmlsZS50eHQnLCBbMywgMF1dIC0tPiBmaWxlLnR4dDoxOjNcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBwb3M/IG9yIG5vdCBwb3NbMF0/XG4gICAgICAgICAgICBmaWxlXG4gICAgICAgIGVsc2UgaWYgcG9zWzBdXG4gICAgICAgICAgICBmaWxlICsgXCI6I3twb3NbMV0rMX06I3twb3NbMF19XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmlsZSArIFwiOiN7cG9zWzFdKzF9XCJcbiAgICAgICAgICAgICAgICBcbiAgICBAam9pbkZpbGVMaW5lOiAoZmlsZSwgbGluZSwgY29sKSAtPiAjICdmaWxlLnR4dCcsIDEsIDIgLS0+IGZpbGUudHh0OjE6MlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGZpbGUgaWYgbm90IGxpbmU/XG4gICAgICAgIHJldHVybiBcIiN7ZmlsZX06I3tsaW5lfVwiIGlmIG5vdCBjb2w/XG4gICAgICAgIFwiI3tmaWxlfToje2xpbmV9OiN7Y29sfVwiXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHBhdGhsaXN0OiAocCkgLT4gIyAnL3Jvb3QvZGlyL2ZpbGUudHh0JyAtLT4gWycvJywgJy9yb290JywgJy9yb290L2RpcicsICcvcm9vdC9kaXIvZmlsZS50eHQnXVxuICAgIFxuICAgICAgICByZXR1cm4gW10gaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBwID0gU2xhc2gucGF0aCBTbGFzaC5zYW5pdGl6ZSBwXG4gICAgICAgIGxpc3QgPSBbcF1cbiAgICAgICAgd2hpbGUgU2xhc2guZGlyKHApICE9ICcnXG4gICAgICAgICAgICBsaXN0LnVuc2hpZnQgU2xhc2guZGlyKHApXG4gICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbGlzdFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAYmFzZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGZpbGU6ICAgICAgIChwKSAgIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZXh0bmFtZTogICAgKHApICAgLT4gcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGJhc2VuYW1lOiAgIChwLGUpIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocCksIGVcbiAgICBAaXNBYnNvbHV0ZTogKHApICAgLT4gcGF0aC5pc0Fic29sdXRlIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGlzUmVsYXRpdmU6IChwKSAgIC0+IG5vdCBTbGFzaC5pc0Fic29sdXRlIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGRpcm5hbWU6ICAgIChwKSAgIC0+IFNsYXNoLnBhdGggcGF0aC5kaXJuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQG5vcm1hbGl6ZTogIChwKSAgIC0+IFNsYXNoLnBhdGggcGF0aC5ub3JtYWxpemUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZGlyOiAgICAgICAgKHApICAgLT4gXG4gICAgICAgIHAgPSBTbGFzaC5zYW5pdGl6ZSBwXG4gICAgICAgIGlmIFNsYXNoLmlzUm9vdCBwIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIHAgPSBwYXRoLmRpcm5hbWUgcFxuICAgICAgICBpZiBwID09ICcuJyB0aGVuIHJldHVybiAnJ1xuICAgICAgICBTbGFzaC5wYXRoIHBcbiAgICAgICAgXG4gICAgQHNhbml0aXplOiAocCkgLT4gXG4gICAgICAgIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5lcnJvciAnZW1wdHkgcGF0aCEnXG4gICAgICAgIGlmIHBbMF0gPT0gJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwibGVhZGluZyBuZXdsaW5lIGluIHBhdGghICcje3B9J1wiXG4gICAgICAgICAgICByZXR1cm4gU2xhc2guc2FuaXRpemUgcC5zdWJzdHIgMVxuICAgICAgICBpZiBwLmVuZHNXaXRoICdcXG4nXG4gICAgICAgICAgICBTbGFzaC5lcnJvciBcInRyYWlsaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAwLCBwLmxlbmd0aC0xXG4gICAgICAgIHBcbiAgICBcbiAgICBAcGFyc2U6IChwKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGRpY3QgPSBwYXRoLnBhcnNlIHBcbiAgICAgICAgXG4gICAgICAgIGlmIGRpY3QuZGlyLmxlbmd0aCA9PSAyIGFuZCBkaWN0LmRpclsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3QuZGlyICs9ICcvJ1xuICAgICAgICBpZiBkaWN0LnJvb3QubGVuZ3RoID09IDIgYW5kIGRpY3Qucm9vdFsxXSA9PSAnOidcbiAgICAgICAgICAgIGRpY3Qucm9vdCArPSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICBkaWN0XG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAaG9tZTogICAgICAgICAgLT4gU2xhc2gucGF0aCBvcy5ob21lZGlyKClcbiAgICBAdGlsZGU6ICAgICAocCkgLT4gU2xhc2gucGF0aChwKT8ucmVwbGFjZSBTbGFzaC5ob21lKCksICd+J1xuICAgIEB1bnRpbGRlOiAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIC9eXFx+LywgU2xhc2guaG9tZSgpXG4gICAgQHVuZW52OiAgICAgKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIDBcbiAgICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgICAgICBmb3Igayx2IG9mIHByb2Nlc3MuZW52XG4gICAgICAgICAgICAgICAgaWYgayA9PSBwLnNsaWNlIGkrMSwgaSsxK2subGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHAgPSBwLnNsaWNlKDAsIGkpICsgdiArIHAuc2xpY2UoaStrLmxlbmd0aCsxKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaSA9IHAuaW5kZXhPZiAnJCcsIGkrMVxuICAgICAgICBTbGFzaC5wYXRoIHBcbiAgICBcbiAgICBAcmVzb2x2ZTogKHApIC0+XG4gICAgICAgIFxuICAgICAgICBwID0gcHJvY2Vzcy5jd2QoKSBpZiBub3QgcD8ubGVuZ3RoXG4gICAgICAgIFNsYXNoLnBhdGggcGF0aC5yZXNvbHZlIFNsYXNoLnVuZW52IFNsYXNoLnVudGlsZGUgcFxuICAgIFxuICAgIEByZWxhdGl2ZTogKHJlbCwgdG8pIC0+XG4gICAgICAgIFxuICAgICAgICB0byA9IHByb2Nlc3MuY3dkKCkgaWYgbm90IHRvPy5sZW5ndGhcbiAgICAgICAgcmVsID0gU2xhc2gucmVzb2x2ZSByZWxcbiAgICAgICAgcmV0dXJuIHJlbCBpZiBub3QgU2xhc2guaXNBYnNvbHV0ZSByZWxcbiAgICAgICAgaWYgU2xhc2gucmVzb2x2ZSh0bykgPT0gcmVsXG4gICAgICAgICAgICByZXR1cm4gJy4nXG4gICAgICAgICAgICBcbiAgICAgICAgU2xhc2gucGF0aCBwYXRoLnJlbGF0aXZlIFNsYXNoLnJlc29sdmUodG8pLCByZWxcbiAgICAgICAgXG4gICAgQGZpbGVVcmw6IChwKSAtPiBcImZpbGU6Ly8vI3tTbGFzaC5lbmNvZGUgcH1cIlxuXG4gICAgQHNhbWVQYXRoOiAoYSwgYikgLT4gU2xhc2gucmVzb2x2ZShhKSA9PSBTbGFzaC5yZXNvbHZlKGIpXG5cbiAgICBAZXNjYXBlOiAocCkgLT4gcC5yZXBsYWNlIC8oW1xcYFxcXCJdKS9nLCAnXFxcXCQxJ1xuXG4gICAgQGVuY29kZTogKHApIC0+XG4gICAgICAgIHAgPSBlbmNvZGVVUkkgcFxuICAgICAgICBwID0gcC5yZXBsYWNlIC9cXCMvZywgXCIlMjNcIlxuICAgICAgICBwID0gcC5yZXBsYWNlIC9cXCYvZywgXCIlMjZcIlxuICAgICAgICBwID0gcC5yZXBsYWNlIC9cXCcvZywgXCIlMjdcIlxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgICAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgICAwMDAgICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBwa2c6IChwKSAtPlxuICAgIFxuICAgICAgICBpZiBwPy5sZW5ndGg/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlIHAubGVuZ3RoIGFuZCBTbGFzaC5yZW1vdmVEcml2ZShwKSBub3QgaW4gWycuJywgJy8nLCAnJ11cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5kaXJFeGlzdHMgIFNsYXNoLmpvaW4gcCwgJy5naXQnICAgICAgICAgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZmlsZUV4aXN0cyBTbGFzaC5qb2luIHAsICdwYWNrYWdlLm5vb24nIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmZpbGVFeGlzdHMgU2xhc2guam9pbiBwLCAncGFja2FnZS5qc29uJyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbnVsbFxuXG4gICAgQGdpdDogKHApIC0+XG5cbiAgICAgICAgaWYgcD8ubGVuZ3RoP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSBwLmxlbmd0aCBhbmQgU2xhc2gucmVtb3ZlRHJpdmUocCkgbm90IGluIFsnLicsICcvJywgJyddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZGlyRXhpc3RzIFNsYXNoLmpvaW4gcCwgJy5naXQnIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIHAgPSBTbGFzaC5kaXIgcFxuICAgICAgICBudWxsXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBAZXhpc3RzOiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgaWYgbm90IHA/XG4gICAgICAgICAgICAgICAgY2IoKSBcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIHAgPSBTbGFzaC5yZXNvbHZlIFNsYXNoLnJlbW92ZUxpbmVQb3MgcFxuICAgICAgICAgICAgZnMuYWNjZXNzIHAsIGZzLlJfT0sgfCBmcy5GX09LLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgICAgICAgICAgY2IoKSBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGZzLnN0YXQgcCwgKGVyciwgc3RhdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYigpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2Igc3RhdFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBwP1xuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICAgICAgaWYgc3RhdCA9IGZzLnN0YXRTeW5jKHApXG4gICAgICAgICAgICAgICAgICAgIGZzLmFjY2Vzc1N5bmMgcCwgZnMuUl9PS1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdFxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgaWYgZXJyLmNvZGUgaW4gWydFTk9FTlQnLCAnRU5PVERJUiddXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgIGVycm9yIGVyclxuICAgICAgICBudWxsICAgICBcbiAgICAgICAgXG4gICAgQHRvdWNoOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGZzLm1rZGlyU3luYyBTbGFzaC5kaXJuYW1lKHApLCByZWN1cnNpdmU6dHJ1ZVxuICAgICAgICBpZiBub3QgU2xhc2guZmlsZUV4aXN0cyBwXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIHAsICcnXG4gICAgICAgIFxuICAgIEBmaWxlRXhpc3RzOiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRmlsZSgpIHRoZW4gY2Igc3RhdFxuICAgICAgICAgICAgICAgIGVsc2UgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBzdGF0ID0gU2xhc2guZXhpc3RzIHBcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdCBpZiBzdGF0LmlzRmlsZSgpXG5cbiAgICBAZGlyRXhpc3RzOiAocCwgY2IpIC0+XG5cbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIFNsYXNoLmV4aXN0cyBwLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBzdGF0Py5pc0RpcmVjdG9yeSgpIHRoZW4gY2Igc3RhdFxuICAgICAgICAgICAgICAgIGVsc2UgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBzdGF0ID0gU2xhc2guZXhpc3RzIHBcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdCBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgIFxuICAgIEBpc0RpcjogIChwLCBjYikgLT4gU2xhc2guZGlyRXhpc3RzIHAsIGNiXG4gICAgQGlzRmlsZTogKHAsIGNiKSAtPiBTbGFzaC5maWxlRXhpc3RzIHAsIGNiXG4gICAgXG4gICAgQGlzV3JpdGFibGU6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICBmcy5hY2Nlc3MgU2xhc2gucmVzb2x2ZShwKSwgZnMuUl9PSyB8IGZzLldfT0ssIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgY2Igbm90IGVycj9cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBTbGFzaC5yZXNvbHZlKHApLCBmcy5SX09LIHwgZnMuV19PS1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQHVzZXJEYXRhOiAtPlxuICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGVsZWN0cm9uID0gcmVxdWlyZSAnZWxlY3Ryb24nXG4gICAgICAgICAgICBpZiBwcm9jZXNzLnR5cGUgPT0gJ3JlbmRlcmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVjdHJvbi5yZW1vdGUuYXBwLmdldFBhdGggJ3VzZXJEYXRhJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVjdHJvbi5hcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgaWYgcGtnRGlyID0gU2xhc2gucGtnIF9fZGlybmFtZVxuICAgICAgICAgICAgICAgICAgICBwa2cgPSByZXF1aXJlIHNsYXNoLmpvaW4gcGtnRGlyLCAncGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgICAgICAgICB7IHNkcyB9ID0gcmVxdWlyZSAnLi9reGsnXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBzZHMuZmluZC52YWx1ZSBwa2csICduYW1lJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU2xhc2gucmVzb2x2ZSBcIn4vQXBwRGF0YS9Sb2FtaW5nLyN7bmFtZX1cIlxuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgZXJyb3IgZXJyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBTbGFzaC5yZXNvbHZlIFwifi9BcHBEYXRhL1JvYW1pbmcvXCJcblxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgXG4gICAgXG4gICAgQHRleHRleHQ6IG51bGxcbiAgICBcbiAgICBAdGV4dGJhc2U6IFxuICAgICAgICBwcm9maWxlOjFcbiAgICAgICAgbGljZW5zZToxXG4gICAgICAgICcuZ2l0aWdub3JlJzoxXG4gICAgICAgICcubnBtaWdub3JlJzoxXG4gICAgXG4gICAgQGlzVGV4dDogKGYpIC0+XG4gICAgXG4gICAgICAgIGlmIG5vdCBTbGFzaC50ZXh0ZXh0XG4gICAgICAgICAgICBTbGFzaC50ZXh0ZXh0ID0ge31cbiAgICAgICAgICAgIGZvciBleHQgaW4gcmVxdWlyZSAndGV4dGV4dGVuc2lvbnMnXG4gICAgICAgICAgICAgICAgU2xhc2gudGV4dGV4dFtleHRdID0gdHJ1ZVxuICAgICAgICAgICAgU2xhc2gudGV4dGV4dFsnY3J5cHQnXSAgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBleHQgPSBTbGFzaC5leHQgZlxuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBleHQgYW5kIFNsYXNoLnRleHRleHRbZXh0XT8gXG4gICAgICAgIHJldHVybiB0cnVlIGlmIFNsYXNoLnRleHRiYXNlW1NsYXNoLmJhc2VuYW1lKGYpLnRvTG93ZXJDYXNlKCldXG4gICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgU2xhc2guaXNGaWxlIGZcbiAgICAgICAgaXNCaW5hcnkgPSByZXF1aXJlICdpc2JpbmFyeWZpbGUnXG4gICAgICAgIHJldHVybiBub3QgaXNCaW5hcnkuaXNCaW5hcnlGaWxlU3luYyBmXG4gICAgICAgIFxuICAgIEByZWFkVGV4dDogKGYsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlIGYsICd1dGY4JywgKGVyciwgdGV4dCkgLT4gXG4gICAgICAgICAgICAgICAgY2Igbm90IGVycj8gYW5kIHRleHQgb3IgJydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGVTeW5jIGYsICd1dGY4J1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgJydcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gU2xhc2hcbiJdfQ==
//# sourceURL=../coffee/kslash.coffee