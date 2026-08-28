import { forwardToDjango } from "@/lib/backend";

type RouteContext = { params: Promise<{ id: string }> };

async function forward(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return Response.json({ detail: "Task not found." }, { status: 404 });
  }
  return forwardToDjango(request, `/api/todos/${id}/`);
}

export const GET = forward;
export const PATCH = forward;
export const DELETE = forward;
