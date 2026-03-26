import { useEffect, useState } from "react";
import api from "../utils/api";

const MONTHS = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Analytics() {
  const [data, setData] = useState({ monthly: [], overall: null });
  const [allBills, setAllBills] = useState([]);
  const [calDate, setCalDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayBills, setDayBills] = useState([]);

  useEffect(() => {
    api
      .get("/bills/analytics")
      .then((res) => setData(res.data))
      .catch(console.error);
    api
      .get("/bills?limit=1000")
      .then((res) => setAllBills(res.data.bills))
      .catch(console.error);
  }, []);

  // Build a map: "YYYY-MM-DD" → [bills]
  const billsByDate = allBills.reduce((map, bill) => {
    const d = new Date(bill.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!map[key]) map[key] = [];
    map[key].push(bill);
    return map;
  }, {});

  const year = calDate.getFullYear();
  const month = calDate.getMonth(); // 0-indexed
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const calCells = [];
  for (let i = 0; i < firstDay; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);

  const handleDayClick = (day) => {
    if (!day) return;
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const bills = billsByDate[key] || [];
    setSelectedDay({ day, key, bills });
    setDayBills(bills);
  };

  const prevMonth = () => setCalDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalDate(new Date(year, month + 1, 1));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics & Profit</h1>
        <p className="text-gray-400 text-sm">
          Track your revenue, profit and bills day by day
        </p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl mb-1"></div>
          <div className="text-2xl font-black">
            ₹{(data.overall?.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-green-100 text-sm">Total Revenue</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl mb-1"></div>
          <div className="text-2xl font-black">
            ₹{(data.overall?.totalProfit || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-purple-100 text-sm">Total Profit</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-primary rounded-xl p-5 text-white shadow-lg">
          <div className="text-3xl mb-1"></div>
          <div className="text-2xl font-black">
            {data.overall?.totalBills || 0}
          </div>
          <div className="text-blue-100 text-sm">Total Bills</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4 gap-2">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center font-bold text-gray-600"
            >
              ‹
            </button>
            <h2 className="font-black text-gray-800 text-base sm:text-lg text-center">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center font-bold text-gray-600"
            >
              ›
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs text-gray-400 font-semibold py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {calCells.map((day, idx) => {
              if (!day) return <div key={`e${idx}`} />;
              const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const bills = billsByDate[key] || [];
              const isToday =
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;
              const isSelected = selectedDay?.day === day;
              const hasBills = bills.length > 0;
              const dayRevenue = bills.reduce((s, b) => s + (b.total || 0), 0);

                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`
                        rounded-lg cursor-pointer transition p-1 min-h-[44px] flex flex-col items-center justify-start
                        ${isSelected ? "bg-primary text-white" : isToday ? "bg-blue-50 border-2 border-primary" : hasBills ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"}
                      `}
                    >
                      <span
                        className={`text-xs font-bold ${isSelected ? "text-white" : isToday ? "text-primary" : "text-gray-700"}`}
                      >
                        {day}
                      </span>
                      {hasBills && (
                        <div
                          className={`mt-0.5 text-center ${isSelected ? "text-white" : "text-green-700"}`}
                        >
                          <div
                            className={`text-xs font-black leading-none ${isSelected ? "text-white" : "text-green-600"}`}
                          >
                            {bills.length}
                          </div>
                          <div
                            style={{ fontSize: "8px" }}
                            className={`${isSelected ? "text-green-100" : "text-green-500"} font-semibold`}
                          >
                            ₹
                            {dayRevenue >= 1000
                              ? `${(dayRevenue / 1000).toFixed(1)}k`
                              : dayRevenue}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-100 inline-block"></span>{" "}
              Has bills
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-primary inline-block"></span>{" "}
              Selected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border-2 border-primary inline-block"></span>{" "}
              Today
            </span>
          </div>
        </div>

        {/* Day detail */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          {selectedDay ? (
            <>
              <h3 className="font-black text-gray-800 text-lg mb-1">
                {selectedDay.day} {MONTH_NAMES[month]} {year}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {dayBills.length > 0
                  ? `${dayBills.length} bill${dayBills.length > 1 ? "s" : ""} — Total: ₹${dayBills.reduce((s, b) => s + b.total, 0).toLocaleString("en-IN")}`
                  : "No bills on this day"}
              </p>
              {dayBills.length === 0 ? (
                <div className="text-center py-8 text-gray-300">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm">No bills generated</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayBills.map((bill) => (
                    <div
                      key={bill._id}
                      className="border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div className="min-w-0">
                          <span className="font-black text-primary">
                            Bill No: {bill.billNo}
                          </span>
                          <span className="text-gray-700 font-semibold sm:ml-2 block sm:inline">
                            - {bill.customer.name}
                          </span>
                        </div>
                        <span className="font-black text-gray-800 self-start sm:self-auto">
                          ₹{bill.total?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Mobile No: {bill.customer.mobile}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {bill.items?.slice(0, 3).map((item, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                          >
                            {item.description}
                          </span>
                        ))}
                        {bill.items?.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{bill.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <div className="text-center">
                <div className="text-5xl mb-2">📅</div>
                <p className="text-sm font-semibold">Click on a date</p>
                <p className="text-xs">to see bills for that day</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4 text-lg">
          Monthly Breakdown
        </h2>
        {data.monthly.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No data yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
                  <th className="pb-3">Month</th>
                  <th className="pb-3">Bills</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Net Profit</th>
                  <th className="pb-3">Margin</th>
                </tr>
              </thead>
              <tbody>
                {data.monthly.map((m) => {
                  const margin =
                    m.totalRevenue > 0
                      ? Math.round((m.totalProfit / m.totalRevenue) * 100)
                      : 0;
                  return (
                    <tr
                      key={`${m._id.year}-${m._id.month}`}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 font-semibold text-gray-800">
                        {MONTHS[m._id.month]} {m._id.year}
                      </td>
                      <td className="py-3">
                        <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">
                          {m.totalBills}
                        </span>
                      </td>
                      <td className="py-3 text-green-600 font-bold">
                        ₹{m.totalRevenue.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-purple-600 font-bold">
                        ₹{m.totalProfit.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${Math.min(margin, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {margin}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
