'use client';
import { useState } from 'react';
import { uid, todayStr, PRIORITY, Avatar } from '@/lib/shared';

export default function Board({ board, setBoard, openTask }) {
  const [adding, setAdding] = useState(false);
  const [colName, setColName] = useState('');
  const [inputs, setInputs] = useState({});

  const addTask = (columnId, title) => {
    if (!title?.trim()) return;
    setBoard((p) => ({ ...p, tasks: [...p.tasks, { id: uid(), columnId, title: title.trim(), desc: '', assigneeId: null, deadline: '', priority: 'medium', comments: [], createdAt: Date.now() }] }));
  };
  const moveTask = (taskId, colId) => setBoard((p) => {
    const t = p.tasks.find((x) => x.id === taskId);
    return { ...p, tasks: [...p.tasks.filter((x) => x.id !== taskId), { ...t, columnId: colId }] };
  });
  const addColumn = () => { if (!colName.trim()) return; setBoard((p) => ({ ...p, columns: [...p.columns, { id: uid(), name: colName.trim(), isDone: false, color: '#C4257A' }] })); setColName(''); setAdding(false); };
  const delColumn = (id) => setBoard((p) => ({ ...p, columns: p.columns.filter((c) => c.id !== id), tasks: p.tasks.filter((t) => t.columnId !== id) }));

  return (
    <div className="fade-in">
      <div className="kanban">
        {board.columns.map((col, ci) => {
          const tasks = board.tasks.filter((t) => t.columnId === col.id);
          return (
            <div key={col.id} className="kolumn" style={{ borderTop: `5px solid ${col.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{col.name} <span style={{ color: 'var(--ink-soft)', fontWeight: 700 }}>({tasks.length})</span></span>
                <button onClick={() => { if (confirm(`"${col.name}" ustunini o'chirasizmi?`)) delColumn(col.id); }} style={{ color: 'var(--ink-soft)', fontSize: 16 }} aria-label="Ustunni o'chirish">×</button>
              </div>
              <div style={{ overflowY: 'auto', padding: '0 10px', flex: 1 }}>
                {tasks.map((t) => {
                  const mem = board.members.find((m) => m.id === t.assigneeId);
                  const overdue = t.deadline && t.deadline < todayStr() && !col.isDone;
                  return (
                    <div key={t.id} className="kard" style={{ borderLeft: `4px solid ${PRIORITY[t.priority]?.color || 'var(--warn)'}` }} onClick={() => openTask(t.id)}>
                      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{t.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {mem && <Avatar name={mem.name} color={mem.color} size={20} />}
                          {t.deadline && <span className="chip" style={{ background: overdue ? 'var(--danger-soft)' : 'var(--paper)', color: overdue ? 'var(--danger)' : 'var(--ink-soft)' }}>{overdue ? 'Kechikkan!' : t.deadline}</span>}
                        </span>
                        <span onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 2 }}>
                          {ci > 0 && <button className="btn-sm" onClick={() => moveTask(t.id, board.columns[ci - 1].id)} aria-label="Chapga">←</button>}
                          {ci < board.columns.length - 1 && <button className="btn-sm" onClick={() => moveTask(t.id, board.columns[ci + 1].id)} aria-label="O'ngga">→</button>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: 10 }}>
                <input className="input" placeholder="+ Vazifa yozib Enter bosing" value={inputs[col.id] || ''}
                  onChange={(e) => setInputs((v) => ({ ...v, [col.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { addTask(col.id, inputs[col.id]); setInputs((v) => ({ ...v, [col.id]: '' })); } }} />
              </div>
            </div>
          );
        })}
        <div style={{ width: 230, flexShrink: 0 }}>
          {adding ? (
            <div className="card">
              <input className="input" autoFocus placeholder="Ustun nomi" value={colName} onChange={(e) => setColName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addColumn()} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={addColumn}>Qo&#699;shish</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}>Bekor</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }} onClick={() => setAdding(true)}>+ Ustun qo&#699;shish</button>
          )}
        </div>
      </div>
    </div>
  );
}
