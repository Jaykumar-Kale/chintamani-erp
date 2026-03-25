import { useState, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import signImg from '../assets/sign.jpg';

const DEFAULT_ITEMS = [
  { label: 'Laxmi Pump', description: 'Laxmi ___ HP ___ Stage Pump', qty: 1, rate: '', amount: 0, checked: false },
  { label: 'Pipe ISI Brand', description: 'Pipe ISI Brand ___ Fut', qty: 1, rate: '', amount: 0, checked: false },
  { label: 'Cable ISI', description: '2.5 Sq mm ISI Brand Cable', qty: '', rate: '', amount: 0, checked: false, unit: 'Miter' },
  { label: 'Rope 10mm', description: 'Rope 10mm', qty: 1, rate: '', amount: 0, checked: false },
  { label: 'Dry Run Panel', description: 'Dry Run Panel Kissan', qty: 1, rate: '', amount: 0, checked: false },
  { label: 'Fitting Material', description: 'Fitting Material', qty: 1, rate: '', amount: 0, checked: false },
  { label: 'Panel Box', description: 'Panel Box', qty: 1, rate: '', amount: 0, checked: false },
  { label: 'Fitting Charges', description: 'Fitting Charges', qty: 1, rate: '', amount: 0, checked: false },
];

export default function NewBill() {
  const printRef = useRef();
  const [customer, setCustomer] = useState({ name: '', mobile: '', address: '' });
  const [items, setItems] = useState(DEFAULT_ITEMS.map(i => ({ ...i })));
  const [customItems, setCustomItems] = useState([]);
  const [costPrice, setCostPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedBill, setSavedBill] = useState(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const toggleItem = (idx) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, checked: !item.checked } : item
    ));
  };

  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'qty' || field === 'rate') {
        const qty = parseFloat(field === 'qty' ? value : item.qty) || 0;
        const rate = parseFloat(field === 'rate' ? value : item.rate) || 0;
        updated.amount = qty * rate;
      }
      return updated;
    }));
  };

  const addCustomItem = () => {
    setCustomItems(prev => [...prev, { description: '', qty: 1, rate: '', amount: 0 }]);
  };

  const updateCustomItem = (idx, field, value) => {
    setCustomItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'qty' || field === 'rate') {
        const qty = parseFloat(field === 'qty' ? value : item.qty) || 0;
        const rate = parseFloat(field === 'rate' ? value : item.rate) || 0;
        updated.amount = qty * rate;
      }
      return updated;
    }));
  };

  const removeCustomItem = (idx) => {
    setCustomItems(prev => prev.filter((_, i) => i !== idx));
  };

  const allBillItems = [...items.filter(i => i.checked), ...customItems];
  const total = allBillItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  const handleSave = async () => {
    if (!customer.name || !customer.mobile) {
      toast.error('Please enter customer name and mobile!');
      return;
    }
    if (allBillItems.length === 0) {
      toast.error('Please select at least one item!');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/bills', {
        customer,
        items: allBillItems.map(i => ({
          description: i.description,
          qty: parseFloat(i.qty) || 1,
          rate: parseFloat(i.rate) || 0,
          amount: parseFloat(i.amount) || 0,
        })),
        notes: '18 months warranty. Rs.800 replacement charges.',
        costPrice: parseFloat(costPrice) || 0,
      });
      setSavedBill(res.data.bill);
      toast.success(`Bill #${res.data.bill.billNo} created! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    }
    setLoading(false);
  };

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    if (!savedBill) return;
    const msg = `🙏 नमस्कार ${savedBill.customer.name} जी,\n\nश्री चिंतामणी इलेक्ट्रिकल्स अँड मोटार वायडिंग\n\nBill No: #${savedBill.billNo}\nDate: ${new Date(savedBill.date).toLocaleDateString('en-IN')}\nTotal: Rs. ${savedBill.total.toLocaleString()}\n\n✅ 18 महिने वॉरंटी\n💰 Rs.800 बदली शुल्क\n\nधन्यवाद 🙏\nSagar Kale: 9527370207`;
    window.open(`https://wa.me/91${savedBill.customer.mobile}?text=${encodeURIComponent(msg)}`);
  };

  const handleNewBill = () => {
    setSavedBill(null);
    setCustomer({ name: '', mobile: '', address: '' });
    setItems(DEFAULT_ITEMS.map(i => ({ ...i })));
    setCustomItems([]);
    setCostPrice('');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">New Bill / Cash Memo</h1>
          <p className="text-gray-400 text-sm mt-0.5">Fill in details to generate a bill</p>
        </div>
        <div className="flex gap-3">
          {savedBill ? (
            <>
              <button onClick={handleWhatsApp} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition">
                📱 Send WhatsApp
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                🖨️ Print Bill
              </button>
              <button onClick={handleNewBill} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition">
                ➕ New Bill
              </button>
            </>
          ) : (
            <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50">
              {loading ? '⏳ Saving...' : '💾 Save & Generate Bill'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* LEFT — FORM */}
        <div className="space-y-4">

          {/* 1. Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Customer Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Customer Name *</label>
                <input type="text" placeholder="e.g. Rushi More" value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })} disabled={!!savedBill}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Mobile Number *</label>
                <input type="tel" placeholder="e.g. 9876543210" value={customer.mobile}
                  onChange={e => setCustomer({ ...customer, mobile: e.target.value })} disabled={!!savedBill}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Address / Location</label>
                <input type="text" placeholder="e.g. More Vasti, Hadapsar, Pune" value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })} disabled={!!savedBill}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 transition" />
              </div>
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
                    {item.checked && (
                      <span className="text-xs text-primary font-bold">₹{(item.amount || 0).toLocaleString()}</span>
                    )}
                  </div>
                  {item.checked && (
                    <div className="px-3 pb-3 space-y-2 border-t border-blue-100 pt-2">
                      <input type="text" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                        disabled={!!savedBill} placeholder="Description"
                        className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white" />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-400 mb-0.5 block">Qty {item.unit ? `(${item.unit})` : ''}</label>
                          <input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)}
                            disabled={!!savedBill}
                            className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-0.5 block">Rate (₹)</label>
                          <input type="number" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)}
                            disabled={!!savedBill}
                            className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white" />
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
                      <input type="text" value={item.description} onChange={e => updateCustomItem(idx, 'description', e.target.value)}
                        disabled={!!savedBill} placeholder="Item description"
                        className="flex-1 border border-orange-200 rounded px-2 py-1.5 text-xs focus:outline-none bg-white" />
                      {!savedBill && (
                        <button onClick={() => removeCustomItem(idx)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Qty</label>
                        <input type="number" value={item.qty} onChange={e => updateCustomItem(idx, 'qty', e.target.value)}
                          disabled={!!savedBill} className="w-full border border-orange-200 rounded px-2 py-1.5 text-xs bg-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Rate (₹)</label>
                        <input type="number" value={item.rate} onChange={e => updateCustomItem(idx, 'rate', e.target.value)}
                          disabled={!!savedBill} className="w-full border border-orange-200 rounded px-2 py-1.5 text-xs bg-white" />
                      </div>
                    </div>
                    <p className="text-xs text-right font-semibold text-orange-600">₹{(item.amount || 0).toLocaleString()}</p>
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

          {/* 3. Profit Tracking */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 mb-1 flex items-center gap-2">
              <span className="bg-purple-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">3</span>
              Profit Tracking
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full ml-1">Private</span>
            </h2>
            <p className="text-xs text-gray-400 mb-3">Not shown on bill — only for your records</p>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Your Cost Price (₹)</label>
              <input type="number" placeholder="How much did this job cost you?" value={costPrice}
                onChange={e => setCostPrice(e.target.value)} disabled={!!savedBill}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50 transition" />
            </div>
            {costPrice && (
              <div className="mt-3 bg-purple-50 rounded-lg p-3 flex justify-between text-sm">
                <span className="text-gray-600">Estimated Profit:</span>
                <span className="font-bold text-purple-600">₹{(total - parseFloat(costPrice || 0)).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Total Card */}
          <div className="bg-primary rounded-xl p-5 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-200 text-sm">Total Amount</p>
                <p className="text-3xl font-black mt-1">₹{total.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-xs">Items selected</p>
                <p className="text-2xl font-bold">{allBillItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — CASH MEMO PREVIEW */}
        <div>
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">📄 Live Preview</p>
              {savedBill && (
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                  ✅ Bill #{savedBill.billNo} Saved
                </span>
              )}
            </div>

            {/* CASH MEMO */}
            <div ref={printRef} id="cash-memo" className="bg-white border-2 border-gray-700 shadow-xl"
              style={{ fontFamily: "'Noto Sans Devanagari', 'Tiro Devanagari Marathi', sans-serif", fontSize: '11.5px' }}>

              {/* Header */}
              <div className="border-b-2 border-gray-700 p-3">
                <div className="flex justify-between items-start">
                  <span className="border border-gray-600 text-xs px-2 py-0.5 font-bold">कॅश मेमो</span>
                  <span className="font-semibold text-sm">|| श्री चिंतामणी प्रसन्न ||</span>
                  <div className="text-right text-xs leading-5">
                    <div>Mob : 9527370207</div>
                    <div>9970780137</div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <h1 className="font-black text-xl leading-tight" style={{ color: '#c0392b', fontFamily: 'Georgia, serif' }}>
                    चिंतामणी इलेक्ट्रिकल्स ॲण्ड मोटार वायडिंग
                  </h1>
                  <p className="text-xs text-gray-600 mt-0.5">आमच्याकडे सर्व प्रकारच्या मोटार वायडिंग व दुरुस्ती करुन मिळेल.</p>
                  <p className="text-xs text-gray-600">मु.पो.कुंजीरवाडी,(थेऊरफाटा),ता.हवेली,जि.पुणे– ४१२११०</p>
                  <p className="text-xs font-bold text-gray-700 mt-0.5">प्रोप्रा.:कैलास काळे</p>
                </div>
              </div>

              {/* Customer & Bill Info */}
              <div className="px-3 py-2 border-b border-gray-500 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">श्री.</span>
                    <span className="font-semibold border-b border-gray-500 flex-1 pb-0.5 min-h-[18px]">
                      {customer.name || ''}
                    </span>
                  </div>
                  {customer.address && <p className="text-xs text-gray-600 ml-6 mt-0.5">{customer.address}</p>}
                  {customer.mobile && <p className="text-xs text-gray-500 ml-6">📱 {customer.mobile}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-bold text-xs">बिल नं.</span>
                    <span className="font-black text-xl text-gray-800">{savedBill ? savedBill.billNo : '___'}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="font-bold text-xs">दि:</span>
                    <span className="text-xs">{dateStr}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-700 bg-gray-50">
                    <th className="border-r border-gray-400 py-2 px-1 text-center font-bold w-7">क्र.</th>
                    <th className="border-r border-gray-400 py-2 px-2 text-left font-bold">तपशील</th>
                    <th className="border-r border-gray-400 py-2 px-1 text-center font-bold w-14">नग</th>
                    <th className="border-r border-gray-400 py-2 px-1 text-center font-bold w-14">दर</th>
                    <th className="py-2 px-1 text-center font-bold w-20">रक्कम</th>
                  </tr>
                </thead>
                <tbody>
                  {allBillItems.length > 0 ? (
                    <>
                      {allBillItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-300">
                          <td className="border-r border-gray-300 py-2 px-1 text-center">{idx + 1}</td>
                          <td className="border-r border-gray-300 py-2 px-2">{item.description}</td>
                          <td className="border-r border-gray-300 py-2 px-1 text-center">{item.qty}</td>
                          <td className="border-r border-gray-300 py-2 px-1 text-center">
                            {item.rate ? parseFloat(item.rate).toLocaleString() : ''}
                          </td>
                          <td className="py-2 px-1 text-right font-semibold">
                            {item.amount ? `${parseFloat(item.amount).toLocaleString()}/-` : ''}
                          </td>
                        </tr>
                      ))}
                      {allBillItems.length < 7 && Array.from({ length: 7 - allBillItems.length }).map((_, i) => (
                        <tr key={`empty-${i}`} className="border-b border-gray-200">
                          <td className="border-r border-gray-200 py-3 px-1"></td>
                          <td className="border-r border-gray-200 py-3 px-2"></td>
                          <td className="border-r border-gray-200 py-3 px-1"></td>
                          <td className="border-r border-gray-200 py-3 px-1"></td>
                          <td className="py-3 px-1"></td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="border-r border-gray-200 py-3 px-1 text-center text-gray-200">{i + 1}</td>
                        <td className="border-r border-gray-200 py-3 px-2"></td>
                        <td className="border-r border-gray-200 py-3 px-1"></td>
                        <td className="border-r border-gray-200 py-3 px-1"></td>
                        <td className="py-3 px-1"></td>
                      </tr>
                    ))
                  )}
                  {/* Total Row */}
                  <tr className="border-t-2 border-gray-700">
                    <td colSpan={3} className="border-r border-gray-400 py-2 px-2">
                      <div className="border border-gray-500 p-1.5 inline-block rounded-sm" style={{ fontSize: '10px' }}>
                        <div className="font-bold">18 months warranty</div>
                        <div>Rs. 800 replacement charges</div>
                      </div>
                    </td>
                    <td className="border-r border-gray-400 py-2 px-1 text-center font-black text-sm" style={{ color: '#c0392b' }}>
                      एकूण
                    </td>
                    <td className="py-2 px-1 text-right font-black text-sm">
                      {total > 0 ? `${total.toLocaleString()}/-` : ''}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Footer */}
              <div className="border-t border-gray-400 flex justify-between items-end px-4 py-3">
                <div>
                  <p className="font-bold text-xs mb-1">ग्राहकाची सही</p>
                  <div className="w-28 border-b border-gray-500 mt-8"></div>
                </div>
                <div className="text-center">
                  <img src={signImg} alt="Sagar Kale Signature" className="h-12 object-contain mx-auto mb-0.5" />
                  <p className="font-bold" style={{ color: '#c0392b', fontSize: '10px' }}>
                    चिंतामणी इलेक्ट्रिकल्स ॲण्ड मोटार वायडिंग किरता
                  </p>
                </div>
              </div>
            </div>
            {/* End Cash Memo */}

            {/* Action Buttons */}
            {!savedBill ? (
              <button onClick={handleSave} disabled={loading}
                className="mt-4 w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition disabled:opacity-50 text-sm shadow-lg">
                {loading ? '⏳ Saving...' : '💾 Save & Generate Bill'}
              </button>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={handleWhatsApp} className="bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition text-sm shadow">
                  📱 Send on WhatsApp
                </button>
                <button onClick={handlePrint} className="bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition text-sm shadow">
                  🖨️ Print / Save PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cash-memo, #cash-memo * { visibility: visible !important; }
          #cash-memo {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 100vw !important;
            border: none !important;
            box-shadow: none !important;
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}