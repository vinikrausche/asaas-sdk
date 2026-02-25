import { AsaasHttpClient } from "../../../core/http/asaas-http-client";
import {
  CreateCustomerInputDto,
  CreateCustomerOutputDto,
  parseCreateCustomerInput,
  parseCreateCustomerOutput
} from "../dto/customer.dto";

export class CustomerResource {
  constructor(private readonly httpClient: AsaasHttpClient) {}

  public async create(input: CreateCustomerInputDto): Promise<CreateCustomerOutputDto> {
    const payload = parseCreateCustomerInput(input);
    const response = await this.httpClient.post<unknown>("/v3/customers", payload);

    return parseCreateCustomerOutput(response);
  }
}
