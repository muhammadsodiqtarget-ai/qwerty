'use client';
import { useState } from 'react';
import { fmtDate, todayStr, UZ_MONTHS } from '@/lib/shared';

const DOW = ['Du','Se','Cho','Pa','Ju','Sha','Ya'];

export default function CalendarView({ board, openDay }) {
  const [monthStr, setMonthStr] = useState(todayStr().slice(0, 7));
  const [y, m] = monthStr.split('-').map(Number);
  const doneIds = new Set(board.columns.filter((c) => c.isDone).map((c) => c.id));

  const first = new Date(y, m - 1, 1);
  const startDow = (first.getDay() + 6) % 7;
  const gridStart = new Date(first); gridStart.setDate(first.getDate() - startDow);
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(gridStart); d.setDate(gridStart.getDate() + i); return d; });
  const nav = (dir) => { const nd = new Date(y, m - 1 + dir, 1); setMonthStr(fmtDate(nd).slice(0, 7)); };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav(-1)}>← Oldingi</button>
        <span style={{ fontWeight: 800, fontSize: 16 }}>{UZ_MONTHS[m - 1]} {y}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => nav(1)}>Keyingi →</button>
      </div>
      <div className="cal-grid" style={{ marginBottom: 6 }}>
        {DOW.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--ink-soft)', padding: 4 }}>{d}</div>)}
      </div>
      <div className="cal-grid">
        {days.map((d, i) => {
          const ds = fmtDate(d);
          const inMonth = d.getMonth() + 1 === m;
          const dayTasks = board.tasks.filter((t) => t.deadline === ds);
          const done = dayTasks.filter((t) => doneIds.has(t.columnId)).length;
          const total = dayTasks.length;
          const isToday = ds === todayStr();
          const past = ds < todayStr();
          let chip = null;
          if (total > 0) {
            const all = done === total;
            const bg = all ? 'var(--jade-soft)' : past ? 'var(--danger-soft)' : 'var(--warn-soft)';
            const cl = all ? 'var(--jade)' : past ? 'var(--danger)' : '#9A6B0A';
            chip = <span className="chip" style={{ background: bg, color: cl, fontSize: 10, padding: '2px 7px' }}>{done}/{total}</span>;
          }
          return (
            <button key={i} className="cal-day" onClick={() => openDay(ds)}
              style={{ opacity: inMonth ? 1 : 0.35, background: isToday ? 'var(--cobalt-soft)' : 'var(--surface)', borderColor: isToday ? 'var(--cobalt)' : 'var(--line)' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: isToday ? 'var(--cobalt)' : 'var(--ink)' }}>{d.getDate()}</span>
              {chip}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 12, color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
        <span><span style={{ color: 'var(--jade)' }}>●</span> Hammasi bajarilgan</span>
        <span><span style={{ color: 'var(--warn)' }}>●</span> Kutilmoqda</span>
        <span><span style={{ color: 'var(--danger)' }}>●</span> Muddati o&#699;tgan</span>
      </div>
    </div>
  );
}
