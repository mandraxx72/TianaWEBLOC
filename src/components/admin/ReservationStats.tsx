import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { CalendarDays, Coins, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, differenceInDays } from "date-fns";
import { pt } from "date-fns/locale";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Reservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_name: string;
  room_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface ReservationStatsProps {
  reservations: Reservation[];
}

const ROOM_COLORS: Record<string, string> = {
  dunas: "hsl(var(--chart-1))",
  "baia-tranquila": "hsl(var(--chart-2))",
  "vista-mar": "hsl(var(--chart-3))",
  amplo: "hsl(var(--chart-4))",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "hsl(var(--chart-1))",
  pending: "hsl(var(--chart-2))",
  completed: "hsl(var(--chart-3))",
  cancelled: "hsl(var(--chart-4))",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmadas",
  pending: "Pendentes",
  completed: "Concluídas",
  cancelled: "Canceladas",
};

const ROOM_LABELS: Record<string, string> = {
  dunas: "Dunas",
  "baia-tranquila": "Baía Tranquila",
  "vista-mar": "Vista Mar",
  amplo: "Amplo",
};

export function ReservationStats({ reservations }: ReservationStatsProps) {
  const { formatAmountWithSecondary } = useCurrency();
  // Calculate the last 12 months range
  const months = useMemo(() => {
    const now = new Date();
    return eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 11),
      end: endOfMonth(now),
    });
  }, []);

  // Summary metrics
  const metrics = useMemo(() => {
    const totalReservations = reservations.length;
    const totalRevenue = reservations
      .filter(r => r.status !== "cancelled")
      .reduce((sum, r) => sum + r.total_price, 0);
    const confirmedCount = reservations.filter(r => r.status === "confirmed").length;
    const cancelledCount = reservations.filter(r => r.status === "cancelled").length;
    const totalNights = reservations
      .filter(r => r.status !== "cancelled")
      .reduce((sum, r) => sum + (r.nights || differenceInDays(parseISO(r.check_out), parseISO(r.check_in))), 0);
    
    // Assuming 4 rooms and calculating for the last 12 months
    const totalAvailableNights = 4 * 365;
    const occupancyRate = totalAvailableNights > 0 ? Math.round((totalNights / totalAvailableNights) * 100) : 0;

    return { totalReservations, totalRevenue, confirmedCount, cancelledCount, occupancyRate };
  }, [reservations]);

  // Monthly occupancy by room type
  const monthlyOccupancy = useMemo(() => {
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthLabel = format(month, "MMM", { locale: pt });

      const roomNights: Record<string, number> = {
        dunas: 0,
        "baia-tranquila": 0,
        "vista-mar": 0,
        amplo: 0,
      };

      reservations
        .filter(r => r.status !== "cancelled")
        .forEach(r => {
          const checkIn = parseISO(r.check_in);
          const checkOut = parseISO(r.check_out);
          
          // Check if reservation overlaps with this month
          if (checkOut >= monthStart && checkIn <= monthEnd) {
            const effectiveStart = checkIn < monthStart ? monthStart : checkIn;
            const effectiveEnd = checkOut > monthEnd ? monthEnd : checkOut;
            const nights = differenceInDays(effectiveEnd, effectiveStart);
            
            if (r.room_type && roomNights[r.room_type] !== undefined) {
              roomNights[r.room_type] += Math.max(0, nights);
            }
          }
        });

      return {
        month: monthLabel,
        ...roomNights,
      };
    });
  }, [reservations, months]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      confirmed: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
    };

    reservations.forEach(r => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({
        name: STATUS_LABELS[status] || status,
        value,
        fill: STATUS_COLORS[status] || "hsl(var(--chart-5))",
      }));
  }, [reservations]);

  // Monthly revenue
  const monthlyRevenue = useMemo(() => {
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthLabel = format(month, "MMM", { locale: pt });

      const revenue = reservations
        .filter(r => r.status !== "cancelled")
        .filter(r => {
          const checkIn = parseISO(r.check_in);
          return checkIn >= monthStart && checkIn <= monthEnd;
        })
        .reduce((sum, r) => sum + r.total_price, 0);

      return {
        month: monthLabel,
        revenue,
      };
    });
  }, [reservations, months]);

  const chartConfig = {
    dunas: { label: "Dunas", color: "hsl(var(--chart-1))" },
    "baia-tranquila": { label: "Baía Tranquila", color: "hsl(var(--chart-2))" },
    "vista-mar": { label: "Vista Mar", color: "hsl(var(--chart-3))" },
    amplo: { label: "Amplo", color: "hsl(var(--chart-4))" },
  };

  const revenueConfig = {
    revenue: { label: "Receita", color: "hsl(var(--chart-1))" },
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reservas</p>
                <p className="text-2xl font-bold">{metrics.totalReservations}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">{formatAmountWithSecondary(metrics.totalRevenue).primary}</p>
                <p className="text-sm text-muted-foreground">{formatAmountWithSecondary(metrics.totalRevenue).secondary}</p>
              </div>
              <Coins className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Ocupação</p>
                <p className="text-2xl font-bold">{metrics.occupancyRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">{metrics.confirmedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold text-red-600">{metrics.cancelledCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Occupancy Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ocupação Mensal por Quarto</CardTitle>
          <CardDescription>Noites ocupadas por tipo de quarto nos últimos 12 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={monthlyOccupancy} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="dunas" stackId="a" fill="var(--color-dunas)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="baia-tranquila" stackId="a" fill="var(--color-baia-tranquila)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="vista-mar" stackId="a" fill="var(--color-vista-mar)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="amplo" stackId="a" fill="var(--color-amplo)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Proporção de reservas por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita Mensal</CardTitle>
            <CardDescription>Receita por mês nos últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[250px] w-full">
              <LineChart data={monthlyRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />} 
                  formatter={(value: number) => [`€${value.toLocaleString()}`, "Receita"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-revenue)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-revenue)", strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
