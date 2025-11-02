import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { getTodaysAppointmentsCount } from "@/actions/appointment";
import { getNewClientsCount } from "@/actions/users";
import { getPendingCasesCount } from "@/actions/cases";
import { getNewClientsGrowthRate } from "@/data/metrics";

export default async function Page() {
  const [appointmentsResponse, clientsResponse, casesResponse, growthRateResponse] = await Promise.all([
    getTodaysAppointmentsCount(),
    getNewClientsCount(),
    getPendingCasesCount(),
    getNewClientsGrowthRate(),
  ]);

  const todaysAppointments = appointmentsResponse.success ? appointmentsResponse.data : 0;
  const newClients = clientsResponse.success ? clientsResponse.data : 0;
  const pendingCases = casesResponse.success ? casesResponse.data : 0;
  const growthRate = growthRateResponse.success ? growthRateResponse.data : 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards
            todaysAppointments={todaysAppointments}
            newClients={newClients}
            pendingCases={pendingCases}
            growthRate={growthRate}
          />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}
