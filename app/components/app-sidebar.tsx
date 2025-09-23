import { Archive, Calendar, ChevronDown, Home, Inbox, PartyPopper, Search, Send, Settings, Trophy, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { Link } from "@tanstack/react-router"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

// Menu items.
const mail_items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Eingegangen",
    url: "/mails",
    icon: Inbox,
  },
  {
    title: "Gesendet",
    url: "/prank",
    icon: Send,
  },
  {
    title: "Entwürfe",
    url: "/prank",
    icon: Archive,
  },
]

const club_items = [
  {
    title: "Trainingszeiten",
    url: "/training-times",
    icon: Calendar,
  },
  {
    title: "Turnierinfo",
    url: "/prank",
    icon: Trophy,
  },
  {
    title: "Trainer",
    url: "/trainer",
    icon: Users,
  },
  {
    title: "Neuzugang",
    url: "/freshman",
    icon: PartyPopper,
  }
]

export function AppSidebar() {
  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mailbox</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mail_items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
            <SidebarGroupLabel asChild>
            <CollapsibleTrigger>
                Verein
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
            <SidebarGroupContent>
                <SidebarMenu>
                {club_items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                        <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            </SidebarGroupContent>
            </CollapsibleContent>
        </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  )
}