import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import AdminProductForm, {
  type TemplateFormValues,
} from "@/components/AdminProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import {
  createTemplate,
  deleteTemplate,
  fetchAdminStats,
  fetchCurrentUser,
  fetchTemplates,
  fetchAdminUsers,
  login,
  logout,
  updateTemplate,
  updateAdminUserPremium,
} from "@/lib/api";
import type { UserAccount } from "@/lib/api";
import type { AdminStats, Template } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const currentUserQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    retry: false,
  });

  const currentUser = currentUserQuery.data ?? null;
  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.role === "admin";

  const templatesQuery = useQuery({
    queryKey: ["adminTemplates"],
    queryFn: () => fetchTemplates({ status: "all" }),
    enabled: isAdmin,
  });

  const statsQuery = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
    enabled: isAdmin,
  });

  const usersQuery = useQuery({
    queryKey: ["adminUsers"],
    queryFn: fetchAdminUsers,
    enabled: isAdmin,
  });

  useEffect(() => {
    if (usersQuery.isError) {
      toast({
        title: "Failed to load users",
        description: "We couldn't load user accounts. Please refresh and try again.",
        variant: "destructive",
      });
    }
  }, [usersQuery.isError, toast]);

  useEffect(() => {
    if (!isAdmin || typeof window === "undefined") {
      return;
    }

    const eventSource = new EventSource("/api/admin/stats/stream");

    const messageListener = (event: Event) => {
      if (!(event instanceof MessageEvent)) {
        return;
      }

      try {
        const payload = JSON.parse(event.data) as AdminStats;
        queryClient.setQueryData(["adminStats"], payload);
      } catch (error) {
        console.error("[Admin] Failed to parse admin stats event", error);
      }
    };

    const errorListener = () => {
      void queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    };

    eventSource.addEventListener("message", messageListener);
    eventSource.addEventListener("error", errorListener);

    return () => {
      eventSource.removeEventListener("message", messageListener);
      eventSource.removeEventListener("error", errorListener);
      eventSource.close();
    };
  }, [isAdmin, queryClient]);

  const loginMutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Welcome back",
        description: "You are now logged in.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Login failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.removeQueries({ queryKey: ["adminTemplates"] });
      queryClient.removeQueries({ queryKey: ["adminStats"] });
      queryClient.removeQueries({ queryKey: ["adminUsers"] });
      setShowProductForm(false);
      setSelectedTemplate(null);
    },
    onError: (error: unknown) => {
      toast({
        title: "Logout failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      const basePayload = {
        title: values.title,
        category: values.category,
        price: values.price,
        description: values.description,
        heroImage: values.images[0],
        galleryImages: values.images,
        videoUrl: values.videoUrl,
        liveDemoUrl: values.liveDemoUrl,
        figmaUrl: values.figmaUrl,
        tags: values.tags,
        features: values.features,
        status: values.status,
      };

      if (values.id) {
        return await updateTemplate(values.id, {
          id: values.id,
          ...basePayload,
        });
      }

      return await createTemplate(basePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      setShowProductForm(false);
      setSelectedTemplate(null);
      toast({
        title: "Template saved",
        description: "Your template changes have been published.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Failed to save template",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (template: Template) => deleteTemplate(template.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast({
        title: "Template deleted",
        description: "The template has been removed from the marketplace.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePremiumMutation = useMutation({
    mutationFn: ({
      userId,
      isPremium,
    }: {
      userId: string;
      isPremium: boolean;
    }) => updateAdminUserPremium(userId, { isPremium }),
    onMutate: (variables) => {
      setPendingUserId(variables.userId);
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: user.isPremium ? "Premium granted" : "Premium removed",
        description: `${user.username} now has ${user.isPremium ? "premium" : "standard"} access.`,
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Could not update premium status.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setPendingUserId(null);
    },
  });

  const handleLogin = ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    loginMutation.mutate({ username, password });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleAddProduct = () => {
    setSelectedTemplate(null);
    setShowProductForm(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowProductForm(true);
  };

  const handleDeleteTemplate = (template: Template) => {
    const confirmed = window.confirm(`Delete template "${template.title}"?`);
    if (confirmed) {
      deleteTemplateMutation.mutate(template);
    }
  };

  const handleFormCancel = () => {
    setShowProductForm(false);
    setSelectedTemplate(null);
  };

  const handleFormSubmit = async (values: TemplateFormValues) => {
    await saveTemplateMutation.mutateAsync(values);
  };

  const handleTogglePremium = (user: UserAccount) => {
    updatePremiumMutation.mutate({
      userId: user.id,
      isPremium: !user.isPremium,
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <AdminLogin
          onLogin={handleLogin}
          isSubmitting={loginMutation.isPending}
        />
      </>
    );
  }

  if (isAuthenticated && !isAdmin) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl font-display font-bold">Admin access required</h2>
            <p className="text-muted-foreground">
              You are signed in as <span className="font-semibold">{currentUser?.username}</span>,
              but this account does not have administrator permissions.
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Return home
          </Button>
        </div>
      </>
    );
  }

  if (showProductForm) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            onClick={handleFormCancel}
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <AdminProductForm
          initialTemplate={selectedTemplate}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={saveTemplateMutation.isPending}
        />
      </>
    );
  }

  const templates = templatesQuery.data?.data ?? [];
  const stats = statsQuery.data ?? null;

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <AdminDashboard
        products={templates}
        stats={stats}
        onAddProduct={handleAddProduct}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onLogout={handleLogout}
        users={usersQuery.data ?? []}
        onTogglePremium={handleTogglePremium}
        updatingUserId={pendingUserId}
      />
    </>
  );
}
