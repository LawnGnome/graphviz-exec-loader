"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loader;

var _child_process = require("child_process");

var _datauri = _interopRequireDefault(require("datauri"));

var _loaderUtils = require("loader-utils");

var _schemaUtils = _interopRequireDefault(require("schema-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const schema = {
  type: "object",
  required: ["command"],
  properties: {
    command: {
      type: "string"
    },
    format: {
      type: "string"
    }
  }
};

function loader(source) {
  const callback = this.async();
  const options = (0, _loaderUtils.getOptions)(this);
  (0, _schemaUtils.default)(schema, options, "Graphviz loader");
  const format = options.format || "svg";
  let buffer = "";
  const proc = (0, _child_process.spawn)(options.command, [`-T${format}`]);
  proc.on("error", e => this.emitError(e));
  proc.on("exit", code => {
    if (code === 0) {
      const du = new _datauri.default();
      du.format(`.${format}`, buffer);
      callback(null, `module.exports = ${JSON.stringify(du.content)}`);
    } else {
      this.emitError(`${options.command} exited with return code ${code}`);
    }
  });
  proc.stdout.on("data", buf => buffer += buf.toString());
  proc.stdin.end(source);
}
