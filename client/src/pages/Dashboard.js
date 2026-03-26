import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null); // 🔥 NEW

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, billsRes] = await Promise.all([
          api.get('/bills/analytics'),
          api.get('/bills?limit=5'),
        ]);

        setStats(analyticsRes.data.overall);
        setMonthly(analyticsRes.data.monthly || []);
        setRecentBills(billsRes.data.bills);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthData = monthly.find(
    (m) => m._id.month === currentMonth && m._id.year === currentYear
  );

  const currentMonthProfit = currentMonthData?.totalProfit || 0;
  const totalProfitTillDate = stats?.totalProfit || 0;

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Welcome back{" "}
            <span className="font-semibold text-gray-700">
              {user?.name || "User"}
            </span>{" "}
            👋
          </p>
        </div>

        <button
          onClick={() => navigate("/bills/new")}
          className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition text-sm font-semibold"
        >
          New Bill
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-primary rounded-xl p-5 text-white shadow-lg">
          <div className="text-2xl font-black">{stats?.totalBills || 0}</div>
          <div className="text-blue-100 text-sm">Total Bills</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-2xl font-black">
            ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-green-100 text-sm">Total Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-2xl font-black">
            ₹{currentMonthProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-purple-100 text-sm">
            {now.toLocaleString('default', { month: 'long' })} Profit
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white shadow-lg">
          <div className="text-2xl font-black">
            ₹{totalProfitTillDate.toLocaleString('en-IN')}
          </div>
          <div className="text-orange-100 text-sm">Total Profit Till Date</div>
        </div>
      </div>

      {/* RECENT BILLS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Recent 5 Bills :
        </h2>

        <div className="space-y-3">
          {recentBills.map((bill) => (
            <div
              key={bill._id}
              onClick={() => setSelectedBill(bill)} // 🔥 CLICK
              className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="min-w-0">
                  <span className="font-black text-primary">
                    Bill No : {bill.billNo} 
                  </span>
                  <span className="sm:ml-2 font-semibold text-gray-700 block sm:inline truncate">
                    {bill.customer.name}
                  </span>
                </div>

                <span className="font-bold self-start sm:self-auto">
                  ₹{bill.total?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 BILL MODAL */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl p-4 sm:p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              Bill #{selectedBill.billNo}
            </h2>

            <p><b>Customer:</b> {selectedBill.customer.name}</p>
            <p><b>Mobile:</b> {selectedBill.customer.mobile}</p>
            <p><b>Date:</b> {new Date(selectedBill.date).toLocaleDateString('en-IN')}</p>

            <div className="mt-3">
              <h3 className="font-semibold mb-2">Items:</h3>
              {selectedBill.items.map((item, i) => (
                <div key={i} className="text-sm flex justify-between">
                  <span>{item.description}</span>
                  <span>₹{item.amount}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 font-bold text-right">
              Total: ₹{selectedBill.total}
            </div>

            <button
              onClick={() => setSelectedBill(null)}
              className="mt-4 w-full bg-primary text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}