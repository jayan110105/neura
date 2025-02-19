import { google as googleApis } from "googleapis";

export async function fetchEmail(accessToken: string) {
    const authClient = new googleApis.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });
  
    const gmail = googleApis.gmail({ version: "v1", auth: authClient });
  
    try {
      const messagesList = await gmail.users.messages.list({
        userId: "me",
        maxResults: 5,
        q: "is:unread category:primary -from:linkedin.com",
      });

      if (!messagesList.data.messages) return "No emails found.";

      const emailSummaries = [];

      for (const message of messagesList.data.messages) {
        if (!message.id) continue
    
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });
    
        const parts = email.data.payload?.parts ?? [];
        const emailContent = parts
          .filter(part => part.mimeType === "text/plain" && part.body?.data)
          .map(part => part.body?.data ? Buffer.from(part.body.data, "base64").toString("utf-8") : "No content")
          .join("\n");
    
        emailSummaries.push(emailContent || "No content found.");
      }

      return emailSummaries.join("\n\n");
    } catch (error) {
      console.error("Error fetching email list: ", error);
      throw new Error("Failed to fetch emails");
    }
  }