import { sendTelegram } from '@/lib/telegram';
export async function POST(req) {
  const { chatId } = await req.json();
  if (!chatId) return Response.json({ error: 'chatId required' }, { status: 400 });
  try {
    await sendTelegram(chatId, '✅ <b>Mo\u2018ljal</b> ulandi! Kunlik hisobotlar shu yerga tushadi.');
    return Response.json({ ok: true });
  } catch (e) { return Response.json({ error: String(e.message || e) }, { status: 500 }); }
}
