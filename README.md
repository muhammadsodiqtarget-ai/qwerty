# Mo'ljal — agentlik boshqaruv tizimi

Doska (kanban) · Kalendar · Dashboard · Meta Ads (jonli) · Jamoa · Telegram kunlik hisobot (cron 04:00 UTC = 09:00 Toshkent).

## Environment variables (Vercel → Settings → Environment Variables)
- ACCESS_PASSWORD — saytga kirish uchun jamoa paroli
- META_TOKENS — JSON: {"Elegan":"EAAB...token...","pixor":"EAAG..."}
- TELEGRAM_BOT_TOKEN — @BotFather bergan token
- CRON_SECRET — istalgan uzun tasodifiy satr (cron himoyasi)
- DATABASE_URL — Neon Postgres (Vercel Marketplace → Neon, bir bosishda ulanadi)

DATABASE_URL bo'lmasa sayt ishlayveradi, lekin ma'lumot deploy qayta ishga tushganda o'chadi — production uchun albatta ulang.
