"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";

export default function OpdAppointmentsTrend() {
  const [range, setRange] = useState("today");

  const datasets = {
    today: [
      { time: "8 AM", appointments: 5 },
      { time: "9 AM", appointments: 8 },
      { time: "10 AM", appointments: 14 },
      { time: "11 AM", appointments: 20 },
      { time: "12 PM", appointments: 16 },
      { time: "1 PM", appointments: 9 },
      { time: "2 PM", appointments: 12 },
      { time: "3 PM", appointments: 15 },
      { time: "4 PM", appointments: 10 },
      { time: "5 PM", appointments: 6 },
      { time: "6 PM", appointments: 4 },
    ],
    week: [
      { time: "Mon", appointments: 45 },
      { time: "Tue", appointments: 52 },
      { time: "Wed", appointments: 64 },
      { time: "Thu", appointments: 70 },
      { time: "Fri", appointments: 60 },
      { time: "Sat", appointments: 40 },
      { time: "Sun", appointments: 20 },
    ],
    month: [
      { time: "Week 1", appointments: 180 },
      { time: "Week 2", appointments: 220 },
      { time: "Week 3", appointments: 260 },
      { time: "Week 4", appointments: 190 },
    ],
  };

  const data = datasets[range];

  return (
    <Card className="w-full h-full border border-gray-200 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-gray-800">
          OPD Daily Appointments Trend
        </CardTitle>

        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[130px] h-8 text-sm border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="h-[260px] px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient
                id="colorAppointments"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#E82646" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#E82646" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: "#6B7280"}}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="appointments"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
              }}
            />
            <Area
              type="linear"
              dataKey="appointments"
              stroke="#E82646"
              strokeWidth={1.5}
              fill="url(#colorAppointments)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
