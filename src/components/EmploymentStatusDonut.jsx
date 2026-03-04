/**
 * EmploymentStatusDonut - Employment by Status Breakdown
 * Shows distribution of employment types: employer, employee, own-account, unpaid family
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import employmentData from '../data/labour/employment-status-latest.json';

const COLORS = {
  employee: '#3b82f6',      // Blue - largest segment
  ownAccount: '#10b981',   // Green
  employer: '#f59e0b',      // Orange
  unpaidFamily: '#ef4444'  // Red
};

export default function EmploymentStatusDonut() {
  // Transform imported data for chart
  const chartData = [
    {
      name: 'Employee',
      value: employmentData.breakdown.employee.value,
      percentage: employmentData.breakdown.employee.percentage.toFixed(1),
      color: COLORS.employee,
      key: 'employee'
    },
    {
      name: 'Own Account Worker',
      value: employmentData.breakdown.ownAccount.value,
      percentage: employmentData.breakdown.ownAccount.percentage.toFixed(1),
      color: COLORS.ownAccount,
      key: 'ownAccount'
    },
    {
      name: 'Employer',
      value: employmentData.breakdown.employer.value,
      percentage: employmentData.breakdown.employer.percentage.toFixed(1),
      color: COLORS.employer,
      key: 'employer'
    },
    {
      name: 'Unpaid Family Worker',
      value: employmentData.breakdown.unpaidFamily.value,
      percentage: employmentData.breakdown.unpaidFamily.percentage.toFixed(1),
      color: COLORS.unpaidFamily,
      key: 'unpaidFamily'
    }
  ].sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value.toLocaleString()} thousand
          </p>
          <p className="text-sm font-bold" style={{ color: data.color }}>
            {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry) => {
    return `${entry.percentage}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Employment by Status
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Distribution of employed persons by employment status (Latest data: {employmentData.date})
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry) => (
              <span className="text-sm">
                {value}: <span className="font-semibold">{entry.payload.percentage}%</span>
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {chartData.map(item => (
          <div key={item.key} className="p-3 rounded" style={{ backgroundColor: `${item.color}10` }}>
            <p className="text-gray-600 text-xs">{item.name}</p>
            <p className="text-lg font-bold mt-1" style={{ color: item.color }}>
              {item.value.toLocaleString()}k
            </p>
            <p className="text-xs text-gray-500">{item.percentage}% of total</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          Total Employed: <span className="font-bold text-gray-900">{employmentData.totalEmployed.toLocaleString()} thousand</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Source: Department of Statistics Malaysia - Monthly Labour Force Survey
        </p>
      </div>
    </div>
  );
}
