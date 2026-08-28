import "server-only";

import { auth0 } from "@/lib/auth0";

function json(message: string, status: number) {
  return Response.json({ detail: message }, { status });
}

export async function forwardToDjango(request: Request, path: string) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return json("Please log in again.", 401);
    }

    const { token } = await auth0.getAccessToken({
      audience: process.env.AUTH0_AUDIENCE,
      scope: process.env.AUTH0_SCOPE,
    });
    const baseUrl = process.env.API_SERVER_URL;
    if (!baseUrl) {
      return json("The API is not configured.", 500);
    }

    const incomingUrl = new URL(request.url);
    const targetUrl = `${baseUrl.replace(/\/$/, "")}${path}${incomingUrl.search}`;
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
    const response = await fetch(targetUrl, {
      method: request.method,
      body,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": request.headers.get("Content-Type") || "application/json",
      },
    });

    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
    });
  } catch {
    return json("Could not reach the API. Try again.", 503);
  }
}

