'use client';
import { useEffect, useState } from 'react';
import { loadKV, saveKV, defaultBoard, uid, PRIORITY, Avatar } from '@/lib/shared';
import Board from '@/components/Board';
import CalendarView from '@/components/CalendarView';
import Dashboard from '@/components/Dashboard';
import MetaAds from '@/components/MetaAds';
import Team from '@/components/Team';

const NAV = [
  { id: 'board', label: 'Doska', emoji: '🗂' },
  { id: 'calendar', label: 'Kalendar', emoji: '📅' },
  { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
  { id: 'ads', label: 'Meta Ads', emoji: '🎯' },
  { id: 'team', label: 'Jamoa', emoji: '👥' },
];
const SUBS = {
  board: "Vazifalarni ustunlar bo'ylab suring — hammasi jamoaga jonli ko'rinadi",
  calendar: 'Kelgusi ishlar esdan chiqmaydi, o\u2018tganlari hisobda turadi',
  dashboard: 'Jamoa qanday ketyapti — bir qarashda',
  ads: 'Meta Ads natijalari jonli, hisobotlar Telegramga o\u2018zi boradi',
  team: 'Hodimlarni qo\u2018shing — vazifa tayinlash ochiladi',
};

export default function Home() {
  const [tab, setTab] = useState('board');
  const [board, setBoard] = useState(null);
  const [ads, setAds] = useState(null);
  const [status, setStatus] = useState('');
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [dayModal, setDayModal] = useState(null);

  useEffect(() => {
    (async () => {
      const [b, a] = await Promise.all([loadKV('board', null), loadKV('ads', null)]);
      setBoard(b || defaultBoard());
      setAds(a || { projects: [] });
    })();
  }, []);

  useEffect(() => {
    if (!board) return;
    const t = setTimeout(async () => { setStatus('Saqlanmoqda…'); try { await saveKV('board', board); setStatus('Saqlandi ✓'); setTimeout(() => setStatus(''), 1100); } catch { setStatus('Xatolik'); } }, 700);
    return () => clearTimeout(t);
  }, [board]);
  useEffect(() => {
    if (!ads) return;
    const t = setTimeout(() => saveKV('ads', ads).catch(() => {}), 700);
    return () => clearTimeout(t);
  }, [ads]);

  if (!board || !ads) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)' }}>Yuklanmoqda…</div>;

  const activeTask = activeTaskId ? board.tasks.find((t) => t.id === activeTaskId) : null;
  const patchTask = (id, patch) => setBoard((p) => ({ ...p, tasks: p.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) }));

  return (
    <div className="shell">
      <aside className="sidebar">
        <div style={{ marginBottom: 6 }}>
          <div className="thread" style={{ marginBottom: 12 }} />
          <span className="wordmark">Mo&#699;ljal</span>
        </div>
        <nav style={{ marginTop: 16, display: 'flex', flexDirection: 'inherit', gap: 2, flex: 1 }}>
          {NAV.map((n) => (
            <button key={n.id} className={`nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
              <span className="emoji">{n.emoji}</span> {n.label}
            </button>
          ))}
        </nav>
        <span style={{ fontSize: 12, color: 'var(--cobalt)', padding: '0 10px', minHeight: 16 }}>{status}</span>
      </aside>

      <main className="content">
        <h1 className="page-title">{NAV.find((n) => n.id === tab)?.label}</h1>
        <p className="page-sub">{SUBS[tab]}</p>

        {tab === 'board' && <Board board={board} setBoard={setBoard} openTask={setActiveTaskId} />}
        {tab === 'calendar' && <CalendarView board={board} openDay={setDayModal} />}
        {tab === 'dashboard' && <Dashboard board={board} openTask={(id) => { setActiveTaskId(id); setTab('board'); }} />}
        {tab === 'ads' && <MetaAds ads={ads} setAds={setAds} />}
        {tab === 'team' && <Team board={board} setBoard={setBoard} />}
      </main>

      {activeTask && (
        <div className="modal-overlay" onClick={() => setActiveTaskId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <input className="input" style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }} defaultValue={activeTask.title}
              onBlur={(e) => patchTask(activeTask.id, { title: e.target.value.trim() || activeTask.title })} />
            <div className="grid grid-2" style={{ marginBottom: 14 }}>
              <div>
                <label className="label">Kimga</label>
                <select className="input" value={activeTask.assigneeId || ''} onChange={(e) => patchTask(activeTask.id, { assigneeId: e.target.value || null })}>
                  <option value="">Tayinlanmagan</option>
                  {board.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Bosqich</label>
                <select className="input" value={activeTask.columnId} onChange={(e) => patchTask(activeTask.id, { columnId: e.target.value })}>
                  {board.columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Muddat</label>
                <input type="date" className="input" value={activeTask.deadline || ''} onChange={(e) => patchTask(activeTask.id, { deadline: e.target.value })} />
              </div>
              <div>
                <label className="label">Muhimlik</label>
                <select className="input" value={activeTask.priority} onChange={(e) => patchTask(activeTask.id, { priority: e.target.value })}>
                  {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <label className="label">Izoh / tavsif</label>
            <textarea className="input" rows={3} defaultValue={activeTask.desc} onBlur={(e) => patchTask(activeTask.id, { desc: e.target.value })} style={{ resize: 'none', marginBottom: 14 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-danger btn-sm" onClick={() => { setBoard((p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== activeTask.id) })); setActiveTaskId(null); }}>Vazifani o&#699;chirish</button>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveTaskId(null)}>Tayyor</button>
            </div>
          </div>
        </div>
      )}

      {dayModal && (
        <div className="modal-overlay" onClick={() => setDayModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p className="card-title">{dayModal}</p>
            {board.tasks.filter((t) => t.deadline === dayModal).map((t) => {
              const done = board.columns.find((c) => c.id === t.columnId)?.isDone;
              const mem = board.members.find((m) => m.id === t.assigneeId);
              return (
                <button key={t.id} onClick={() => { setDayModal(null); setActiveTaskId(t.id); setTab('board'); }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 6px', borderBottom: '1px solid var(--line)', textAlign: 'left', fontSize: 14 }}>
                  <span>{done ? '✅' : '⬜️'} {t.title}</span>
                  {mem && <Avatar name={mem.name} color={mem.color} size={20} />}
                </button>
              );
            })}
            {board.tasks.filter((t) => t.deadline === dayModal).length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Bu kunga vazifa yo&#699;q.</p>}
            <DayQuickAdd board={board} setBoard={setBoard} date={dayModal} />
          </div>
        </div>
      )}
    </div>
  );
}

function DayQuickAdd({ board, setBoard, date }) {
  const [title, setTitle] = useState('');
  const [colId, setColId] = useState(board.columns[0]?.id);
  const add = () => {
    if (!title.trim()) return;
    setBoard((p) => ({ ...p, tasks: [...p.tasks, { id: uid(), columnId: colId, title: title.trim(), desc: '', assigneeId: null, deadline: date, priority: 'medium', comments: [], createdAt: Date.now() }] }));
    setTitle('');
  };
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
      <select className="input" style={{ width: 'auto' }} value={colId} onChange={(e) => setColId(e.target.value)}>
        {board.columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input className="input" placeholder="+ Shu kunga vazifa" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
      <button className="btn btn-primary" onClick={add}>+</button>
    </div>
  );
}
