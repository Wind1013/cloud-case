import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { getTodaysAppointmentsCount, getAppointmentsChangePercentage, getAppointmentsChartData } from "@/actions/appointment";
import { getNewClientsCount } from "@/actions/users";
import { getPendingCasesCount, getCasesChangePercentage, getCasesChartData } from "@/actions/cases";
import { getNewClientsGrowthRate, getNewClientsChangePercentage } from "@/data/metrics";

export default async function Page() {
  const [
    appointmentsResponse,
    appointmentsChangeResponse,
    clientsResponse,
    clientsChangeResponse,
    casesResponse,
    casesChangeResponse,
    growthRateResponse,
    casesChartResponse,
    appointmentsChartResponse,
  ] = await Promise.all([
    getTodaysAppointmentsCount(),
    getAppointmentsChangePercentage(),
    getNewClientsCount(),
    getNewClientsChangePercentage(),
    getPendingCasesCount(),
    getCasesChangePercentage(),
    getNewClientsGrowthRate(),
    getCasesChartData(90),
    getAppointmentsChartData(90),
  ]);

  const todaysAppointments = appointmentsResponse.success
    ? (appointmentsResponse.data as number)
    : 0;
  const appointmentsChange = appointmentsChangeResponse.success
    ? (appointmentsChangeResponse.data as number)
    : 0;
  const newClients = clientsResponse.success
    ? (clientsResponse.data as number)
    : 0;
  const clientsChange = clientsChangeResponse.success
    ? (clientsChangeResponse.data as number)
    : 0;
  const pendingCases = casesResponse.success
    ? (casesResponse.data as number)
    : 0;
  const casesChange = casesChangeResponse.success
    ? (casesChangeResponse.data as number)
    : 0;
  const growthRate = growthRateResponse.success
    ? (growthRateResponse.data as number)
    : 0;

  // Merge cases and appointments chart data
  const casesData = casesChartResponse.success
    ? (casesChartResponse.data as Array<{ date: string; cases: number }>)
    : [];
  const appointmentsData = appointmentsChartResponse.success
    ? (appointmentsChartResponse.data as Array<{ date: string; appointments: number }>)
    : [];

  // Create a map to merge data by date
  const dataMap = new Map<string, { date: string; cases: number; appointments: number }>();

  // Add cases data
  casesData.forEach((item) => {
    dataMap.set(item.date, { date: item.date, cases: item.cases, appointments: 0 });
  });

  // Add appointments data
  appointmentsData.forEach((item) => {
    const existing = dataMap.get(item.date);
    if (existing) {
      existing.appointments = item.appointments;
    } else {
      dataMap.set(item.date, { date: item.date, cases: 0, appointments: item.appointments });
    }
  });

  // Convert to array and sort by date
  const chartData = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards
            todaysAppointments={todaysAppointments}
            appointmentsChange={appointmentsChange}
            newClients={newClients}
            clientsChange={clientsChange}
            pendingCases={pendingCases}
            casesChange={casesChange}
            growthRate={growthRate}
          />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive initialData={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
}
