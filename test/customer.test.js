const assert = require("node:assert/strict");
const test = require("node:test");

const {
  parseCreateCustomerInput,
  parseCreateCustomerOutput
} = require("../dist/modules/customer/dto/customer.dto.js");
const { CustomerResource } = require("../dist/modules/customer/resource/customer.resource.js");

test("parseCreateCustomerInput accepts minimal valid payload", () => {
  const result = parseCreateCustomerInput({
    name: "John Doe",
    cpfCnpj: "24971563792"
  });

  assert.equal(result.name, "John Doe");
  assert.equal(result.cpfCnpj, "24971563792");
});

test("parseCreateCustomerInput rejects payload without cpfCnpj", () => {
  assert.throws(
    () =>
      parseCreateCustomerInput({
        name: "John Doe"
      }),
    /cpfCnpj/
  );
});

test("parseCreateCustomerOutput accepts nullable optional fields", () => {
  const result = parseCreateCustomerOutput({
    object: "customer",
    id: "cus_1",
    dateCreated: "2026-02-25",
    name: "John Doe",
    cpfCnpj: "24971563792",
    email: null,
    externalReference: null
  });

  assert.equal(result.id, "cus_1");
  assert.equal(result.email, null);
});

test("CustomerResource.create validates payload and calls /v3/customers", async () => {
  let calledUrl = null;
  let calledPayload = null;

  const resource = new CustomerResource({
    post: async (url, payload) => {
      calledUrl = url;
      calledPayload = payload;

      return {
        object: "customer",
        id: "cus_1",
        dateCreated: "2026-02-25",
        name: payload.name,
        cpfCnpj: payload.cpfCnpj
      };
    }
  });

  const result = await resource.create({
    name: "John Doe",
    cpfCnpj: "24971563792"
  });

  assert.equal(calledUrl, "/v3/customers");
  assert.equal(calledPayload.name, "John Doe");
  assert.equal(result.id, "cus_1");
});
