// RSVP + Wishes collector for Aira Paulyn's Debut invitation
const RSVP_KEY = 'rsvps';
const WISH_KEY = 'wishes_aira_reset_2026_08_16';

async function readAll(key) {
  const raw = await me.puter.kv.get(key);
  if (!raw) return [];
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; }
  catch { return []; }
}

/* ---------- RSVP ---------- */
router.get('/rsvps', async () => {
  const list = await readAll(RSVP_KEY);
  const attending = list.filter(r => r.attending).reduce((s, r) => s + (Number(r.guests) || 1), 0);
  return { count: list.length, attending, rsvps: list };
});

router.post('/rsvp', async ({ request }) => {
  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400 }); }
  const name = (body.name || '').toString().trim().slice(0, 80);
  if (!name) return new Response(JSON.stringify({ error: 'Name required' }), { status: 400 });
  const entry = {
    id: 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    attending: !!body.attending,
    guests: Math.max(1, Math.min(20, parseInt(body.guests, 10) || 1)),
    message: (body.message || '').toString().trim().slice(0, 500),
    ts: Date.now()
  };
  const list = await readAll(RSVP_KEY);
  list.push(entry);
  await me.puter.kv.set(RSVP_KEY, JSON.stringify(list));
  return { ok: true, entry };
});

/* ---------- WISHES ---------- */
router.get('/wishes', async () => {
  const list = await readAll(WISH_KEY);
  return { count: list.length, wishes: list.sort((a, b) => b.ts - a.ts) };
});

router.post('/wish', async ({ request }) => {
  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400 }); }
  const name = (body.name || '').toString().trim().slice(0, 80);
  const message = (body.message || '').toString().trim().slice(0, 500);
  if (!name || !message) return new Response(JSON.stringify({ error: 'Name and message required' }), { status: 400 });
  const entry = {
    id: 'w_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name, message, ts: Date.now()
  };
  const list = await readAll(WISH_KEY);
  list.push(entry);
  await me.puter.kv.set(WISH_KEY, JSON.stringify(list));
  return { ok: true, entry };
});

router.get('/', async () => ({ ok: true, service: 'aira-debut-rsvp' }));
