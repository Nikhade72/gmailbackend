# Node.js Gmail Auto-Reply Server

This Node.js server provides an auto-reply functionality for unread emails in the Gmail inbox using the Gmail API. It periodically checks for unread emails, sends an auto-reply if necessary, and updates labels accordingly.

## Prerequisites

Before running the server, ensure you have the following:

- [Node.js](https://nodejs.org/) installed on your machine.
- A Gmail API project with credentials and access to the Gmail API. Follow the [Gmail API Node.js Quickstart](https://developers.google.com/gmail/api/quickstart) to set up your project and obtain credentials.
 
## Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    ```

2. **Navigate to the project directory:**

    ```bash
    cd <project-directory>
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Place your Gmail API credentials file (`credentials.json`) in the project directory.**

## Configuration

1. Open `server.js` in a text editor.

2. Update the `SCOPES` array with the necessary Gmail API scopes based on your application requirements.

3. Modify the `labelName` variable with the desired label name for auto-replied emails.

4. Optionally, adjust other configuration values, such as the interval for checking unread messages.

## Running the Server

Start the server by running:

```bash
npm start

Note: My auto reply email address : harshanikhade29@gmail.com
