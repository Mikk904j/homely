
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Lock, Home, Palette, User, Shield } from "lucide-react";

export const SettingsView = () => {
  const settingSections = [
    {
      title: "Profile Settings",
      icon: User,
      description: "Manage your personal information and preferences",
      href: "#profile",
    },
    {
      title: "Household Settings",
      icon: Home,
      description: "Configure your household details and preferences",
      href: "#household",
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Customize your notification preferences",
      href: "#notifications",
    },
    {
      title: "Security",
      icon: Lock,
      description: "Manage security settings and permissions",
      href: "#security",
    },
    {
      title: "Appearance",
      icon: Palette,
      description: "Customize the look and feel of your dashboard",
      href: "#appearance",
    },
    {
      title: "Roles & Permissions",
      icon: Shield,
      description: "Manage member roles and access levels",
      href: "#roles",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your household preferences and configurations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingSections.map((section) => (
          <Card
            key={section.title}
            className="p-6 hover:shadow-lg transition-all duration-200 animate-hover"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <section.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  asChild
                >
                  <a href={section.href}>Configure</a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive email updates about household activities</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Dark Mode</h4>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Mobile Notifications</h4>
              <p className="text-sm text-muted-foreground">Configure push notification settings</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
