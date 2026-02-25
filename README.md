# @vinikrausche/asaas-sdk

SDK Node.js + TypeScript para integrar com a API do Asaas com foco em simplicidade:
- inicializacao unica com token
- selecao de ambiente (`sandbox` ou `production`)
- recursos por dominio (`customers` e `subscriptions`)
- validacao de entrada e saida com Zod

## Requisitos

- Node.js 20+
- npm 10+

## Instalacao

```bash
npm install @vinikrausche/asaas-sdk
```

## Inicializacao da SDK

```ts
import { createAsaasSdk } from "@vinikrausche/asaas-sdk";

const sdk = createAsaasSdk({
  apiKey: process.env.ASAAS_API_KEY!,
  environment: "sandbox"
});
```

### Configuracao disponivel

- `apiKey` (obrigatorio): chave da API Asaas
- `environment` (opcional): `"sandbox"` (padrao) ou `"production"`
- `baseUrl` (opcional): sobrescreve a URL base (somente `https`)
- `timeoutMs` (opcional): timeout HTTP em ms (padrao `30000`)

### Ambientes

- `sandbox` -> `https://api-sandbox.asaas.com`
- `production` -> `https://api.asaas.com`

### Auth

O token e enviado no header `access_token`.

Voce pode trocar o token em runtime:

```ts
sdk.setApiKey("nova-chave");
```

O retorno de `sdk.getConfig()` mascara o `apiKey` para reduzir risco de vazamento em logs.

## Recursos implementados

- `sdk.customers.create(...)`
- `sdk.subscriptions.create(...)`

## Customers

Endpoint: `POST /v3/customers`

Referencia oficial:
- https://docs.asaas.com/reference/criar-novo-cliente

### Exemplo

```ts
const customer = await sdk.customers.create({
  name: "John Doe",
  cpfCnpj: "24971563792",
  email: "john.doe@asaas.com.br",
  phone: "4738010919",
  mobilePhone: "4799376637"
});

console.log(customer.id);
```

## Subscriptions

Endpoint: `POST /v3/subscriptions`

Referencia oficial:
- https://docs.asaas.com/reference/criar-nova-assinatura

### Exemplo minimo

```ts
const subscription = await sdk.subscriptions.create({
  customer: "cus_000005401844",
  billingType: "BOLETO",
  value: 19.9,
  nextDueDate: "2026-03-10",
  cycle: "MONTHLY"
});

console.log(subscription.id);
```

### Exemplo completo

```ts
const subscription = await sdk.subscriptions.create({
  customer: "cus_000005401844",
  billingType: "PIX",
  value: 29.9,
  nextDueDate: "2026-03-10",
  cycle: "MONTHLY",
  description: "Plano Pro",
  endDate: "2026-12-10",
  maxPayments: 12,
  externalReference: "SUB-1001",
  discount: {
    value: 10,
    dueDateLimitDays: 0,
    type: "PERCENTAGE"
  },
  interest: {
    value: 2
  },
  fine: {
    value: 1,
    type: "PERCENTAGE"
  },
  split: [
    {
      walletId: "wallet_123",
      percentualValue: 20
    }
  ],
  callback: {
    successUrl: "https://app.exemplo.com/pagamento/sucesso",
    autoRedirect: true
  }
});

console.log(subscription.status);
```

## Tratamento de erro

Erros HTTP da API sao normalizados em `AsaasRequestError`.

```ts
import { AsaasRequestError } from "@vinikrausche/asaas-sdk";

try {
  await sdk.customers.create({
    name: "Nome sem documento",
    cpfCnpj: ""
  });
} catch (error) {
  if (error instanceof AsaasRequestError) {
    console.log(error.status);
    console.log(error.errors);
    console.log(error.data);
  }
}
```

## Estrutura do projeto

```text
src
├── core
│   └── http
│       └── asaas-http-client.ts
├── modules
│   ├── customer
│   │   ├── dto
│   │   │   └── customer.dto.ts
│   │   └── resource
│   │       └── customer.resource.ts
│   └── subscription
│       ├── dto
│       │   └── subscription.dto.ts
│       └── resource
│           └── subscription.resource.ts
├── sdk.ts
└── index.ts
```

## Scripts

- `npm run check`: validacao de tipos sem gerar arquivos
- `npm run build`: compilacao TypeScript para `dist/`
- `npm run dev`: compilacao em watch mode
- `npm test`: executa testes automatizados (build + node:test)
- `npm run clean`: remove `dist/`

## Publicacao no npm

```bash
npm login
npm publish --access public
```
