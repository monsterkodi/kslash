// koffee 1.4.0

/*
0000000    000  00000000   000      000   0000000  000000000  
000   000  000  000   000  000      000  000          000     
000   000  000  0000000    000      000  0000000      000     
000   000  000  000   000  000      000       000     000     
0000000    000  000   000  0000000  000  0000000      000
 */
var dirList, slash;

slash = require('./kslash');

dirList = function(dirPath, opt, cb) {
    var dirs, err, fileSort, files, filter, onDir, onFile, walkdir, walker;
    walkdir = require('walkdir');
    if (typeof dirPath === 'function' && (opt == null)) {
        cb = dirPath;
        dirPath = '.';
    } else {
        if (typeof opt === 'function' && (cb == null)) {
            cb = opt;
        } else {
            if (cb != null) {
                cb;
            } else {
                cb = opt != null ? opt.cb : void 0;
            }
        }
    }
    if (opt != null) {
        opt;
    } else {
        opt = {};
    }
    if (opt.textTest != null) {
        opt.textTest;
    } else {
        opt.textTest = false;
    }
    if (opt.ignoreHidden != null) {
        opt.ignoreHidden;
    } else {
        opt.ignoreHidden = true;
    }
    if (opt.logError != null) {
        opt.logError;
    } else {
        opt.logError = true;
    }
    dirs = [];
    files = [];
    dirPath = slash.resolve(dirPath);
    filter = function(p) {
        var base;
        base = slash.file(p);
        if (base.startsWith('.')) {
            if (opt.ignoreHidden) {
                return true;
            }
            if (base === '.DS_Store') {
                return true;
            }
        }
        if (base === 'Icon\r') {
            return true;
        }
        if (base.toLowerCase().startsWith('ntuser.')) {
            return true;
        }
        if (base.toLowerCase().startsWith('$recycle')) {
            return true;
        }
        return false;
    };
    onDir = function(d, stat) {
        var dir;
        if (!filter(d)) {
            dir = {
                type: 'dir',
                file: slash.path(d),
                name: slash.basename(d),
                stat: stat
            };
            return dirs.push(dir);
        }
    };
    onFile = function(f, stat) {
        var file;
        if (!filter(f)) {
            file = {
                type: 'file',
                file: slash.path(f),
                name: slash.basename(f),
                stat: stat
            };
            if (opt.textTest) {
                if (slash.isText(f)) {
                    file.textFile = true;
                }
            }
            return files.push(file);
        }
    };
    fileSort = function(a, b) {
        return a.name.localeCompare(b.name);
    };
    if (typeof cb === 'function') {
        try {
            walker = walkdir.walk(dirPath, {
                no_recurse: true
            });
            walker.on('directory', onDir);
            walker.on('file', onFile);
            walker.on('end', function() {
                return cb(dirs.sort(fileSort).concat(files.sort(fileSort)));
            });
            walker.on('error', function(err) {
                if (opt.logError) {
                    return console.error(err);
                }
            });
            return walker;
        } catch (error) {
            err = error;
            if (opt.logError) {
                return console.error(err);
            }
        }
    } else {
        try {
            walkdir.sync(dirPath, {
                no_recurse: true
            }, function(p, stat) {
                if (stat.isDirectory()) {
                    return onDir(p, stat);
                } else {
                    return onFile(p, stat);
                }
            });
            return dirs.sort(fileSort).concat(files.sort(fileSort));
        } catch (error) {
            err = error;
            if (opt.logError) {
                console.error(err);
            }
            return [];
        }
    }
};

