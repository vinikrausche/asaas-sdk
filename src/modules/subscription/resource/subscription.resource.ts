import { AsaasHttpClient } from "../../../core/http/asaas-http-client";
import {
  CreateSubscriptionInputDto,
  CreateSubscriptionOutputDto,
  parseCreateSubscriptionInput,
  parseCreateSubscriptionOutput
} from "../dto/subscription.dto";

export class SubscriptionResource {
  constructor(private readonly httpClient: AsaasHttpClient) {}

  public async create(input: CreateSubscriptionInputDto): Promise<CreateSubscriptionOutputDto> {
    const payload = parseCreateSubscriptionInput(input);
    const response = await this.httpClient.post<unknown>("/v3/subscriptions", payload);

    return parseCreateSubscriptionOutput(response);
  }
}
