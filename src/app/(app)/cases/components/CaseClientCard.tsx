import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Mail, Phone } from "lucide-react";
import React from "react";
import { User } from "@/generated/prisma";

const CaseClientCard = ({ client }: { client: User }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Client Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{client.name}</p>
            <p className="text-sm text-muted-foreground">
              Client ID: {client.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{client.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant="outline" className="text-xs">
              {client.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Email Verified
            </span>
            <Badge
              variant={client.emailVerified ? "default" : "destructive"}
              className="text-xs"
            >
              {client.emailVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button size="sm" className="flex-1 gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 bg-transparent"
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseClientCard;
