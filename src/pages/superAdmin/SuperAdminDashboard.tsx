import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, GraduationCap, TrendingUp, Calendar, Activity } from "lucide-react";
import { getSuperAdminDashboard } from "@/lib/superAdminApi";

interface DashboardStats {
  total_organizations: number;
  total_org_admins: number;
  total_students: number;
  recent_organizations: Array<{
    id: number;
    name: string;
    description: string;
    created_at: string;
  }>;
  recent_org_admins: Array<{
    id: number;
    name: string;
    user: { name: string; email: string };
    organization: { name: string };
    created_at: string;
  }>;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await getSuperAdminDashboard();
      setStats(response.data);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Card className="border-red-200 bg-white">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of the University Gateway System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Organizations</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_organizations || 0}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Org Admins</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_org_admins || 0}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_students || 0}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Organizations */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Building2 className="h-5 w-5 text-gray-600" />
              Recent Organizations
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest organizations added to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent_organizations?.length ? (
                stats.recent_organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{org.name}</p>
                      <p className="text-sm text-gray-500">{org.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(org.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No organizations found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Org Admins */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5 text-gray-600" />
              Recent Org Admins
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest organizational administrators added
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent_org_admins?.length ? (
                stats.recent_org_admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{admin.user.name}</p>
                      <p className="text-sm text-gray-500">{admin.user.email}</p>
                      <p className="text-xs text-blue-600">{admin.organization.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(admin.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No org admins found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Activity className="h-5 w-5 text-gray-600" />
            System Status
          </CardTitle>
          <CardDescription className="text-gray-600">
            Current system health and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">System Status</p>
                <p className="text-sm text-green-600">Operational</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Growth Rate</p>
                <p className="text-sm text-blue-600">+15% this month</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Active Users</p>
                <p className="text-sm text-purple-600">{(stats?.total_students || 0) + (stats?.total_org_admins || 0)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
