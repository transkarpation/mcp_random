import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse";
import express from "express"
import { z } from "zod";

const app = express()

const server = new McpServer({
  name: "MCP for Dog Lovers",
  version: "1.0.0",
});

server.tool("getRandomDogImage", { breed: z.string() }, async ({ breed }) => {
  const response = await fetch(
    `https://dog.ceo/api/breed/${breed}/images/random`,
  );
  const data = await response.json();
  return {
    content: [
      { type: "text", text: `Your dog image is here: ${data.message}` },
    ],
  };
});

let transport: SSEServerTransport | null = null;

app.get("/sse", async (_req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

const PORT = process.env.PORT || 3030
app.listen(PORT, () => console.log("PORT ", PORT))
