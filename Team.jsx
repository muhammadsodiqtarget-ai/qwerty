'use client';
import { useState } from 'react';
import { uid, todayStr, MEMBER_COLORS, Avatar } from '@/lib/shared';

export default function Team({ board, setBoard }) {
  const [name, setName] = useState('');
  const doneIds = new Set(board.columns.filter((c) => c.isDone).map((c) => c.id));
  const add = () => {
    const t = name.trim(); if (!t) return;
    setBoard((p) => {
      if (p.members.some((m) => m.name.toLowerCase() === t.toLowerCase())) return p;
      return { ...p, members: [...p.members, { id: uid(), name: t, color: MEMBER_COLORS[p.members.length % MEMBER_COLORS.length] }] };
    });
    setName('');
  };
  const remove = (id) => setBoard((p) => ({ ...p, members: p.members.filter((m) => m.id !== id), tasks: p.tasks.map((t) => t.assigneeId === id ? { ...t, assigneeId: null } : t) }));

  return (
    <div className="fade-in card" style={{ maxWidth: 560 }}>
      <p className="card-title">Jamoa a&#699;zolari</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input className="input" placeholder="Yangi a'zo ismi" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button className="btn btn-primary" onClick={add}>Qo&#699;shish</button>
      </div>
      {board.members.map((m) => {
        const active = board.tasks.filter((t) => t.assigneeId === m.id && !doneIds.has(t.columnId)).length;
        const over = board.tasks.filter((t) => t.assigneeId === m.id && t.deadline && t.deadline < todayStr() && !doneIds.has(t.columnId)).length;
        return (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 2px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={m.name} color={m.color} size={32} />
              <span>
                <span style={{ fontWeight: 800, fontSize: 14, display: 'block' }}>{m.name}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{active} faol vazifa{over > 0 ? ` · ${over} kechikkan` : ''}</span>
              </span>
            </span>
            <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`${m.name}ni ro'yxatdan o'chirasizmi?`)) remove(m.id); }}>O&#699;chirish</button>
          </div>
        );
      })}
      {board.members.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Hozircha a&#699;zo yo&#699;q. Birinchi hodimni qo&#699;shing.</p>}
    </div>
  );
}
