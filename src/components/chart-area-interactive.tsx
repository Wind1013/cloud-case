"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive line chart showing case and appointment trends";

interface ChartDataPoint {
  date: string;
  cases: number;
  appointments: number;
}

interface ChartAreaInteractiveProps {
  initialData?: ChartDataPoint[];
}

const chartConfig = {
  cases: {
    label: "Cases",
    color: "hsl(270, 70%, 50%)",
  },
  appointments: {
    label: "Appointments",
    color: "hsl(270, 60%, 60%)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({ initialData = [] }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    if (!initialData || initialData.length === 0) return [];
    
    const today = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0);
    
    return initialData.filter(item => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [timeRange, initialData]);

  const maxValue = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) return 10;
    const values = filteredData.flatMap(d => [d.cases || 0, d.appointments || 0]);
    return Math.max(...values, 10);
  }, [filteredData]);

  return (
    <Card className="@container/card border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Activity Overview
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              <span className="hidden @[540px]/card:block">
                Track your cases and appointments over time
              </span>
              <span className="@[540px]/card:hidden">Activity trends</span>
            </CardDescription>
          </div>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden gap-1 *:data-[slot=toggle-group-item]:!px-4 *:data-[slot=toggle-group-item]:!h-9 *:data-[slot=toggle-group-item]:text-sm @[767px]/card:flex"
            >
              <ToggleGroupItem value="90d" aria-label="Last 3 months">
                3M
              </ToggleGroupItem>
              <ToggleGroupItem value="30d" aria-label="Last 30 days">
                30D
              </ToggleGroupItem>
              <ToggleGroupItem value="7d" aria-label="Last 7 days">
                7D
              </ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-36 h-9 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="90d" className="rounded-md">
                  Last 3 months
                </SelectItem>
                <SelectItem value="30d" className="rounded-md">
                  Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-md">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-6 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <LineChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={timeRange === "7d" ? 8 : timeRange === "30d" ? 16 : 32}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={value => {
                const date = new Date(value);
                if (timeRange === "7d") {
                  return date.toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                }
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, Math.ceil(maxValue * 1.1)]}
              width={40}
            />
            <ChartTooltip
              cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  className="rounded-lg border bg-background shadow-lg"
                  labelFormatter={value => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  }}
                  indicator="line"
                  labelClassName="font-medium text-foreground"
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent className="mt-4 justify-center" />}
            />
            <Line
              dataKey="cases"
              type="monotone"
              stroke="hsl(270, 70%, 50%)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(270, 70%, 50%)" }}
            />
            <Line
              dataKey="appointments"
              type="monotone"
              stroke="hsl(270, 60%, 60%)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(270, 60%, 60%)" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
