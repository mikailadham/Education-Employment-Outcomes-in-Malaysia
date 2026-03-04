/**
 * EnrolmentBubbleChart - Bubble chart showing relationship between enrolment, teachers, and student-teacher ratio
 * X-axis: Total enrolment, Y-axis: Total teachers, Bubble size: Student-teacher ratio
 */

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';
import infrastructureData from '../data/education/infrastructure-by-state.json';

export default function EnrolmentBubbleChart() {
  // Transform data for bubble chart
  const chartData = Object.values(infrastructureData).map(state => ({
    state: state.state,
    enrolment: state.total_enrolment,
    teachers: state.total_teachers,
    ratio: state.student_teacher_ratio,
    schools: state.total_schools
  }));

  // Color palette for bubbles
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{data.state}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Total Enrolment:</span>
            <span className="font-bold">{data.enrolment.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Total Teachers:</span>
            <span className="font-bold">{data.teachers.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Student-Teacher Ratio:</span>
            <span className="font-bold">{data.ratio.toFixed(1)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Total Schools:</span>
            <span className="font-bold">{data.schools.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate statistics
  const avgRatio = (chartData.reduce((sum, d) => sum + d.ratio, 0) / chartData.length).toFixed(1);
  const maxEnrolment = Math.max(...chartData.map(d => d.enrolment));
  const maxTeachers = Math.max(...chartData.map(d => d.teachers));
  const minRatio = Math.min(...chartData.map(d => d.ratio)).toFixed(1);
  const maxRatio = Math.max(...chartData.map(d => d.ratio)).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Education Infrastructure by State (2022)
        </h3>
        <p className="text-sm text-gray-600">
          Bubble size represents student-teacher ratio. Hover over bubbles for detailed information.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="enrolment"
            name="Total Enrolment"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Total Enrolment (Students)',
              position: 'bottom',
              offset: 40,
              style: { fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }
            }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="number"
            dataKey="teachers"
            name="Total Teachers"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Total Teachers',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }
            }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <ZAxis type="number" dataKey="ratio" range={[100, 1000]} name="Student-Teacher Ratio" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={chartData} fill="#3b82f6">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 mb-1">Avg S-T Ratio</p>
          <p className="text-2xl font-bold text-blue-700">{avgRatio}</p>
          <p className="text-xs text-blue-600 mt-1">students per teacher</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-green-600 mb-1">Lowest Ratio</p>
          <p className="text-2xl font-bold text-green-700">{minRatio}</p>
          <p className="text-xs text-green-600 mt-1">better teacher access</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-xs text-orange-600 mb-1">Highest Ratio</p>
          <p className="text-2xl font-bold text-orange-700">{maxRatio}</p>
          <p className="text-xs text-orange-600 mt-1">more students per teacher</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs text-purple-600 mb-1">Total States</p>
          <p className="text-2xl font-bold text-purple-700">{chartData.length}</p>
          <p className="text-xs text-purple-600 mt-1">included in analysis</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Ministry of Education Malaysia, 2022 data
      </div>
    </div>
  );
}
