"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

export function TabsWrapper({
  activeContent,
  archivedContent,
}: {
  activeContent: ReactNode;
  archivedContent: ReactNode;
}) {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="active">{activeContent}</TabsContent>
      <TabsContent value="archived">{archivedContent}</TabsContent>
    </Tabs>
  );
}

