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
        p = path.normalize(p);
        p = p.replace(Slash.reg, '/');
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
                return [p.slice(2), parsed.dir.slice(0, 2)];
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
        return !Slash.isAbsolute(p);
    };

    Slash.dirname = function(p) {
        return Slash.path(path.dirname(Slash.sanitize(p)));
    };

    Slash.normalize = function(p) {
        return Slash.path(Slash.sanitize(p));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3NsYXNoLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVI7O0FBQ1AsRUFBQSxHQUFPLE9BQUEsQ0FBUSxJQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFFRDs7O0lBUUYsS0FBQyxDQUFBLElBQUQsR0FBTyxTQUFDLENBQUQ7UUFDSCxJQUErQyxjQUFJLENBQUMsQ0FBRSxnQkFBdEQ7QUFBQSxtQkFBTyxLQUFLLENBQUMsS0FBTixDQUFZLHdCQUFaLEVBQVA7O1FBQ0EsQ0FBQSxHQUFJLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZjtRQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQUssQ0FBQyxHQUFoQixFQUFxQixHQUFyQjtlQUNKO0lBSkc7O0lBTVAsS0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLENBQUQ7UUFDTixJQUFrRCxjQUFJLENBQUMsQ0FBRSxnQkFBekQ7QUFBQSxtQkFBTyxLQUFLLENBQUMsS0FBTixDQUFZLDJCQUFaLEVBQVA7O1FBQ0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWDtRQUNKLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBQSxDQUFIO1lBQ0ksSUFBRyxDQUFDLENBQUMsTUFBRixJQUFZLENBQVosSUFBa0IsQ0FBQSxDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsR0FBUixJQUFRLEdBQVIsS0FBZSxDQUFFLENBQUEsQ0FBQSxDQUFqQixDQUFyQjtnQkFDSSxDQUFBLEdBQUksQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLEdBQVAsR0FBYSxDQUFDLENBQUMsS0FBRixDQUFRLENBQVIsRUFEckI7O1lBRUEsQ0FBQSxHQUFJLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZjtZQUNKLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRixLQUFRLEdB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QUFDLENBQUEsR0FBRCxHQUFNLFNBQUE7ZUFBRyxJQUFJLENBQUMsR0FBTCxLQUFZO0lBQWY7O0lBRU4sS0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLEdBQUQ7ZUFBUztJQUFUOzs7Ozs7QUFFWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMDAwICAgIFxuMDAwICAwMDAgICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuIyMjXG5cbm9zICAgPSByZXF1aXJlICdvcydcbmZzICAgPSByZXF1aXJlICdmcycgXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxuY2xhc3MgU2xhc2hcblxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQHBhdGg6IChwKSAtPlxuICAgICAgICByZXR1cm4gU2xhc2guZXJyb3IgXCJTbGFzaC5wYXRoIC0tIG5vIHBhdGg/XCIgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBwID0gcGF0aC5ub3JtYWxpemUgcFxuICAgICAgICBwID0gcC5yZXBsYWNlIFNsYXNoLnJlZywgJy8nXG4gICAgICAgIHBcblxuICAgIEB1bnNsYXNoOiAocCkgLT5cbiAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gudW5zbGFzaCAtLSBubyBwYXRoP1wiIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgcCA9IFNsYXNoLnBhdGggcFxuICAgICAgICBpZiBTbGFzaC53aW4oKVxuICAgICAgICAgICAgaWYgcC5sZW5ndGggPj0gMyBhbmQgcFswXSA9PSAnLycgPT0gcFsyXSBcbiAgICAgICAgICAgICAgICBwID0gcFsxXSArICc6JyArIHAuc2xpY2UgMlxuICAgICAgICAgICAgcCA9IHBhdGgubm9ybWFsaXplIHBcbiAgICAgICAgICAgIGlmIHBbMV0gPT0gJzonXG4gICAgICAgICAgICAgICAgcCA9ICBwWzBdLnRvVXBwZXJDYXNlKCkgKyBwWzEuLl1cbiAgICAgICAgcFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc3BsaXQ6IChwKSAtPiBTbGFzaC5wYXRoKHApLnNwbGl0KCcvJykuZmlsdGVyIChlKSAtPiBlLmxlbmd0aFxuICAgIFxuICAgIEBzcGxpdERyaXZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHAgPSBTbGFzaC5wYXRoIHBcbiAgICAgICAgcGFyc2VkID0gU2xhc2gucGFyc2UgcFxuICAgICAgICByb290ID0gcGFyc2VkLnJvb3RcblxuICAgICAgICBpZiByb290Lmxlbmd0aCA+IDFcbiAgICAgICAgICAgIGlmIHAubGVuZ3RoID4gcm9vdC5sZW5ndGhcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IHAuc2xpY2Uocm9vdC5sZW5ndGgtMSlcbiAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSAnLydcbiAgICAgICAgICAgIHJldHVybiBbZmlsZVBhdGggLCByb290LnNsaWNlIDAsIHJvb3QubGVuZ3RoLTJdXG4gICAgICAgIGVsc2UgaWYgcGFyc2VkLmRpci5sZW5ndGggPiAxXG4gICAgICAgICAgICBpZiBwYXJzZWQuZGlyWzFdID09ICc6J1xuICAgICAgICAgICAgICAgIHJldHVybiBbcFsyLi5dLCBwYXJzZWQuZGlyWy4uMV1dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFtTbGFzaC5wYXRoKHApLCAnJ11cbiAgICAgICAgXG4gICAgQHJlbW92ZURyaXZlOiAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBTbGFzaC5zcGxpdERyaXZlKHApWzBdXG4gIFxuICAgIEBpc1Jvb3Q6IChwKSAtPiBTbGFzaC5yZW1vdmVEcml2ZShwKSA9PSAnLydcbiAgICAgICAgXG4gICAgQHNwbGl0RmlsZUxpbmU6IChwKSAtPiAgIyBmaWxlLnR4dDoxOjAgLS0+IFsnZmlsZS50eHQnLCAxLCAwXVxuICAgICAgICBcbiAgICAgICAgW2YsZF0gPSBTbGFzaC5zcGxpdERyaXZlIHBcbiAgICAgICAgc3BsaXQgPSBTdHJpbmcoZikuc3BsaXQgJzonXG4gICAgICAgIGxpbmUgPSBwYXJzZUludCBzcGxpdFsxXSBpZiBzcGxpdC5sZW5ndGggPiAxXG4gICAgICAgIGNsbW4gPSBwYXJzZUludCBzcGxpdFsyXSBpZiBzcGxpdC5sZW5ndGggPiAyXG4gICAgICAgIGwgPSBjID0gMFxuICAgICAgICBsID0gbGluZSBpZiBOdW1iZXIuaXNJbnRlZ2VyIGxpbmVcbiAgICAgICAgYyA9IGNsbW4gaWYgTnVtYmVyLmlzSW50ZWdlciBjbG1uXG4gICAgICAgIGQgPSBkICsgJzonIGlmIGQgIT0gJydcbiAgICAgICAgWyBkICsgc3BsaXRbMF0sIE1hdGgubWF4KGwsMSksICBNYXRoLm1heChjLDApIF1cbiAgICAgICAgXG4gICAgQHNwbGl0RmlsZVBvczogKHApIC0+ICMgZmlsZS50eHQ6MTozIC0tPiBbJ2ZpbGUudHh0JywgWzMsIDBdXVxuICAgIFxuICAgICAgICBbZixsLGNdID0gU2xhc2guc3BsaXRGaWxlTGluZSBwXG4gICAgICAgIFtmLCBbYywgbC0xXV1cbiAgICAgICAgXG4gICAgQHJlbW92ZUxpbmVQb3M6IChwKSAtPiBTbGFzaC5zcGxpdEZpbGVMaW5lKHApWzBdXG4gICAgQHJlbW92ZUNvbHVtbjogIChwKSAtPiBcbiAgICAgICAgW2YsbF0gPSBTbGFzaC5zcGxpdEZpbGVMaW5lIHBcbiAgICAgICAgaWYgbD4xIHRoZW4gZiArICc6JyArIGxcbiAgICAgICAgZWxzZSBmXG4gICAgICAgIFxuICAgIEBleHQ6ICAgICAgIChwKSAtPiBwYXRoLmV4dG5hbWUocCkuc2xpY2UgMVxuICAgIEBzcGxpdEV4dDogIChwKSAtPiBbU2xhc2gucmVtb3ZlRXh0KHApLCBTbGFzaC5leHQocCldXG4gICAgQHJlbW92ZUV4dDogKHApIC0+IFNsYXNoLmpvaW4gU2xhc2guZGlyKHApLCBTbGFzaC5iYXNlIHBcbiAgICBAc3dhcEV4dDogICAocCwgZXh0KSAtPiBTbGFzaC5yZW1vdmVFeHQocCkgKyAoZXh0LnN0YXJ0c1dpdGgoJy4nKSBhbmQgZXh0IG9yIFwiLiN7ZXh0fVwiKVxuICAgICAgICBcbiAgICAjICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBqb2luOiAtPiBbXS5tYXAuY2FsbChhcmd1bWVudHMsIFNsYXNoLnBhdGgpLmpvaW4gJy8nXG4gICAgXG4gICAgQGpvaW5GaWxlUG9zOiAoZmlsZSwgcG9zKSAtPiAjIFsnZmlsZS50eHQnLCBbMywgMF1dIC0tPiBmaWxlLnR4dDoxOjNcbiAgICAgICAgXG4gICAgICAgIGZpbGUgPSBTbGFzaC5yZW1vdmVMaW5lUG9zIGZpbGVcbiAgICAgICAgaWYgbm90IHBvcz8gb3Igbm90IHBvc1swXT9cbiAgICAgICAgICAgIGZpbGVcbiAgICAgICAgZWxzZSBpZiBwb3NbMF1cbiAgICAgICAgICAgIGZpbGUgKyBcIjoje3Bvc1sxXSsxfToje3Bvc1swXX1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICsgXCI6I3twb3NbMV0rMX1cIlxuICAgICAgICAgICAgICAgIFxuICAgIEBqb2luRmlsZUxpbmU6IChmaWxlLCBsaW5lLCBjb2wpIC0+ICMgJ2ZpbGUudHh0JywgMSwgMiAtLT4gZmlsZS50eHQ6MToyXG4gICAgICAgIFxuICAgICAgICBmaWxlID0gU2xhc2gucmVtb3ZlTGluZVBvcyBmaWxlXG4gICAgICAgIHJldHVybiBmaWxlIGlmIG5vdCBsaW5lXG4gICAgICAgIHJldHVybiBcIiN7ZmlsZX06I3tsaW5lfVwiIGlmIG5vdCBjb2xcbiAgICAgICAgXCIje2ZpbGV9OiN7bGluZX06I3tjb2x9XCJcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBAcGF0aGxpc3Q6IChwKSAtPiAjICcvcm9vdC9kaXIvZmlsZS50eHQnIC0tPiBbJy8nLCAnL3Jvb3QnLCAnL3Jvb3QvZGlyJywgJy9yb290L2Rpci9maWxlLnR4dCddXG4gICAgXG4gICAgICAgIGlmIG5vdCBwPy5sZW5ndGhcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gucGF0aGxpc3QgLS0gbm8gcGF0aD9cIiBcbiAgICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICBwID0gU2xhc2gucGF0aCBTbGFzaC5zYW5pdGl6ZSBwXG4gICAgICAgIGxpc3QgPSBbcF1cbiAgICAgICAgd2hpbGUgU2xhc2guZGlyKHApICE9ICcnXG4gICAgICAgICAgICBsaXN0LnVuc2hpZnQgU2xhc2guZGlyKHApXG4gICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbGlzdFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAYmFzZTogICAgICAgKHApICAgLT4gcGF0aC5iYXNlbmFtZSBTbGFzaC5zYW5pdGl6ZShwKSwgcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGZpbGU6ICAgICAgIChwKSAgIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAZXh0bmFtZTogICAgKHApICAgLT4gcGF0aC5leHRuYW1lIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGJhc2VuYW1lOiAgIChwLGUpIC0+IHBhdGguYmFzZW5hbWUgU2xhc2guc2FuaXRpemUocCksIGVcbiAgICBAaXNBYnNvbHV0ZTogKHApICAgLT4gcGF0aC5pc0Fic29sdXRlIFNsYXNoLnNhbml0aXplKHApXG4gICAgQGlzUmVsYXRpdmU6IChwKSAgIC0+IG5vdCBTbGFzaC5pc0Fic29sdXRlIHBcbiAgICBAZGlybmFtZTogICAgKHApICAgLT4gU2xhc2gucGF0aCBwYXRoLmRpcm5hbWUgU2xhc2guc2FuaXRpemUocClcbiAgICBAbm9ybWFsaXplOiAgKHApICAgLT4gU2xhc2gucGF0aCBTbGFzaC5zYW5pdGl6ZShwKVxuICAgIFxuICAgIEBkaXI6IChwKSAtPiBcbiAgICAgICAgcCA9IFNsYXNoLnNhbml0aXplIHBcbiAgICAgICAgaWYgU2xhc2guaXNSb290IHAgdGhlbiByZXR1cm4gJydcbiAgICAgICAgcCA9IHBhdGguZGlybmFtZSBwXG4gICAgICAgIGlmIHAgPT0gJy4nIHRoZW4gcmV0dXJuICcnXG4gICAgICAgIFNsYXNoLnBhdGggcFxuICAgICAgICBcbiAgICBAc2FuaXRpemU6IChwKSAtPiBcbiAgICAgICAgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2guc2FuaXRpemUgLS0gbm8gcGF0aD9cIiBcbiAgICAgICAgaWYgcFswXSA9PSAnXFxuJ1xuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJsZWFkaW5nIG5ld2xpbmUgaW4gcGF0aCEgJyN7cH0nXCJcbiAgICAgICAgICAgIHJldHVybiBTbGFzaC5zYW5pdGl6ZSBwLnN1YnN0ciAxXG4gICAgICAgIGlmIHAuZW5kc1dpdGggJ1xcbidcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwidHJhaWxpbmcgbmV3bGluZSBpbiBwYXRoISAnI3twfSdcIlxuICAgICAgICAgICAgcmV0dXJuIFNsYXNoLnNhbml0aXplIHAuc3Vic3RyIDAsIHAubGVuZ3RoLTFcbiAgICAgICAgcFxuICAgIFxuICAgIEBwYXJzZTogKHApIC0+IFxuICAgICAgICBcbiAgICAgICAgZGljdCA9IHBhdGgucGFyc2UgcFxuICAgICAgICBcbiAgICAgICAgaWYgZGljdC5kaXIubGVuZ3RoID09IDIgYW5kIGRpY3QuZGlyWzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5kaXIgKz0gJy8nXG4gICAgICAgIGlmIGRpY3Qucm9vdC5sZW5ndGggPT0gMiBhbmQgZGljdC5yb290WzFdID09ICc6J1xuICAgICAgICAgICAgZGljdC5yb290ICs9ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgIGRpY3RcbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBob21lOiAgICAgICAgICAtPiBTbGFzaC5wYXRoIG9zLmhvbWVkaXIoKVxuICAgIEB0aWxkZTogICAgIChwKSAtPiBTbGFzaC5wYXRoKHApPy5yZXBsYWNlIFNsYXNoLmhvbWUoKSwgJ34nXG4gICAgQHVudGlsZGU6ICAgKHApIC0+IFNsYXNoLnBhdGgocCk/LnJlcGxhY2UgL15cXH4vLCBTbGFzaC5ob21lKClcbiAgICBAdW5lbnY6ICAgICAocCkgLT4gXG4gICAgICAgIFxuICAgICAgICBpID0gcC5pbmRleE9mICckJywgMFxuICAgICAgICB3aGlsZSBpID49IDBcbiAgICAgICAgICAgIGZvciBrLHYgb2YgcHJvY2Vzcy5lbnZcbiAgICAgICAgICAgICAgICBpZiBrID09IHAuc2xpY2UgaSsxLCBpKzEray5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcCA9IHAuc2xpY2UoMCwgaSkgKyB2ICsgcC5zbGljZShpK2subGVuZ3RoKzEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpID0gcC5pbmRleE9mICckJywgaSsxXG4gICAgICAgICAgICBcbiAgICAgICAgU2xhc2gucGF0aCBwXG4gICAgXG4gICAgQHJlc29sdmU6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgcCA9IHByb2Nlc3MuY3dkKCkgaWYgbm90IHA/Lmxlbmd0aFxuICAgICAgICBTbGFzaC5wYXRoIHBhdGgucmVzb2x2ZSBTbGFzaC51bmVudiBTbGFzaC51bnRpbGRlIHBcbiAgICBcbiAgICBAcmVsYXRpdmU6IChyZWwsIHRvKSAtPlxuICAgICAgICBcbiAgICAgICAgdG8gPSBwcm9jZXNzLmN3ZCgpIGlmIG5vdCB0bz8ubGVuZ3RoXG4gICAgICAgIHJlbCA9IFNsYXNoLnJlc29sdmUgcmVsXG4gICAgICAgIHJldHVybiByZWwgaWYgbm90IFNsYXNoLmlzQWJzb2x1dGUgcmVsXG4gICAgICAgIGlmIFNsYXNoLnJlc29sdmUodG8pID09IHJlbFxuICAgICAgICAgICAgcmV0dXJuICcuJ1xuICAgICAgICAgICAgXG4gICAgICAgIFNsYXNoLnBhdGggcGF0aC5yZWxhdGl2ZSBTbGFzaC5yZXNvbHZlKHRvKSwgcmVsXG4gICAgICAgIFxuICAgIEBmaWxlVXJsOiAocCkgLT4gXCJmaWxlOi8vLyN7U2xhc2guZW5jb2RlIHB9XCJcblxuICAgIEBzYW1lUGF0aDogKGEsIGIpIC0+IFNsYXNoLnJlc29sdmUoYSkgPT0gU2xhc2gucmVzb2x2ZShiKVxuXG4gICAgQGVzY2FwZTogKHApIC0+IHAucmVwbGFjZSAvKFtcXGBcXFwiXSkvZywgJ1xcXFwkMSdcblxuICAgIEBlbmNvZGU6IChwKSAtPlxuICAgICAgICBwID0gZW5jb2RlVVJJIHBcbiAgICAgICAgcCA9IHAucmVwbGFjZSAvXFwjL2csIFwiJTIzXCJcbiAgICAgICAgcCA9IHAucmVwbGFjZSAvXFwmL2csIFwiJTI2XCJcbiAgICAgICAgcCA9IHAucmVwbGFjZSAvXFwnL2csIFwiJTI3XCJcblxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMDAgICAgMDAwICAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAcGtnOiAocCkgLT5cbiAgICBcbiAgICAgICAgaWYgcD8ubGVuZ3RoP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSBwLmxlbmd0aCBhbmQgU2xhc2gucmVtb3ZlRHJpdmUocCkgbm90IGluIFsnLicsICcvJywgJyddXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgU2xhc2guZGlyRXhpc3RzICBTbGFzaC5qb2luIHAsICcuZ2l0JyAgICAgICAgIHRoZW4gcmV0dXJuIFNsYXNoLnJlc29sdmUgcFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmZpbGVFeGlzdHMgU2xhc2guam9pbiBwLCAncGFja2FnZS5ub29uJyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBpZiBTbGFzaC5maWxlRXhpc3RzIFNsYXNoLmpvaW4gcCwgJ3BhY2thZ2UuanNvbicgdGhlbiByZXR1cm4gU2xhc2gucmVzb2x2ZSBwXG4gICAgICAgICAgICAgICAgcCA9IFNsYXNoLmRpciBwXG4gICAgICAgIG51bGxcblxuICAgIEBnaXQ6IChwKSAtPlxuXG4gICAgICAgIGlmIHA/Lmxlbmd0aD9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgcC5sZW5ndGggYW5kIFNsYXNoLnJlbW92ZURyaXZlKHApIG5vdCBpbiBbJy4nLCAnLycsICcnXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFNsYXNoLmRpckV4aXN0cyBTbGFzaC5qb2luIHAsICcuZ2l0JyB0aGVuIHJldHVybiBTbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgICAgICAgICBwID0gU2xhc2guZGlyIHBcbiAgICAgICAgbnVsbFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgQGV4aXN0czogKHAsIGNiKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGlmIG5vdCBwP1xuICAgICAgICAgICAgICAgICAgICBjYigpIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBwID0gU2xhc2gucmVzb2x2ZSBTbGFzaC5yZW1vdmVMaW5lUG9zIHBcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3MgcCwgZnMuUl9PSyB8IGZzLkZfT0ssIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGVycj9cbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKCkgXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnN0YXQgcCwgKGVyciwgc3RhdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBlcnI/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiIHN0YXRcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5leGlzdHMgLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgcD9cbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgcCA9IFNsYXNoLnJlc29sdmUgU2xhc2gucmVtb3ZlTGluZVBvcyBwXG4gICAgICAgICAgICAgICAgICAgIGlmIHN0YXQgPSBmcy5zdGF0U3luYyhwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZnMuYWNjZXNzU3luYyBwLCBmcy5SX09LXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdFxuICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICBpZiBlcnIuY29kZSBpbiBbJ0VOT0VOVCcsICdFTk9URElSJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2guZXhpc3RzIC0tIFwiICsgU3RyaW5nKGVycikgXG4gICAgICAgIG51bGwgICAgIFxuICAgICAgICBcbiAgICBAdG91Y2g6IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBmcy5ta2RpclN5bmMgU2xhc2guZGlybmFtZShwKSwgcmVjdXJzaXZlOnRydWVcbiAgICAgICAgICAgIGlmIG5vdCBTbGFzaC5maWxlRXhpc3RzIHBcbiAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIHAsICcnXG4gICAgICAgICAgICByZXR1cm4gcFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIFNsYXNoLmVycm9yIFwiU2xhc2gudG91Y2ggLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIFxuICAgIEBmaWxlRXhpc3RzOiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgU2xhc2guZXhpc3RzIHAsIChzdGF0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHN0YXQ/LmlzRmlsZSgpIHRoZW4gY2Igc3RhdFxuICAgICAgICAgICAgICAgIGVsc2UgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBzdGF0ID0gU2xhc2guZXhpc3RzIHBcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdCBpZiBzdGF0LmlzRmlsZSgpXG5cbiAgICBAZGlyRXhpc3RzOiAocCwgY2IpIC0+XG5cbiAgICAgICAgaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2JcbiAgICAgICAgICAgIFNsYXNoLmV4aXN0cyBwLCAoc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBzdGF0Py5pc0RpcmVjdG9yeSgpIHRoZW4gY2Igc3RhdFxuICAgICAgICAgICAgICAgIGVsc2UgY2IoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBzdGF0ID0gU2xhc2guZXhpc3RzIHBcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdCBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgIFxuICAgIEBpc0RpcjogIChwLCBjYikgLT4gU2xhc2guZGlyRXhpc3RzIHAsIGNiXG4gICAgQGlzRmlsZTogKHAsIGNiKSAtPiBTbGFzaC5maWxlRXhpc3RzIHAsIGNiXG4gICAgXG4gICAgQGlzV3JpdGFibGU6IChwLCBjYikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICdmdW5jdGlvbicgPT0gdHlwZW9mIGNiXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3MgU2xhc2gucmVzb2x2ZShwKSwgZnMuUl9PSyB8IGZzLldfT0ssIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNiIG5vdCBlcnI/XG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBTbGFzaC5lcnJvciBcIlNsYXNoLmlzV3JpdGFibGUgLS0gXCIgKyBTdHJpbmcoZXJyKSBcbiAgICAgICAgICAgICAgICBjYiBmYWxzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBmcy5hY2Nlc3NTeW5jIFNsYXNoLnJlc29sdmUocCksIGZzLlJfT0sgfCBmcy5XX09LXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAdXNlckRhdGE6IC0+XG4gICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZWxlY3Ryb24gPSByZXF1aXJlICdlbGVjdHJvbidcbiAgICAgICAgICAgIGlmIHByb2Nlc3MudHlwZSA9PSAncmVuZGVyZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZWN0cm9uLnJlbW90ZS5hcHAuZ2V0UGF0aCAndXNlckRhdGEnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZWN0cm9uLmFwcC5nZXRQYXRoICd1c2VyRGF0YSdcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBpZiBwa2dEaXIgPSBTbGFzaC5wa2cgX19kaXJuYW1lXG4gICAgICAgICAgICAgICAgICAgIHBrZyA9IHJlcXVpcmUgc2xhc2guam9pbiBwa2dEaXIsICdwYWNrYWdlLmpzb24nXG4gICAgICAgICAgICAgICAgICAgIHsgc2RzIH0gPSByZXF1aXJlICcuL2t4aydcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHNkcy5maW5kLnZhbHVlIHBrZywgJ25hbWUnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTbGFzaC5yZXNvbHZlIFwifi9BcHBEYXRhL1JvYW1pbmcvI3tuYW1lfVwiXG4gICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBlcnJvciBlcnJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIFNsYXNoLnJlc29sdmUgXCJ+L0FwcERhdGEvUm9hbWluZy9cIlxuXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICBcbiAgICBcbiAgICBAdGV4dGV4dDogbnVsbFxuICAgIFxuICAgIEB0ZXh0YmFzZTogXG4gICAgICAgIHByb2ZpbGU6MVxuICAgICAgICBsaWNlbnNlOjFcbiAgICAgICAgJy5naXRpZ25vcmUnOjFcbiAgICAgICAgJy5ucG1pZ25vcmUnOjFcbiAgICBcbiAgICBAaXNUZXh0OiAocCkgLT5cbiAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBpZiBub3QgU2xhc2gudGV4dGV4dFxuICAgICAgICAgICAgICAgIFNsYXNoLnRleHRleHQgPSB7fVxuICAgICAgICAgICAgICAgIGZvciBleHQgaW4gcmVxdWlyZSAndGV4dGV4dGVuc2lvbnMnXG4gICAgICAgICAgICAgICAgICAgIFNsYXNoLnRleHRleHRbZXh0XSA9IHRydWVcbiAgICAgICAgICAgICAgICBTbGFzaC50ZXh0ZXh0WydjcnlwdCddICA9IHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXh0ID0gU2xhc2guZXh0IHBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGV4dCBhbmQgU2xhc2gudGV4dGV4dFtleHRdPyBcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIFNsYXNoLnRleHRiYXNlW1NsYXNoLmJhc2VuYW1lKGYpLnRvTG93ZXJDYXNlKCldXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IFNsYXNoLmlzRmlsZSBwXG4gICAgICAgICAgICBpc0JpbmFyeSA9IHJlcXVpcmUgJ2lzYmluYXJ5ZmlsZSdcbiAgICAgICAgICAgIHJldHVybiBub3QgaXNCaW5hcnkuaXNCaW5hcnlGaWxlU3luYyBwXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgU2xhc2guZXJyb3IgXCJTbGFzaC5pc1RleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgQHJlYWRUZXh0OiAocCwgY2IpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAnZnVuY3Rpb24nID09IHR5cGVvZiBjYlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGUgcCwgJ3V0ZjgnLCAoZXJyLCB0ZXh0KSAtPiBcbiAgICAgICAgICAgICAgICAgICAgY2Igbm90IGVycj8gYW5kIHRleHQgb3IgJydcbiAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgIHJldHVybiBTbGFzaC5lcnJvciBcIlNsYXNoLnJlYWRUZXh0IC0tIFwiICsgU3RyaW5nKGVycilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZnMucmVhZEZpbGVTeW5jIHAsICd1dGY4J1xuICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNsYXNoLmVycm9yIFwiU2xhc2gucmVhZFRleHQgLS0gXCIgKyBTdHJpbmcoZXJyKVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEByZWcgPSBuZXcgUmVnRXhwIFwiXFxcXFxcXFxcIiwgJ2cnXG5cbiAgICBAd2luOiAtPiBwYXRoLnNlcCA9PSAnXFxcXCdcbiAgICBcbiAgICBAZXJyb3I6IChtc2cpIC0+ICcnXG5cbm1vZHVsZS5leHBvcnRzID0gU2xhc2hcbiJdfQ==
//# sourceURL=../coffee/kslash.coffee