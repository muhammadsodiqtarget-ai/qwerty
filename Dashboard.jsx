'use client';
import { todayStr, PRIORITY } from '@/lib/shared';

function Stat({ label, value, color, bg }) {
  return (
    <div className="card" style={{ background: bg, border: 'none' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>{label}</p>
      <p className="stat-num" style={{ color, marginTop: 6 }}>{value}</p>
    </div>
  );
}

export default function Dashboard({ board, openTask }) {
  const doneIds = new Set(board.columns.filter((c) => c.isDone).map((c) => c.id));
  const total = board.tasks.length;
  const done = board.tasks.filter((t) => doneIds.has(t.columnId)).length;
  const overdue = board.tasks.filter((t) => t.deadline && t.deadline < todayStr() && !doneIds.has(t.columnId));
  const maxCol = Math.max(1, ...board.columns.map((c) => board.tasks.filter((t) => t.columnId === c.id).length));
  const workload = board.members.map((mm) => ({ ...mm, n: board.tasks.filter((t) => t.assigneeId === mm.id && !doneIds.has(t.columnId)).length }));
  const maxW = Math.max(1, ...workload.map((w) => w.n));

  return (
    <div className="fade-in">
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Stat label="Jami vazifalar" value={total} color="var(--cobalt)" bg="var(--cobalt-soft)" />
        <Stat label="Bajarilgan" value={done} color="var(--jade)" bg="var(--jade-soft)" />
        <Stat label="Muddati o'tgan" value={overdue.length} color="var(--danger)" bg="var(--danger-soft)" />
        <Stat label="Jamoa a'zolari" value={board.members.length} color="#9A6B0A" bg="var(--warn-soft)" />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <p className="card-title">Bosqichlar bo&#699;yicha</p>
          {board.columns.map((c) => {
            const n = board.tasks.filter((t) => t.columnId === c.id).length;
            return (
              <div key={c.id} className="bar-row">
                <span style={{ width: 90, fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(n / maxCol) * 100}%`, background: c.color }} /></div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600, width: 22, textAlign: 'right' }}>{n}</span>
              </div>
            );
          })}
        </div>
        <div className="card">
          <p className="card-title">Jamoa yuklamasi (faol)</p>
          {workload.length === 0 ? <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Jamoa bo&#699;limidan a&#699;zo qo&#699;shing.</p> : workload.map((w) => (
            <div key={w.id} className="bar-row">
              <span style={{ width: 90, fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(w.n / maxW) * 100}%`, background: w.color }} /></div>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, width: 22, textAlign: 'right' }}>{w.n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="card-title" style={{ color: 'var(--danger)' }}>Muddati o&#699;tgan vazifalar</p>
        {overdue.length === 0 ? <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Hammasi o&#699;z vaqtida — zo&#699;r! 🎉</p> : overdue.map((t) => (
          <button key={t.id} onClick={() => openTask(t.id)} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '9px 4px', borderBottom: '1px solid var(--line)', fontSize: 14, textAlign: 'left' }}>
            <span>{t.title}</span><span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 12 }}>{t.deadline}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
