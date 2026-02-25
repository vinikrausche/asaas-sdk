import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { z } from "zod";

export type AsaasEnvironment = "sandbox" | "production";

export interface AsaasHttpClientOptions {
  apiKey: string;
  environment?: AsaasEnvironment;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface ResolvedAsaasHttpClientOptions {
  apiKey: string;
  environment: AsaasEnvironment;
  baseUrl: string;
  timeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

export const ASAAS_BASE_URLS: Record<AsaasEnvironment, string> = {
  sandbox: "https://api-sandbox.asaas.com",
  production: "https://api.asaas.com"
};

const asaasErrorItemSchema = z
  .object({
    code: z.string().optional(),
    description: z.string().optional()
  })
  .passthrough();

const asaasErrorResponseSchema = z
  .object({
    errors: z.array(asaasErrorItemSchema).optional()
  })
  .passthrough();

export type AsaasErrorItem = z.infer<typeof asaasErrorItemSchema>;
export type AsaasErrorResponse = z.infer<typeof asaasErrorResponseSchema>;

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function validateBaseUrl(baseUrl: string): void {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(baseUrl);
  } catch (error) {
    throw new Error(`Invalid Asaas baseUrl: ${baseUrl}`);
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Asaas baseUrl must use HTTPS.");
  }
}

function resolveEnvironment(options: AsaasHttpClientOptions): AsaasEnvironment {
  return options.environment ?? "sandbox";
}

function assertApiKey(apiKey: string): void {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Asaas apiKey is required.");
  }
}

export function resolveAsaasHttpClientOptions(
  options: AsaasHttpClientOptions
): ResolvedAsaasHttpClientOptions {
  assertApiKey(options.apiKey);

  const environment = resolveEnvironment(options);
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? ASAAS_BASE_URLS[environment]);
  validateBaseUrl(baseUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    apiKey: options.apiKey.trim(),
    environment,
    baseUrl,
    timeoutMs
  };
}

interface AsaasRequestErrorParams {
  status?: number;
  errors?: AsaasErrorItem[];
  data?: unknown;
  cause?: unknown;
}

export class AsaasRequestError extends Error {
  public readonly status?: number;
  public readonly errors?: AsaasErrorItem[];
  public readonly data?: unknown;

  constructor(message: string, params: AsaasRequestErrorParams = {}) {
    super(message);
    this.name = "AsaasRequestError";

    if (params.status !== undefined) {
      this.status = params.status;
    }

    if (params.errors !== undefined) {
      this.errors = params.errors;
    }

    if (params.data !== undefined) {
      this.data = params.data;
    }

    if (params.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = params.cause;
    }
  }
}

export class AsaasHttpClient {
  private readonly axiosInstance: AxiosInstance;
  private resolvedOptions: ResolvedAsaasHttpClientOptions;

  constructor(options: AsaasHttpClientOptions) {
    this.resolvedOptions = resolveAsaasHttpClientOptions(options);

    this.axiosInstance = axios.create({
      baseURL: this.resolvedOptions.baseUrl,
      timeout: this.resolvedOptions.timeoutMs,
      maxRedirects: 0,
      headers: {
        "Content-Type": "application/json",
        access_token: this.resolvedOptions.apiKey
      }
    });
  }

  public getConfig(): ResolvedAsaasHttpClientOptions {
    return {
      ...this.resolvedOptions,
      apiKey: this.maskApiKey(this.resolvedOptions.apiKey)
    };
  }

  public setApiKey(apiKey: string): void {
    assertApiKey(apiKey);

    const trimmedApiKey = apiKey.trim();
    this.resolvedOptions = {
      ...this.resolvedOptions,
      apiKey: trimmedApiKey
    };

    this.axiosInstance.defaults.headers.common["access_token"] = trimmedApiKey;
  }

  public async get<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.request<TResponse>(() => this.axiosInstance.get<TResponse>(url, config));
  }

  public async post<TResponse>(
    url: string,
    payload?: unknown,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>(() => this.axiosInstance.post<TResponse>(url, payload, config));
  }

  public async put<TResponse>(
    url: string,
    payload?: unknown,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.request<TResponse>(() => this.axiosInstance.put<TResponse>(url, payload, config));
  }

  public async delete<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.request<TResponse>(() => this.axiosInstance.delete<TResponse>(url, config));
  }

  private async request<TResponse>(
    action: () => Promise<AxiosResponse<TResponse>>
  ): Promise<TResponse> {
    try {
      const response = await action();
      return response.data;
    } catch (error) {
      throw this.buildAsaasRequestError(error);
    }
  }

  private buildAsaasRequestError(error: unknown): AsaasRequestError {
    if (!axios.isAxiosError(error)) {
      return new AsaasRequestError("Unknown Asaas request error.", { cause: error });
    }

    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    const parsedError = asaasErrorResponseSchema.safeParse(data);
    const firstErrorDescription = parsedError.success
      ? parsedError.data.errors?.[0]?.description
      : undefined;

    const message =
      firstErrorDescription ??
      axiosError.message ??
      "Asaas API request failed without details.";

    const params: AsaasRequestErrorParams = {
      cause: error
    };

    if (status !== undefined) {
      params.status = status;
    }

    if (data !== undefined) {
      params.data = data;
    }

    if (parsedError.success && parsedError.data.errors !== undefined) {
      params.errors = parsedError.data.errors;
    }

    return new AsaasRequestError(message, params);
  }

  private maskApiKey(apiKey: string): string {
    if (!apiKey) {
      return "";
    }

    if (apiKey.length <= 8) {
      return "*".repeat(apiKey.length);
    }

    const prefix = apiKey.slice(0, 4);
    const suffix = apiKey.slice(-4);

    return `${prefix}...${suffix}`;
  }
}
