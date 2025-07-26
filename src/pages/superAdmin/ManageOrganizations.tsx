import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Edit, Trash2, Search, Upload, X } from "lucide-react";
import { getOrganizations, createOrganization, updateOrganization, deleteOrganization, uploadOrganizationLogo } from "@/lib/superAdminApi";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Organization {
  id: number;
  name: string;
  description: string;
  logo?: string;
  org_admins_count?: number;
  created_at: string;
  updated_at: string;
}

export default function ManageOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deleteOrgId, setDeleteOrgId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Logo upload states
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await getOrganizations();
      // Ensure we're setting an array of organizations
      const orgsData = Array.isArray(response.data) ? response.data : [];
      setOrganizations(orgsData);
    } catch (err: any) {
      console.error('Load organizations error:', err);
      setError(err.message || 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFormErrors({ logo: 'Logo file size must be less than 5MB' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setFormErrors({ logo: 'Please select an image file' });
        return;
      }
      
      setSelectedLogo(file);
      setFormErrors({ ...formErrors, logo: '' });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setSelectedLogo(null);
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormErrors({ ...formErrors, logo: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      let organization;
      if (editingOrg) {
        organization = await updateOrganization(editingOrg.id, formData);
      } else {
        organization = await createOrganization(formData);
      }
      
      // Upload logo if a new file was selected
      if (selectedLogo && organization.data && 'id' in organization.data) {
        try {
          await uploadOrganizationLogo(organization.data.id, selectedLogo);
        } catch (logoErr: any) {
          console.error('Logo upload error:', logoErr);
          // Don't fail the whole operation for logo upload failure
          setFormErrors({ logo: 'Organization saved but logo upload failed. You can try uploading it again.' });
        }
      }
      
      await loadOrganizations();
      resetForm();
    } catch (err: any) {
      console.error('Submit error:', err);
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        setFormErrors({ general: err.message || 'Failed to save organization' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      description: org.description || ""
    });
    
    // Set existing logo as preview if it exists
    if (org.logo) {
      setLogoPreview(`http://localhost:8000${org.logo}`);
    } else {
      setLogoPreview('');
    }
    setSelectedLogo(null); // Clear selected file since we're showing existing logo
    
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteOrgId) return;

    try {
      await deleteOrganization(deleteOrgId);
      await loadOrganizations();
      setDeleteOrgId(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete organization');
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setFormErrors({});
    setEditingOrg(null);
    setShowForm(false);
    setSelectedLogo(null);
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Manage Organizations</h1>
          <p className="text-gray-600 mt-2">Create and manage organizations in the system</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
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
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {editingOrg ? "Edit Organization" : "Create Organization"}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {editingOrg ? "Update organization details" : "Add a new organization to the system"}
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
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Organization Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Organization Name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-colors ${
                        formErrors.name ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""
                      }`}
                    />
                    {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="Description (optional)"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-colors ${
                        formErrors.description ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""
                      }`}
                    />
                    {formErrors.description && <p className="text-red-600 text-sm mt-1">{formErrors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Logo (optional)
                    </Label>
                    <div className="space-y-3">
                      {logoPreview && (
                        <div className="relative inline-block">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                          {editingOrg?.logo && !selectedLogo && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-b-lg">
                              Current Logo
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <Upload size={16} />
                          {logoPreview ? (editingOrg?.logo && !selectedLogo ? 'Replace Logo' : 'Change Logo') : 'Upload Logo'}
                        </Button>
                        <span className="text-gray-500 text-sm">
                          Max 5MB, JPG/PNG
                        </span>
                      </div>
                    </div>
                    {formErrors.logo && <p className="text-red-600 text-sm mt-1">{formErrors.logo}</p>}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                    >
                      {isSubmitting ? "Saving..." : editingOrg ? "Update" : "Create"}
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
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Building2 className="h-5 w-5 text-gray-600" />
            Organizations ({filteredOrganizations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrganizations.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No organizations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrganizations.map((org) => (
                <div key={org.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Logo Display */}
                      <div className="flex-shrink-0">
                        {org.logo ? (
                          <img 
                            src={`http://localhost:8000${org.logo}`}
                            alt={`${org.name} logo`}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                            onError={(e) => {
                              // Hide image if it fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Organization Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{org.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{org.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Admins: {org.org_admins_count || 0}</span>
                          <span>Created: {new Date(org.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(org)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteOrgId(org.id)}
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
        isOpen={deleteOrgId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOrgId(null)}
        title="Delete Organization"
        message="Are you sure you want to delete this organization? This action cannot be undone and will also remove all associated org admins."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}