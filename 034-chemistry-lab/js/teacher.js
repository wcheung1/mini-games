/* 老師專區：大人閘、班表（學生交功課加入）、全班進度、匯出 CSV、列印、今日任務連結
   全部資料只存喺老師部機（localStorage chemlab.class.v1），唔會上傳 */
import { html, useApp, useState, useEffect, useMemo, joinSay, createStore, useStore } from './lib.js';
import { Btn, Spk, TopBar } from './ui.js';
import { MODULES } from './modules.js';
import { CHALLENGES } from './challenges.js';
import { QR, decodeSubmission, unpackProgress, siteUrl, copyText } from './share.js';

export const classStore = createStore('chemlab.class.v1', { students: {}, pin: '' });
const N = MODULES.length;

function addStudent(sub) {
  classStore.set((s) => ({ ...s, students: { ...s.students, [sub.name]: { name: sub.name, t: sub.t, p: sub.p } } }));
}
// 大人閘：一條乘數題；老師設定咗密碼就要輸入密碼
function Gate({ onPass }) {
  const { t, lang } = useApp(); const cls = useStore(classStore);
  const [q] = useState(() => { const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4); return { a, b }; });
  const [v, setV] = useState(''); const [bad, setBad] = useState(false);
  const usePin = !!cls.pin;
  const check = (e) => {
    e.preventDefault();
    const ok = usePin ? v === cls.pin : +v === q.a * q.b;
    if (ok) { try { sessionStorage.setItem('chemlab.teacher', '1'); } catch (x) { /* ignore */ } onPass(); } else { setBad(true); setV(''); }
  };
  const prompt = usePin ? t('gatePin') : t('gateMath', { a: q.a, b: q.b });
  return html`<form onSubmit=${check} className="max-w-md mx-auto mt-10 rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 p-6 space-y-4 text-center">
    <div className="text-5xl" aria-hidden="true">🧑‍🏫</div>
    <h2 className="text-xl font-black text-slate-800">${t('gateTitle')}</h2>
    <div className="flex items-start gap-2 justify-center"><label htmlFor="gate-in" className="font-bold text-slate-700">${prompt}</label><${Spk} size="sm" text=${joinSay(lang, [t('gateTitle'), prompt])} id="gate" /></div>
    <input id="gate-in" type=${usePin ? 'password' : 'text'} inputMode="numeric" autoComplete="off" value=${v} onChange=${(e) => { setV(e.target.value.replace(/\D/g, '').slice(0, 6)); setBad(false); }}
      className="w-40 h-14 text-center text-2xl font-black rounded-2xl ring-2 ring-slate-300 focus:ring-sky-500 outline-none" />
    ${bad ? html`<p role="alert" className="font-bold text-rose-600">${t('gateWrong')}</p>` : null}
    <button type="submit" className="w-full min-h-12 rounded-2xl bg-sky-500 text-white font-black text-lg shadow">${t('gateGo')}</button>
  </form>`;
}

