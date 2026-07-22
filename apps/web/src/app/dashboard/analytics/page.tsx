'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  Award,
  BarChart3,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsDashboardPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/dashboard');
      return response.data.data;
    },
  });

  if (isLoading || !res) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-64 skeleton rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 skeleton rounded-2xl" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  const { summary, charts } = res;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-400" /> Executive Analytics & Intelligence
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time institutional performance metrics, revenue growth, pass rates, and attendance distribution
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Enrolled Students</p>
              <p className="text-2xl font-black">{summary.totalStudents}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Active Faculty</p>
              <p className="text-2xl font-black">{summary.totalFaculty}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Active Courses</p>
              <p className="text-2xl font-black">{summary.totalCourses}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Overall Attendance</p>
              <p className="text-2xl font-black text-yellow-400">{summary.overallAttendanceRate}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend Chart */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" /> Fee Collection Revenue Trend (INR)
            </CardTitle>
            <CardDescription>Monthly fee collections across all branches</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Bar dataKey="revenue" fill="hsl(245, 75%, 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Academic Pass Rate Trend */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" /> Academic Pass Percentage (%)
            </CardTitle>
            <CardDescription>Average student performance across recent exam terms</CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.passTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="test" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="passRate" stroke="#c084fc" fill="#c084fc" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
