import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get(`/customers?search=${search}`)
      .then(res => setCustomers(res.data))
      .catch(console.error);
  }, [search]);

  const loadHistory = async (customer) => {
    setSelected(customer);
    const res = await api.get(`/customers/${customer._id}`);
    setHistory(res.data.bills);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customers</h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Customer List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <input
            type="text"
            placeholder="🔍 Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="space-y-2">
            {customers.map((c) => (
              <div
                key={c._id}
                onClick={() => loadHistory(c)}
                className={`p-3 rounded-lg cursor-pointer border transition ${
                  selected?._id === c._id
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                <p className="text-gray-400 text-xs">📱 {c.mobile}</p>
                {c.address && <p className="text-gray-400 text-xs">📍 {c.address}</p>}
              </div>
            ))}
            {customers.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No customers found</p>
            )}
          </div>
        </div>

        {/* Bill History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          {selected ? (
            <>
              <h2 className="font-bold text-gray-800 mb-1">{selected.name}</h2>
              <p className="text-gray-400 text-sm mb-4">📱 {selected.mobile}</p>
              <h3 className="font-semibold text-sm text-gray-600 mb-3">Bill History</h3>
              <div className="space-y-2">
                {history.map((bill) => (
                  <div key={bill._id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary text-sm">#{bill.billNo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bill.warrantyStatus?.includes('Active')
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>{bill.warrantyStatus}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{new Date(bill.date).toLocaleDateString('en-IN')}</p>
                    <p className="font-semibold text-sm mt-1">₹{bill.total.toLocaleString()}</p>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-gray-400 text-sm">No bills for this customer</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[180px] xl:min-h-full text-gray-300 text-sm">
              👈 Select a customer to view history
            </div>
          )}
        </div>
      </div>
    </div>
  );
}