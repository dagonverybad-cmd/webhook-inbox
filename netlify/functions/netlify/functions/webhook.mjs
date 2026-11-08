import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }

  const secret = process.env.WEBHOOK_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", {
      status: 401
    });
  }

  try {
    const incoming = await request.json();

    const message = {
      sender: String(incoming.sender || "Discord"),
      content: String(incoming.content || ""),
      timestamp: incoming.timestamp || new Date().toISOString(),
      raw: incoming.raw ?? incoming
    };

    const store = getStore("webhook-inbox");

    const messages = (await store.get("messages", {
      type: "json"
    })) || [];

    messages.unshift(message);

    await store.setJSON("messages", messages.slice(0, 200));

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error(error);
    return new Response("Bad request", {
      status: 400
    });
  }
};