module.exports = dirList;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlybGlzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSOztBQWFSLE9BQUEsR0FBVSxTQUFDLE9BQUQsRUFBVSxHQUFWLEVBQWUsRUFBZjtBQUVOLFFBQUE7SUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7SUFFVixJQUFHLE9BQU8sT0FBUCxLQUFtQixVQUFuQixJQUFzQyxhQUF6QztRQUNJLEVBQUEsR0FBSztRQUNMLE9BQUEsR0FBVSxJQUZkO0tBQUEsTUFBQTtRQUlJLElBQUcsT0FBTyxHQUFQLEtBQWUsVUFBZixJQUFrQyxZQUFyQztZQUNJLEVBQUEsR0FBSyxJQURUO1NBQUEsTUFBQTs7Z0JBR0k7O2dCQUFBLG1CQUFNLEdBQUcsQ0FBRTthQUhmO1NBSko7OztRQVFBOztRQUFBLE1BQU87OztRQUVQLEdBQUcsQ0FBQzs7UUFBSixHQUFHLENBQUMsV0FBZ0I7OztRQUNwQixHQUFHLENBQUM7O1FBQUosR0FBRyxDQUFDLGVBQWdCOzs7UUFDcEIsR0FBRyxDQUFDOztRQUFKLEdBQUcsQ0FBQyxXQUFnQjs7SUFDcEIsSUFBQSxHQUFVO0lBQ1YsS0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsT0FBZDtJQUVWLE1BQUEsR0FBUyxTQUFDLENBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWDtRQUNQLElBQUcsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBSDtZQUVJLElBQUcsR0FBRyxDQUFDLFlBQVA7QUFDSSx1QkFBTyxLQURYOztZQUdBLElBQUcsSUFBQSxLQUFTLFdBQVo7QUFDSSx1QkFBTyxLQURYO2FBTEo7O1FBUUEsSUFBRyxJQUFBLEtBQVEsUUFBWDtBQUNJLG1CQUFPLEtBRFg7O1FBR0EsSUFBRyxJQUFJ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YUFBQTtZQU9NO1lBQ0gsSUFBYyxHQUFHLENBQUMsUUFBbEI7Z0JBQUEsT0FBQSxDQUFDLEtBQUQsQ0FBTyxHQUFQLEVBQUE7O21CQUNDLEdBVEo7U0FkSjs7QUFqRU07O0FBMEZWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMjI1xuXG5zbGFzaCA9IHJlcXVpcmUgJy4va3NsYXNoJ1xuXG4jICAgY2FsbHMgYmFjayB3aXRoIGEgbGlzdCBvZiBvYmplY3RzIGZvciBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgaW4gZGlyUGF0aFxuIyAgICAgICBbXG4jICAgICAgICAgICB0eXBlOiBmaWxlfGRpclxuIyAgICAgICAgICAgbmFtZTogYmFzZW5hbWVcbiMgICAgICAgICAgIGZpbGU6IGFic29sdXRlIHBhdGhcbiMgICAgICAgXVxuI1xuIyAgIG9wdDogIFxuIyAgICAgICAgICBpZ25vcmVIaWRkZW46IHRydWUgIyBza2lwIGZpbGVzIHRoYXQgc3RhcnRzIHdpdGggYSBkb3RcbiMgICAgICAgICAgbG9nRXJyb3I6ICAgICB0cnVlICMgcHJpbnQgbWVzc2FnZSB0byBjb25zb2xlLmxvZyBpZiBhIHBhdGggZG9lc24ndCBleGl0c1xuXG5kaXJMaXN0ID0gKGRpclBhdGgsIG9wdCwgY2IpIC0+XG4gICAgXG4gICAgd2Fsa2RpciA9IHJlcXVpcmUgJ3dhbGtkaXInXG4gICAgXG4gICAgaWYgdHlwZW9mKGRpclBhdGgpID09ICdmdW5jdGlvbicgYW5kIG5vdCBvcHQ/IFxuICAgICAgICBjYiA9IGRpclBhdGggICMgb25seSBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkXG4gICAgICAgIGRpclBhdGggPSAnLicgIyBsaXN0IHRoZSBjdXJyZW50IGRpclxuICAgIGVsc2VcbiAgICAgICAgaWYgdHlwZW9mKG9wdCkgPT0gJ2Z1bmN0aW9uJyBhbmQgbm90IGNiPyBcbiAgICAgICAgICAgIGNiID0gb3B0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNiID89IG9wdD8uY2JcbiAgICBvcHQgPz0ge31cbiAgICBcbiAgICBvcHQudGV4dFRlc3QgICAgID89IGZhbHNlXG4gICAgb3B0Lmlnbm9yZUhpZGRlbiA/PSB0cnVlXG4gICAgb3B0LmxvZ0Vycm9yICAgICA/PSB0cnVlXG4gICAgZGlycyAgICA9IFtdXG4gICAgZmlsZXMgICA9IFtdXG4gICAgZGlyUGF0aCA9IHNsYXNoLnJlc29sdmUgZGlyUGF0aFxuICAgIFxuICAgIGZpbHRlciA9IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmZpbGUgcFxuICAgICAgICBpZiBiYXNlLnN0YXJ0c1dpdGggJy4nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9wdC5pZ25vcmVIaWRkZW5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYmFzZSBpbiBbJy5EU19TdG9yZSddXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgYmFzZSA9PSAnSWNvblxccidcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgYmFzZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGggJ250dXNlci4nXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGJhc2UudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoICckcmVjeWNsZSdcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIFxuICAgICAgICBmYWxzZVxuICAgIFxuICAgIG9uRGlyID0gKGQsIHN0YXQpIC0+IFxuICAgICAgICBpZiBub3QgZmlsdGVyKGQpIFxuICAgICAgICAgICAgZGlyID0gXG4gICAgICAgICAgICAgICAgdHlwZTogJ2RpcidcbiAgICAgICAgICAgICAgICBmaWxlOiBzbGFzaC5wYXRoIGRcbiAgICAgICAgICAgICAgICBuYW1lOiBzbGFzaC5iYXNlbmFtZSBkXG4gICAgICAgICAgICAgICAgc3RhdDogc3RhdFxuICAgICAgICAgICAgZGlycy5wdXNoICBkaXJcbiAgICAgICAgICAgIFxuICAgIG9uRmlsZSA9IChmLCBzdGF0KSAtPiBcbiAgICAgICAgaWYgbm90IGZpbHRlcihmKSBcbiAgICAgICAgICAgIGZpbGUgPSBcbiAgICAgICAgICAgICAgICB0eXBlOiAnZmlsZSdcbiAgICAgICAgICAgICAgICBmaWxlOiBzbGFzaC5wYXRoIGZcbiAgICAgICAgICAgICAgICBuYW1lOiBzbGFzaC5iYXNlbmFtZSBmXG4gICAgICAgICAgICAgICAgc3RhdDogc3RhdFxuICAgICAgICAgICAgaWYgb3B0LnRleHRUZXN0XG4gICAgICAgICAgICAgICAgZmlsZS50ZXh0RmlsZSA9IHRydWUgaWYgc2xhc2guaXNUZXh0IGZcbiAgICAgICAgICAgIGZpbGVzLnB1c2ggZmlsZVxuICAgICAgICBcbiAgICBmaWxlU29ydCA9IChhLGIpIC0+IGEubmFtZS5sb2NhbGVDb21wYXJlIGIubmFtZVxuICAgIFxuICAgIGlmIHR5cGVvZihjYikgPT0gJ2Z1bmN0aW9uJyAjIGFzeW5jXG4gICAgICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICB3YWxrZXIgPSB3YWxrZGlyLndhbGsgZGlyUGF0aCwgbm9fcmVjdXJzZTp0cnVlXG4gICAgICAgICAgICB3YWxrZXIub24gJ2RpcmVjdG9yeScgb25EaXJcbiAgICAgICAgICAgIHdhbGtlci5vbiAnZmlsZScgICAgICBvbkZpbGVcbiAgICAgICAgICAgIHdhbGtlci5vbiAnZW5kJyAgICAgICAgIC0+IGNiIGRpcnMuc29ydChmaWxlU29ydCkuY29uY2F0IGZpbGVzLnNvcnQoZmlsZVNvcnQpXG4gICAgICAgICAgICB3YWxrZXIub24gJ2Vycm9yJyAoZXJyKSAtPiBlcnJvciBlcnIgaWYgb3B0LmxvZ0Vycm9yXG4gICAgICAgICAgICB3YWxrZXJcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnIgaWYgb3B0LmxvZ0Vycm9yXG4gICAgICAgICAgICBcbiAgICBlbHNlICMgc3luY1xuXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgd2Fsa2Rpci5zeW5jIGRpclBhdGgsIG5vX3JlY3Vyc2U6dHJ1ZSwgKHAsc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICAgICAgb25EaXIgcCxzdGF0XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvbkZpbGUgcCxzdGF0XG4gICAgICAgICAgICBkaXJzLnNvcnQoZmlsZVNvcnQpLmNvbmNhdCBmaWxlcy5zb3J0KGZpbGVTb3J0KVxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGVycm9yIGVyciBpZiBvcHQubG9nRXJyb3JcbiAgICAgICAgICAgIFtdXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBkaXJMaXN0XG4iXX0=
//# sourceURL=../coffee/dirlist.coffee