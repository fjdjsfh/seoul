import React from "react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

const BarChart = ({ data, height = 240 }) => {
  if (!data || data.length === 0) return null;

  const averageScore =
    data.reduce((sum, d) => sum + d.score, 0) / data.length;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ width: data.length * 40 }}>
        <ResponsiveContainer width="100%" height={height}>
          <ReBarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              angle={-45} // 👉 X축 라벨 기울이기
              textAnchor="end"
              interval={0}
            />
            <YAxis domain={[0, "dataMax + 500"]} />
            <Tooltip
              formatter={(value) => [`${value}점`, "점수"]}
              labelFormatter={(label) => `지역: ${label}`}
            />
            <ReferenceLine
              y={averageScore}
              stroke="#FF6347"
              strokeDasharray="5 5"
              strokeWidth={2} // 👉 평균선 두껍게
              label={{
                position: "top",
                value: `평균: ${Math.round(averageScore)}`,
                fontSize: 12,
                fill: "#FF6347",
                fontWeight: "bold",
              }}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#4A90E2" />
              ))}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;
