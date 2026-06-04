const http = require('http');
const url = require('url');
const fs = require('fs');
const readline = require('readline');

// Google OAuth2 endpoints
const AUTH_URI = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URI = 'https://oauth2.googleapis.com/token';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("=== Google OAuth2 Gmail Helper ===");
  console.log("Please create a Project in Google Cloud Console, enable Gmail API,");
  console.log("and create an OAuth 2.0 Client ID (Application Type: Web Application).");
  console.log("Add Redirect URI: http://localhost:8888");
  console.log("");

  const clientId = await ask("Enter your Google Client ID: ");
  const clientSecret = await ask("Enter your Google Client Secret: ");

  if (!clientId.trim() || !clientSecret.trim()) {
    console.error("Client ID and Client Secret are required.");
    process.exit(1);
  }

  const PORT = 8888;
  const redirectUri = `http://localhost:${PORT}`;
  
  // Scopes required for sending Gmail
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send'
  ].join(' ');

  const authUrl = `${AUTH_URI}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;

  console.log("\n========================================================");
  console.log("Please open the following URL in your browser to authorize:");
  console.log(authUrl);
  console.log("========================================================\n");

  // Start local HTTP server to catch redirect
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/') {
      const code = parsedUrl.query.code;
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Authorization Successful!</h1><p>You can close this tab and return to the terminal.</p>');
        server.close();
        rl.close();
        
        console.log("Authorization code received. Exchanging for tokens...");
        await exchangeCodeForTokens(code, clientId, clientSecret, redirectUri);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Authorization code missing in redirect.');
      }
    }
  });

  server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT} for redirect...`);
  });
}

async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
  try {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    const res = await fetch(TOKEN_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(`${data.error}: ${data.error_description}`);
    }

    console.log("\nToken exchange successful!");
    console.log("-----------------------------------------");
    console.log("Please save these to your Strapi backend .env file on ECS:");
    console.log(`GMAIL_CLIENT_ID="${clientId}"`);
    console.log(`GMAIL_CLIENT_SECRET="${clientSecret}"`);
    console.log(`GMAIL_REFRESH_TOKEN="${data.refresh_token}"`);
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (err) {
    console.error("Failed to exchange tokens:", err.message);
    process.exit(1);
  }
}

main();
