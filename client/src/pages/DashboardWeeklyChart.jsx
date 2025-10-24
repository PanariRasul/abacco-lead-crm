import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { toZonedTime } from "date-fns-tz";

const USA_TZ = "America/Chicago";

const DashboardWeeklyChart = ({ leads }) => {
  // ✅ Normalize every lead date to Central USA timezone (strip time)
  const normalizeDate = (dateStr) => {
    const d = toZonedTime(new Date(dateStr), USA_TZ);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  // ✅ Current CST date
  const nowUSA = toZonedTime(new Date(), USA_TZ);
  const currentYear = nowUSA.getFullYear();
  const currentMonth = nowUSA.getMonth();

  // ✅ Filter this month’s leads (CST)
  const monthlyLeads = leads.filter((l) => {
    const d = normalizeDate(l.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // ✅ Define month range in CST
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // ✅ Prepare weekly buckets (Sun → Sat)
  const weeks = [];
  let weekStart = new Date(firstDayOfMonth);
  let currentWeekIndex = -1;

  while (weekStart <= lastDayOfMonth) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd > lastDayOfMonth) weekEnd.setDate(lastDayOfMonth.getDate());

    const count = monthlyLeads.filter((l) => {
      const d = normalizeDate(l.date);
      return d >= weekStart && d <= weekEnd;
    }).length;

    const isCurrentWeek = nowUSA >= weekStart && nowUSA <= weekEnd;
    if (isCurrentWeek) currentWeekIndex = weeks.length;

    weeks.push({
      week: `Week ${weeks.length + 1}`,
      leads: count,
      isCurrent: isCurrentWeek,
    });

    weekStart.setDate(weekStart.getDate() + 7);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold mb-4">
        Weekly Trend (Central USA Time)
      </h2>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={weeks}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="week" />
          <YAxis allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: "10px",
              border: "1px solid #eee",
            }}
          />
          <defs>
            <linearGradient id="weekGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="leads"
            stroke="#7c3aed"
            strokeWidth={3}
            fill="url(#weekGradient)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

          {/* 🟣 Highlight current week */}
          {currentWeekIndex >= 0 && (
            <circle
              cx={(currentWeekIndex + 0.5) * (100 / weeks.length) + "%"}
              cy="50%"
              r="7"
              fill="#7c3aed"
              className="animate-pulse"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardWeeklyChart;
