import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorHandler<T extends (...args: any[]) => Promise<Response>>(handler: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === "Unauthorized")
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (e.message.includes("Forbidden"))
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (e.message.includes("not found") || e.message.includes("Not found"))
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        console.error("[API Error]", e.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }) as T;
}
