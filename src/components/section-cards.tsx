import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SectionCardsProps {
  todaysAppointments: number;
  appointmentsChange: number;
  newClients: number;
  clientsChange: number;
  pendingCases: number;
  casesChange: number;
  growthRate: number;
}

export function SectionCards({
  todaysAppointments,
  appointmentsChange,
  newClients,
  clientsChange,
  pendingCases,
  casesChange,
  growthRate,
}: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Link href="/appointments">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Today&apos;s Appointments</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {todaysAppointments}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {appointmentsChange >= 0 ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {appointmentsChange >= 0 ? "+" : ""}
                {appointmentsChange.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {appointmentsChange >= 0 ? "Trending up" : "Trending down"} this week{" "}
              {appointmentsChange >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              Compared to previous week
            </div>
          </CardFooter>
        </Card>
      </Link>
      <Link href="/clients">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>New Clients</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {newClients}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {clientsChange >= 0 ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {clientsChange >= 0 ? "+" : ""}
                {clientsChange.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {clientsChange >= 0 ? "Up" : "Down"} {Math.abs(clientsChange).toFixed(1)}% this period{" "}
              {clientsChange >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              Compared to previous 30 days
            </div>
          </CardFooter>
        </Card>
      </Link>
      <Link href="/cases">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Cases</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {pendingCases}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {casesChange >= 0 ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {casesChange >= 0 ? "+" : ""}
                {casesChange.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {casesChange >= 0 ? "Increased" : "Decreased"} by {Math.abs(casesChange).toFixed(1)}%{" "}
              {casesChange >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              Compared to 30 days ago
            </div>
          </CardFooter>
        </Card>
      </Link>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {growthRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {growthRate >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {growthRate >= 0 ? "+" : ""}
              {growthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {growthRate >= 0 ? "Trending up" : "Trending down"} this period
            {growthRate >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Growth Rate based on new clients
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
