// koffee 1.19.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlybGlzdC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImRpcmxpc3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7QUFhUixPQUFBLEdBQVUsU0FBQyxPQUFELEVBQVUsR0FBVixFQUFlLEVBQWY7QUFFTixRQUFBO0lBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSO0lBRVYsSUFBRyxPQUFPLE9BQVAsS0FBbUIsVUFBbkIsSUFBc0MsYUFBekM7UUFDSSxFQUFBLEdBQUs7UUFDTCxPQUFBLEdBQVUsSUFGZDtLQUFBLE1BQUE7UUFJSSxJQUFHLE9BQU8sR0FBUCxLQUFlLFVBQWYsSUFBa0MsWUFBckM7WUFDSSxFQUFBLEdBQUssSUFEVDtTQUFBLE1BQUE7O2dCQUdJOztnQkFBQSxtQkFBTSxHQUFHLENBQUU7YUFIZjtTQUpKOzs7UUFRQTs7UUFBQSxNQUFPOzs7UUFFUCxHQUFHLENBQUM7O1FBQUosR0FBRyxDQUFDLFdBQWdCOzs7UUFDcEIsR0FBRyxDQUFDOztRQUFKLEdBQUcsQ0FBQyxlQUFnQjs7O1FBQ3BCLEdBQUcsQ0FBQzs7UUFBSixHQUFHLENBQUMsV0FBZ0I7O0lBQ3BCLElBQUEsR0FBVTtJQUNWLEtBQUEsR0FBVTtJQUNWLE9BQUEsR0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLE9BQWQ7SUFFVixNQUFBLEdBQVMsU0FBQyxDQUFEO0FBRUwsWUFBQTtRQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7UUFDUCxJQUFHLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCLENBQUg7WUFFSSxJQUFHLEdBQUcsQ0FBQyxZQUFQO0FBQ0ksdUJBQU8sS0FEWDs7WUFHQSxJQUFHLElBQUEsS0FBUyxXQUFaO0FBQ0ksdUJBQU8sS0FEWDthQUxKOztRQVFBLElBQUcsSUFBQSxLQUFRLFFBQVg7QUFDSSxtQkFB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LFFBQVgsQ0FBM0IsRUFOSjtTQUFBLGFBQUE7WUFPTTtZQUNILElBQWMsR0FBRyxDQUFDLFFBQWxCO2dCQUFBLE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQUFBOzttQkFDQyxHQVRKO1NBZEo7O0FBakVNOztBQTBGVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4jIyNcblxuc2xhc2ggPSByZXF1aXJlICcuL2tzbGFzaCdcblxuIyAgIGNhbGxzIGJhY2sgd2l0aCBhIGxpc3Qgb2Ygb2JqZWN0cyBmb3IgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIGluIGRpclBhdGhcbiMgICAgICAgW1xuIyAgICAgICAgICAgdHlwZTogZmlsZXxkaXJcbiMgICAgICAgICAgIG5hbWU6IGJhc2VuYW1lXG4jICAgICAgICAgICBmaWxlOiBhYnNvbHV0ZSBwYXRoXG4jICAgICAgIF1cbiNcbiMgICBvcHQ6ICBcbiMgICAgICAgICAgaWdub3JlSGlkZGVuOiB0cnVlICMgc2tpcCBmaWxlcyB0aGF0IHN0YXJ0cyB3aXRoIGEgZG90XG4jICAgICAgICAgIGxvZ0Vycm9yOiAgICAgdHJ1ZSAjIHByaW50IG1lc3NhZ2UgdG8gY29uc29sZS5sb2cgaWYgYSBwYXRoIGRvZXNuJ3QgZXhpdHNcblxuZGlyTGlzdCA9IChkaXJQYXRoLCBvcHQsIGNiKSAtPlxuICAgIFxuICAgIHdhbGtkaXIgPSByZXF1aXJlICd3YWxrZGlyJ1xuICAgIFxuICAgIGlmIHR5cGVvZihkaXJQYXRoKSA9PSAnZnVuY3Rpb24nIGFuZCBub3Qgb3B0PyBcbiAgICAgICAgY2IgPSBkaXJQYXRoICAjIG9ubHkgYSBjYWxsYmFjayBpcyBwcm92aWRlZFxuICAgICAgICBkaXJQYXRoID0gJy4nICMgbGlzdCB0aGUgY3VycmVudCBkaXJcbiAgICBlbHNlXG4gICAgICAgIGlmIHR5cGVvZihvcHQpID09ICdmdW5jdGlvbicgYW5kIG5vdCBjYj8gXG4gICAgICAgICAgICBjYiA9IG9wdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjYiA/PSBvcHQ/LmNiXG4gICAgb3B0ID89IHt9XG4gICAgXG4gICAgb3B0LnRleHRUZXN0ICAgICA/PSBmYWxzZVxuICAgIG9wdC5pZ25vcmVIaWRkZW4gPz0gdHJ1ZVxuICAgIG9wdC5sb2dFcnJvciAgICAgPz0gdHJ1ZVxuICAgIGRpcnMgICAgPSBbXVxuICAgIGZpbGVzICAgPSBbXVxuICAgIGRpclBhdGggPSBzbGFzaC5yZXNvbHZlIGRpclBhdGhcbiAgICBcbiAgICBmaWx0ZXIgPSAocCkgLT5cbiAgICAgICAgXG4gICAgICAgIGJhc2UgPSBzbGFzaC5maWxlIHBcbiAgICAgICAgaWYgYmFzZS5zdGFydHNXaXRoICcuJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvcHQuaWdub3JlSGlkZGVuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGJhc2UgaW4gWycuRFNfU3RvcmUnXVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGJhc2UgPT0gJ0ljb25cXHInXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGJhc2UudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoICdudHVzZXIuJ1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBiYXNlLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCAnJHJlY3ljbGUnXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgZmFsc2VcbiAgICBcbiAgICBvbkRpciA9IChkLCBzdGF0KSAtPiBcbiAgICAgICAgaWYgbm90IGZpbHRlcihkKSBcbiAgICAgICAgICAgIGRpciA9IFxuICAgICAgICAgICAgICAgIHR5cGU6ICdkaXInXG4gICAgICAgICAgICAgICAgZmlsZTogc2xhc2gucGF0aCBkXG4gICAgICAgICAgICAgICAgbmFtZTogc2xhc2guYmFzZW5hbWUgZFxuICAgICAgICAgICAgICAgIHN0YXQ6IHN0YXRcbiAgICAgICAgICAgIGRpcnMucHVzaCAgZGlyXG4gICAgICAgICAgICBcbiAgICBvbkZpbGUgPSAoZiwgc3RhdCkgLT4gXG4gICAgICAgIGlmIG5vdCBmaWx0ZXIoZikgXG4gICAgICAgICAgICBmaWxlID0gXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ZpbGUnXG4gICAgICAgICAgICAgICAgZmlsZTogc2xhc2gucGF0aCBmXG4gICAgICAgICAgICAgICAgbmFtZTogc2xhc2guYmFzZW5hbWUgZlxuICAgICAgICAgICAgICAgIHN0YXQ6IHN0YXRcbiAgICAgICAgICAgIGlmIG9wdC50ZXh0VGVzdFxuICAgICAgICAgICAgICAgIGZpbGUudGV4dEZpbGUgPSB0cnVlIGlmIHNsYXNoLmlzVGV4dCBmXG4gICAgICAgICAgICBmaWxlcy5wdXNoIGZpbGVcbiAgICAgICAgXG4gICAgZmlsZVNvcnQgPSAoYSxiKSAtPiBhLm5hbWUubG9jYWxlQ29tcGFyZSBiLm5hbWVcbiAgICBcbiAgICBpZiB0eXBlb2YoY2IpID09ICdmdW5jdGlvbicgIyBhc3luY1xuICAgICAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgd2Fsa2VyID0gd2Fsa2Rpci53YWxrIGRpclBhdGgsIG5vX3JlY3Vyc2U6dHJ1ZVxuICAgICAgICAgICAgd2Fsa2VyLm9uICdkaXJlY3RvcnknIG9uRGlyXG4gICAgICAgICAgICB3YWxrZXIub24gJ2ZpbGUnICAgICAgb25GaWxlXG4gICAgICAgICAgICB3YWxrZXIub24gJ2VuZCcgICAgICAgICAtPiBjYiBkaXJzLnNvcnQoZmlsZVNvcnQpLmNvbmNhdCBmaWxlcy5zb3J0KGZpbGVTb3J0KVxuICAgICAgICAgICAgd2Fsa2VyLm9uICdlcnJvcicgKGVycikgLT4gZXJyb3IgZXJyIGlmIG9wdC5sb2dFcnJvclxuICAgICAgICAgICAgd2Fsa2VyXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgZXJyb3IgZXJyIGlmIG9wdC5sb2dFcnJvclxuICAgICAgICAgICAgXG4gICAgZWxzZSAjIHN5bmNcblxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHdhbGtkaXIuc3luYyBkaXJQYXRoLCBub19yZWN1cnNlOnRydWUsIChwLHN0YXQpIC0+XG4gICAgICAgICAgICAgICAgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgICAgIG9uRGlyIHAsc3RhdFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25GaWxlIHAsc3RhdFxuICAgICAgICAgICAgZGlycy5zb3J0KGZpbGVTb3J0KS5jb25jYXQgZmlsZXMuc29ydChmaWxlU29ydClcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBlcnJvciBlcnIgaWYgb3B0LmxvZ0Vycm9yXG4gICAgICAgICAgICBbXVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gZGlyTGlzdFxuIl19
//# sourceURL=../coffee/dirlist.coffee