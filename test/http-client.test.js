const assert = require("node:assert/strict");
const test = require("node:test");

const {
  AsaasHttpClient,
  ASAAS_BASE_URLS,
  resolveAsaasHttpClientOptions
} = require("../dist/core/http/asaas-http-client.js");

test("resolveAsaasHttpClientOptions applies sandbox defaults", () => {
  const result = resolveAsaasHttpClientOptions({ apiKey: "token_123" });

  assert.equal(result.environment, "sandbox");
  assert.equal(result.baseUrl, ASAAS_BASE_URLS.sandbox);
  assert.equal(result.timeoutMs, 30000);
});

test("resolveAsaasHttpClientOptions normalizes trailing slash", () => {
  const result = resolveAsaasHttpClientOptions({
    apiKey: "token_123",
    baseUrl: "https://api-sandbox.asaas.com/"
  });

  assert.equal(result.baseUrl, "https://api-sandbox.asaas.com");
});

test("resolveAsaasHttpClientOptions rejects insecure baseUrl", () => {
  assert.throws(
    () =>
      resolveAsaasHttpClientOptions({
        apiKey: "token_123",
        baseUrl: "http://api-sandbox.asaas.com"
      }),
    /HTTPS/
  );
});

test("AsaasHttpClient setApiKey updates runtime config", () => {
  const client = new AsaasHttpClient({ apiKey: "old_token", environment: "sandbox" });

  client.setApiKey("new_token");

  const config = client.getConfig();
  assert.equal(config.apiKey, "new_...oken");
});
