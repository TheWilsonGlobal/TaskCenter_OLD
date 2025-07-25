import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCog, Smartphone, Tablet, Download, Edit, Trash2, Plus, Upload } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useRef } from "react";
import type { Profile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ProfilesTab() {
  const [profileName, setProfileName] = useState("profile_custom");
  const [name, setName] = useState("Custom Profile");
  const [description, setDescription] = useState("New browser profile");
  const [userAgent, setUserAgent] = useState("chrome-linux");
  const [customUserAgent, setCustomUserAgent] = useState("");
  const [viewportWidth, setViewportWidth] = useState("1920");
  const [viewportHeight, setViewportHeight] = useState("1080");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en-US");
  const [useProxy, setUseProxy] = useState(false);
  const [proxyType, setProxyType] = useState("http");
  const [proxyHost, setProxyHost] = useState("");
  const [proxyPort, setProxyPort] = useState("");
  const [proxyUsername, setProxyUsername] = useState("");
  const [proxyPassword, setProxyPassword] = useState("");
  const [scriptSource, setScriptSource] = useState("editor");
  const [customScript, setCustomScript] = useState("");
  const [customField, setCustomField] = useState("{}");
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const createProfileMutation = useMutation({
    mutationFn: (profileData: any) => apiRequest("POST", "/api/profiles", profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setIsEditorOpen(false);
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, profileData }: { id: number; profileData: any }) => 
      apiRequest("PUT", `/api/profiles/${id}`, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setIsEditorOpen(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/profiles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Success",
        description: "Profile deleted successfully",
      });
    },
  });

  const resetForm = () => {
    setProfileName("profile_custom");
    setName("Custom Profile");
    setDescription("New browser profile");
    setUserAgent("chrome-linux");
    setCustomUserAgent("");
    setViewportWidth("1920");
    setViewportHeight("1080");
    setTimezone("America/New_York");
    setLanguage("en-US");
    setUseProxy(false);
    setProxyType("http");
    setProxyHost("");
    setProxyPort("");
    setProxyUsername("");
    setProxyPassword("");
    setScriptSource("editor");
    setCustomScript("");
    setCustomField("{}");
    setSelectedProfileId(null);
    setIsEditorOpen(true);
  };

  const loadProfileData = (profile: Profile) => {
      setProfileName(profile.name);
      setName(profile.name || "Custom Profile");
      setDescription(profile.description || "");
      setUserAgent(profile.userAgent || "chrome-linux");
      setCustomUserAgent(profile.customUserAgent || "");
      setViewportWidth(String(profile.viewportWidth || 1920));
      setViewportHeight(String(profile.viewportHeight || 1080));
      setTimezone(profile.timezone || "America/New_York");
      setLanguage(profile.language || "en-US");
      setUseProxy(profile.useProxy || false);
      setProxyType(profile.proxyType || "http");
      setProxyHost(profile.proxyHost || "");
      setProxyPort(profile.proxyPort || "");
      setProxyUsername(profile.proxyUsername || "");
      setProxyPassword(profile.proxyPassword || "");
      setScriptSource(profile.scriptSource || "editor");
      setCustomScript(profile.customScript || "");
      setCustomField(profile.customField || "{}");
      setSelectedProfileId(profile.id);
      setIsEditorOpen(true);
      
      toast({
        title: "Profile loaded",
        description: `${profile.name} configuration loaded for editing`,
      });
    } catch (error) {
      toast({
        title: "Error loading profile",
        description: "Failed to parse profile configuration",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast({
        title: "Profile name required",
        description: "Please enter a profile name",
        variant: "destructive",
      });
      return;
    }

    try {
      const customFields = JSON.parse(customField);
      
      const profileData = {
        name: name.trim(),
        description: description.trim(),
        userAgent,
        customUserAgent: customUserAgent.trim(),
        viewportWidth: parseInt(viewportWidth) || 1920,
        viewportHeight: parseInt(viewportHeight) || 1080,
        timezone,
        language,
        useProxy,
        proxyType,
        proxyHost: proxyHost.trim(),
        proxyPort: proxyPort.trim(),
        proxyUsername: proxyUsername.trim(),
        proxyPassword: proxyPassword.trim(),
        scriptSource,
        customScript: customScript.trim(),
        customField,
        content: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          userAgent,
          customUserAgent: customUserAgent.trim(),
          viewportWidth: parseInt(viewportWidth) || 1920,
          viewportHeight: parseInt(viewportHeight) || 1080,
          timezone,
          language,
          useProxy,
          proxyType,
          proxyHost: proxyHost.trim(),
          proxyPort: proxyPort.trim(),
          proxyUsername: proxyUsername.trim(),
          proxyPassword: proxyPassword.trim(),
          scriptSource,
          customScript: customScript.trim(),
          custom_fields: customFields
        }, null, 2)
      };

      if (selectedProfileId) {
        updateProfileMutation.mutate({ id: selectedProfileId, profileData });
      } else {
        createProfileMutation.mutate(profileData);
      }
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Custom fields must be valid JSON",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (profile: Profile) => {
    try {
      const response = await fetch(`/api/profiles/${profile.id}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${profile.name}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download profile",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteProfileMutation.mutate(id);
    }
  };

  const handleImportProfile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const profileConfig = JSON.parse(content);
        
        const importData = {
          name: profileConfig.name || "Imported Profile",
          description: profileConfig.description || "Imported profile configuration",
          userAgent: profileConfig.userAgent || "chrome-linux",
          customUserAgent: profileConfig.customUserAgent || "",
          viewportWidth: profileConfig.viewportWidth || 1920,
          viewportHeight: profileConfig.viewportHeight || 1080,
          timezone: profileConfig.timezone || "America/New_York",
          language: profileConfig.language || "en-US",
          useProxy: profileConfig.useProxy || false,
          proxyType: profileConfig.proxyType || "http",
          proxyHost: profileConfig.proxyHost || "",
          proxyPort: profileConfig.proxyPort || "",
          proxyUsername: profileConfig.proxyUsername || "",
          proxyPassword: profileConfig.proxyPassword || "",
          scriptSource: profileConfig.scriptSource || "editor",
          customScript: profileConfig.customScript || "",
          customField: JSON.stringify(profileConfig.custom_fields, null, 2),
          content
        };

        createProfileMutation.mutate(importData);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid JSON file or corrupted profile data",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const getDeviceIcon = (profile: Profile) => {
    if (profile.viewportWidth && profile.viewportWidth <= 500) return <Smartphone className="text-success h-5 w-5" />;
    if (profile.viewportWidth && profile.viewportWidth <= 1024) return <Tablet className="text-success h-5 w-5" />;
    return <UserCog className="text-success h-5 w-5" />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading profiles...</div>;
  }

  return (
    <>
      <Card>
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">Profile Configurations</h3>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleImportProfile}>
                <Upload className="h-4 w-4 mr-2" />
                Import Profile
              </Button>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Profile
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          {profiles.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No profiles created yet. Create your first browser profile to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">
                      {String(profile.id).padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell className="text-slate-600">
                      {profile.description || "No description"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(profile)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => loadProfileData(profile)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(profile.id)}
                          disabled={deleteProfileMutation.isPending}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProfileId ? "Edit Profile Configuration" : "Create New Profile"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Custom Profile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="New browser profile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">User Agent</label>
              <Select value={userAgent} onValueChange={setUserAgent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chrome-linux">Chrome Linux</SelectItem>
                  <SelectItem value="chrome-windows">Chrome Windows</SelectItem>
                  <SelectItem value="firefox-linux">Firefox Linux</SelectItem>
                  <SelectItem value="safari-mac">Safari Mac</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Viewport Width</label>
                <Input
                  type="number"
                  value={viewportWidth}
                  onChange={(e) => setViewportWidth(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Viewport Height</label>
                <Input
                  type="number"
                  value={viewportHeight}
                  onChange={(e) => setViewportHeight(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                <Input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="America/New_York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <Input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="en-US"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Custom Field (JSON)</label>
              <Textarea
                value={customField}
                onChange={(e) => setCustomField(e.target.value)}
                placeholder='{"key": "value"}'
                className="h-32 font-mono text-sm"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleSaveProfile}
                disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                className="flex-1"
              >
                {(createProfileMutation.isPending || updateProfileMutation.isPending) 
                  ? "Saving..." 
                  : selectedProfileId 
                    ? "Update Profile" 
                    : "Create Profile"}
              </Button>
              <Button variant="secondary" onClick={() => {
                resetForm();
                setIsEditorOpen(false);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />
    </>
  );
}