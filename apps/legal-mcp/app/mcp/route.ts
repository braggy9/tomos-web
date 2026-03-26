import { NextRequest, NextResponse } from "next/server";
import { PROMPTS } from "../../lib/prompts";
import { RESOURCES } from "../../lib/resources";
import { TOOLS, callTool } from "../../lib/tools";

// MCP Protocol version
const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "tomos-mcp", version: "2.0.0" };

// ─── Auth ──────────────────────────────────────────────────────────────────

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.MCP_SECRET;
  if (!secret) return true; // No secret configured — allow all
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

// ─── MCP Message Handler ───────────────────────────────────────────────────

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id?: string | number | null;
  result?: unknown;
  error?: { code: number; message: string };
};

function ok(id: string | number | null | undefined, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function err(id: string | number | null | undefined, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

async function handleMessage(msg: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  const { id, method, params } = msg;

  // Notifications — no response
  if (method?.startsWith("notifications/") || method === "initialized") {
    return null;
  }

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
          prompts: { listChanged: false },
          resources: { listChanged: false, subscribe: false },
          tools: { listChanged: false },
        },
        serverInfo: SERVER_INFO,
      });

    case "ping":
      return ok(id, {});

    case "prompts/list":
      return ok(id, {
        prompts: PROMPTS.map((p) => ({
          name: p.name,
          description: p.description,
          arguments: p.arguments ?? [],
        })),
      });

    case "prompts/get": {
      const name = (params as { name?: string })?.name;
      const args = ((params as { arguments?: Record<string, string> })?.arguments) ?? {};
      const prompt = PROMPTS.find((p) => p.name === name);
      if (!prompt) {
        return err(id, -32001, `Prompt not found: ${name}`);
      }
      return ok(id, {
        description: prompt.description,
        messages: prompt.getMessages(args),
      });
    }

    case "resources/list":
      return ok(id, {
        resources: RESOURCES.map((r) => ({
          uri: r.uri,
          name: r.name,
          description: r.description,
          mimeType: r.mimeType,
        })),
      });

    case "resources/read": {
      const uri = (params as { uri?: string })?.uri;
      const resource = RESOURCES.find((r) => r.uri === uri);
      if (!resource) {
        return err(id, -32001, `Resource not found: ${uri}`);
      }
      return ok(id, {
        contents: [
          {
            uri: resource.uri,
            mimeType: resource.mimeType,
            text: resource.content,
          },
        ],
      });
    }

    case "tools/list":
      return ok(id, {
        tools: TOOLS.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      });

    case "tools/call": {
      const toolName = (params as { name?: string })?.name;
      const toolArgs = ((params as { arguments?: Record<string, unknown> })?.arguments) ?? {};
      if (!toolName) {
        return err(id, -32602, "Missing tool name");
      }
      try {
        const result = await callTool(toolName, toolArgs);
        return ok(id, result);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return err(id, -32001, message);
      }
    }

    default:
      return err(id, -32601, `Method not found: ${method}`);
  }
}

// ─── Route Handlers ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 }
    );
  }

  // Handle batch requests
  if (Array.isArray(body)) {
    const results = await Promise.all(
      body.map((msg) => handleMessage(msg as JsonRpcRequest))
    );
    const responses = results.filter((r): r is JsonRpcResponse => r !== null);
    return NextResponse.json(responses, {
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await handleMessage(body as JsonRpcRequest);

  // Notification — return 202 with no body
  if (response === null) {
    return new NextResponse(null, { status: 202 });
  }

  return NextResponse.json(response, {
    headers: { "Content-Type": "application/json" },
  });
}

// GET for SSE — return 405 (stateless server doesn't support SSE streams)
export async function GET() {
  return NextResponse.json(
    { error: "This MCP server uses JSON response mode. Use POST." },
    { status: 405 }
  );
}
