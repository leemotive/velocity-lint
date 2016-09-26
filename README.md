# velocity-lint
check the template file of velocity. show tips  when using the variable without "!"

Only check the variable used in html to show the value. Not check the variable use as a condition or arguments in #if,#elseif,#set,#foreach,#macro or function call

#### example
```html
#if($type == "primary")
    <div>$name</div>
    #foreach($item in $lists)
        <div>$item.name</div>
        <div>#formatValue($item.value)</div>
    #end
#end

#macro(formatValue $value)
    $NumberUtil.format($value)
#end
```
In up codes, we check $name in line 2, $item.name in line 4, $NumberUtil in line 10, the others will not be checked


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
