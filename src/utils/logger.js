function deComposeMatch(where) {
  let file = /\((.*):[0-9]+:[0-9]+/.exec(where);
  let line = /:(\d+):/.exec(where);
  line = line ? line[1] : '?';
  file = file ? file[1] : '?';
  return `${file}:${line}`;
}
function lineNumber() {
  try {
    // throw a fake error
    // eslint-disable-next-line no-underscore-dangle
    const __y__ = __X_; // x is undefined and will fail under use struct- ths will provoke an error so i can get the call stack
  } catch (err) {
    // return the error object so we know where we are
    const stack = err.stack.split('\n');
    return deComposeMatch(stack[3]);
  }
  return undefined;
}

class log {
  static log_level() {
    return 3;
  }

  static info(str) {
    if (log.log_level() > 1) {
      console.log(`[INFO][${lineNumber()}] ${JSON.stringify(str)}`);
    } else {
      console.log(`[INFO] ${JSON.stringify(str)}`);
    }
  }

  static debug(str) {
    if (log.log_level() > 1) {
      Logger.log(`[DBG][${lineNumber()}] ${JSON.stringify(str)}`);
    }
  }

  static trace(str) {
    if (log.log_level() > 2) {
      Logger.log(`[DBG][${lineNumber()}] ${JSON.stringify(str)}`);
    }
  }
}
