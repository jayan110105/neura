import { type gmail_v1, google as googleApis } from "googleapis";

import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
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
  const response = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: querySchema,
    system: `
    You are an AI agent that converts natural language queries into Gmail API query parameters.

    ${Date()} is today's date just for reference

    For the given user query, extract:
    - Gmail API 'q' string.
    - 'maxResults' as an integer.

    **Mapping Rules:**
    - If the user mentions **"last"** or **"most recent"**, set **maxResults: 1**.
    - If the user specifies a **category** (e.g., "updates", "primary", "social", "promotions"), map to **category:[category name]** (e.g., 'category:updates').
    - If the user specifies **"from [sender]"**, map to **from:[sender]**.
    - If **"unread"** is mentioned, include **is:unread**.
    - Use **maxResults: 10** as the default if not specified.
    - Exclude emails using terms like **"excluding [term]"** ➔ **-[term]**.
    - Handle date filters by converting natural language dates into **YYYY/MM/DD** format:
      - **"from last week"** ➔ **after:[YYYY/MM/DD]** (7 days ago).
      - **"from today"** ➔ **after:[YYYY/MM/DD]** (current date).

    **Examples:**
    1. "Fetch my last mail from Updates" ➔ q: 'category:updates', maxResults: 1
    2. "Get 5 unread emails from John" ➔ q: 'is:unread from:John', maxResults: 5
    3. "Show all emails excluding newsletters" ➔ q: '-category:newsletter', maxResults: 10
    4. "Fetch my mails from today" ➔ q: 'after:2025/02/21', maxResults: 10 (where 2025/02/21 is today's date in YYYY/MM/DD format)

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
      Classify the following email into one of these categories:

      - **"Spam"**: Promotional, phishing, irrelevant, or unsolicited emails.
      - **"Unimportant"**: Newsletters, social updates, non-actionable notifications, or general information not requiring immediate attention.
      - **"Important"**: Personal, work-related, or emails containing tasks, deadlines, applications, interviews, or any actionable content.

      **Guidelines:**
      1. Prioritize context and sender relevance. For example:
        - Emails from known institutions (e.g., placement departments) about tests or deadlines are "Important."
        - Job applications or professional communications are "Important."
        - Generic forwards without meaningful content may be "Unimportant" or "Spam" depending on the content.
      2. Avoid misclassifying important emails due to keywords like "template" or "Fwd"—focus on the core message.
    `,
    messages: [{ role: "user", content: emailContent }],
  });

  return response.object.classification;
};

export async function summarizeEmail(emailContent: string)
{
  const response = await generateText({
    model: google("gemini-2.0-flash"),
    system: `
      You are an advanced email summarization assistant designed to present emails in a clean, structured, and user-friendly format. 
      Follow these specific guidelines while summarizing:

      - Prioritize Important Emails:
        - Identify and list important emails first based on relevance, urgency, and user-defined preferences.

      - Group by Sender:
        - Organize emails under their respective senders to provide clarity and streamline reading.

      - Combine Similar Subjects:
        - Merge emails with similar subjects or threads to avoid repetition while preserving key updates.

      - Handle Spam/Unimportant Emails:
        - For emails marked as spam or deemed unimportant, only display the sender's name and a summarized subject in a separate section at the end.

      - Concise and Clear Summaries:
        - Focus on presenting essential details from each email without adding explicit "Action Items" sections.

      The final output should be neat, easy to scan, and emphasize the most relevant information first, ensuring users can quickly understand the contents of their inbox.
    `,
    messages: [{ role: "user", content: emailContent }],
  });

  return response.text;
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
        // Utility to decode base64 safely
        const decodeBase64 = (str: string) => {
          const cleanedStr = str.replace(/-/g, '+').replace(/_/g, '/');
          return Buffer.from(cleanedStr, "base64").toString("utf-8");
        };

        const cleanTextContent = (text: string) => {
          // 1. Remove HTML tags
          let cleanedText = text.replace(/<\/?[^>]+(>|$)/g, "");
        
          // 2. Remove multiple spaces and line breaks
          cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
        
          // 3. Remove common disclaimers (if any)
          const disclaimerRegex = /Disclaimer:.*$/i;
          cleanedText = cleanedText.replace(disclaimerRegex, '').trim();
        
          return cleanedText;
        };
        

        // Recursive function to extract text content from email parts
        const extractContentFromParts = (parts: gmail_v1.Schema$MessagePart[]) => {
          const content: string[] = [];
        
          parts.forEach(part => {
            if (part.mimeType === "text/plain" || part.mimeType === "text/html") {
              if (part.body?.data) {
                const decodedContent = decodeBase64(part.body.data);
                const cleanedContent = cleanTextContent(decodedContent);
                content.push(cleanedContent);
              }
            } else if (part.mimeType?.startsWith("multipart/") && part.parts) {
              // Recursively handle nested multipart sections
              content.push(extractContentFromParts(part.parts));
            }
          });
        
          return content.flat().join("\n");
        };

        const parts = email.data.payload?.parts ?? [];
        let emailContent = "";

        if (email.data.payload?.body?.data) {
          emailContent = decodeBase64(email.data.payload.body.data);
        } else if (email.data.payload?.parts) {
          emailContent = extractContentFromParts(email.data.payload.parts);
        }

        // Normalize content (remove excessive whitespace)
        emailContent = emailContent.replace(/\s+/g, " ").trim();

        // Check for attachments
        const hasAttachments = parts.some(part => part.filename && part.filename.length > 0);

        const classification = await classifyEmail(from+" "+subject+" "+emailContent);

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