import type { APIContext } from "astro";
import { clientIp } from "./ratelimit";

export function requestIp({ request, clientAddress }: Pick<APIContext, "request" | "clientAddress">): string {
  const fromHeaders = clientIp(request.headers);
  if (fromHeaders !== "unknown") return fromHeaders;
  try {
    return clientAddress?.trim().slice(0, 64) || "unknown";
  } catch {
    return "unknown";
  }
}
