import { google as googleApis } from "googleapis";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().describe("Gmail API query string"),
  maxResults: z.number().min(1).max(50).describe("Number of emails to fetch"),
});

const emailClassificationSchema = z.object({
  classification: z.enum(["Spam", "Unimportant", "Important"]),
  reason: z.string().describe("Reason for classification"),
});

export async function mailParams (userQuery: string)
{
  console.log("Invoked mailParams");
  
  const response = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: querySchema,
    system: `
    You are an AI agent that converts natural language queries into Gmail API query parameters.

    For the given user query, extract:
    - Gmail API 'q' string.
    - 'maxResults' as an integer.

    **Mapping Rules:**
    - If the user mentions **"last"** or **"most recent"**, set **maxResults: 1**.
    - If the user specifies a **category** (e.g., "updates", "primary", "social", "promotions"), map to **category:[category name]** (e.g., 'category:updates').
    - If the user specifies **"from [sender]"**, map to **from:[sender]**.
    - If **"unread"** is mentioned, include **is:unread**.
    - Use **maxResults: 1** as the default if not specified.
    - Exclude emails using terms like **"excluding [term]"** ➔ **-[term]**.
    - Handle date filters like **"from last week"** ➔ **after:[timestamp]**.

    **Examples:**
    1. "Fetch my last mail from Updates" ➔ q: 'category:updates', maxResults: 1
    2. "Get 5 unread emails from John" ➔ q: 'is:unread from:John', maxResults: 5
    3. "Show all emails excluding newsletters" ➔ q: '-category:newsletter', maxResults: 5

    Respond ONLY with the JSON object containing 'q' and 'maxResults'.
  `,
    messages: [{ role: "user", content: userQuery }],
  });
  
  console.log("response", response.object);

  return response.object;
};

export async function classifyEmail(emailContent: string)
{
  const response = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: emailClassificationSchema,
    system: `
      Classify the following email as:
      - "Spam" if it's promotional, phishing, or irrelevant.
      - "Unimportant" if it's a newsletter, social update, or non-actionable.
      - "Important" if it's personal, work-related, or contains tasks/deadlines.

      Also, provide a short reason for the classification.

      Respond in JSON format with 'classification' and 'reason'.
    `,
    messages: [{ role: "user", content: emailContent }],
  });

  console.log("response", response.object);

  return response.object.classification;
};

export async function fetchEmail(accessToken: string, q: string, maxResults: number){
    const authClient = new googleApis.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });
  
    const gmail = googleApis.gmail({ version: "v1", auth: authClient });
  
    try {
      const messagesList = await gmail.users.messages.list({
        userId: "me",
        maxResults: maxResults,
        q: q,
      });

      if (!messagesList.data.messages) return "No emails found.";

      const emailSummaries = [];

      for (const message of messagesList.data.messages) {
        if (!message.id) continue
    
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });
    
        const headers = email.data.payload?.headers ?? [];
        const subject = headers.find(h => h.name === "Subject")?.value ?? "(No Subject)";
        const from = headers.find(h => h.name === "From")?.value ?? "(Unknown Sender)";
        const inReplyTo = headers.find(h => h.name === "In-Reply-To")?.value ?? null;

        // Process email parts
        const parts = email.data.payload?.parts ?? [];
        let emailContent = "";

        if (email.data.payload?.body?.data) {
          emailContent = Buffer.from(email.data.payload.body.data, "base64").toString("utf-8");
        } else {
          emailContent = parts
            .filter(part => (part.mimeType === "text/plain" || part.mimeType === "text/html") && part.body?.data)
            .map(part => part.body?.data ? Buffer.from(part.body.data, "base64").toString("utf-8") : "")
            .join("\n");
        }

        // Normalize content (remove excessive whitespace)
        emailContent = emailContent.replace(/\s+/g, " ").trim();

        // Check for attachments
        const hasAttachments = parts.some(part => part.filename && part.filename.length > 0);

        const classification = await classifyEmail(emailContent);

        emailSummaries.push({
          subject,
          from,
          inReplyTo,
          content: emailContent || "No content found.",
          hasAttachments,
          classification: classification
        });
      }

      return emailSummaries
    } catch (error) {
      console.error("Error fetching email list: ", error);
      throw new Error("Failed to fetch emails");
    }
  }