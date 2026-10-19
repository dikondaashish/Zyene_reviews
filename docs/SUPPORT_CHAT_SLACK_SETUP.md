# Website chat: Slack live takeover setup

Natalie (the website chat) mirrors a conversation into Slack once a visitor shares
their details or books a demo. A teammate replying **in that Slack thread** appears
live in the visitor's chat, and Natalie stays quiet for 30 minutes after each reply.
Type `!ai` in the thread to hand the conversation back to Natalie right away.

The feature is off until all three env vars below are set. It takes about 5 minutes.

## 1. Create the Slack app

1. Go to <https://api.slack.com/apps> → **Create New App** → **From scratch**.
   Name it `Zyene Website Chat` and pick your workspace.
2. **OAuth & Permissions** → **Bot Token Scopes** → add:
   - `chat:write` (post leads and visitor messages)
   - `channels:history` (receive thread replies in a public channel), or
     `groups:history` if the support channel is private
   - `users:read` (show the teammate's first name to the visitor)
3. **Install to Workspace**, then copy the **Bot User OAuth Token** (`xoxb-…`).
4. **Basic Information** → copy the **Signing Secret**.

## 2. Pick the channel

1. Create (or choose) a channel such as `#website-chat`.
2. Invite the bot: `/invite @Zyene Website Chat`.
3. Copy the channel ID (channel name → **View channel details** → bottom of the About tab, `C…`).

## 3. Add the env vars in Vercel (Production)

| Variable | Value |
|----------|-------|
| `SLACK_BOT_TOKEN` | `xoxb-…` from step 1.3 |
| `SLACK_SIGNING_SECRET` | Signing secret from step 1.4 |
| `SLACK_SUPPORT_CHANNEL_ID` | `C…` from step 2.3 |

Redeploy so the new values are picked up.

## 4. Turn on events

1. In the Slack app: **Event Subscriptions** → **Enable Events**.
2. **Request URL**: `https://www.zyenereviews.com/api/webhooks/slack`
   (Slack sends a challenge; it should show **Verified**. This needs step 3 deployed first.)
3. **Subscribe to bot events** → add `message.channels` (or `message.groups` for a private channel).
4. **Save Changes** and reinstall the app if Slack asks.

## 5. Test

1. Open the website, ask Natalie a question, then use **··· → Talk to a person** and submit the form.
2. A thread appears in the channel with the lead and transcript.
3. Reply in the thread. The reply shows in the website chat within a second or two,
   labelled with your first name, and the header says "<name> from the team joined".

## Notes

- Requests are verified with Slack's signing secret and a 5-minute replay window.
- Visitor text is escaped before posting, so it cannot @-mention or link in Slack.
- Live delivery uses Supabase Realtime broadcast; if the visitor's tab was closed,
  replies load when they come back (history catch-up).
- Conversations need the `support_chat_*` tables
  (`supabase/migrations/20261018190000_support_chat.sql`).
