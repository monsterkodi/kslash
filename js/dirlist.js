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
        if (cb != null) {
            cb;
        } else {
            cb = opt.cb;
        }
        if (typeof opt === 'function' && (cb == null)) {
            cb = opt;
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
    try {
        fileSort = function(a, b) {
            return a.name.localeCompare(b.name);
        };
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
};

module.exports = dirList;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlybGlzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSOztBQWFSLE9BQUEsR0FBVSxTQUFDLE9BQUQsRUFBVSxHQUFWLEVBQWUsRUFBZjtBQUVOLFFBQUE7SUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7SUFFVixJQUFHLE9BQU8sT0FBUCxLQUFtQixVQUFuQixJQUFzQyxhQUF6QztRQUNJLEVBQUEsR0FBSztRQUNMLE9BQUEsR0FBVSxJQUZkO0tBQUEsTUFBQTs7WUFJSTs7WUFBQSxLQUFNLEdBQUcsQ0FBQzs7UUFDVixJQUFHLE9BQU8sR0FBUCxLQUFlLFVBQWYsSUFBa0MsWUFBckM7WUFDSSxFQUFBLEdBQUssSUFEVDtTQUxKOzs7UUFPQTs7UUFBQSxNQUFPOzs7UUFFUCxHQUFHLENBQUM7O1FBQUosR0FBRyxDQUFDLFdBQWdCOzs7UUFDcEIsR0FBRyxDQUFDOztRQUFKLEdBQUcsQ0FBQyxlQUFnQjs7O1FBQ3BCLEdBQUcsQ0FBQzs7UUFBSixHQUFHLENBQUMsV0FBZ0I7O0lBQ3BCLElBQUEsR0FBVTtJQUNWLEtBQUEsR0FBVTtJQUNWLE9BQUEsR0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLE9BQWQ7SUFFVixNQUFBLEdBQVMsU0FBQyxDQUFEO0FBRUwsWUFBQTtRQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7UUFDUCxJQUFHLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCLENBQUg7WUFFSSxJQUFHLEdBQUcsQ0FBQyxZQUFQO0FBQ0ksdUJBQU8sS0FEWDs7WUFHQSxJQUFHLElBQUEsS0FBUyxXQUFaO0FBQ0ksdUJBQU8sS0FEWDthQUxKOztRQVFBLElBQUcsSUFBQSxLQUFRLFFBQVg7QUFDSSxtQkFBTyxLQURYOztRQUdBLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFrQixDQUFDLFVBQW5CLENBQThCLFNBQTlCLENBQUg7QUFDSSxtQkFBTyxLQURYOztRQUdBLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFrQixDQUFDLFVBQW5CLENBQThCLFVBQTlCLENBQUg7QUFDSSxtQkFBTyxLQURYOztlQUdBO0lBcEJLO0lBc0JULEtBQUEsR0FBUSxTQUFDLENBQUQsRUFBSSxJQUFKO0FBQ0osWUFBQTtRQUFBLElBQUcsQ0FBSSxNQUFBLENBQU8sQ0FBUCxDQUFQO1lBQ0ksR0FBQSxHQUNJO2dCQUFBLElBQUEsRUFBTSxLQUFOO2dCQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsQ0FETjtnQkFFQSxJQUFBLEVBQU0sS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFmLENBRk47Z0JBR0EsSUFBQSxFQUFNLElBSE47O21CQUlKLElBQUksQ0FBQyxJQUFMLENBQVcsR0FBWCxFQU5KOztJQURJO0lBU1IsTUFBQSxHQUFTLFNBQUMsQ0FBRCxFQUFJLElBQUo7QUFDTCxZQUFBO1FBQUEsSUFBRyxDQUFJLE1BQUEsQ0FBTyxDQUFQLENBQVA7WUFDSSxJQUFBLEdBQ0k7Z0JBQUEsSUFBQSxFQUFNLE1BQU47Z0JBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUROO2dCQUVBLElBQUEsRUFBTSxLQUFLLENBQUMsUUFBTixDQUFlLENBQWYsQ0FGTjtnQkFHQSxJQUFBLEVBQU0sSUFITjs7WUFJSixJQUFHLEdBQUcsQ0FBQyxRQUFQO2dCQUNJLElBQXdCLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixDQUF4QjtvQkFBQSxJQUFJLENBQUMsUUFBTCxHQUFnQixLQUFoQjtpQkFESjs7bUJBRUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLEVBUko7O0lBREs7QUFXVDtRQUNJLFFBQUEsR0FBVyxTQUFDLENBQUQsRUFBRyxDQUFIO21CQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBUCxDQUFxQixDQUFDLENBQUMsSUFBdkI7UUFBVDtRQUNYLE1BQUEsR0FBUyxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsRUFBc0I7WUFBQSxVQUFBLEVBQVksSUFBWjtTQUF0QjtRQUNULE1BQU0sQ0FBQyxFQUFQLENBQVUsV0FBVixFQUFzQixLQUF0QjtRQUNBLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFzQixNQUF0QjtRQUNBLE1BQU0sQ0FBQyxFQUFQLENBQVUsS0FBVixFQUF3QixTQUFBO21CQUFHLEVBQUEsQ0FBRyxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsQ0FBbUIsQ0FBQyxNQUFwQixDQUEyQixLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsQ0FBM0IsQ0FBSDtRQUFILENBQXhCO1FBQ0EsTUFBTSxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQWtCLFNBQUMsR0FBRDtZQUFPLElBQWUsR0FBRyxDQUFDLFFBQW5CO3VCQUFBLE9BQUEsQ0FBRSxLQUFGLENBQVEsR0FBUixFQUFBOztRQUFQLENBQWxCO2VBQ0EsT0FQSjtLQUFBLGFBQUE7UUFRTTtRQUNILElBQWMsR0FBRyxDQUFDLFFBQWxCO21CQUFBLE9BQUEsQ0FBQyxLQUFELENBQU8sR0FBUCxFQUFBO1NBVEg7O0FBOURNOztBQXlFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbjAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4jIyNcblxuc2xhc2ggPSByZXF1aXJlICcuL2tzbGFzaCdcblxuIyAgIGNhbGxzIGJhY2sgd2l0aCBhIGxpc3Qgb2Ygb2JqZWN0cyBmb3IgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIGluIGRpclBhdGhcbiMgICAgICAgW1xuIyAgICAgICAgICAgdHlwZTogZmlsZXxkaXJcbiMgICAgICAgICAgIG5hbWU6IGJhc2VuYW1lXG4jICAgICAgICAgICBmaWxlOiBhYnNvbHV0ZSBwYXRoXG4jICAgICAgIF1cbiNcbiMgICBvcHQ6ICBcbiMgICAgICAgICAgaWdub3JlSGlkZGVuOiB0cnVlICMgc2tpcCBmaWxlcyB0aGF0IHN0YXJ0cyB3aXRoIGEgZG90XG4jICAgICAgICAgIGxvZ0Vycm9yOiAgICAgdHJ1ZSAjIHByaW50IG1lc3NhZ2UgdG8gY29uc29sZS5sb2cgaWYgYSBwYXRoIGRvZXNuJ3QgZXhpdHNcblxuZGlyTGlzdCA9IChkaXJQYXRoLCBvcHQsIGNiKSAtPlxuICAgIFxuICAgIHdhbGtkaXIgPSByZXF1aXJlICd3YWxrZGlyJ1xuICAgIFxuICAgIGlmIHR5cGVvZihkaXJQYXRoKSA9PSAnZnVuY3Rpb24nIGFuZCBub3Qgb3B0PyBcbiAgICAgICAgY2IgPSBkaXJQYXRoICAjIG9ubHkgYSBjYWxsYmFjayBpcyBwcm92aWRlZFxuICAgICAgICBkaXJQYXRoID0gJy4nICMgbGlzdCB0aGUgY3VycmVudCBkaXJcbiAgICBlbHNlXG4gICAgICAgIGNiID89IG9wdC5jYlxuICAgICAgICBpZiB0eXBlb2Yob3B0KSA9PSAnZnVuY3Rpb24nIGFuZCBub3QgY2I/IFxuICAgICAgICAgICAgY2IgPSBvcHRcbiAgICBvcHQgPz0ge31cbiAgICBcbiAgICBvcHQudGV4dFRlc3QgICAgID89IGZhbHNlXG4gICAgb3B0Lmlnbm9yZUhpZGRlbiA/PSB0cnVlXG4gICAgb3B0LmxvZ0Vycm9yICAgICA/PSB0cnVlXG4gICAgZGlycyAgICA9IFtdXG4gICAgZmlsZXMgICA9IFtdXG4gICAgZGlyUGF0aCA9IHNsYXNoLnJlc29sdmUgZGlyUGF0aFxuICAgIFxuICAgIGZpbHRlciA9IChwKSAtPlxuICAgICAgICBcbiAgICAgICAgYmFzZSA9IHNsYXNoLmZpbGUgcFxuICAgICAgICBpZiBiYXNlLnN0YXJ0c1dpdGggJy4nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9wdC5pZ25vcmVIaWRkZW5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYmFzZSBpbiBbJy5EU19TdG9yZSddXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgYmFzZSA9PSAnSWNvblxccidcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgYmFzZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGggJ250dXNlci4nXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGJhc2UudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoICckcmVjeWNsZSdcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIFxuICAgICAgICBmYWxzZVxuICAgIFxuICAgIG9uRGlyID0gKGQsIHN0YXQpIC0+IFxuICAgICAgICBpZiBub3QgZmlsdGVyKGQpIFxuICAgICAgICAgICAgZGlyID0gXG4gICAgICAgICAgICAgICAgdHlwZTogJ2RpcidcbiAgICAgICAgICAgICAgICBmaWxlOiBzbGFzaC5wYXRoIGRcbiAgICAgICAgICAgICAgICBuYW1lOiBzbGFzaC5iYXNlbmFtZSBkXG4gICAgICAgICAgICAgICAgc3RhdDogc3RhdFxuICAgICAgICAgICAgZGlycy5wdXNoICBkaXJcbiAgICAgICAgICAgIFxuICAgIG9uRmlsZSA9IChmLCBzdGF0KSAtPiBcbiAgICAgICAgaWYgbm90IGZpbHRlcihmKSBcbiAgICAgICAgICAgIGZpbGUgPSBcbiAgICAgICAgICAgICAgICB0eXBlOiAnZmlsZSdcbiAgICAgICAgICAgICAgICBmaWxlOiBzbGFzaC5wYXRoIGZcbiAgICAgICAgICAgICAgICBuYW1lOiBzbGFzaC5iYXNlbmFtZSBmXG4gICAgICAgICAgICAgICAgc3RhdDogc3RhdFxuICAgICAgICAgICAgaWYgb3B0LnRleHRUZXN0XG4gICAgICAgICAgICAgICAgZmlsZS50ZXh0RmlsZSA9IHRydWUgaWYgc2xhc2guaXNUZXh0IGZcbiAgICAgICAgICAgIGZpbGVzLnB1c2ggZmlsZVxuXG4gICAgdHJ5XG4gICAgICAgIGZpbGVTb3J0ID0gKGEsYikgLT4gYS5uYW1lLmxvY2FsZUNvbXBhcmUgYi5uYW1lXG4gICAgICAgIHdhbGtlciA9IHdhbGtkaXIud2FsayBkaXJQYXRoLCBub19yZWN1cnNlOiB0cnVlXG4gICAgICAgIHdhbGtlci5vbiAnZGlyZWN0b3J5JyBvbkRpclxuICAgICAgICB3YWxrZXIub24gJ2ZpbGUnICAgICAgb25GaWxlXG4gICAgICAgIHdhbGtlci5vbiAnZW5kJyAgICAgICAgIC0+IGNiIGRpcnMuc29ydChmaWxlU29ydCkuY29uY2F0IGZpbGVzLnNvcnQoZmlsZVNvcnQpXG4gICAgICAgIHdhbGtlci5vbiAnZXJyb3InIChlcnIpIC0+IGVycm9yIGVyciBpZiBvcHQubG9nRXJyb3JcbiAgICAgICAgd2Fsa2VyXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIGVycm9yIGVyciBpZiBvcHQubG9nRXJyb3JcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IGRpckxpc3RcbiJdfQ==
//# sourceURL=../coffee/dirlist.coffee