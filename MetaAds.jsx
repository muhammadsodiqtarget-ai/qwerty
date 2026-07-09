'use client';
import { useEffect, useMemo, useState } from 'react';
import { uid, fmtDate, todayStr, fmtNum } from '@/lib/shared';

const METRICS = [
  { id: 'spend', label: 'Sarf', dg: 2 },
  { id: 'impressions', label: "Ko'rsatuvlar", dg: 0 },
  { id: 'clicks', label: 'Bosishlar', dg: 0 },
  { id: 'ctr', label: 'CTR %', dg: 2, avg: true },
  { id: 'leads', label: 'Lidlar', dg: 0 },
  { id: 'cpl', label: 'CPL', dg: 2, avg: true },
];

function rangeFor(period) {
  const now = new Date();
  const until = fmtDate(now);
  const s = new Date(now);
  if (period === '7') s.setDate(now.getDate() - 6);
  else if (period === '30') s.setDate(now.getDate() - 29);
  else s.setDate(now.getDate() - 13);
  return [fmtDate(s), until];
}

export default function MetaAds({ ads, setAds }) {
  const [selectedId, setSelectedId] = useState(null);
  const [picker, setPicker] = useState(false);
  const [accounts, setAccounts] = useState(null);
  const [accErr, setAccErr] = useState('');
  const [period, setPeriod] = useState('7');
  const [days, setDays] = useState(null);
  const [daysErr, setDaysErr] = useState('');
  const [chartMetric, setChartMetric] = useState('spend');
  const [tgStatus, setTgStatus] = useState('');

  const projects = ads.projects || [];
  const project = projects.find((p) => p.id === selectedId) || projects[0] || null;
  useEffect(() => { if (!selectedId && projects[0]) setSelectedId(projects[0].id); }, [projects, selectedId]);

  async function openPicker() {
    setPicker(true); setAccounts(null); setAccErr('');
    try {
      const r = await fetch('/api/meta/accounts');
      const j = await r.json();
      if (j.error) setAccErr(j.error);
      else {
        const errs = (j.accounts || []).filter((a) => a.error);
        setAccounts((j.accounts || []).filter((a) => !a.error));
        if (errs.length) setAccErr(errs.map((e) => `${e.business}: ${e.error}`).join(' · '));
      }
    } catch (e) { setAccErr(String(e)); }
  }
  function addProject(acc) {
    const p = { id: uid(), name: acc.name, business: acc.business, act: acc.id, currency: 'USD', chatId: '' };
    setAds((prev) => ({ ...prev, projects: [...(prev.projects || []), p] }));
    setSelectedId(p.id); setPicker(false);
  }
  const patchProject = (id, patch) => setAds((prev) => ({ ...prev, projects: prev.projects.map((p) => p.id === id ? { ...p, ...patch } : p) }));
  const removeProject = (id) => { setAds((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) })); setSelectedId(null); };

  useEffect(() => {
    if (!project) { setDays(null); return; }
    let alive = true;
    (async () => {
      setDays(null); setDaysErr('');
      const [since, until] = rangeFor(period);
      try {
        const r = await fetch(`/api/meta/insights?business=${encodeURIComponent(project.business)}&act=${project.act}&since=${since}&until=${until}`);
        const j = await r.json();
        if (!alive) return;
        if (j.error) setDaysErr(j.error); else setDays(j.days || []);
      } catch (e) { if (alive) setDaysErr(String(e)); }
    })();
    return () => { alive = false; };
  }, [project?.id, project?.act, period]);

  const totals = useMemo(() => {
    if (!days) return null;
    const t = { spend: 0, impressions: 0, clicks: 0, leads: 0 };
    for (const d of days) { t.spend += d.spend; t.impressions += d.impressions; t.clicks += d.clicks; t.leads += d.leads; }
    t.ctr = t.impressions ? (t.clicks / t.impressions) * 100 : 0;
    t.cpl = t.leads ? t.spend / t.leads : 0;
    return t;
  }, [days]);

  async function sendTest() {
    if (!project?.chatId) { setTgStatus("Avval guruh Chat ID sini kiriting"); return; }
    setTgStatus('Yuborilmoqda…');
    const r = await fetch('/api/telegram/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatId: project.chatId }) });
    const j = await r.json();
    setTgStatus(j.ok ? 'Yuborildi ✓ (guruhni tekshiring)' : `Xatolik: ${j.error}`);
  }

  const maxVal = days ? Math.max(1, ...days.map((d) => d[chartMetric] || 0)) : 1;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {projects.map((p) => (
          <button key={p.id} className="chip" onClick={() => setSelectedId(p.id)}
            style={{ padding: '8px 14px', fontSize: 13, background: project?.id === p.id ? 'var(--cobalt)' : 'var(--surface)', color: project?.id === p.id ? '#fff' : 'var(--ink-soft)', border: '1px solid var(--line)' }}>
            {p.name}
          </button>
        ))}
        <button className="chip" onClick={openPicker} style={{ padding: '8px 14px', fontSize: 13, border: '2px dashed var(--line)', color: 'var(--ink-soft)' }}>+ Loyiha qo&#699;shish</button>
      </div>

      {picker && (
        <div className="modal-overlay" onClick={() => setPicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p className="card-title">Reklama akkauntini tanlang</p>
            {accErr && <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>{accErr}</p>}
            {!accounts && !accErr && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Meta&#699;dan ro&#699;yxat olinmoqda…</p>}
            {accounts && accounts.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Akkaunt topilmadi. META_TOKENS sozlanganini tekshiring.</p>}
            {accounts && accounts.map((a) => (
              <button key={a.id + a.business} onClick={() => addProject(a)} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '11px 8px', borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{a.business} · {a.id}</span>
              </button>
            ))}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setPicker(false)}>Yopish</button>
          </div>
        </div>
      )}

      {!project ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p className="display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Birinchi loyihangizni ulang</p>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>&#699;+ Loyiha qo&#699;shish&#699; tugmasini bosing — Business Manager&#699;dagi akkauntlar ro&#699;yxati o&#699;zi chiqadi.</p>
          <button className="btn btn-primary" onClick={openPicker}>+ Loyiha qo&#699;shish</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 20 }}>{project.name}</h2>
              <p className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{project.business} · {project.act}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['7', '14', '30'].map((p) => (
                <button key={p} className="btn btn-sm" onClick={() => setPeriod(p)} style={{ background: period === p ? 'var(--cobalt)' : 'var(--paper)', color: period === p ? '#fff' : 'var(--ink-soft)', fontWeight: 800 }}>{p} kun</button>
              ))}
              <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Loyihani ro\u2018yxatdan olib tashlaysizmi?')) removeProject(project.id); }}>O&#699;chirish</button>
            </div>
          </div>

          {daysErr && <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: 14 }}><p style={{ fontSize: 13, color: 'var(--danger)' }}>Meta xatosi: {daysErr}</p></div>}
          {!days && !daysErr && <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>Meta&#699;dan ma&#699;lumot olinmoqda…</p>}

          {totals && (
            <div className="grid grid-3" style={{ marginBottom: 16 }}>
              {METRICS.map((m) => (
                <div key={m.id} className="card" style={{ padding: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>{m.label}</p>
                  <p className="stat-num" style={{ fontSize: 20, color: 'var(--cobalt)', marginTop: 4 }}>{fmtNum(totals[m.id], m.dg)}</p>
                  <p className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                    {m.avg ? "davr bo'yicha" : `kuniga o'rtacha ${fmtNum(days.length ? totals[m.id] / days.length : 0, m.dg)}`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {days && days.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p className="card-title" style={{ marginBottom: 0 }}>Kunlik dinamika</p>
                <select className="input" style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }} value={chartMetric} onChange={(e) => setChartMetric(e.target.value)}>
                  {METRICS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div className="spark">
                {days.map((d) => (
                  <div key={d.date} className="spark-bar" style={{ height: `${Math.max(2, ((d[chartMetric] || 0) / maxVal) * 100)}%` }}>
                    <span className="tip">{d.date.slice(5)}: {fmtNum(d[chartMetric], 2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {days && days.length > 0 && (
            <div className="card" style={{ marginBottom: 16, overflowX: 'auto' }}>
              <p className="card-title">Kunlik jadval</p>
              <table className="table">
                <thead><tr><th>Sana</th>{METRICS.map((m) => <th key={m.id} style={{ textAlign: 'right' }}>{m.label}</th>)}</tr></thead>
                <tbody>
                  {[...days].reverse().map((d) => (
                    <tr key={d.date}>
                      <td className="mono" style={{ fontWeight: 600 }}>{d.date}</td>
                      {METRICS.map((m) => <td key={m.id} className="mono" style={{ textAlign: 'right' }}>{fmtNum(d[m.id], m.dg)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card">
            <p className="card-title">📨 Telegram hisobot</p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12 }}>Har kuni ertalab soat 9:00 da (Toshkent vaqti) kechagi natijalar shu guruhga avtomatik yuboriladi.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="label">Guruh Chat ID (masalan: -1001234567890)</label>
                <input className="input" value={project.chatId || ''} onChange={(e) => patchProject(project.id, { chatId: e.target.value.trim() })} placeholder="-100…" />
              </div>
              <div style={{ width: 110 }}>
                <label className="label">Valyuta</label>
                <input className="input" value={project.currency || 'USD'} onChange={(e) => patchProject(project.id, { currency: e.target.value.trim() })} />
              </div>
              <button className="btn btn-primary" onClick={sendTest}>Sinov xabari</button>
            </div>
            {tgStatus && <p style={{ fontSize: 13, marginTop: 10, color: tgStatus.includes('✓') ? 'var(--jade)' : 'var(--ink-soft)' }}>{tgStatus}</p>}
          </div>
        </>
      )}
    </div>
  );
}
