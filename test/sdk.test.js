const assert = require("node:assert/strict");
const test = require("node:test");

const { AsaasSdk, createAsaasSdk } = require("../dist/sdk.js");

test("createAsaasSdk returns AsaasSdk instance with resources", () => {
  const sdk = createAsaasSdk({
    apiKey: "token_123",
    environment: "sandbox"
  });

  assert.ok(sdk instanceof AsaasSdk);
  assert.equal(typeof sdk.customers.create, "function");
  assert.equal(typeof sdk.subscriptions.create, "function");
});

test("AsaasSdk setApiKey updates current configuration", () => {
  const sdk = createAsaasSdk({
    apiKey: "token_old",
    environment: "production"
  });

  sdk.setApiKey("token_new");

  const config = sdk.getConfig();
  assert.equal(config.apiKey, "toke..._new");
  assert.equal(config.environment, "production");
});
