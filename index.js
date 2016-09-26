
var through2 = require('through2');

function vm (options) {
    options = options || {};
    return through2.obj(function (file, enc, cb) {
        if (file.isNull()) {
            console.log('file is null');
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            console.log('stream is not supported');
        }

        var contents = file.contents.toString().split(/\r?\n/);

        var inBlockComment = false, braketsStack = [], quoteStack = [];
        var inLineComment, breakLine, inOperation;
        var fileErrorCount = 0;
        contents && contents.forEach(function (line, lineNo) {
            var col = 0, lastCh = '', ch;
            inLineComment = false;
            while (ch = line.charAt(col++)) {
                switch (ch) {
                    case '#':
                        var keyword = checkVelocityKeyword(col);
                        switch (keyword) {
                            case 'if':
                                if (!inOperation && !inLineComment && !inBlockComment) {
                                    inOperation = true;
                                }
                                break;
                            case 'elseif':
                                if (!inOperation && !inLineComment && !inBlockComment) {
                                    inOperation = true;
                                }
                                break;
                            case 'foreach':
                                if (!inOperation && !inLineComment && !inBlockComment) {
                                    inOperation = true;
                                }
                                break;
                            case 'set':
                                if (!inOperation && !inLineComment && !inBlockComment) {
                                    inOperation = true;
                                }
                                break;
                            case 'end':
                                break;
                            case 'macro':
                                if (!inOperation && !inLineComment && !inBlockComment) {
                                    inOperation = true;
                                }
                                break;
                            case '*':
                                inBlockComment = true;
                                break;
                            case '#':
                                inLineComment = true;
                                if (line.indexOf('*#') < col) {
                                    breakLine = true;
                                }
                                break;
                            default :
                                if (keyword = line.substring(col).match(/^[a-zA-Z_]+\w*\s*(?=\()/)) {
                                    inOperation = true;
                                    keyword = keyword[0];
                                }
                                break;
                        }
                        keyword && (col += keyword.length);
                        break;
                    case '$':
                        break;
                    case '(':
                        if (inOperation && !inBlockComment && !inLineComment && !quoteStack.length) {
                            braketsStack.push(ch);
                        }
                        break;
                    case ')':
                        if (inOperation && !inBlockComment && !inLineComment && !quoteStack.length) {
                            braketsStack.pop();
                            if (!braketsStack.length) {
                                inOperation && (inOperation = false);
                            }
                        }
                        break;
                    case '"':
                        if (inOperation && !inBlockComment && !inLineComment) {
                            if (!quoteStack.length) {
                                quoteStack.push(ch);
                            } else {
                                var lastQuote = quoteStack.pop();
                                if (lastQuote !== ch) {
                                    quoteStack.push(lastQuote);
                                }
                            }
                        }
                        break;
                    case "'":
                        if (inOperation && !inBlockComment && !inLineComment) {
                            if (!quoteStack.length) {
                                quoteStack.push(ch);
                            } else {
                                var lastQuote = quoteStack.pop();
                                if (lastQuote !== ch) {
                                    quoteStack.push(lastQuote);
                                }
                            }
                        }
                        break;
                    case '\\':
                        break;
                    case '*':
                        if (line.charAt(col) === '#') {
                            inBlockComment = false;
                            inLineComment = false;
                        }
                        break;
                    default:
                        var matchBefore, ignore = false;
                        if (!inBlockComment && !inLineComment && !inOperation && (matchBefore = strBefore().match(/^.*\$!?\{?$/)) && /[a-zA-Z_]/.test(ch)) {
                            var variableName = getVariableName(col - 1);
                            var fullVariableName;
                            if (lastCh === '$') {
                                fullVariableName = '$' + variableName;
                            } else {
                                fullVariableName = '${' + variableName;
                            }
                            ignore = isIgnore(variableName);
                            if (/^[\w\.]*\.[\w\.]+\(/.test(line.substring(col))) {
                                inOperation = true;
                                ignore = false;
                            } else if (fullVariableName.charAt(1) === '{') {
                                fullVariableName = '${' + variableName + '}';
                            }

                            if (!/\$!\{?$/.test(matchBefore[0]) && !ignore) {
                                console.warn('bad variable use: "' + fullVariableName + '" ' + 'at pos: ' + (lineNo + 1) + ':' + col);
                                fileErrorCount++;
                            }
                            col += variableName.length - 1;
                        }
                        break;
                }
                lastCh = ch;
                if (breakLine) {
                    breakLine = false;
                    break;
                }
            }

            function checkVelocityKeyword (pos) {
                var matches = line.substring(pos).match(/^(?:if|elseif|foreach|end|macro|set|\*|#)/);
                return matches && matches[0] || '';
            }

            function getVariableName (pos) {
                var matches = line.substring(pos).match(/^[\w\.]+/);
                return matches[0];
            }

            function strBefore () {
                return line.substring(Math.max(0, col - 4), col - 1).replace(/^\s+/, '');
            }

            function isIgnore (name) {
                var i = 0;
                if (options.ignore) {
                    var ignores = options.ignore;
                    while (ignores[i++] === name) {
                        return true;
                    }
                }
            }
        });

        fileErrorCount && console.log(fileErrorCount + ' errors in file: ' + file.path + '\r\n');

        this.push(file);
        cb();
    });
}


