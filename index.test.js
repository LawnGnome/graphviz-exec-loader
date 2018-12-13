import loader from "./index";
import regeneratorRuntime from "regenerator-runtime";

class MockLoaderContext {
  constructor(options) {
    this.query = options;
  }

  invokeLoader(loader, source) {
    return new Promise((resolve, reject) => {
      try {
        loader.call(
          {
            query: this.query,
            async: () => (err, ...values) => resolve({ err, values }),
            emitError: err => resolve({ err, values: null })
          },
          source
        );
      } catch (e) {
        reject(e);
      }
    });
  }
}

test("invalid command", async () => {
  const ctx = new MockLoaderContext({
    command: "this-should-not-exist",
    format: "svg"
  });

  const { err, values } = await ctx.invokeLoader(loader, "graph G {}");

  expect(err.message).toMatch("spawn this-should-not-exist");
  expect(values).toBeNull();
});

test("invalid format", async () => {
  const ctx = new MockLoaderContext({
    command: "dot",
    format: "bogus"
  });

  const { err, values } = await ctx.invokeLoader(loader, "graph G {}");

  expect(err).toMatch("dot exited with return code");
  expect(values).toBeNull();
});

test("invalid input", async () => {
  const ctx = new MockLoaderContext({
    command: "dot",
    format: "svg"
  });

  const { err, values } = await ctx.invokeLoader(loader, "}");

  expect(err).toMatch("dot exited with return code");
  expect(values).toBeNull();
});

test("missing command", async () => {
  const ctx = new MockLoaderContext({});

  expect.assertions(1);

  try {
    await ctx.invokeLoader(loader, "graph G {}");
  } catch (e) {
    expect(e.message).toMatch(
      /options should have required property 'command'/
    );
  }
});

test("success", async () => {
  const ctx = new MockLoaderContext({ command: "dot", format: "svg" });

  const { err, values } = await ctx.invokeLoader(loader, "graph G {}");

  expect(err).toBeNull();
  expect(values).toHaveLength(1);
  expect(values[0]).toMatch("data:image/svg+xml");
});