const fmt = (ms, lang) => new Date(ms).toLocaleString(lang === 'zh' ? 'zh-HK' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export function TeacherPage({ sub, arg, onBack }) {
  const { t, pick, lang, say } = useApp(); const cls = useStore(classStore);
  const [pass, setPass] = useState(() => { try { return sessionStorage.getItem('chemlab.teacher') === '1'; } catch (e) { return false; } });
  const [imported, setImported] = useState(null);
  const [paste, setPaste] = useState('');
  const [pick2, setPick2] = useState(() => new Set());
  const [withCh, setWithCh] = useState(false);
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');

  // 由學生 QR 打開：#/teacher/import/<碼>
  useEffect(() => {
    if (!pass || sub !== 'import' || !arg) return;
    const s = decodeSubmission(arg);
    if (s) { addStudent(s); setImported(s); say('imp', t('importOk', { n: s.name })); } else setImported(false);
    history.replaceState(history.state, '', '#/teacher');
  }, [pass]);

  const rows = useMemo(() => Object.values(cls.students).map((s) => {
    const u = unpackProgress(s.p); // 每個實驗變返一個數值：1 完成、2 自己動手、4 一次答啱、8 升中挑戰
    const per = MODULES.map((m) => { const x = u[m.id]; return x ? (x.done ? 1 : 0) | (x.self ? 2 : 0) | (x.quiz ? 4 : 0) | (x.ch ? 8 : 0) : 0; });
    return { ...s, per, done: per.filter((v) => v & 1).length, stars: per.reduce((a, v) => a + (v & 1 ? 1 : 0) + (v & 2 ? 1 : 0) + (v & 4 ? 1 : 0), 0), ch: per.filter((v) => v & 8).length };
  }).sort((a, b) => a.name.localeCompare(b.name, 'zh-HK')), [cls.students]);

  const back = html`<${Btn} label=${t('back')} onClick=${onBack} className="h-11 px-3 bg-white ring-2 ring-slate-200 text-slate-700"><span className="text-xl leading-none" aria-hidden="true">‹</span><span className="hidden sm:inline">${t('back')}</span><//>`;
  if (!pass) return html`<div className="app-h flex flex-col"><${TopBar} title=${t('teacherTitle')} left=${back} /><main id="main" tabIndex="-1" className="outline-none flex-1 overflow-y-auto px-4"><${Gate} onPass=${() => setPass(true)} /></main></div>`;

  function exportCsv() {
    const head = [t('csvName'), t('csvTime'), t('csvDone'), t('csvStars'), t('csvCh'), ...MODULES.map((m) => `${m.topics[0]} ${pick(m.title)}`)];
    const cell = (v) => (v & 1 ? `${(v & 1 ? 1 : 0) + (v & 2 ? 1 : 0) + (v & 4 ? 1 : 0)}★${v & 8 ? '+🎓' : ''}` : '');
    const lines = [head, ...rows.map((r) => [r.name, fmt(r.t, lang), `${r.done}/${N}`, r.stars, r.ch, ...r.per.map(cell)])]
      .map((row) => row.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chemlab-class.csv';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function doPaste() {
    const m = /teacher\/import\/([A-Za-z0-9_-]+)/.exec(paste) || /^([A-Za-z0-9_-]{20,})$/.exec(paste.trim());
    const s = m && decodeSubmission(m[1]);
    if (s) { addStudent(s); setImported(s); setPaste(''); say('imp', t('importOk', { n: s.name })); } else setImported(false);
  }
  const ids = MODULES.filter((m) => pick2.has(m.id)).map((m) => m.id);
  const taskLink = ids.length ? siteUrl('task/' + ids.join(',') + (withCh ? '/ch' : '')) : '';
  const toggle = (id) => setPick2((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const card = 'rounded-3xl bg-white shadow ring-1 ring-slate-200 p-4 space-y-3';
  const H = ({ icon, text, id }) => html`<div className="flex items-center gap-2"><h2 className="flex-1 text-xl font-black text-slate-800">${icon} ${text}</h2><${Spk} size="sm" text=${text} id=${id} /></div>`;

  return html`<div className="app-h flex flex-col">
    <${TopBar} title=${t('teacherTitle')} left=${back} />
    <main id="main" tabIndex="-1" className="outline-none flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 pb-28 space-y-5">
        ${imported ? html`<p role="status" className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-300 p-3 font-bold text-emerald-800">✅ ${t('importOk', { n: imported.name })}</p>` : null}
        ${imported === false ? html`<p role="alert" className="rounded-2xl bg-rose-50 ring-1 ring-rose-300 p-3 font-bold text-rose-700">${t('importBad')}</p>` : null}

        <section className=${card + ' print-area'}>
          <${H} icon="📊" text=${t('classTitle', { n: rows.length })} id="cls" />
          <p className="text-sm text-slate-500 no-print">${t('classHow')}</p>
          ${rows.length ? html`<div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="text-slate-500"><th className="py-2 pr-3">${t('csvName')}</th><th className="pr-3">${t('csvDone')}</th><th className="pr-3">${t('csvStars')}</th><th className="pr-3">${t('csvCh')}</th><th className="pr-3">${t('csvTime')}</th><th className="no-print"></th></tr></thead>
            <tbody>${rows.map((r) => html`<tr key=${r.name} className="border-t border-slate-100 align-top" data-student=${r.name}>
              <td className="py-2 pr-3 font-black text-slate-800">${r.name}
                <details className="font-normal"><summary className="cursor-pointer text-xs text-sky-700">${t('details')}</summary>
                  <ul className="mt-1 grid sm:grid-cols-2 gap-x-4 text-xs">${MODULES.map((m, i) => html`<li key=${m.id}>${r.per[i] & 1 ? '✅' : '▫️'} ${m.topics[0]} ${pick(m.title)} ${r.per[i] & 1 ? '⭐'.repeat((r.per[i] & 1 ? 1 : 0) + (r.per[i] & 2 ? 1 : 0) + (r.per[i] & 4 ? 1 : 0)) : ''}${r.per[i] & 8 ? ' 🎓' : ''}</li>`)}</ul>
                </details></td>
              <td className="pr-3">${r.done} / ${N}</td><td className="pr-3">${r.stars} / ${N * 3}</td><td className="pr-3">${r.ch} / ${Object.keys(CHALLENGES).length}</td>
              <td className="pr-3 text-slate-500">${fmt(r.t, lang)}</td>
              <td className="no-print"><${Btn} label=${t('removeStu', { n: r.name })} onClick=${() => { if (confirm(t('removeConfirm', { n: r.name }))) classStore.set((s) => { const st = { ...s.students }; delete st[r.name]; return { ...s, students: st }; }); }} className="!min-h-9 px-2 text-xs bg-slate-100 text-slate-600">🗑<//></td>
            </tr>`)}</tbody></table></div>` : html`<p className="text-slate-500">${t('classEmpty')}</p>`}
          <div className="flex flex-wrap gap-2 no-print">
            <${Btn} label=${t('exportCsv')} disabled=${!rows.length} onClick=${exportCsv} className="px-4 py-2 bg-emerald-500 text-white shadow">⬇️ ${t('exportCsv')}<//>
            <${Btn} label=${t('printReport')} disabled=${!rows.length} onClick=${() => window.print()} className="px-4 py-2 bg-sky-500 text-white shadow">🖨️ ${t('printReport')}<//>
          </div>
          <div className="flex flex-wrap gap-2 items-center no-print">
            <input aria-label=${t('pasteLabel')} value=${paste} onChange=${(e) => setPaste(e.target.value)} placeholder=${t('pasteLabel')} className="flex-1 min-w-[12rem] h-11 px-3 rounded-xl ring-2 ring-slate-200 focus:ring-sky-400 outline-none" />
            <${Btn} label=${t('pasteAdd')} disabled=${!paste.trim()} onClick=${doPaste} className="px-4 bg-slate-800 text-white">${t('pasteAdd')}<//>
          </div>
        </section>

        <section className=${card + ' no-print'}>
          <${H} icon="📋" text=${t('taskTitle')} id="task" />
          <p className="text-sm text-slate-500">${t('taskHow')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
            ${MODULES.map((m) => html`<label key=${m.id} className="flex items-center gap-2 py-1 cursor-pointer">
              <input type="checkbox" className="w-5 h-5" checked=${pick2.has(m.id)} onChange=${() => toggle(m.id)} />
              <span className="text-sm"><b className="text-slate-400">${m.topics[0]}</b> ${pick(m.title)}</span></label>`)}
          </div>
          <label className="flex items-center gap-2 font-bold text-slate-700"><input type="checkbox" className="w-5 h-5" checked=${withCh} onChange=${(e) => setWithCh(e.target.checked)} /> 🎓 ${t('taskWithCh')}</label>
          ${taskLink ? html`<div className="flex flex-col sm:flex-row items-center gap-4">
              <${QR} text=${taskLink} label=${t('taskTitle')} size=${200} />
              <div className="space-y-2 min-w-0 flex-1"><p className="text-sm text-slate-600">${t('taskShare')}</p>
                <p className="text-xs text-slate-400 break-all" data-task-link=${taskLink}>${taskLink}</p>
                <${Btn} label=${t('copyLink')} onClick=${async () => { const ok = await copyText(taskLink); setMsg(ok ? t('copied') : t('copyFail')); }} className="px-4 py-2 bg-sky-500 text-white shadow">📋 ${t('copyLink')}<//>
                ${msg ? html`<span role="status" className="ml-2 text-sm font-bold text-emerald-700">${msg}</span>` : null}</div>
            </div>` : null}
        </section>

        <section className=${card + ' no-print'}>
          <${H} icon="🔐" text=${t('pinTitle')} id="pin" />
          <p className="text-sm text-slate-500">${cls.pin ? t('pinOn') : t('pinOff')}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <input type="password" inputMode="numeric" aria-label=${t('pinTitle')} value=${pin} onChange=${(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="1234" className="w-32 h-11 px-3 rounded-xl ring-2 ring-slate-200 focus:ring-sky-400 outline-none" />
            <${Btn} label=${t('pinSave')} disabled=${pin.length < 4} onClick=${() => { classStore.set({ pin }); setPin(''); }} className="px-4 bg-slate-800 text-white">${t('pinSave')}<//>
            ${cls.pin ? html`<${Btn} label=${t('pinClear')} onClick=${() => classStore.set({ pin: '' })} className="px-4 bg-slate-100 text-slate-700">${t('pinClear')}<//>` : null}
          </div>
          <p className="text-xs text-slate-400">🔒 ${t('privacyNote')}</p>
        </section>
      </div>
    </main>
  </div>`;
}
