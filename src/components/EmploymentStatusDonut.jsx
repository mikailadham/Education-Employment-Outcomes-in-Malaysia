/**
 * EmploymentStatusDonut - Employment by Status Breakdown
 * Shows distribution of employment types: employer, employee, own-account, unpaid family
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const COLORS = {
  employee: '#3b82f6',      // Blue - largest segment
  own_account: '#10b981',   // Green
  employer: '#f59e0b',      // Orange
  unpaid_family: '#ef4444'  // Red
};

const STATUS_LABELS = {
  employer: 'Employer',
  employee: 'Employee',
  own_account: 'Own Account Worker',
  unpaid_family: 'Unpaid Family Worker'
};

export default function EmploymentStatusDonut() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load and parse CSV data
    fetch('/data/MONTHLY_SERIES/lfs_month_status.csv')
      .then(response => response.text())
      .then(csvText => {
        const parsed = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true
        });

        // Get latest month data (last row with 'persons' variable)
        const personRows = parsed.data.filter(row => row.variable === 'persons');
        const latestRow = personRows[personRows.length - 1];

        if (latestRow) {
          const totalEmployed = latestRow.employed;
          const chartData = [
            {
              name: STATUS_LABELS.employee,
              value: latestRow.employed_employee,
              percentage: (latestRow.employed_employee / totalEmployed * 100).toFixed(1),
              color: COLORS.employee,
              key: 'employee'
            },
            {
              name: STATUS_LABELS.own_account,
              value: latestRow.employed_own_account,
              percentage: (latestRow.employed_own_account / totalEmployed * 100).toFixed(1),
              color: COLORS.own_account,
              key: 'own_account'
            },
            {
              name: STATUS_LABELS.employer,
              value: latestRow.employed_employer,
              percentage: (latestRow.employed_employer / totalEmployed * 100).toFixed(1),
              color: COLORS.employer,
              key: 'employer'
            },
            {
              name: STATUS_LABELS.unpaid_family,
              value: latestRow.employed_unpaid_family,
              percentage: (latestRow.employed_unpaid_family / totalEmployed * 100).toFixed(1),
              color: COLORS.unpaid_family,
              key: 'unpaid_family'
            }
          ];

          // Sort by value descending
          chartData.sort((a, b) => b.value - a.value);

          setData(chartData);
          setTotal(totalEmployed);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error loading employment status data:', error);
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading employment status data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">No employment status data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Employment by Status
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Distribution of employed persons by employment status (Latest data: 2025)
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
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
        {data.map(item => (
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
          Total Employed: <span className="font-bold text-gray-900">{total.toLocaleString()} thousand</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Source: Department of Statistics Malaysia - Monthly Labour Force Survey
        </p>
      </div>
    </div>
  );
}
