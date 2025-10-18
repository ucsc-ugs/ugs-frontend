import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash2, Search, Building2, UserPlus } from 'lucide-react';
import { getOrgAdmins, createOrgAdmin, updateOrgAdmin, deleteOrgAdmin, getOrganizations } from "@/lib/superAdminApi";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface OrgAdmin {
  id: number;
  name: string;
  user_id: number;
  organization_id: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  organization: {
    id: number;
    name: string;
    description: string;
  };
}

interface Organization {
  id: number;
  name: string;
  description: string;
}

export default function ManageOrgAdmins() {
  const [orgAdmins, setOrgAdmins] = useState<OrgAdmin[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<OrgAdmin | null>(null);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organization_id: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [adminsResponse, orgsResponse] = await Promise.all([
        getOrgAdmins(),
        getOrganizations()
      ]);
  setOrgAdmins(adminsResponse.data as any || []);
  setOrganizations(orgsResponse.data as any || []);
    } catch (err: any) {
      console.error('Load data error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    try {
      if (editingAdmin) {
        await updateOrgAdmin(editingAdmin.id, {
          name: formData.name,
          email: formData.email,
          organization_id: parseInt(formData.organization_id)
        });
      } else {
        await createOrgAdmin({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          organization_id: parseInt(formData.organization_id)
        });
      }
            
      await loadData();
      resetForm();
    } catch (err: any) {
      console.error('Submit error:', err);
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        setFormErrors({ general: err.message || 'Failed to save org admin' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (admin: OrgAdmin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.user.email,
      password: "",
      organization_id: admin.organization_id.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteAdminId) return;
    try {
      await deleteOrgAdmin(deleteAdminId);
      await loadData();
      setDeleteAdminId(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete org admin');
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", organization_id: "" });
    setFormErrors({});
    setEditingAdmin(null);
    setShowForm(false);
  };

  const filteredOrgAdmins = orgAdmins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.organization.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selected organization display name for the Select trigger
  const selectedOrgName = organizations.find(o => o.id.toString() === formData.organization_id)?.name;

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Org Admins</h1>
          <p className="text-gray-600 mt-2">Create and manage organizational administrators</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Org Admin
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-white p-4 rounded-lg max-w-md w-full">
            <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {editingAdmin ? "Edit Org Admin" : "Create Org Admin"}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {editingAdmin ? "Update org admin details" : "Add a new organizational administrator"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formErrors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {formErrors.general}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className={`border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-colors ${
                        formErrors.name ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""
                      }`}
                    />
                    {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className={`border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-colors ${
                        formErrors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""
                      }`}
                    />
                    {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  {!editingAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        className={`border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-colors ${
                          formErrors.password ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""
                        }`}
                      />
                      {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="organisation" className="text-sm font-medium text-gray-700">
                      Organisation
                    </Label>
                    <Select
                      value={formData.organization_id}
                      displayValue={selectedOrgName}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, organization_id: value }))}
                    >
                      <SelectTrigger
                        className={`border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-colors ${
                          formErrors.organization_id ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <SelectValue placeholder="Select Organization" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.organization_id && <p className="text-red-600 text-sm mt-1">{formErrors.organization_id}</p>}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                    >
                      {isSubmitting ? "Saving..." : editingAdmin ? "Update" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search org admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Org Admins List */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Users className="h-5 w-5 text-gray-600" />
            Organizational Admins ({filteredOrgAdmins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrgAdmins.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No org admins found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrgAdmins.map((admin) => (
                <div key={admin.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                      <p className="text-gray-600 text-sm">{admin.user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600">{admin.organization.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(admin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteAdminId(admin.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteAdminId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteAdminId(null)}
        title="Delete Org Admin"
        message="Are you sure you want to delete this organizational admin? This will also delete their user account."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}