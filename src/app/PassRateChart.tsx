
"use client"

import { useState, useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";

const initialChartData = [
  { country: "U.S.", rate: 60 },
  { country: "Non-U.S.", rate: 55 },
];

const chartConfig = {
  rate: {
    label: "Pass Rate (%)",
  },
  us: {
    label: "U.S. Students",
    color: "hsl(var(--primary))",
  },
  nonUs: {
    label: "Non-U.S. Students",
    color: "hsl(var(--accent))",
  },
};


export function PassRateChart() {
  const [chartData, setChartData] = useState(initialChartData);

  useEffect(() => {
    // This runs only on the client, after hydration, to avoid SSR errors
    // with CSS variables in data.
    setChartData([
      { country: "U.S.", rate: 60, fill: "var(--color-us)" },
      { country: "Non-U.S.", rate: 55, fill: "var(--color-nonUs)" },
    ]);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <YAxis dataKey="rate" tickLine={false} axisLine={false} tickMargin={8} unit="%" />
          <XAxis dataKey="country" tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="rate" radius={8} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
