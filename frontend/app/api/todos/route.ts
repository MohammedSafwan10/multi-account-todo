import { forwardToDjango } from "@/lib/backend";

export function GET(request: Request) {
  return forwardToDjango(request, "/api/todos/");
}

export function POST(request: Request) {
  return forwardToDjango(request, "/api/todos/");
}

