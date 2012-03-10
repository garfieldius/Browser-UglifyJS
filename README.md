# Browser UglifiyJS

## About

This little tool offers to build UglifyJS for a web browser by wrapping the actual code into closures and expose an easy to use API

## Built it

Just clone, init the submodules and run the <code>build.js</code> module with node
eg:

```
git clone --recursive git://github.com/Trenker/Browser-UglifyJS.git browser-uglifyjs
cd browser-uglifyjs
node build.js
```

The result is written into the **build** folder

## Useage in a browser - Normal

Simpy add this HTML

```html
<script type="text/javascript" src="uglifyjs.1.2.5.js"></script>
```

Now you can uglify some code like this:

```javascript
var rawCode = document.forms[0].rawCode.value;
var minCode = uglifiy(rawCode);
document.forms[0].minCode.value = minCode;
```

## Usage in a browser - Workers

By default, the wrapper offers the possiblity to be run as a Worker

eg.:

```javascript
var myWorker = new Worker('uglifyjs.1.2.5.js');

myWorker.onmessage = function(minCode) {
  document.forms[0].minCode.value = minCode
}

document.forms[0].doUglifyButton.value.onclick = function() {
  myWorker.postMessage(document.forms[0].rawCode.value);
};
```

## Credits and License

All credits for this tool go to [Mihai Bazon](https://github.com/mishoo).
He created uglifyJS, I only did the wrapper.

License for both UglifyJS and Browser - UglifyJS is the BSD License.
See the LICENSE.md file for details
