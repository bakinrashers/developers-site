/* */ 
"format cjs";
var utils = require("./utils"),
    path = require("github:jspm/nodelibs@0.0.3/path"),
    dirname = path.dirname,
    extname = path.extname,
    join = path.join,
    fs = require("github:jspm/nodelibs@0.0.3/fs"),
    read = fs.readFileSync;
var filters = exports.filters = require("./filters");
var cache = {};
exports.clearCache = function() {
  cache = {};
};
function filtered(js) {
  return js.substr(1).split('|').reduce(function(js, filter) {
    var parts = filter.split(':'),
        name = parts.shift(),
        args = parts.join(':') || '';
    if (args)
      args = ', ' + args;
    return 'filters.' + name + '(' + js + args + ')';
  });
}
;
function rethrow(err, str, filename, lineno) {
  var lines = str.split('\n'),
      start = Math.max(lineno - 3, 0),
      end = Math.min(lines.length, lineno + 3);
  var context = lines.slice(start, end).map(function(line, i) {
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ') + curr + '| ' + line;
  }).join('\n');
  err.path = filename;
  err.message = (filename || 'ejs') + ':' + lineno + '\n' + context + '\n\n' + err.message;
  throw err;
}
var parse = exports.parse = function(str, options) {
  var options = options || {},
      open = options.open || exports.open || '<%',
      close = options.close || exports.close || '%>',
      filename = options.filename,
      compileDebug = options.compileDebug !== false,
      buf = "";
  buf += 'var buf = [];';
  if (false !== options._with)
    buf += '\nwith (locals || {}) { (function(){ ';
  buf += '\n buf.push(\'';
  var lineno = 1;
  var consumeEOL = false;
  for (var i = 0,
      len = str.length; i < len; ++i) {
    var stri = str[i];
    if (str.slice(i, open.length + i) == open) {
      i += open.length;
      var prefix,
          postfix,
          line = (compileDebug ? '__stack.lineno=' : '') + lineno;
      switch (str[i]) {
        case '=':
          prefix = "', escape((" + line + ', ';
          postfix = ")), '";
          ++i;
          break;
        case '-':
          prefix = "', (" + line + ', ';
          postfix = "), '";
          ++i;
          break;
        default:
          prefix = "');" + line + ';';
          postfix = "; buf.push('";
      }
      var end = str.indexOf(close, i);
      if (end < 0) {
        throw new Error('Could not find matching close tag "' + close + '".');
      }
      var js = str.substring(i, end),
          start = i,
          include = null,
          n = 0;
      if ('-' == js[js.length - 1]) {
        js = js.substring(0, js.length - 2);
        consumeEOL = true;
      }
      if (0 == js.trim().indexOf('include')) {
        var name = js.trim().slice(7).trim();
        if (!filename)
          throw new Error('filename option is required for includes');
        var path = resolveInclude(name, filename);
        include = read(path, 'utf8');
        include = exports.parse(include, {
          filename: path,
          _with: false,
          open: open,
          close: close,
          compileDebug: compileDebug
        });
        buf += "' + (function(){" + include + "})() + '";
        js = '';
      }
      while (~(n = js.indexOf("\n", n)))
        n++, lineno++;
      if (js.substr(0, 1) == ':')
        js = filtered(js);
      if (js) {
        if (js.lastIndexOf('//') > js.lastIndexOf('\n'))
          js += '\n';
        buf += prefix;
        buf += js;
        buf += postfix;
      }
      i += end - start + close.length - 1;
    } else if (stri == "\\") {
      buf += "\\\\";
    } else if (stri == "'") {
      buf += "\\'";
    } else if (stri == "\r") {} else if (stri == "\n") {
      if (consumeEOL) {
        consumeEOL = false;
      } else {
        buf += "\\n";
        lineno++;
      }
    } else {
      buf += stri;
    }
  }
  if (false !== options._with)
    buf += "'); })();\n} \nreturn buf.join('');";
  else
    buf += "');\nreturn buf.join('');";
  return buf;
};
var compile = exports.compile = function(str, options) {
  options = options || {};
  var escape = options.escape || utils.escape;
  var input = JSON.stringify(str),
      compileDebug = options.compileDebug !== false,
      client = options.client,
      filename = options.filename ? JSON.stringify(options.filename) : 'undefined';
  if (compileDebug) {
    str = ['var __stack = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };', rethrow.toString(), 'try {', exports.parse(str, options), '} catch (err) {', '  rethrow(err, __stack.input, __stack.filename, __stack.lineno);', '}'].join("\n");
  } else {
    str = exports.parse(str, options);
  }
  if (options.debug)
    console.log(str);
  if (client)
    str = 'escape = escape || ' + escape.toString() + ';\n' + str;
  try {
    var fn = new Function('locals, filters, escape, rethrow', str);
  } catch (err) {
    if ('SyntaxError' == err.name) {
      err.message += options.filename ? ' in ' + filename : ' while compiling ejs';
    }
    throw err;
  }
  if (client)
    return fn;
  return function(locals) {
    return fn.call(this, locals, filters, escape, rethrow);
  };
};
exports.render = function(str, options) {
  var fn,
      options = options || {};
  if (options.cache) {
    if (options.filename) {
      fn = cache[options.filename] || (cache[options.filename] = compile(str, options));
    } else {
      throw new Error('"cache" option requires "filename".');
    }
  } else {
    fn = compile(str, options);
  }
  options.__proto__ = options.locals;
  return fn.call(options.scope, options);
};
exports.renderFile = function(path, options, fn) {
  var key = path + ':string';
  if ('function' == typeof options) {
    fn = options, options = {};
  }
  options.filename = path;
  var str;
  try {
    str = options.cache ? cache[key] || (cache[key] = read(path, 'utf8')) : read(path, 'utf8');
  } catch (err) {
    fn(err);
    return;
  }
  fn(null, exports.render(str, options));
};
function resolveInclude(name, filename) {
  var path = join(dirname(filename), name);
  var ext = extname(name);
  if (!ext)
    path += '.ejs';
  return path;
}
exports.__express = exports.renderFile;
if (require.extensions) {
  require.extensions['.ejs'] = function(module, filename) {
    filename = filename || module.filename;
    var options = {
      filename: filename,
      client: true
    },
        template = fs.readFileSync(filename).toString(),
        fn = compile(template, options);
    module._compile('module.exports = ' + fn.toString() + ';', filename);
  };
} else if (require.registerExtension) {
  require.registerExtension('.ejs', function(src) {
    return compile(src, {});
  });
}
