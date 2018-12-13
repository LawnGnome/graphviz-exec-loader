import {
  spawn
} from "child_process";
import DataURI from "datauri";
import {
  getOptions
} from "loader-utils";
import validateOptions from "schema-utils";

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

export default function loader(source) {
  const callback = this.async();
  const options = getOptions(this);

  validateOptions(schema, options, "Graphviz loader");
  const format = options.format || "svg";

  let buffer = "";
  const proc = spawn(options.command, [`-T${format}`]);
  proc.on("error", e => callback(e, null));
  proc.on("exit", code => {
    if (code === 0) {
      const du = new DataURI();
      du.format(`.${format}`, buffer);
      callback(null, `module.exports = ${JSON.stringify(du.content)}`);
    } else {
      callback(new Error(`${options.command} exited with return code ${code}`), null);
    }
  });
  proc.stdout.on("data", buf => buffer += buf.toString());
  proc.stdin.end(source);
}
