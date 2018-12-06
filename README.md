# Graphviz Exec Loader

This [Webpack](https://webpack.js.org/)
[loader](https://webpack.js.org/concepts/loaders/) calls external
[Graphviz](https://www.graphviz.org/) binaries to process Graphviz files into
any format that the Graphviz tools can emit.

If you want a pure JavaScript solution, you may want to investigate
[graphviz-loader](https://www.npmjs.com/package/graphviz-loader), which uses an
Emscripten compiled version of Graphviz.

## Installation

You will need the Graphviz binaries, such as `dot`, installed on your system.
How you do that is distribution dependent, but usually involves installing a
package named something like `graphviz`.

From there, this is just a standard NPM package:

```bash
yarn add -D graphviz-exec-loader
```

## Usage

You can use this for `.dot` files like any other loader. Here's a sample block
from a Webpack configuration I have:

```js
{
  test: /\.dot$/,
  loader: "graphviz-exec-loader",
  options: {
    command: "dot"
  }
}
```

The `command` option is mandatory, and is the command that will be run
(typically one of `dot`, `neato`, et cetera). You may also provide an optional
`format` option, which will override the `-T` parameter given to the tool; this
defaults to `svg`.

The output of the loader is a data URI that would generally be included
directly into an `<img />` element or a `background: url(...)` style
definition.

## Known issues

I've only tested this with Webpack 3. It may well work with 4, but someone will
have to test that.
