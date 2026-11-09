// Odd Prompt Out - zero-dependency party game server.
// Host screen (TV/laptop): /host     Players (phones): /
// Realtime via Server-Sent Events; actions via POST /api.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { PROMPT_PAIRS } from "./prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = path.join(__dirname, "public");

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;
const ROUNDS = 5;
const ANSWER_MS = 75_000;
const VOTE_MS = 60_000;
const REVEAL_MS = 25_000;

const rooms = new Map();

// ---------- helpers ----------
const id = () => crypto.randomBytes(8).toString("hex");
const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
function newCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code;
  do {
    code = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  } while (rooms.has(code));
  return code;
}
const clean = (s, max) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function lanUrls() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const n of list || []) {
      if (n.family === "IPv4" && !n.internal) out.push(`http://${n.address}:${PORT}`);
    }
  }
  return out;
}

// ---------- room lifecycle ----------
function createRoom() {
  const room = {
    code: newCode(),
    hostToken: id(),
    hostClients: new Set(),
    players: new Map(), // pid -> {id,name,score,clients:Set,joinedAt}
    phase: "lobby", // lobby | answer | vote | reveal | final
    round: 0,
    totalRounds: ROUNDS,
    roundPlayers: [],
    oddId: null,
    lastOddId: null,
    realPrompt: "",
    oddPrompt: "",
    answers: {},
    votes: {},
    voteOrder: [],
    result: null,
    deadline: 0,
    timer: null,
    usedPairs: new Set(),
    touched: Date.now(),
  };
  rooms.set(room.code, room);
  return room;
}

function setTimer(room, ms, fn) {
  clearTimeout(room.timer);
  room.deadline = Date.now() + ms;
  room.timer = setTimeout(() => {
    room.timer = null;
    fn();
  }, ms);
}

function startRound(room) {
  room.round += 1;
  room.roundPlayers = [...room.players.keys()];
  const candidates = room.roundPlayers.filter((p) => p !== room.lastOddId);
  room.oddId = candidates[Math.floor(Math.random() * candidates.length)];
  room.lastOddId = room.oddId;

  if (room.usedPairs.size >= PROMPT_PAIRS.length) room.usedPairs.clear();
  let idx;
  do idx = Math.floor(Math.random() * PROMPT_PAIRS.length);
  while (room.usedPairs.has(idx));
  room.usedPairs.add(idx);
  const pair = Math.random() < 0.5 ? PROMPT_PAIRS[idx] : [...PROMPT_PAIRS[idx]].reverse();
  [room.realPrompt, room.oddPrompt] = pair;

  room.answers = {};
  room.votes = {};
  room.result = null;
  room.phase = "answer";
  setTimer(room, ANSWER_MS, () => startVote(room));
  broadcast(room);
}

function startVote(room) {
  if (room.phase !== "answer") return;
  room.phase = "vote";
  room.voteOrder = shuffle(room.roundPlayers);
  setTimer(room, VOTE_MS, () => reveal(room));
  broadcast(room);
}

function reveal(room) {
  if (room.phase !== "vote") return;
  const tally = {};
  for (const t of Object.values(room.votes)) tally[t] = (tally[t] || 0) + 1;
  const oddVotes = tally[room.oddId] || 0;
  const maxOther = Math.max(0, ...Object.entries(tally).filter(([p]) => p !== room.oddId).map(([, n]) => n));
  const caught = oddVotes > 0 && oddVotes > maxOther;

  const deltas = {};
  const add = (p, n) => {
    deltas[p] = (deltas[p] || 0) + n;
  };
  let fooled = 0;
  for (const [voter, target] of Object.entries(room.votes)) {
    if (voter === room.oddId) continue;
    if (target === room.oddId) add(voter, 200);
    else fooled += 1;
  }
  // Players who didn't vote at all are also "fooled".
  for (const p of room.roundPlayers) {
    if (p !== room.oddId && !room.votes[p] && room.players.has(p)) fooled += 1;
  }
  if (fooled) add(room.oddId, 100 * fooled);
  if (!caught) add(room.oddId, 300);

  for (const [p, n] of Object.entries(deltas)) {
    const pl = room.players.get(p);
    if (pl) pl.score += n;
  }

  room.result = {
    oddId: room.oddId,
    oddName: room.players.get(room.oddId)?.name ?? "Someone",
    realPrompt: room.realPrompt,
    oddPrompt: room.oddPrompt,
    caught,
    tally,
    votes: Object.entries(room.votes).map(([from, to]) => ({ from, to })),
    deltas,
  };
  room.phase = "reveal";
  setTimer(room, REVEAL_MS, () => advance(room));
  broadcast(room);
}

