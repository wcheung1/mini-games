/* 化學式標記：文字入面寫 [[H2SO4]]、[[Fe^3+]]、[[Ca(OH)2]]
   - ChemText：顯示時數字變下標、電荷變上標
   - chemPlain：純文字版（Unicode 上下標），用喺按鈕名、aria-label
   - chemSpeak：朗讀版，用香港課堂讀法（H₂SO₄ → 「H 二 S O 四」／"H two S O four"） */
import { html } from './lib.js';

const RE = /\[\[([^\]]+)\]\]/g;
const SUB = '₀₁₂₃₄₅₆₇₈₉', SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻' };

// 將化學式拆成：元素、數字（下標）、括號、點（結晶水）、電荷
function tokens(f) {
  const out = []; let s = f;
  const charge = /\^(\d*)([+-])$/.exec(s);
  if (charge) s = s.slice(0, charge.index);
  if (s === 'e') return [{ k: 'el', v: 'e' }, ...(charge ? [{ k: 'ch', v: '-' }] : [])]; // 電子 e⁻
  const re = /([A-Z][a-z]?)|(\d+)|([()])|([.·])/g; let m;
  while ((m = re.exec(s))) {
    if (m[1]) out.push({ k: 'el', v: m[1] });
    else if (m[2]) out.push({ k: out.length && out[out.length - 1].k !== 'dot' ? 'n' : 'coef', v: m[2] });
    else if (m[3]) out.push({ k: 'par', v: m[3] });
    else out.push({ k: 'dot', v: '·' });
  }
  if (charge) out.push({ k: 'ch', v: (charge[1] || '') + charge[2] });
  return out;
}

export function chemPlain(text) {
  return String(text ?? '').replace(RE, (_, f) => tokens(f).map((t) => (t.k === 'n' ? [...t.v].map((d) => SUB[d]).join('')
    : t.k === 'ch' ? [...t.v].map((c) => SUP[c]).join('') : t.v)).join(''));
}

const ZH_N = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const EN_N = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const zhNum = (n) => (n <= 10 ? ZH_N[n] : n < 20 ? '十' + ZH_N[n - 10] : ZH_N[Math.floor(n / 10)] + '十' + (n % 10 ? ZH_N[n % 10] : ''));
const enNum = (n) => EN_N[n] || String(n);

function speakFormula(f, lang) {
  const zh = lang === 'zh';
  if (/^e(\^-)?$/.test(f)) return zh ? '電子' : 'electrons';
  const num = (v) => (zh ? zhNum(+v) : enNum(+v));
  return tokens(f).map((t) => {
    if (t.k === 'el') return t.v.toUpperCase().split('').join(' ');
    if (t.k === 'n' || t.k === 'coef') return num(t.v);
    if (t.k === 'par') return '';
    if (t.k === 'dot') return zh ? '點' : 'dot';
    const sign = t.v.endsWith('+') ? (zh ? '正' : 'plus') : (zh ? '負' : 'minus');
    const n = t.v.slice(0, -1);
    return n ? `${num(n)}${zh ? '' : ' '}${sign}` : sign;
  }).filter(Boolean).join(' ');
}

const STATE_SAY = {
  zh: { s: '固體', l: '液體', g: '氣體', aq: '水溶液' },
  en: { s: 'solid', l: 'liquid', g: 'gas', aq: 'aqueous' },
};
// readFormula = false：唔讀化學式（同基礎層一樣，只讀文字）
export function chemSpeak(text, lang, readFormula = true) {
  let s = String(text ?? '');
  if (!s.includes('[[')) return s;
  s = s.replace(/\[\[([^\]]+)\]\]\((s|l|g|aq)\)/g, (_, f, st) => (readFormula ? `${speakFormula(f, lang)} ${STATE_SAY[lang][st]}` : ''));
  s = s.replace(RE, (_, f) => (readFormula ? ` ${speakFormula(f, lang)} ` : ''));
  if (!readFormula) s = s.replace(/(^|[\s，,])\d+\s*(?=[\s+＋→])/g, '$1'); // 拎走方程式剩低嘅係數
  s = s.replace(/\s{2,}/g, ' ');
  return !readFormula && /^[\s+＋→\d]*$/.test(s) ? '' : s; // 淨係剩符號就唔讀
}

// 顯示：[[...]] 變成有上下標嘅化學式；其餘文字照出
export function ChemText({ text }) {
  const s = String(text ?? '');
  if (!s.includes('[[')) return s;
  const parts = []; let last = 0; let m; RE.lastIndex = 0;
  while ((m = RE.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    parts.push(html`<span key=${m.index} className="chem whitespace-nowrap">${tokens(m[1]).map((t, i) => (t.k === 'n'
      ? html`<sub key=${i}>${t.v}</sub>` : t.k === 'ch' ? html`<sup key=${i}>${t.v.replace('-', '−')}</sup>` : t.v))}</span>`);
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}
