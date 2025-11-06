"use client";

import React, { useState } from "react"; // Import useState
import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Sector, Cell } from "recharts"; // Import Cell for custom colors

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// 🟩 Your chart config (matches shadcn style)
const chartConfig = {
  value: {
    label: "People",
  },
  Male: {
    label: "Male",
    color: "hsl(220 89% 59%)", // Using HSL for better theme compatibility (example)
  },
  Female: {
    label: "Female",
    color: "hsl(220 89% 79%)",
  },
  Children: {
    label: "Children",
    color: "hsl(220 89% 89%)",
  },
  // Add other categories if needed in your data, e.g.:
  // Other: { label: "Other", color: "hsl(0 0% 80%)" },
};

export default function ChartPieDonutActive({
  data,
  title = "Donut Chart",
  description = "Gender Distribution",
  footerText = "Showing total distribution",
  trendingValue = "Trending up by 5.2% this month", // Example
}) {
  // Removed ChartPieDonutActiveProps interface here
  const [activeIndex, setActiveIndex] = useState(-1); // -1 means no slice is active

  // Function to handle hovering over a slice
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  // Calculate total value for the trending text if needed
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value" // ✅ Correct: matches `value` in your data objects
              nameKey="label" // ✅ Correct: matches `label` in your data objects
              innerRadius={60}
              outerRadius={80} // Give it some outer radius to draw
              strokeWidth={1} // Keep strokeWidth small or remove
              activeIndex={activeIndex} // Use state for active index
              activeShape={({ outerRadius = 0, ...props }) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
              onMouseEnter={onPieEnter} // Event listener for hover
              onMouseLeave={onPieLeave} // Event listener for hover out
            >
              {/* Assign colors from chartConfig dynamically */}
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartConfig[entry.label]?.color || "#cccccc"} // Pulls color based on label (e.g., "Male")
                  stroke={chartConfig[entry.label]?.color || "#cccccc"}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {trendingValue} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {footerText} (Total: {totalValue})
        </div>
      </CardFooter>
    </Card>
  );
}
