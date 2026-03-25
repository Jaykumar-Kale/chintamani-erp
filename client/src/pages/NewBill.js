import { useState, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import signImg from '../assets/sign.jpg';
import motorLeft from '../assets/motor-left.jpg';
import motorRight from '../assets/motor-right.jpg';

const DEFAULT_ITEMS = [
  { label: 'Laxmi Pump',       description: 'Laxmi ___ HP ___ Stage Pump', qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Pipe ISI Brand',   description: 'Pipe ISI Brand ___ Fut',       qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Cable ISI',        description: '2.5 Sq mm ISI Brand Cable',    qty: '', rate: '', amount: 0, checked: false, unit: 'Miter' },
  { label: 'Rope 10mm',        description: 'Rope 10mm',                    qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Dry Run Panel',    description: 'Dry Run Panel Kissan',         qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Fitting Material', description: 'Fitting Material',             qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Panel Box',        description: 'Panel Box',                    qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Fitting Charges',  description: 'Fitting Charges',              qty: 1,  rate: '', amount: 0, checked: false },
];

const LANG = {
  mr: {
    cashMemo:    'कॅश मेमो',
    tagline:     '|| श्री चिंतामणी प्रसन्न ||',
    company:     'चिंतामणी इलेक्ट्रिकल्स ॲण्ड मोटार वायडिंग',
    subtext:     'आमच्याकडे सर्व प्रकारच्या मोटार वायडिंग व दुरुस्ती करुन मिळेल.',
    address:     'मु.पो.कुंजीरवाडी,(थेऊरफाटा),ता.हवेली,जि.पुणे– ४१२११०',
    propr:       'प्रोप्रा.:कैलास काळे',
    shri:        'श्री.',
    billNo:      'बिल नं.',
    date:        'दि:',
    srNo:        'क्र.',
    details:     'तपशील',
    qty:         'नग',
    rate:        'दर',
    amount:      'रक्कम',
    total:       'एकूण',
    custSign:    'ग्राहकाची सही',
    forSign:     'चिंतामणी इलेक्ट्रिकल्स ॲण्ड मोटार वायडिंग किरता',
    warranty:    '१८ महिने वॉरंटी',
    replacement: 'रु. ८०० बदली शुल्क',
  },
  en: {
    cashMemo:    'CASH MEMO',
    tagline:     '|| Shree Chintamani Prasanna ||',
    company:     'Chintamani Electricals & Motor Winding',
    subtext:     'All types of motor winding & repair services available.',
    address:     'Muje Kunjirwadi (Theurphata), Tal. Haveli, Dist. Pune – 412110',
    propr:       'Propr.: Kailas Kale',
    shri:        'Mr./Ms.',
    billNo:      'Bill No.',
    date:        'Date:',
    srNo:        'Sr.',
    details:     'Description',
    qty:         'Qty',
    rate:        'Rate',
    amount:      'Amount',
    total:       'Total',
    custSign:    'Customer Signature',
    forSign:     'For Chintamani Electricals & Motor Winding',
    warranty:    '18 Months Warranty',
    replacement: 'Rs. 800 Replacement Charges',
  },
};

// ── Shared memo styles ──
const S = {
  border:     '2px solid #1a1a1a',
  borderLight:'1px solid #bbbbbb',
  borderMid:  '1px solid #888888',
  red:        '#c0392b',
  bg:         '#ffffff',
  rowH:       '28px',
};

export default function NewBill() {
  const [lang, setLang]           = useState('mr');
  const [customer, setCustomer]   = useState({ name: '', mobile: '', address: '' });
  const [items, setItems]         = useState(DEFAULT_ITEMS.map(i => ({ ...i })));
  const [customItems, setCustomItems] = useState([]);
  const [costPrice, setCostPrice] = useState('');
  const [loading, setLoading]     = useState(false);
  const [savedBill, setSavedBill] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const memoRef = useRef();

  const L       = LANG[lang];
  const today   = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const toggleItem = (idx) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, checked: !it.checked } : it));

  const updateItem = (idx, field, value) =>
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const u = { ...it, [field]: value };
      if (field === 'qty' || field === 'rate') {
        u.amount = (parseFloat(field === 'qty' ? value : it.qty) || 0)
                 * (parseFloat(field === 'rate' ? value : it.rate) || 0);
      }
      return u;
    }));

  const addCustomItem = () =>
    setCustomItems(p => [...p, { description: '', qty: 1, rate: '', amount: 0 }]);

  const updateCustomItem = (idx, field, value) =>
    setCustomItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const u = { ...it, [field]: value };
      if (field === 'qty' || field === 'rate') {
        u.amount = (parseFloat(field === 'qty' ? value : it.qty) || 0)
                 * (parseFloat(field === 'rate' ? value : it.rate) || 0);
      }
      return u;
    }));

  const removeCustomItem = (idx) =>
    setCustomItems(p => p.filter((_, i) => i !== idx));

  const allBillItems = [...items.filter(i => i.checked), ...customItems];
  const total = allBillItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const displayTotal = savedBill ? savedBill.total : total;
  const displayBillNo = savedBill ? savedBill.billNo : null;
  const displayCustomer = savedBill ? savedBill.customer : customer;

  // ── Save to DB ──
  const handleSave = async () => {
    if (!customer.name || !customer.mobile) { toast.error('Customer name & mobile required!'); return; }
    if (allBillItems.length === 0)           { toast.error('Select at least one item!'); return; }
    setLoading(true);
    try {
      const res = await api.post('/bills', {
        customer,
        items: allBillItems.map(i => ({
          description: i.description,
          qty:    parseFloat(i.qty)    || 1,
          rate:   parseFloat(i.rate)   || 0,
          amount: parseFloat(i.amount) || 0,
        })),
        notes:     `${L.warranty}. ${L.replacement}.`,
        costPrice: parseFloat(costPrice) || 0,
        language:  lang,
      });
      setSavedBill(res.data.bill);
      toast.success(`Bill #${res.data.bill.billNo} created! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    }
    setLoading(false);
  };

  // ── Print → browser "Save as PDF" gives pixel-perfect output ──
  const handlePrint = () => window.print();

  // ── WhatsApp with personalized bilingual message ──
  const handleWhatsApp = () => {
    if (!savedBill) return;
    const name   = savedBill.customer.name;
    const billNo = savedBill.billNo;
    const amt    = savedBill.total.toLocaleString('en-IN');
    const mobile = savedBill.customer.mobile;

    const msg = lang === 'mr'
      ? `🙏 नमस्कार ${name} जी,\n\nश्री चिंतामणी इलेक्ट्रिकल्स\nBill No: #${billNo}\nदिनांक: ${dateStr}\nएकूण: रु. ${amt}\n\n✅ १८ महिने वॉरंटी & रु.८०० बदली शुल्क\n\n💳 UPI : 9527370207 (Sagar Kale)\n\nधन्यवाद 🙏\nSagar Kale: 9527370207`
      : `🙏 Dear ${name},\n\nShree Chintamani Electricals\nBill No: #${billNo}\nDate: ${dateStr}\nTotal: Rs. ${amt}\n\n✅ 18 Months Warranty & Rs.800 Replacement Charges\n\n💳 UPI : 9527370207 (Sagar Kale)\n\nThank you 🙏\nSagar Kale: 9527370207`;

    // Opens WhatsApp from Sagar's number (9527370207) to customer
    window.open(`https://wa.me/91${mobile}?text=${encodeURIComponent(msg)}`);
  };

  const handleNewBill = () => {
    setSavedBill(null);
    setCustomer({ name: '', mobile: '', address: '' });
    setItems(DEFAULT_ITEMS.map(i => ({ ...i })));
    setCustomItems([]);
    setCostPrice('');
  };

  // ────────────────────────────────────────────────────────────
  //  CASH MEMO COMPONENT  — identical for screen + print
  // ────────────────────────────────────────────────────────────
  const fontFamily = lang === 'mr'
    ? "'Noto Sans Devanagari','Mangal',sans-serif"
    : "'Inter','Segoe UI',sans-serif";

  const CashMemo = () => (
    <div
      id="cash-memo"
      style={{
        fontFamily,
        fontSize: '11.5px',
        background: S.bg,
        border: S.border,
        width: '100%',
        boxSizing: 'border-box',
        color: '#111',
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ borderBottom: S.border, padding: '8px 12px 7px' }}>
        {/* Row 1: label | tagline | phone */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
          <span style={{ border:'1.5px solid #333', padding:'2px 7px', fontSize:'10px', fontWeight:'700', whiteSpace:'nowrap', alignSelf:'center' }}>
            {L.cashMemo}
          </span>
          <span style={{ fontWeight:'700', fontSize:'12px', textAlign:'center', flex:1, margin:'0 10px', alignSelf:'center' }}>
            {L.tagline}
          </span>
          <div style={{ textAlign:'right', fontSize:'10px', lineHeight:'1.6', whiteSpace:'nowrap' }}>
            <div>Mob : 9527370207</div>
            <div>9970780137</div>
          </div>
        </div>

        {/* Row 2: left-image | company info | right-image */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <img src={motorRight} alt="pumps"
            style={{ height:'64px', width:'64px', objectFit:'contain', flexShrink:0 }} />
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ color:S.red, fontWeight:'900', fontSize:'16px', lineHeight:'1.25', letterSpacing:'-0.2px' }}>
              {L.company}
            </div>
            <div style={{ fontSize:'9.5px', color:'#555', marginTop:'3px' }}>{L.subtext}</div>
            <div style={{ fontSize:'9.5px', color:'#555' }}>{L.address}</div>
            <div style={{ fontSize:'10px', fontWeight:'700', color:'#222', marginTop:'2px' }}>{L.propr}</div>
          </div>
          <img src={motorLeft} alt="motor"
            style={{ height:'64px', width:'64px', objectFit:'contain', flexShrink:0 }} />
        </div>
      </div>

      {/* ── CUSTOMER + BILL NO ── */}
      <div style={{ borderBottom: S.borderMid, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
            <span style={{ fontWeight:'700', fontSize:'12.5px', flexShrink:0 }}>{L.shri}</span>
            <span style={{
              fontWeight:'600', borderBottom:'1.5px solid #555',
              flex:1, paddingBottom:'2px', fontSize:'12px',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>
              {displayCustomer.name || ''}
            </span>
          </div>
          {displayCustomer.address && (
            <div style={{ fontSize:'9.5px', color:'#555', marginLeft:'30px', marginTop:'3px' }}>
              {displayCustomer.address}
            </div>
          )}
          {displayCustomer.mobile && (
            <div style={{ fontSize:'9.5px', color:'#666', marginLeft:'30px' }}>
              📱 {displayCustomer.mobile}
            </div>
          )}
        </div>
        <div style={{ textAlign:'right', flexShrink:0, minWidth:'100px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'4px' }}>
            <span style={{ fontWeight:'700', fontSize:'10px', whiteSpace:'nowrap' }}>{L.billNo}</span>
            <span style={{ fontWeight:'900', fontSize:'20px', color:'#111', lineHeight:1 }}>
              {displayBillNo ?? '___'}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'4px', marginTop:'4px' }}>
            <span style={{ fontWeight:'700', fontSize:'10px', whiteSpace:'nowrap' }}>{L.date}</span>
            <span style={{ fontSize:'10.5px', whiteSpace:'nowrap' }}>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* ── ITEMS TABLE ── */}
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px', tableLayout:'fixed' }}>
        <colgroup>
          <col style={{ width:'30px' }} />
          <col />
          <col style={{ width:'42px' }} />
          <col style={{ width:'52px' }} />
          <col style={{ width:'68px' }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: S.border, background:'#f5f5f5' }}>
            {[L.srNo, L.details, L.qty, L.rate, L.amount].map((h, i) => (
              <th key={i} style={{
                borderRight: i < 4 ? S.borderMid : 'none',
                padding:'5px 4px', fontWeight:'700',
                textAlign: i === 0 ? 'center' : i >= 2 ? 'center' : 'left',
                fontSize:'11px',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Filled rows */}
          {allBillItems.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: S.borderLight, height: S.rowH }}>
              <td style={{ borderRight: S.borderLight, textAlign:'center', padding:'3px 2px', verticalAlign:'middle' }}>{idx + 1}</td>
              <td style={{ borderRight: S.borderLight, padding:'3px 8px', verticalAlign:'middle', wordBreak:'break-word' }}>{item.description}</td>
              <td style={{ borderRight: S.borderLight, textAlign:'center', padding:'3px 2px', verticalAlign:'middle' }}>{item.qty}</td>
              <td style={{ borderRight: S.borderLight, textAlign:'right', padding:'3px 6px', verticalAlign:'middle' }}>
                {item.rate ? parseFloat(item.rate).toLocaleString('en-IN') : ''}
              </td>
              <td style={{ textAlign:'right', padding:'3px 8px', fontWeight:'600', verticalAlign:'middle' }}>
                {item.amount ? `${parseFloat(item.amount).toLocaleString('en-IN')}/-` : ''}
              </td>
            </tr>
          ))}
          {/* Empty filler rows — always show at least 8 rows total */}
          {Array.from({ length: Math.max(0, 8 - allBillItems.length) }).map((_, i) => (
            <tr key={`e${i}`} style={{ borderBottom: S.borderLight, height: S.rowH }}>
              <td style={{ borderRight: S.borderLight }}></td>
              <td style={{ borderRight: S.borderLight }}></td>
              <td style={{ borderRight: S.borderLight }}></td>
              <td style={{ borderRight: S.borderLight }}></td>
              <td></td>
            </tr>
          ))}

          {/* ── TOTAL ROW ── */}
          <tr style={{ borderTop: S.border }}>
            <td colSpan={3} style={{ borderRight: S.borderMid, padding:'7px 8px', verticalAlign:'middle' }}>
              <div style={{ border:'1px solid #999', padding:'4px 8px', display:'inline-block', borderRadius:'3px', fontSize:'9.5px' }}>
                <div style={{ fontWeight:'700' }}>{L.warranty}</div>
                <div>{L.replacement}</div>
              </div>
            </td>
            <td style={{ borderRight: S.borderMid, textAlign:'center', fontWeight:'900', fontSize:'13px', color: S.red, verticalAlign:'middle' }}>
              {L.total}
            </td>
            <td style={{ textAlign:'right', fontWeight:'900', fontSize:'14px', padding:'7px 8px', verticalAlign:'middle', whiteSpace:'nowrap' }}>
              {displayTotal > 0 ? `${displayTotal.toLocaleString('en-IN')}/-` : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: S.borderMid, display:'flex', justifyContent:'space-between', alignItems:'flex-end', padding:'10px 14px 12px' }}>
        <div>
          <p style={{ fontWeight:'700', fontSize:'10.5px', margin:'0 0 2px 0' }}>{L.custSign}</p>
          <div style={{ width:'100px', borderBottom:'1.5px solid #666', marginTop:'30px' }}></div>
        </div>
        <div style={{ textAlign:'center' }}>
          <img src={signImg} alt="Signature"
            style={{ height:'42px', objectFit:'contain', display:'block', margin:'0 auto 3px' }} />
          <p style={{ color: S.red, fontWeight:'700', fontSize:'10px', margin:0 }}>{L.forSign}</p>
        </div>
      </div>
    </div>
  );

  // ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">New Bill / Cash Memo</h1>
          <p className="text-gray-400 text-sm mt-0.5">Fill in details — preview updates live on the right</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          {!savedBill && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setLang('mr')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${lang==='mr' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                मराठी
              </button>
              <button onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${lang==='en' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                English
              </button>
            </div>
          )}
          {savedBill ? (
            <>
              <button onClick={handleWhatsApp}
                className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition">
                📱 WhatsApp
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                🖨️ Print / PDF
              </button>
              <button onClick={handleNewBill}
                className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition">
                ➕ New Bill
              </button>
            </>
          ) : (
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-1.5 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50">
              {loading ? '⏳ Saving...' : '💾 Save & Generate Bill'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ══ LEFT — FORM ══ */}
        <div className="space-y-4">
          {/* Language banner */}
          {!savedBill && (
            <div className={`rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${lang==='mr' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
              {lang==='mr' ? '🟠 मराठी भाषेत बिल तयार होईल' : '🔵 Bill will be generated in English'}
              <span className="ml-auto text-xs opacity-60">{lang==='mr' ? '(Village / rural customers)' : '(Educated / IT park customers)'}</span>
            </div>
          )}

          {/* 1. Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Customer Details
            </h2>
            <div className="space-y-3">
              {[
                { label:'Customer Name *', key:'name',    type:'text', placeholder:'e.g. Rushi More' },
                { label:'Mobile Number *', key:'mobile',  type:'tel',  placeholder:'e.g. 9876543210' },
                { label:'Address / Location', key:'address', type:'text', placeholder:'e.g. More Vasti, Hadapsar, Pune' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
                  <input type={type} placeholder={placeholder} value={customer[key]}
                    onChange={e => setCustomer({ ...customer, [key]: e.target.value })} disabled={!!savedBill}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 transition" />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Select Items
            </h2>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className={`border rounded-lg transition-all ${item.checked ? 'border-primary bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 p-3">
                    <input type="checkbox" checked={item.checked} onChange={() => toggleItem(idx)} disabled={!!savedBill}
                      className="w-4 h-4 accent-primary cursor-pointer" />
                    <span className="text-sm font-medium text-gray-700 flex-1">{item.label}</span>
                    {item.checked && <span className="text-xs text-primary font-bold">₹{(item.amount||0).toLocaleString('en-IN')}</span>}
                  </div>
                  {item.checked && (
                    <div className="px-3 pb-3 pt-2 space-y-2 border-t border-blue-100">
                      <input type="text" value={item.description} onChange={e => updateItem(idx,'description',e.target.value)}
                        disabled={!!savedBill} placeholder="Description"
                        className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white" />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-400 mb-0.5 block">Qty {item.unit?`(${item.unit})`:''}</label>
                          <input type="number" value={item.qty} onChange={e => updateItem(idx,'qty',e.target.value)} disabled={!!savedBill}
                            className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-0.5 block">Rate (₹)</label>
                          <input type="number" value={item.rate} onChange={e => updateItem(idx,'rate',e.target.value)} disabled={!!savedBill}
                            className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {customItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Custom Items</p>
                {customItems.map((item, idx) => (
                  <div key={idx} className="border border-orange-200 bg-orange-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="text" value={item.description} onChange={e => updateCustomItem(idx,'description',e.target.value)}
                        disabled={!!savedBill} placeholder="Item description"
                        className="flex-1 border border-orange-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none" />
                      {!savedBill && <button onClick={() => removeCustomItem(idx)} className="text-red-400 hover:text-red-600 text-lg leading-none">✕</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Qty</label>
                        <input type="number" value={item.qty} onChange={e => updateCustomItem(idx,'qty',e.target.value)}
                          disabled={!!savedBill} className="w-full border border-orange-200 rounded px-2 py-1.5 text-xs bg-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Rate (₹)</label>
                        <input type="number" value={item.rate} onChange={e => updateCustomItem(idx,'rate',e.target.value)}
                          disabled={!!savedBill} className="w-full border border-orange-200 rounded px-2 py-1.5 text-xs bg-white" />
                      </div>
                    </div>
                    <p className="text-xs text-right font-semibold text-orange-600">₹{(item.amount||0).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
            {!savedBill && (
              <button onClick={addCustomItem}
                className="mt-4 w-full border-2 border-dashed border-gray-200 text-gray-400 py-2.5 rounded-lg text-sm hover:border-primary hover:text-primary transition">
                + Add Custom Item
              </button>
            )}
          </div>

          {/* 3. Profit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 mb-1 flex items-center gap-2">
              <span className="bg-purple-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">3</span>
              Profit Tracking
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full ml-1">Private</span>
            </h2>
            <p className="text-xs text-gray-400 mb-3">Not shown on bill</p>
            <input type="number" placeholder="Your cost price (₹)" value={costPrice}
              onChange={e => setCostPrice(e.target.value)} disabled={!!savedBill}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50" />
            {costPrice && (
              <div className="mt-3 bg-purple-50 rounded-lg p-3 flex justify-between text-sm">
                <span className="text-gray-600">Estimated Profit:</span>
                <span className="font-bold text-purple-600">₹{(total - parseFloat(costPrice||0)).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-primary rounded-xl p-5 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-200 text-sm">Total Amount</p>
                <p className="text-3xl font-black mt-1">₹{displayTotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-xs">Items</p>
                <p className="text-2xl font-bold">{allBillItems.length}</p>
              </div>
            </div>
          </div>

          {/* WhatsApp tip */}
          {savedBill && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <p className="font-bold mb-1">📱 WhatsApp Message Preview ({lang === 'mr' ? 'मराठी' : 'English'}):</p>
              <pre className="text-xs whitespace-pre-wrap text-green-700 font-sans mt-2">
                {lang === 'mr'
                  ? `🙏 नमस्कार ${savedBill.customer.name} जी,\n\nश्री चिंतामणी इलेक्ट्रिकल्स\nBill No: #${savedBill.billNo}\nदिनांक: ${dateStr}\nएकूण: रु. ${savedBill.total.toLocaleString('en-IN')}\n\n✅ १८ महिने वॉरंटी & रु.८०० बदली शुल्क\n\n💳 UPI : 9527370207 (Sagar Kale)\n\nधन्यवाद 🙏\nSagar Kale: 9527370207`
                  : `🙏 Dear ${savedBill.customer.name},\n\nShree Chintamani Electricals\nBill No: #${savedBill.billNo}\nDate: ${dateStr}\nTotal: Rs. ${savedBill.total.toLocaleString('en-IN')}\n\n✅ 18 Months Warranty & Rs.800 Replacement Charges\n\n💳 UPI : 9527370207 (Sagar Kale)\n\nThank you 🙏\nSagar Kale: 9527370207`}
              </pre>
            </div>
          )}
        </div>

        {/* ══ RIGHT — PREVIEW ══ */}
        <div>
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">📄 Live Preview</p>
              <div className="flex items-center gap-2">
                {savedBill && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                    ✅ Bill #{savedBill.billNo} Saved
                  </span>
                )}
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${lang==='mr' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {lang==='mr' ? '🟠 मराठी' : '🔵 English'}
                </span>
              </div>
            </div>

            <CashMemo />

            {!savedBill ? (
              <button onClick={handleSave} disabled={loading}
                className="mt-4 w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition disabled:opacity-50 text-sm shadow-lg">
                {loading ? '⏳ Saving...' : '💾 Save & Generate Bill'}
              </button>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={handleWhatsApp}
                  className="bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition text-sm shadow">
                  📱 Send WhatsApp
                </button>
                <button onClick={handlePrint}
                  className="bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition text-sm shadow">
                  🖨️ Print / Save PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          PRINT CSS — only cash-memo prints, 1 page, A5
          ════════════════════════════════ */}
      <style>{`
        @media print {
          /* Hide everything except the memo */
          body > * { display: none !important; }
          #root > * { display: none !important; }
          #cash-memo {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 148mm !important;
            border: 2px solid #1a1a1a !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11.5pt !important;
          }
          #cash-memo * { visibility: visible !important; }

          /* Force single page A5 */
          @page {
            size: A5 portrait;
            margin: 6mm;
          }

          /* Remove browser header/footer */
          @page { margin-top: 0; margin-bottom: 0; }
        }
      `}</style>
    </div>
  );
}