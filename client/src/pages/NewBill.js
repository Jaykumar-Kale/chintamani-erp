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
    cashMemo: 'कॅश मेमो', tagline: '|| श्री चिंतामणी प्रसन्न ||',
    company: 'चिंतामणी इलेक्ट्रिकल्स ॲण्ड मोटार वायडिंग',
    subtext: 'आमच्याकडे सर्व प्रकारच्या मोटार वायडिंग व दुरुस्ती करुन मिळेल.',
    address: 'मु.पो.कुंजीरवाडी,(थेऊरफाटा),ता.हवेली,जि.पुणे– ४१२११०',
    propr: 'प्रोप्रा.:कैलास काळे', shri: 'श्री.', billNo: 'बिल नं.', date: 'दि:',
    srNo: 'क्र.', details: 'तपशील', qty: 'नग', rate: 'दर', amount: 'रक्कम',
    total: 'एकूण', custSign: 'ग्राहकाची सही',
    forSign: 'चिंतामणी इलेक्ट्रिकल्स ॲण्ड मोटार वायडिंग किरता',
    warranty: '१८ महिने वॉरंटी', replacement: 'रु. ८०० बदली शुल्क',
  },
  en: {
    cashMemo: 'CASH MEMO', tagline: '|| Shree Chintamani Prasanna ||',
    company: 'Chintamani Electricals & Motor Winding',
    subtext: 'All types of motor winding & repair services available.',
    address: 'Muje Kunjirwadi (Theurphata), Tal. Haveli, Dist. Pune – 412110',
    propr: 'Propr.: Kailas Kale', shri: 'Mr./Ms.', billNo: 'Bill No.', date: 'Date:',
    srNo: 'Sr.', details: 'Description', qty: 'Qty', rate: 'Rate', amount: 'Amount',
    total: 'Total', custSign: 'Customer Signature',
    forSign: 'For Chintamani Electricals & Motor Winding',
    warranty: '18 Months Warranty', replacement: 'Rs. 800 Replacement Charges',
  },
};