function advance(room) {
  if (room.phase !== "reveal") return;
  if (room.round >= room.totalRounds) {
    clearTimeout(room.timer);
    room.phase = "final";
    room.deadline = 0;
    broadcast(room);
  } else startRound(room);
}

function resetGame(room) {
  clearTimeout(room.timer);
  for (const p of room.players.values()) p.score = 0;
  Object.assign(room, { phase: "lobby", round: 0, result: null, deadline: 0, lastOddId: null });
  broadcast(room);
}

function vipId(room) {
  return [...room.players.values()].sort((a, b) => a.joinedAt - b.joinedAt)[0]?.id ?? null;
}

function maybeAdvanceEarly(room) {
  const active = room.roundPlayers.filter((p) => room.players.has(p));
  if (room.phase === "answer" && active.every((p) => room.answers[p] != null)) startVote(room);
  else if (room.phase === "vote" && active.every((p) => room.votes[p])) reveal(room);
}

// ---------- views ----------
function playerList(room) {
  return [...room.players.values()]
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      online: p.clients.size > 0,
      inRound: room.roundPlayers.includes(p.id),
      answered: room.answers[p.id] != null,
      voted: !!room.votes[p.id],
    }));
}

function answerList(room) {
  return room.voteOrder
    .filter((p) => room.players.has(p))
    .map((p) => ({ id: p, name: room.players.get(p).name, text: room.answers[p] ?? null }));
}

function baseView(room) {
  return {
    code: room.code,
    phase: room.phase,
    round: room.round,
    totalRounds: room.totalRounds,
    players: playerList(room),
    vip: vipId(room),
    minPlayers: MIN_PLAYERS,
    timeLeft: room.deadline ? Math.max(0, room.deadline - Date.now()) : 0,
  };
}

function hostView(room) {
  const v = baseView(room);
  // The host screen is public: never show prompts during the answer phase.
  if (room.phase === "vote") {
    v.answers = answerList(room);
    v.realPrompt = room.realPrompt;
  }
  if (room.phase === "reveal") {
    v.answers = answerList(room);
    v.result = room.result;
  }
  return v;
}

function playerView(room, pid) {
  const v = baseView(room);
  const me = room.players.get(pid);
  v.me = { id: pid, name: me.name, score: me.score };
  v.inRound = room.roundPlayers.includes(pid);
  if (room.phase === "answer" && v.inRound) {
    v.prompt = pid === room.oddId ? room.oddPrompt : room.realPrompt;
    v.myAnswer = room.answers[pid] ?? null;
  }
  if (room.phase === "vote") {
    v.answers = answerList(room);
    v.realPrompt = room.realPrompt;
    v.myVote = room.votes[pid] ?? null;
  }
  if (room.phase === "reveal") {
    v.result = room.result;
    v.myDelta = room.result?.deltas[pid] || 0;
  }
  return v;
}

