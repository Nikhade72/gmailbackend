// Import required modules
const express = require("express");
const app = express();
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

// Set the server port
const port = 5000;

// Define the Google API scopes required for Gmail operations
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

// Define the label name for auto-reply messages
const labelName = "Vacation Auto-Reply";

// Define an endpoint for handling auto-reply logic
app.get("/", async (req, res) => {
  try {
    // Authenticate using local credentials file
    const auth = await authenticate({
      keyfilePath: path.join(__dirname, "credentials.json"),
      scopes: SCOPES,
    });

    // Create Gmail API client
    const gmail = google.gmail({ version: "v1", auth });

    // Function to retrieve unread messages from the "INBOX" label
    async function getUnrepliesMessages(auth) {
      const response = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX"],
        q: "is:unread",
      });

      return response.data.messages || [];
    }

    // Function to create a label if it doesn't exist, or retrieve its ID if it does
    async function createLabel(auth) {
      try {
        const response = await gmail.users.labels.create({
          userId: "me",
          requestBody: {
            name: labelName,
            labelListVisibility: "labelShow",
            messageListVisibility: "show",
          },
        });
        return response.data.id;
      } catch (error) {
        if (error.code === 409) {
          const response = await gmail.users.labels.list({
            userId: "me",
          });
          const label = response.data.labels.find(
            (label) => label.name === labelName
          );
          return label.id;
        } else {
          throw error;
        }
      }
    }

    // Main function to handle auto-reply logic
    async function main() {
      // Create or retrieve the ID of the "Vacation Auto-Reply" label
      const labelId = await createLabel(auth);

      // Retrieve unread messages from the "INBOX"
      const messages = await getUnrepliesMessages(auth);

      // If there are unread messages, process each one
      if (messages && messages.length > 0) {
        for (const message of messages) {
          // Retrieve details of the message
          const messageData = await gmail.users.messages.get({
            auth,
            userId: "me",
            id: message.id,
          });

          // Extract email information
          const email = messageData.data;

          // Check if the email has been replied to
          const hasReplied = email.payload.headers.some(
            (header) => header.name === "In-Reply-To"
          );

          // If not replied, send an auto-reply and update labels
          if (!hasReplied) {
            const replyMessage = {
              userId: "me",
              resource: {
                raw: Buffer.from(
                  `To: ${email.payload.headers.find(
                    (header) => header.name === "From"
                  ).value
                  }\r\n` +
                  `Subject: Re: ${email.payload.headers.find(
                    (header) => header.name === "Subject"
                  ).value
                  }\r\n` +
                  `Content-Type: text/plain; charset="UTF-8"\r\n` +
                  `Content-Transfer-Encoding: 7bit\r\n\r\n` +
                  `Thank you for your email. I'm currently on vacation and will reply to you when I return.\r\n`
                ).toString("base64"),
              },
            };

            // Send the auto-reply message
            await gmail.users.messages.send(replyMessage);

            // Update labels by adding "Vacation Auto-Reply" and removing "INBOX"
            await gmail.users.messages.modify({
              auth,
              userId: "me",
              id: message.id,
              resource: {
                addLabelIds: [labelId],
                removeLabelIds: ["INBOX"],
              },
            });
          }
        }
      }

      // Send a structured JSON response
      res.json({
        success: true,
        message: "Auto-reply process completed successfully.",
      });
    }

    // Execute the auto-reply logic
    main();
  } catch (error) {
    // Handle errors and send a structured JSON response with an error message
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error in auto-reply process." });
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
