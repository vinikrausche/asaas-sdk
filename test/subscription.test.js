const assert = require("node:assert/strict");
const test = require("node:test");

const {
  parseCreateSubscriptionInput,
  parseCreateSubscriptionOutput
} = require("../dist/modules/subscription/dto/subscription.dto.js");
const {
  SubscriptionResource
} = require("../dist/modules/subscription/resource/subscription.resource.js");

test("parseCreateSubscriptionInput accepts minimal valid payload", () => {
  const result = parseCreateSubscriptionInput({
    customer: "cus_1",
    billingType: "BOLETO",
    value: 19.9,
    nextDueDate: "2026-03-10",
    cycle: "MONTHLY"
  });

  assert.equal(result.customer, "cus_1");
  assert.equal(result.billingType, "BOLETO");
});

test("parseCreateSubscriptionInput rejects payload without required fields", () => {
  assert.throws(
    () =>
      parseCreateSubscriptionInput({
        customer: "cus_1"
      }),
    /billingType/
  );
});

test("parseCreateSubscriptionOutput accepts nullable optional fields", () => {
  const result = parseCreateSubscriptionOutput({
    object: "subscription",
    id: "sub_1",
    dateCreated: "2026-02-25",
    customer: "cus_1",
    billingType: "BOLETO",
    cycle: "MONTHLY",
    value: 19.9,
    nextDueDate: "2026-03-10",
    status: "ACTIVE",
    endDate: null,
    externalReference: null,
    split: null
  });

  assert.equal(result.id, "sub_1");
  assert.equal(result.endDate, null);
});

test("SubscriptionResource.create validates payload and calls /v3/subscriptions", async () => {
  let calledUrl = null;
  let calledPayload = null;

  const resource = new SubscriptionResource({
    post: async (url, payload) => {
      calledUrl = url;
      calledPayload = payload;

      return {
        object: "subscription",
        id: "sub_1",
        dateCreated: "2026-02-25",
        customer: payload.customer,
        billingType: payload.billingType,
        cycle: payload.cycle,
        value: payload.value,
        nextDueDate: payload.nextDueDate,
        status: "ACTIVE"
      };
    }
  });

  const result = await resource.create({
    customer: "cus_1",
    billingType: "BOLETO",
    value: 19.9,
    nextDueDate: "2026-03-10",
    cycle: "MONTHLY"
  });

  assert.equal(calledUrl, "/v3/subscriptions");
  assert.equal(calledPayload.customer, "cus_1");
  assert.equal(result.id, "sub_1");
});
