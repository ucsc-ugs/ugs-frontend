import { useState, useEffect } from "react";
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Building2, BookOpen, PieChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";


interface RevenueData {
  total_revenue: number;
  total_commission: number;
  organization_revenues: Array<{
    id: number;
    name: string;
    revenue: number;
    commission: number;
    exam_count: number;
  }>;
  exam_revenues: Array<{
    id: number;
    name: string;
    organization_name: string;
    revenue: number;
    commission: number;
    attempt_count: number;
  }>;
  monthly_revenues: Array<{
    month: string;
    revenue: number;
    commission: number;
  }>;
}

export default function RevenueDashboard() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("all_time");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        
        if (!token) {
          setError("Authentication token not found");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/revenue?range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        // Normalize response to avoid runtime errors if some fields are missing
        const payload = response.data || {};
        setData({
          total_revenue: Number(payload.total_revenue ?? 0),
          total_commission: Number(payload.total_commission ?? 0),
          organization_revenues: Array.isArray(payload.organization_revenues) ? payload.organization_revenues : [],
          exam_revenues: Array.isArray(payload.exam_revenues) ? payload.exam_revenues : [],
          monthly_revenues: Array.isArray(payload.monthly_revenues) ? payload.monthly_revenues : [],
        });
         setError("");
      } catch (err: any) {
        console.error("Error fetching revenue data:", err);
        setError(err.response?.data?.message || "Failed to fetch revenue data");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading revenue data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">No data found.</p>
      </div>
    );
  }

  // Guarded local arrays to avoid runtime errors when mapping
  const orgs = data.organization_revenues ?? [];
  const exams = data.exam_revenues ?? [];
  const months = data.monthly_revenues ?? [];
  
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600 mt-2">Track earnings and commissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {["overview", "organizations", "exams"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "Overview" : tab === "organizations" ? "By Organization" : "By Exam"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(data.total_revenue)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Commission</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(data.total_commission)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Net Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(data.total_revenue - data.total_commission)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <PieChart className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                Revenue Trends
              </CardTitle>
              <CardDescription className="text-gray-600">
                Monthly revenue and commission breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" />
                  <Bar dataKey="commission" name="Commission" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === "organizations" && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Building2 className="h-5 w-5 text-gray-600" />
              Revenue by Organization
            </CardTitle>
            <CardDescription className="text-gray-600">
              Breakdown of revenue generated by each organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgs.map((org) => (
                  <TableRow key={org.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        {org.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.exam_count}</Badge>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(org.revenue)}
                    </TableCell>
                    <TableCell className="text-purple-600 font-medium">
                      {formatCurrency(org.commission)}
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {formatCurrency(org.revenue - org.commission)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Exams Tab */}
      {activeTab === "exams" && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BookOpen className="h-5 w-5 text-gray-600" />
              Revenue by Exam
            </CardTitle>
            <CardDescription className="text-gray-600">
              Breakdown of revenue generated by each exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        {exam.name}
                      </div>
                    </TableCell>
                    <TableCell>{exam.organization_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.attempt_count}</Badge>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(exam.revenue)}
                    </TableCell>
                    <TableCell className="text-purple-600 font-medium">
                      {formatCurrency(exam.commission)}
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {formatCurrency(exam.revenue - exam.commission)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Adjust Commission
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
