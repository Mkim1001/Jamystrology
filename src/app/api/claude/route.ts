import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { messages, apiKey } = await req.json();

    if (!apiKey?.trim()) {
      return new Response("Claude API 키가 필요합니다.", { status: 400 });
    }

    const client = new Anthropic({ apiKey: apiKey.trim() });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const s = client.messages.stream({
            model: "claude-opus-4-6",
            max_tokens: 4096,
            messages: messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          });

          for await (const event of s) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          controller.enqueue(encoder.encode(`\n[오류: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(`오류: ${msg}`, { status: 500 });
  }
}