// ─── CashMemo component — used for BOTH screen preview and PDF capture ───
function CashMemoTemplate({ L, lang, displayCust, displayBillNo, dateStr, allBillItems, displayTotal, signImg, motorLeft, motorRight }) {
  const fontFamily = lang === 'mr'
    ? "'Noto Sans Devanagari','Mangal',sans-serif"
    : "'Inter','Segoe UI',sans-serif";
  const emptyRows = Math.max(0, 8 - allBillItems.length);

  return (
    <div style={{
      fontFamily,
      fontSize: '13px',
      background: '#ffffff',
      border: '2.5px solid #1a1a1a',
      width: '100%',
      boxSizing: 'border-box',
      color: '#111',
    }}>
      {/* HEADER */}
      <div style={{ borderBottom: '2px solid #1a1a1a', padding: '10px 14px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ border: '1.5px solid #444', padding: '3px 8px', fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap' }}>
            {L.cashMemo}
          </span>
          <span style={{ fontWeight: '700', fontSize: '14px', textAlign: 'center', flex: 1, margin: '0 12px' }}>
            {L.tagline}
          </span>
          <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.7', whiteSpace: 'nowrap', fontWeight: '500' }}>
            <div>Mob : 9527370207</div>
            <div>9970780137</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={motorRight} alt="pumps" style={{ height: '72px', width: '72px', objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ color: '#c0392b', fontWeight: '900', fontSize: lang === 'en' ? '20px' : '17px', lineHeight: '1.3' }}>
              {L.company}
            </div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>{L.subtext}</div>
            <div style={{ fontSize: '11px', color: '#555' }}>{L.address}</div>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#222', marginTop: '3px' }}>{L.propr}</div>
          </div>
          <img src={motorLeft} alt="motor" style={{ height: '72px', width: '72px', objectFit: 'contain', flexShrink: 0 }} />
        </div>
      </div>

      {/* CUSTOMER + BILL NO */}
      <div style={{ borderBottom: '1px solid #888', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>{L.shri}</span>
            <span style={{ fontWeight: '700', borderBottom: '1.5px solid #555', flex: 1, paddingBottom: '2px', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayCust.name || ''}
            </span>
          </div>
          {displayCust.address && (
            <div style={{ fontSize: '11px', color: '#555', marginLeft: '32px', marginTop: '3px' }}>{displayCust.address}</div>
          )}
          {displayCust.mobile && (
            <div style={{ fontSize: '11px', color: '#666', marginLeft: '32px' }}>📱 {displayCust.mobile}</div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
            <span style={{ fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap' }}>{L.billNo}</span>
            <span style={{ fontWeight: '900', fontSize: '26px', color: '#111', lineHeight: 1 }}>{displayBillNo ?? '___'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', marginTop: '5px' }}>
            <span style={{ fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap' }}>{L.date}</span>
            <span style={{ fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '32px' }} />
          <col />
          <col style={{ width: '46px' }} />
          <col style={{ width: '58px' }} />
          <col style={{ width: '78px' }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: '2px solid #1a1a1a', background: '#f5f5f5' }}>
            <th style={{ borderRight: '1px solid #888', padding: '6px 2px', textAlign: 'center', fontWeight: '700' }}>{L.srNo}</th>
            <th style={{ borderRight: '1px solid #888', padding: '6px 10px', textAlign: 'left', fontWeight: '700' }}>{L.details}</th>
            <th style={{ borderRight: '1px solid #888', padding: '6px 2px', textAlign: 'center', fontWeight: '700' }}>{L.qty}</th>
            <th style={{ borderRight: '1px solid #888', padding: '6px 4px', textAlign: 'center', fontWeight: '700' }}>{L.rate}</th>
            <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '700' }}>{L.amount}</th>
          </tr>
        </thead>
        <tbody>
          {allBillItems.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #cccccc', height: '30px' }}>
              <td style={{ borderRight: '1px solid #cccccc', textAlign: 'center', padding: '4px 2px', verticalAlign: 'middle' }}>{idx + 1}</td>
              <td style={{ borderRight: '1px solid #cccccc', padding: '4px 10px', verticalAlign: 'middle' }}>{item.description}</td>
              <td style={{ borderRight: '1px solid #cccccc', textAlign: 'center', padding: '4px 2px', verticalAlign: 'middle' }}>{item.qty}</td>
              <td style={{ borderRight: '1px solid #cccccc', textAlign: 'right', padding: '4px 6px', verticalAlign: 'middle' }}>
                {item.rate ? parseFloat(item.rate).toLocaleString('en-IN') : ''}
              </td>
              <td style={{ textAlign: 'right', padding: '4px 8px', fontWeight: '700', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                {item.amount ? `${parseFloat(item.amount).toLocaleString('en-IN')}/-` : ''}
              </td>
            </tr>
          ))}
          {Array.from({ length: emptyRows }).map((_, i) => (
            <tr key={`e${i}`} style={{ borderBottom: '1px solid #dddddd', height: '30px' }}>
              <td style={{ borderRight: '1px solid #dddddd' }}></td>
              <td style={{ borderRight: '1px solid #dddddd' }}></td>
              <td style={{ borderRight: '1px solid #dddddd' }}></td>
              <td style={{ borderRight: '1px solid #dddddd' }}></td>
              <td></td>
            </tr>
          ))}
          <tr style={{ borderTop: '2px solid #1a1a1a' }}>
            <td colSpan={3} style={{ borderRight: '1px solid #888', padding: '8px 10px', verticalAlign: 'middle' }}>
              <div style={{ border: '1px solid #999', padding: '5px 10px', display: 'inline-block', borderRadius: '3px', fontSize: '11px' }}>
                <div style={{ fontWeight: '700' }}>{L.warranty}</div>
                <div>{L.replacement}</div>
              </div>
            </td>
            <td style={{ borderRight: '1px solid #888', textAlign: 'center', fontWeight: '900', fontSize: '15px', color: '#c0392b', verticalAlign: 'middle' }}>
              {L.total}
            </td>
            <td style={{ textAlign: 'right', fontWeight: '900', fontSize: '16px', padding: '8px 8px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
              {displayTotal > 0 ? `${displayTotal.toLocaleString('en-IN')}/-` : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #888', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 16px 14px' }}>
        <div>
          <p style={{ fontWeight: '700', fontSize: '12px', margin: '0 0 2px 0' }}>{L.custSign}</p>
          <div style={{ width: '110px', borderBottom: '1.5px solid #666', marginTop: '32px' }}></div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src={signImg} alt="Signature" style={{ height: '46px', objectFit: 'contain', display: 'block', margin: '0 auto 4px' }} />
          <p style={{ color: '#c0392b', fontWeight: '700', fontSize: '11px', margin: 0 }}>{L.forSign}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
export default function NewBill() {
  const [lang, setLang]               = useState('mr');
  const [customer, setCustomer]       = useState({ name: '', mobile: '', address: '' });
  const [items, setItems]             = useState(DEFAULT_ITEMS.map(i => ({ ...i })));
  const [customItems, setCustomItems] = useState([]);
  const [costPrice, setCostPrice]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [savedBill, setSavedBill]     = useState(null);
  const memoRef                       = useRef();

  const L          = LANG[lang];
  const today      = new Date();
  const dateStr    = today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const displayTotal  = savedBill ? savedBill.total : 0;
  const displayBillNo = savedBill ? savedBill.billNo : null;
  const displayCust   = savedBill ? savedBill.customer : customer;

  const toggleItem = (idx) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, checked: !it.checked } : it));

  const updateItem = (idx, field, value) =>
    setItems(p => p.map((it, i) => {
      if (i !== idx) return it;
      const u = { ...it, [field]: value };
      if (field === 'qty' || field === 'rate')
        u.amount = (parseFloat(field === 'qty' ? value : it.qty) || 0)
                 * (parseFloat(field === 'rate' ? value : it.rate) || 0);
      return u;
    }));

  const addCustomItem = () =>
    setCustomItems(p => [...p, { description: '', qty: 1, rate: '', amount: 0 }]);

  const updateCustomItem = (idx, field, value) =>
    setCustomItems(p => p.map((it, i) => {
      if (i !== idx) return it;
      const u = { ...it, [field]: value };
      if (field === 'qty' || field === 'rate')
        u.amount = (parseFloat(field === 'qty' ? value : it.qty) || 0)
                 * (parseFloat(field === 'rate' ? value : it.rate) || 0);
      return u;
    }));

  const removeCustomItem = (idx) =>
    setCustomItems(p => p.filter((_, i) => i !== idx));

  const allBillItems = [...items.filter(i => i.checked), ...customItems];
  const total        = allBillItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const handleSave = async () => {
    if (!customer.name || !customer.mobile) { toast.error('Customer name & mobile required!'); return; }
    if (allBillItems.length === 0)           { toast.error('Select at least one item!'); return; }
    setLoading(true);
    try {
      const res = await api.post('/bills', {
        customer,
        items: allBillItems.map(i => ({
          description: i.description, qty: parseFloat(i.qty) || 1,
          rate: parseFloat(i.rate) || 0, amount: parseFloat(i.amount) || 0,
        })),
        notes: `${L.warranty}. ${L.replacement}.`,
        costPrice: parseFloat(costPrice) || 0,
        language: lang,
      });
      setSavedBill(res.data.bill);
      toast.success(`Bill #${res.data.bill.billNo} created! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    }
    setLoading(false);
  };

  // ── PDF: capture exact preview div as image → embed in A4 PDF ──
  const handleDownloadPDF = async () => {
    if (!memoRef.current) { toast.error('Preview not ready'); return; }
    setPdfLoading(true);
    toast.loading('Generating PDF...', { id: 'pdf' });
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      // Capture the exact preview element
      const canvas = await html2canvas(memoRef.current, {
        scale: 3,           // 3x for crisp quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
      });

      const imgData   = canvas.toDataURL('image/png');
      const pdf       = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW     = pdf.internal.pageSize.getWidth();   // 210mm
      const pageH     = pdf.internal.pageSize.getHeight();  // 297mm

      // Calculate image dimensions to fit A4 with margins
      const margin    = 10; // mm
      const maxW      = pageW - margin * 2;
      const imgW      = canvas.width;
      const imgH      = canvas.height;
      const ratio     = imgW / imgH;
      const drawW     = maxW;
      const drawH     = drawW / ratio;

      // Center vertically on page
      const offsetY   = Math.max(margin, (pageH - drawH) / 2);

      pdf.addImage(imgData, 'PNG', margin, offsetY, drawW, drawH);

      const custName = (savedBill?.customer?.name || 'Bill').replace(/\s+/g, '_');
      const billNo   = savedBill?.billNo || '';
      pdf.save(`${custName}_Bill_${billNo}.pdf`);
      toast.success(`PDF saved! ✅`, { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('PDF failed. Try again.', { id: 'pdf' });
    }
    setPdfLoading(false);
  };

  const handleWhatsApp = () => {
    if (!savedBill) return;
    const { name, mobile } = savedBill.customer;
    const amt    = savedBill.total.toLocaleString('en-IN');
    const billNo = savedBill.billNo;
    const msg    = lang === 'mr'
      ? `🙏 नमस्कार ${name} जी,\n\nश्री चिंतामणी इलेक्ट्रिकल्स\nBill No: #${billNo}\nदिनांक: ${dateStr}\nएकूण: रु. ${amt}\n\n✅ १८ महिने वॉरंटी & रु.८०० बदली शुल्क\n\n💳 UPI : 9527370207 (Sagar Kale)\n\nधन्यवाद 🙏\nSagar Kale: 9527370207`
      : `🙏 Dear ${name},\n\nShree Chintamani Electricals\nBill No: #${billNo}\nDate: ${dateStr}\nTotal: Rs. ${amt}\n\n✅ 18 Months Warranty & Rs.800 Replacement Charges\n\n💳 UPI : 9527370207 (Sagar Kale)\n\nThank you 🙏\nSagar Kale: 9527370207`;
    window.open(`https://wa.me/91${mobile}?text=${encodeURIComponent(msg)}`);
  };

  const handleNewBill = () => {
    setSavedBill(null);
    setCustomer({ name: '', mobile: '', address: '' });
    setItems(DEFAULT_ITEMS.map(i => ({ ...i })));
    setCustomItems([]);
    setCostPrice('');
  };

  // ─────────────────────────────────────────────────────────────────
  // The allBillItems for preview = items from form (before save) OR saved items
  const previewItems = savedBill
    ? savedBill.items
    : allBillItems;
  const previewTotal = savedBill ? savedBill.total : total;

  return (
    <div className="max-w-7xl mx-auto pb-10">

      {/* ══ PAGE HEADER ══ */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">New Bill / Cash Memo</h1>
          <p className="text-gray-400 text-sm mt-0.5 hidden md:block">Fill in details — live preview on the right</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {!savedBill && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setLang('mr')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${lang==='mr' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>
                मराठी
              </button>
              <button onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${lang==='en' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>
                English
              </button>
            </div>
          )}
          {savedBill ? (
            <>
              <button onClick={handleWhatsApp} className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition">
                📱 WhatsApp
              </button>
              <button onClick={handleDownloadPDF} disabled={pdfLoading} className="bg-accent text-white px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
                {pdfLoading ? '⏳...' : '⬇️ PDF'}
              </button>
              <button onClick={handleNewBill} className="bg-primary text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition">
                ➕ New
              </button>
            </>
          ) : (
            <button onClick={handleSave} disabled={loading} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50">
              {loading ? '⏳ Saving...' : '💾 Save Bill'}
            </button>
          )}
        </div>
      </div>

      {/* ══ MAIN GRID ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ════ LEFT — FORM ════ */}
        <div className="space-y-4">

          {!savedBill && (
            <div className={`rounded-lg px-4 py-2.5 text-sm font-medium flex flex-wrap items-center gap-2 ${lang==='mr' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
              {lang==='mr' ? '🟠 मराठी भाषेत बिल तयार होईल' : '🔵 Bill will be generated in English'}
              <span className="ml-auto text-xs opacity-60 hidden md:block">{lang==='mr' ? '(Village/rural customers)' : '(Educated/IT park customers)'}</span>
            </div>
          )}

          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Customer Details
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Customer Name *', key: 'name', type: 'text', placeholder: 'e.g. Rushi More' },
                { label: 'Mobile Number *', key: 'mobile', type: 'tel', placeholder: 'e.g. 9876543210' },
                { label: 'Address / Location', key: 'address', type: 'text', placeholder: 'e.g. Hadapsar, Pune' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
                  <input type={type} placeholder={placeholder} value={customer[key]}
                    onChange={e => setCustomer({ ...customer, [key]: e.target.value })}
                    disabled={!!savedBill}
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 transition" />
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Select Items
            </h2>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className={`border rounded-xl transition-all ${item.checked ? 'border-primary bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 p-3">
                    <input type="checkbox" checked={item.checked} onChange={() => toggleItem(idx)} disabled={!!savedBill}
                      className="w-5 h-5 accent-primary cursor-pointer" />
                    <span className="text-sm font-medium text-gray-700 flex-1">{item.label}</span>
                    {item.checked && <span className="text-xs text-primary font-bold">₹{(item.amount||0).toLocaleString('en-IN')}</span>}
                  </div>
                  {item.checked && (
                    <div className="px-3 pb-3 pt-2 space-y-2 border-t border-blue-100">
                      <input type="text" value={item.description} onChange={e => updateItem(idx,'description',e.target.value)}
                        disabled={!!savedBill} placeholder="Description"
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white" />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-400 mb-0.5 block">Qty {item.unit ? `(${item.unit})` : ''}</label>
                          <input type="number" value={item.qty} onChange={e => updateItem(idx,'qty',e.target.value)} disabled={!!savedBill}
                            className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-0.5 block">Rate (₹)</label>
                          <input type="number" value={item.rate} onChange={e => updateItem(idx,'rate',e.target.value)} disabled={!!savedBill}
                            className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {customItems.map((item, idx) => (
              <div key={idx} className="mt-2 border border-orange-200 bg-orange-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input type="text" value={item.description} onChange={e => updateCustomItem(idx,'description',e.target.value)}
                    disabled={!!savedBill} placeholder="Custom item description"
                    className="flex-1 border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none" />
                  {!savedBill && <button onClick={() => removeCustomItem(idx)} className="text-red-400 hover:text-red-600 text-xl leading-none w-8 h-8 flex items-center justify-center">✕</button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-0.5 block">Qty</label>
                    <input type="number" value={item.qty} onChange={e => updateCustomItem(idx,'qty',e.target.value)}
                      disabled={!!savedBill} className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-0.5 block">Rate (₹)</label>
                    <input type="number" value={item.rate} onChange={e => updateCustomItem(idx,'rate',e.target.value)}
                      disabled={!!savedBill} className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white" />
                  </div>
                </div>
                <p className="text-xs text-right font-semibold text-orange-600">₹{(item.amount||0).toLocaleString('en-IN')}</p>
              </div>
            ))}
            {!savedBill && (
              <button onClick={addCustomItem}
                className="mt-3 w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-xl text-sm hover:border-primary hover:text-primary transition">
                + Add Custom Item
              </button>
            )}
          </div>

          {/* Profit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
            <h2 className="font-bold text-gray-700 mb-1 flex items-center gap-2">
              <span className="bg-purple-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">3</span>
              Profit Tracking
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full ml-1">Private</span>
            </h2>
            <p className="text-xs text-gray-400 mb-3">Not shown on bill</p>
            <input type="number" placeholder="Your cost price (₹)" value={costPrice}
              onChange={e => setCostPrice(e.target.value)} disabled={!!savedBill}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50" />
            {costPrice && (
              <div className="mt-3 bg-purple-50 rounded-xl p-3 flex justify-between text-sm">
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
                <p className="text-3xl font-black mt-1">₹{(savedBill ? savedBill.total : total).toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-xs">Items</p>
                <p className="text-2xl font-bold">{savedBill ? savedBill.items.length : allBillItems.length}</p>
              </div>
            </div>
          </div>

          {/* WhatsApp preview */}
          {savedBill && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="font-bold text-green-800 mb-2 text-sm">📱 WhatsApp Message Preview:</p>
              <pre className="text-xs whitespace-pre-wrap text-green-700 font-sans bg-white p-3 rounded-lg border border-green-100 leading-relaxed">
                {lang === 'mr'
                  ? `🙏 नमस्कार ${savedBill.customer.name} जी,\n\nश्री चिंतामणी इलेक्ट्रिकल्स\nBill No: #${savedBill.billNo}\nदिनांक: ${dateStr}\nएकूण: रु. ${savedBill.total.toLocaleString('en-IN')}\n\n✅ १८ महिने वॉरंटी & रु.८०० बदली शुल्क\n\n💳 UPI : 9527370207 (Sagar Kale)\n\nधन्यवाद 🙏\nSagar Kale: 9527370207`
                  : `🙏 Dear ${savedBill.customer.name},\n\nShree Chintamani Electricals\nBill No: #${savedBill.billNo}\nDate: ${dateStr}\nTotal: Rs. ${savedBill.total.toLocaleString('en-IN')}\n\n✅ 18 Months Warranty & Rs.800 Replacement Charges\n\n💳 UPI : 9527370207 (Sagar Kale)\n\nThank you 🙏\nSagar Kale: 9527370207`}
              </pre>
            </div>
          )}
        </div>

        {/* ════ RIGHT — PREVIEW ════ */}
        <div>
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">📄 Live Preview</p>
              <div className="flex items-center gap-2">
                {savedBill && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                    ✅ Bill #{savedBill.billNo}
                  </span>
                )}
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${lang==='mr' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {lang==='mr' ? '🟠 मराठी' : '🔵 English'}
                </span>
              </div>
            </div>

            {/* This exact div gets captured by html2canvas */}
            <div ref={memoRef}>
              <CashMemoTemplate
                L={L} lang={lang}
                displayCust={displayCust}
                displayBillNo={displayBillNo}
                dateStr={dateStr}
                allBillItems={previewItems}
                displayTotal={previewTotal}
                signImg={signImg}
                motorLeft={motorLeft}
                motorRight={motorRight}
              />
            </div>

            {!savedBill ? (
              <button onClick={handleSave} disabled={loading}
                className="mt-4 w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition disabled:opacity-50 text-sm shadow-lg">
                {loading ? '⏳ Saving...' : '💾 Save & Generate Bill'}
              </button>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button onClick={handleWhatsApp} className="bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition text-xs shadow">
                  📱 WhatsApp
                </button>
                <button onClick={handleDownloadPDF} disabled={pdfLoading} className="bg-accent text-white py-3 rounded-xl font-bold hover:opacity-90 transition text-xs shadow disabled:opacity-50">
                  {pdfLoading ? '⏳...' : '⬇️ Download PDF'}
                </button>
                <button onClick={handleNewBill} className="bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition text-xs shadow">
                  ➕ New Bill
                </button>
              </div>
            )}

            {savedBill && (
              <p className="text-xs text-gray-400 text-center mt-2">
                💡 PDF will be saved as <strong>{(savedBill.customer.name||'Bill').replace(/\s+/g,'_')}_Bill_{savedBill.billNo}.pdf</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}