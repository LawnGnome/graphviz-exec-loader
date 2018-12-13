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
            async: () => (err, values) => resolve({ err, values })
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

  expect(err.message).toMatch(
    /dot exited with return code 1[\s\S]+Format: "bogus" not recognized/
  );
  expect(values).toBeNull();
});

test("invalid input", async () => {
  const ctx = new MockLoaderContext({
    command: "dot",
    format: "svg"
  });

  const { err, values } = await ctx.invokeLoader(loader, "}");

  expect(err.message).toMatch(
    /dot exited with return code 1[\s\S]+syntax error/
  );
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
  expect(values).toMatch("data:image/svg+xml");
});
