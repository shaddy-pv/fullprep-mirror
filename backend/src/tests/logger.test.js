import test from "node:test";
import assert from "node:assert";
import { logger, logStore } from "../utils/logger.js";

test("Logger unit tests", async (t) => {
  await t.test("should export logging methods", () => {
    assert.strictEqual(typeof logger.info, "function");
    assert.strictEqual(typeof logger.warn, "function");
    assert.strictEqual(typeof logger.error, "function");
    assert.strictEqual(typeof logger.debug, "function");
    assert.strictEqual(typeof logger.audit, "function");
  });

  await t.test("should support AsyncLocalStorage context propagation", () => {
    const testContext = {
      reqId: "test-uuid-1234",
      method: "GET",
      url: "/test-url",
      ip: "127.0.0.1",
      userId: "user-123"
    };

    logStore.run(testContext, () => {
      const activeStore = logStore.getStore();
      assert.deepStrictEqual(activeStore, testContext);
    });
  });
});
