import { convertToModelMessages, createGateway, streamText, type UIMessage } from "ai";

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().aiGatewayApiKey;
  if (!apiKey) throw new Error("Missing AI Gateway API key");
  const gateway = createGateway({ apiKey });

  return defineEventHandler(async (event) => {
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    const result = streamText({
      // Align with AI SDK Nuxt quickstart; swap model id as needed.
      model: gateway("openai/gpt-5.1"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  });
});