function send(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
function broadcast(room) {
  room.touched = Date.now();
  const hv = hostView(room);
  for (const res of room.hostClients) send(res, hv);
  for (const p of room.players.values()) {
    if (!p.clients.size) continue;
    const pv = playerView(room, p.id);
    for (const res of p.clients) send(res, pv);
  }
}

// ---------- HTTP ----------
function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = "";
    req.on("data", (c) => {
      b += c;
      if (b.length > 1e4) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(b || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

function handleAction(body) {
  const { action } = body;
  if (action === "create") {
    const room = createRoom();
    return { ok: true, code: room.code, hostToken: room.hostToken, lanUrls: lanUrls() };
  }
  const room = rooms.get(clean(body.code, 4).toUpperCase());
  if (!room) return { error: "Room not found. Check the code!" };
  const isHost = body.hostToken && body.hostToken === room.hostToken;
  const player = room.players.get(body.pid);
  const isVip = player && vipId(room) === player.id;

  switch (action) {
    case "check":
      return isHost || player ? { ok: true } : { error: "Not in room." };
    case "join": {
      if (player) return { ok: true, pid: player.id };
      const name = clean(body.name, 14);
      if (!name) return { error: "Enter a name." };
      if ([...room.players.values()].some((p) => p.name.toLowerCase() === name.toLowerCase()))
        return { error: "That name is taken." };
      if (room.players.size >= MAX_PLAYERS) return { error: "Room is full." };
      const pid = id();
      room.players.set(pid, { id: pid, name, score: 0, clients: new Set(), joinedAt: Date.now() });
      broadcast(room);
      return { ok: true, pid };
    }
    case "start":
      if (!(isHost || isVip)) return { error: "Only the host or VIP can start." };
      if (room.phase !== "lobby") return { error: "Already started." };
      if (room.players.size < MIN_PLAYERS) return { error: `Need at least ${MIN_PLAYERS} players.` };
      startRound(room);
      return { ok: true };
    case "answer": {
      if (!player || room.phase !== "answer" || !room.roundPlayers.includes(player.id))
        return { error: "Can't answer right now." };
      const text = clean(body.text, 80);
      if (!text) return { error: "Write something!" };
      room.answers[player.id] = text;
      broadcast(room);
      maybeAdvanceEarly(room);
      return { ok: true };
    }
    case "vote": {
      if (!player || room.phase !== "vote" || !room.roundPlayers.includes(player.id))
        return { error: "Can't vote right now." };
      if (body.target === player.id) return { error: "You can't vote for yourself." };
      if (!room.roundPlayers.includes(body.target)) return { error: "Invalid vote." };
      room.votes[player.id] = body.target;
      broadcast(room);
      maybeAdvanceEarly(room);
      return { ok: true };
    }
    case "skip":
      if (!(isHost || isVip)) return { error: "Not allowed." };
      if (room.phase === "answer") startVote(room);
      else if (room.phase === "vote") reveal(room);
      else if (room.phase === "reveal") advance(room);
      return { ok: true };
    case "again":
      if (!(isHost || isVip)) return { error: "Not allowed." };
      resetGame(room);
      return { ok: true };
    case "kick":
      if (!isHost) return { error: "Not allowed." };
      if (room.players.has(body.target)) {
        for (const res of room.players.get(body.target).clients) {
          send(res, { kicked: true });
          res.end();
        }
        room.players.delete(body.target);
        broadcast(room);
        maybeAdvanceEarly(room);
      }
      return { ok: true };
    default:
      return { error: "Unknown action." };
  }
}

function handleEvents(req, res, url) {
  const room = rooms.get((url.searchParams.get("code") || "").toUpperCase());
  const host = url.searchParams.get("host");
  const pid = url.searchParams.get("pid");
  if (!room) return json(res, 404, { error: "Room not found" });
  let set, view;
  if (host && host === room.hostToken) {
    set = room.hostClients;
    view = () => hostView(room);
  } else if (pid && room.players.has(pid)) {
    set = room.players.get(pid).clients;
    view = () => playerView(room, pid);
  } else return json(res, 403, { error: "Not in room" });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("retry: 1500\n\n");
  set.add(res);
  send(res, view());
  if (!host) broadcast(room); // update online status for everyone
  const ping = setInterval(() => res.write(": ping\n\n"), 20_000);
  req.on("close", () => {
    clearInterval(ping);
    set.delete(res);
    if (!host && rooms.has(room.code)) broadcast(room);
  });
}

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };
function serveStatic(res, file) {
  const p = path.join(PUBLIC, file);
  if (!p.startsWith(PUBLIC)) return json(res, 404, {});
  fs.readFile(p, (err, data) => {
    if (err) return json(res, 404, { error: "Not found" });
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "POST" && url.pathname === "/api") {
    const body = await readBody(req);
    const out = handleAction(body);
    return json(res, out.error ? 400 : 200, out);
  }
  if (url.pathname === "/events") return handleEvents(req, res, url);
  if (url.pathname === "/" || url.pathname === "/play") return serveStatic(res, "play.html");
  if (url.pathname === "/host") return serveStatic(res, "host.html");
  return serveStatic(res, url.pathname.slice(1));
});

// Clean up abandoned rooms.
setInterval(() => {
  for (const [code, room] of rooms) {
    const empty = !room.hostClients.size && [...room.players.values()].every((p) => !p.clients.size);
    if (empty && Date.now() - room.touched > 30 * 60_000) {
      clearTimeout(room.timer);
      rooms.delete(code);
    }
  }
}, 60_000);

server.listen(PORT, () => {
  console.log(`\n  ODD PROMPT OUT is running!\n`);
  console.log(`  Host screen (TV/laptop):  http://localhost:${PORT}/host`);
  for (const u of lanUrls()) console.log(`  Players join on phones:   ${u}`);
  console.log("");
});
