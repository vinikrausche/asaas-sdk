import {
  AsaasHttpClient,
  AsaasHttpClientOptions,
  ResolvedAsaasHttpClientOptions
} from "./core/http/asaas-http-client";
import { CustomerResource } from "./modules/customer/resource/customer.resource";
import { SubscriptionResource } from "./modules/subscription/resource/subscription.resource";

export type { AsaasEnvironment } from "./core/http/asaas-http-client";

export interface AsaasSdkOptions extends AsaasHttpClientOptions {}

export type AsaasSdkConfig = ResolvedAsaasHttpClientOptions;

export class AsaasSdk {
  public readonly customers: CustomerResource;
  public readonly subscriptions: SubscriptionResource;
  private readonly httpClient: AsaasHttpClient;

  constructor(options: AsaasSdkOptions) {
    this.httpClient = new AsaasHttpClient(options);
    this.customers = new CustomerResource(this.httpClient);
    this.subscriptions = new SubscriptionResource(this.httpClient);
  }

  public setApiKey(apiKey: string): void {
    this.httpClient.setApiKey(apiKey);
  }

  public getConfig(): AsaasSdkConfig {
    return this.httpClient.getConfig();
  }
}

export function createAsaasSdk(options: AsaasSdkOptions): AsaasSdk {
  return new AsaasSdk(options);
}
