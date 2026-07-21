import type { ApiErrorBody, ErrorField, PlanRequest } from "./types";

const DEFAULT_API_BASE_URL = "/api";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: ErrorField[];

  constructor({
    status,
    code,
    message,
    fields = [],
  }: {
    status: number;
    code: string;
    message: string;
    fields?: ErrorField[];
  }) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export async function postPlanResult<TResponse>(
  path: "/plans/workout" | "/plans/meal-prep" | "/plans/budget",
  request: PlanRequest,
  signal?: AbortSignal,
): Promise<TResponse> {
  return postJson<TResponse>(path, request, signal);
}

export function getApiErrorMessages(error: unknown): {
  message: string;
  fieldMessages: Record<string, string>;
} {
  if (!(error instanceof ApiClientError)) {
    return {
      message: "The request could not be completed.",
      fieldMessages: {},
    };
  }

  const fieldMessages = Object.fromEntries(
    error.fields.map((field) => [field.field, field.message]),
  );
  const uniqueFieldMessages = [...new Set(error.fields.map((field) => field.message))];

  return {
    message:
      uniqueFieldMessages.length > 0
        ? `${error.message} ${uniqueFieldMessages.join(" ")}`
        : error.message,
    fieldMessages,
  };
}

async function postJson<TResponse>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      method: "POST",
      credentials: "include",
      signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiClientError({
      status: 0,
      code: "network_error",
      message: error instanceof Error ? error.message : "Network request failed.",
    });
  }

  const payload = await parseJson(response);

  if (!response.ok) {
    throw toApiClientError(response.status, payload);
  }

  return payload as TResponse;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toApiClientError(status: number, payload: unknown): ApiClientError {
  if (isApiErrorBody(payload)) {
    return new ApiClientError({
      status,
      code: payload.error.code,
      message: payload.error.message,
      fields: payload.error.fields,
    });
  }

  return new ApiClientError({
    status,
    code: "request_error",
    message: "The request could not be completed.",
  });
}

function isApiErrorBody(payload: unknown): payload is ApiErrorBody {
  if (!payload || typeof payload !== "object" || !("error" in payload)) {
    return false;
  }

  const error = (payload as { error: unknown }).error;
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      "message" in error &&
      typeof (error as { code: unknown }).code === "string" &&
      typeof (error as { message: unknown }).message === "string",
  );
}

function apiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
  return configuredUrl.replace(/\/$/, "");
}
