# grunt-git-tag [![Build Status](https://secure.travis-ci.org/markparolisi/grunt-git-tag.png?branch=master)](http://travis-ci.org/markparolisi/grunt-git-tag)


## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```bash
npm install grunt-git-tag --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-git-tag');
```


## Usage

Invoke this task with the following Grunt command.

```js
grunt git-tag
```

Depending on the task settings, certain prompts will guide you through the tagging process.

## Options

```
gitTag: {
    packageFile: 'path/to/package/file.json' // Default: package.json
}
```

## Release History

 * 2013-07-15   0.0.5   Better organization. Event emitters.
 * 2013-07-12   0.0.1   Initial release


