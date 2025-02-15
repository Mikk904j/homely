
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Star, Shield } from "lucide-react";

export const MembersView = () => {
  const members = [
    {
      id: 1,
      name: "John Doe",
      role: "Admin",
      email: "john@example.com",
      phone: "+1 234 567 890",
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Smith",
      role: "Member",
      email: "sarah@example.com",
      phone: "+1 234 567 891",
      status: "active",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Household Members</h1>
          <p className="text-muted-foreground">Manage your household members and their permissions</p>
        </div>
        <Button className="animate-hover">
          Add Member
        </Button>
      </div>

      <div className="grid gap-6">
        {members.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-semibold flex items-center">
                    {member.name}
                    {member.role === "Admin" && (
                      <Shield className="h-4 w-4 text-primary ml-2" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{member.phone}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Member Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Members</span>
              <span className="font-medium">4</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Members</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending Invites</span>
              <span className="font-medium">1</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <p className="text-muted-foreground">Loading activity...</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
