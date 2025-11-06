"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdmissionsDonutChart() {
  const data = [
    { label: "Male", value: 140, fill: "#6366f1" },
    { label: "Female", value: 110, fill: "#EAB300" },
    { label: "Children", value: 50, fill: "#E82646" },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-2 rounded-xl shadow-sm border border-gray-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[16px] font-semibold text-gray-800">
              Admissions
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              This Month
            </CardDescription>
          </div>
          <select className="border border-gray-200 rounded-md text-sm px-2 py-1 text-gray-600">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>

        <div className="flex justify-between space-x-4 mt-4 text-center">
          <div className="">
            <p className="text-[18px] font-semibold text-gray-800">140</p>
            <p className="text-xs text-gray-500">Male</p>
          </div>
          <div className="border-r-2 border-gray-300"></div>
          <div>
            <p className="text-[18px] font-semibold text-gray-800">110</p>
            <p className="text-xs text-gray-500">Female</p>
          </div>
          <div className="border-r-2 border-gray-300"></div>
          <div>
            <p className="text-[18px] font-semibold text-gray-800">50</p>
            <p className="text-xs text-gray-500">Children</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex flex-col items-center justify-center">
        <div className="w-[200px] h-[200px] relative">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                startAngle={90}
                endAngle={450}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ color: "#6b7280" }}
                formatter={(value, name) => [`${value} patients`, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-gray-800">{total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>

        <Button variant="outline" className="mt-4 text-sm rounded-lg">
          View All
        </Button>
      </CardContent>
    </Card>
  );
}
