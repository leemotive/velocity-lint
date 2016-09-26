# velocity-lint
check the template file of velocity. show tips  when using the variable without "!"

## Installation
Install package with NPM and add it to your development devpendencies:

`npm install --save-dev velocity-lint`


## Usage
```javascript

var gulp = require('gulp');
var vm = require('velocity-lint');

gulp.task('vm', function () {
    return gulp.src('src/**/*.vm')
        .pipe(vm(options))
})

```

## Options

- `ignore`
    pass an array if you wish to ignore some variable
