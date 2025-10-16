import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash2, Search, Building2 } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
        <Card>
          <CardHeader>
            <CardTitle>{editingAdmin ? 'Edit Org Admin' : 'Create Org Admin'}</CardTitle>
            <CardDescription>
              {editingAdmin ? 'Update org admin details' : 'Add a new organizational administrator'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {formErrors.general}
                </div>
              )}
              
              <div>
                <Input
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={formErrors.name ? 'border-red-300' : ''}
                />
                {formErrors.name && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={formErrors.email ? 'border-red-300' : ''}
                />
                {formErrors.email && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              {!editingAdmin && (
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={formErrors.password ? 'border-red-300' : ''}
                  />
                  {formErrors.password && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>
              )}

              <div>
                <Select
                  value={formData.organization_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, organization_id: value }))}
                >
                  <SelectTrigger className={formErrors.organization_id ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select Organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.organization_id && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.organization_id}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Saving...' : (editingAdmin ? 'Update' : 'Create')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
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
