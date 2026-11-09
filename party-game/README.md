# Odd Prompt Out

A party game you play with your phones, in the style of Jackbox games.

**Everyone gets the same prompt, except one player, who secretly gets a slightly different one and doesn't know it.** Everyone writes an answer. The answers go up on the big screen with names attached. Then you argue about them and vote for the Odd One Out.

- You catch the Odd One: **+200** for each player who voted for them
- You're the Odd One: **+100** for each player you fooled, plus **+300** if you escape
- 5 rounds, 3–10 players

## Run it

Needs Node 18 or newer. There's nothing to install.

```bash
cd party-game
npm start          # or: node server.js
```

The terminal prints two addresses:

```
Host screen (TV/laptop):  http://localhost:3000/host
Players join on phones:   http://192.168.1.23:3000
```

1. Open the **host screen** on a laptop or TV that everyone can see. It creates a room with a 4-letter code.
2. Everyone on the **same Wi-Fi** opens the players address on their phone, types the code, and joins.
3. The host, or the 👑 VIP (the first player to join), presses Start.

Use `PORT=8080 npm start` to run it on a different port.

### Playing with people who aren't in the room

Put the server on the internet, then share the screen with the host page over Zoom, Discord, or something similar:

- **Quick:** run `npx localtunnel --port 3000` or `ngrok http 3000` and send the public URL to friends.
- **Permanent:** deploy the `party-game` folder to any Node host that supports long-lived connections, such as Render, Railway, or Fly.io. Use the start command `node server.js`. Vercel serverless won't work, because the game keeps state in memory and pushes updates live.

## How it works

- `server.js` is a plain Node HTTP server with no dependencies. Rooms live in memory. Phones and the host screen get live updates over Server-Sent Events and send actions with `POST /api`.
- The host screen never shows anyone's prompt while answers are being written, so the Odd One can't spot their prompt on the TV.
- If a phone refreshes or loses connection, it rejoins automatically.
- To add more prompt pairs, edit `prompts.js`.
