import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("webhook-inbox");
    const messages = (await store.get("messages", {
      type: "json"
    })) || [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify(messages)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Could not read inbox"
    };
  }
};
