"use client";

import * as React from "react";
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronDown,
  Database,
  FileText,
  FolderDot,
  Layers,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { app1User } from "@/components/ui/app-1-utils/app-1-data";

export function App1Sidebar() {
  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="border-b px-4 py-3.5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Database className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-foreground tracking-tight">
                SupaHub
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Database Hub
              </span>
            </div>
          </Link>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            v1.0
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 space-y-4">
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted">
            <FolderDot className="h-4 w-4" />
            <span>Projets</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted">
            <CheckSquare className="h-4 w-4" />
            <span>Tâches</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted">
            <Users className="h-4 w-4" />
            <span>Équipe</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </button>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 border">
          <Avatar className="h-8 w-8">
            <AvatarImage src={app1User.avatar} alt={app1User.name} />
            <AvatarFallback>{app1User.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate leading-none">
              {app1User.name}
            </p>
            <p className="text-[10px] text-muted-foreground truncate mt-1">
              {app1User.email}
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Déconnexion"
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
