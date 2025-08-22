import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, XCircle, DollarSign, TrendingUp, Search, Download } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";

interface LogData {
  id: string;
  mc_number: string;
  load_id: string;
  final_rate: number;
  outcome: "accepted" | "declined" | "no_agreement";
  sentiment: "positive" | "neutral" | "negative";
  rounds: number;
  notes: string;
  created_at: string;
}

const OUTCOME_COLORS = {
  accepted: "#10b981",
  declined: "#ef4444", 
  no_agreement: "#f59e0b"
};

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#6b7280",
  negative: "#ef4444"
};

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs = [], isLoading, isError, error, refetch } = useQuery<LogData[]>({
    queryKey: ["/api/logs"],
    queryFn: async () => {
      const response = await fetch("https://hrfde-2.fly.dev/api/logs");
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    return logs.filter(log => 
      log.mc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.load_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.outcome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sentiment.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const stats = useMemo(() => {
    if (!logs.length) return { accepted: 0, declined: 0, avgFinalRate: 0, avgRounds: 0 };
    
    const accepted = logs.filter(log => log.outcome === "accepted").length;
    const declined = logs.filter(log => log.outcome === "declined").length;
    const avgFinalRate = logs.reduce((sum, log) => sum + log.final_rate, 0) / logs.length;
    const avgRounds = logs.reduce((sum, log) => sum + log.rounds, 0) / logs.length;

    return { accepted, declined, avgFinalRate, avgRounds };
  }, [logs]);

  const chartData = useMemo(() => {
    if (!logs.length) return { outcomeData: [], sentimentData: [], trendData: [] };

    // Outcome distribution
    const outcomeCounts = logs.reduce((acc, log) => {
      acc[log.outcome] = (acc[log.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const outcomeData = Object.entries(outcomeCounts).map(([outcome, count]) => ({
      name: outcome.replace('_', ' '),
      value: count,
      color: OUTCOME_COLORS[outcome as keyof typeof OUTCOME_COLORS]
    }));

    // Sentiment distribution
    const sentimentCounts = logs.reduce((acc, log) => {
      acc[log.sentiment] = (acc[log.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sentimentData = Object.entries(sentimentCounts).map(([sentiment, count]) => ({
      name: sentiment,
      value: count,
      color: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS]
    }));

    // Rate trend over time (group by day)
    const dailyRates = logs.reduce((acc, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { rates: [], date };
      }
      acc[date].rates.push(log.final_rate);
      return acc;
    }, {} as Record<string, { rates: number[], date: string }>);

    const trendData = Object.values(dailyRates)
      .map(({ rates, date }) => ({
        date,
        avgRate: rates.reduce((sum, rate) => sum + rate, 0) / rates.length
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days

    return { outcomeData, sentimentData, trendData };
  }, [logs]);

  const getSentimentBadgeClass = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'negative': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'neutral': return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
      default: return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };

  const getOutcomeBadgeClass = (outcome: string) => {
    switch(outcome) {
      case 'accepted': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'declined': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'no_agreement': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default: return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <span className="text-sm font-medium text-slate-700">John Doe</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-64 w-full" />
              </Card>
            ))}
          </div>

          <Card>
            <div className="px-6 py-4 border-b border-slate-200">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <span className="text-sm font-medium text-slate-700">John Doe</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="mt-1 text-sm text-red-700">
                  {error instanceof Error ? error.message : "Failed to fetch analytics data. Please try again."}
                </p>
              </div>
              <div className="ml-auto">
                <Button 
                  onClick={() => refetch()}
                  className="bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
                  variant="outline"
                  size="sm"
                  data-testid="button-retry"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <span className="text-sm font-medium text-slate-700">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Accepted</p>
                <p className="text-2xl font-bold text-slate-900" data-testid="text-accepted-count">
                  {stats.accepted.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Declined</p>
                <p className="text-2xl font-bold text-slate-900" data-testid="text-declined-count">
                  {stats.declined.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Avg Final Rate</p>
                <p className="text-2xl font-bold text-slate-900" data-testid="text-avg-rate">
                  {formatCurrency(stats.avgFinalRate)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Avg Rounds</p>
                <p className="text-2xl font-bold text-slate-900" data-testid="text-avg-rounds">
                  {stats.avgRounds.toFixed(1)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Outcome Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Outcome Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.outcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {chartData.outcomeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-600 capitalize">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {((item.value / logs.length) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Sentiment Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Sentiment Analysis</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {chartData.sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Final Rate Trend Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Rate Trend Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [formatCurrency(value), 'Avg Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgRate" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent Logs</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64"
                    data-testid="input-search"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">MC Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Load ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Final Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Outcome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rounds</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-slate-500">
                        {searchTerm ? "No logs found matching your search." : "No logs available."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50" data-testid={`row-log-${log.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900" data-testid={`text-mc-${log.id}`}>
                        {log.mc_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" data-testid={`text-load-${log.id}`}>
                        {log.load_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900" data-testid={`text-rate-${log.id}`}>
                        {formatCurrency(log.final_rate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={getOutcomeBadgeClass(log.outcome)}
                          data-testid={`badge-outcome-${log.id}`}
                        >
                          {log.outcome.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={getSentimentBadgeClass(log.sentiment)}
                          data-testid={`badge-sentiment-${log.id}`}
                        >
                          {log.sentiment}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" data-testid={`text-rounds-${log.id}`}>
                        {log.rounds}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" data-testid={`text-date-${log.id}`}>
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {filteredLogs.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredLogs.length, 50)}</span> of <span className="font-medium">{filteredLogs.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled={filteredLogs.length <= 50}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
