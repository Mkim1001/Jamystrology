import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { messages, apiKey } = await req.json();

    if (!apiKey?.trim()) {
      return new Response("Gemini API 키가 필요합니다.", { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // All but last message go to history; last is the current prompt
    const rawMessages: { role: string; content: string }[] = messages;
    const history = rawMessages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const lastContent = rawMessages[rawMessages.length - 1]?.content ?? "";

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const chat = model.startChat({ history });
          const result = await chat.sendMessageStream(lastContent);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
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
