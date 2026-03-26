import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [history, setHistory]     = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading]     = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data);
    } catch { toast.error('Failed to load customers'); }
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [search]); // eslint-disable-line

  const loadHistory = async (customer) => {
    setSelected(customer);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/customers/${customer._id}`);
      setHistory(res.data.bills);
    } catch { toast.error('Failed to load history'); }
    setLoadingHistory(false);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Delete this customer and all their bills?')) return;
    try {
      // Delete all bills for this customer first
      const res = await api.get(`/customers/${customerId}`);
      for (const bill of res.data.bills) {
        await api.delete(`/bills/${bill._id}`);
      }
      toast.success('Customer and all bills deleted');
      setSelected(null);
      setHistory([]);
      fetchCustomers();
    } catch { toast.error('Delete failed'); }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm('Delete this bill?')) return;
    try {
      await api.delete(`/bills/${billId}`);
      toast.success('Bill deleted');
      // Refresh history
      if (selected) {
        const res = await api.get(`/customers/${selected._id}`);
        setHistory(res.data.bills);
        fetchCustomers();
      }
    } catch { toast.error('Delete failed'); }
  };

  const warrantyStatus = (expiry) => {
    const now    = new Date();
    const exp    = new Date(expiry);
    const days   = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    const months = Math.ceil(days / 30);
    if (days <= 0) return { label:'Expired (Warranty Expired)', color:'text-red-600', bg:'bg-red-50 border-red-200' };
    if (days <= 90) return { label:`${months} month${months>1?'s':''} left (Warranty)`, color:'text-yellow-700', bg:'bg-yellow-50 border-yellow-200' };
    return { label:`${months} months left (Warranty)`, color:'text-green-700', bg:'bg-green-50 border-green-200' };
  };

  const totalSpent = history.reduce((s, b) => s + (b.total || 0), 0);
  const activeBills = history.filter(b => new Date(b.warrantyExpiry) > new Date()).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <p className="text-gray-400 text-sm">{customers.length} customers found</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5 lg:h-[calc(100vh-160px)]">

        {/* LEFT: Customer list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden max-h-[45vh] lg:max-h-none">
          <div className="p-4 border-b border-gray-100">
            <input type="text" placeholder="Search by Name or Mobile..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <div className="text-3xl mb-2"></div>No customers found
              </div>
            ) : customers.map(c => (
              <div key={c._id} onClick={() => loadHistory(c)}
                className={`p-3 rounded-xl cursor-pointer border mb-2 transition ${selected?._id === c._id ? 'border-primary bg-blue-50 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${selected?._id === c._id ? 'bg-primary' : 'bg-gray-400'}`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">{c.name}</p>
                    <p className="text-gray-400 text-xs">Mobile No: {c.mobile}</p>
                    {c.address && <p className="text-gray-400 text-xs truncate">Location: {c.address}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Customer history */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[50vh] lg:min-h-0">
          {selected ? (
            <>
              {/* Customer header */}
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-black text-xl">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-800">{selected.name}</h2>
                      <p className="text-gray-500 text-sm mt-0.5">Mobile No: {selected.mobile}</p>
                      {selected.address && <p className="text-gray-400 text-xs">Location: {selected.address}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCustomer(selected._id)}
                    className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-200 transition self-start sm:self-auto">
                    Delete Customer
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <p className="text-2xl font-black text-primary">{history.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Bills</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <p className="text-xl font-black text-green-600">₹{totalSpent.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Spent</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <p className="text-2xl font-black text-blue-600">{activeBills}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Active Warranty</p>
                  </div>
                </div>
              </div>

              {/* Bill history */}
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Bill History</h3>
                {loadingHistory ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No bills for this customer</div>
                ) : (
                  <div className="space-y-3">
                    {history.map(bill => {
                      const ws = warrantyStatus(bill.warrantyExpiry);
                      return (
                        <div key={bill._id} className={`border rounded-xl p-4 ${ws.bg} transition`}>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-primary text-xl">#{bill.billNo}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ws.color} bg-white border`}>
                                  {ws.label}
                                </span>
                              </div>
                              <p className="text-gray-500 text-xs mt-1">
                                Date: {new Date(bill.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                              </p>
                              <p className="text-xs text-gray-400">
                                Warranty expires: {new Date(bill.warrantyExpiry).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="font-black text-xl text-gray-800">₹{bill.total?.toLocaleString('en-IN')}</p>
                              <p className="text-xs text-gray-400">{bill.items?.length} items</p>
                            </div>
                          </div>

                          {/* Items list */}
                          <div className="bg-white rounded-lg p-2 mb-3">
                            {bill.items?.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs py-1 border-b last:border-0 border-gray-50">
                                <span className="text-gray-600">{i+1}. {item.description}</span>
                                <span className="font-semibold text-gray-800">₹{item.amount?.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button onClick={() => {
                              const dateStr = new Date(bill.date).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' });
                              const msg = `Dear ${selected.name},\n\nShree Chintamani Electricals\nDate: ${dateStr}\nTotal: Rs. ${bill.total?.toLocaleString('en-IN')}\n\n01 year Warranty & Rs.800 Replacement Charges\nPlease Pay using Gpay/Phnepay : \nUPI No: 9527370207\nThank you....`;
                              window.open(`https://wa.me/91${selected.mobile}?text=${encodeURIComponent(msg)}`);
                            }} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-green-600 transition text-center">
                              WhatsApp
                            </button>
                            <button onClick={() => handleDeleteBill(bill._id)}
                              className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-200 transition">
                              Delete Bill
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-300">
              <div className="text-center">
                <div className="text-6xl mb-3">👈</div>
                <p className="text-lg font-semibold">Select a customer</p>
                <p className="text-sm">to view their complete history</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}