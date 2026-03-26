
export const TeamInviteEmail = (inviteLink: string, inviterName: string, organizationName: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #000000;
        color: #ffffff;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        margin-top: 24px;
      }
      .footer {
        margin-top: 32px;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div style="padding: 40px;">
      <div class="container">
        <h1 style="color: #111827; font-size: 24px; margin-bottom: 16px;">
          Join ${organizationName} on Zyene
        </h1>
        <p style="color: #374151; font-size: 16px; line-height: 24px;">
          ${inviterName} has invited you to join their team on Zyene Ratings.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 24px;">
          Accept the invitation to start managing reviews and growing your business.
        </p>
        <a href="${inviteLink}" class="button">Accept Invitation</a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          Or copy and paste this link into your browser:
          <br />
          <a href="${inviteLink}" style="color: #2563eb;">${inviteLink}</a>
        </p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Zyene Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>
`;
