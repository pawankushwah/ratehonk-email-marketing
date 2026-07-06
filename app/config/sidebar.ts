import {
  Home,
  Send,
  Zap,
  FileText,
  Users,
  BarChart,
  Globe,
  PenTool,
  Puzzle,
  LifeBuoy,
  Settings,
  LucideIcon
} from "lucide-react";

export type MenuGroup = "main" | "bottom";

export interface MenuChild {
  id: string;
  label: string;
  href: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  group: MenuGroup;
  order: number;
  hasSubmenu?: boolean;
  children?: MenuChild[];
}

export const SIDEBAR_MENUS: MenuItem[] = [
  // Main Group
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/dashboard",
    group: "main",
    order: 1,
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Send,
    href: "/campaigns",
    group: "main",
    order: 2,
    hasSubmenu: true,
    children: [
      { id: "campaigns-email-templates", label: "Email Templates", href: "/campaigns/email-templates" },
    ]
  },
  {
    id: "automations",
    label: "Automations",
    icon: Zap,
    href: "/automations",
    group: "main",
    order: 3,
    hasSubmenu: true,
    children: [
      { id: "automations-flow-templates", label: "Flow Templates", href: "/automations/flow-templates" },
      { id: "automations-transactional", label: "Transactional", href: "/automations/transactional" },
    ]
  },
  {
    id: "forms",
    label: "Forms",
    icon: FileText,
    href: "/forms",
    group: "main",
    order: 4,
    hasSubmenu: true,
    children: [
      { id: "forms-other", label: "Other forms", href: "/forms/other" },
    ]
  },
  {
    id: "audience",
    label: "Audience",
    icon: Users,
    href: "/audience",
    group: "main",
    order: 5,
    hasSubmenu: true,
    children: [
      { id: "audience-dashboard", label: "Audience Dashboard", href: "/audience" },
      { id: "audience-tags", label: "Tags", href: "/audience/tags" },
      { id: "audience-segments", label: "Segments", href: "/audience/segments" },
      { id: "audience-surveys", label: "Surveys", href: "/audience/surveys" },
      { id: "audience-preferences", label: "Subscriber Preferences", href: "/audience/preferences" },
      { id: "audience-inbox", label: "Inbox", href: "/audience/inbox" },
    ]
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart,
    href: "/analytics",
    group: "main",
    order: 6,
    hasSubmenu: true,
    children: [
      { id: "analytics-reports", label: "Reports", href: "/analytics/reports" },
      { id: "analytics-conversion", label: "Conversion insights", href: "/analytics/conversion-insights" },
      { id: "analytics-custom", label: "Custom reports", href: "/analytics/custom-reports" },
    ]
  },
  {
    id: "website",
    label: "Website",
    icon: Globe,
    href: "/website",
    group: "main",
    order: 7,
    hasSubmenu: true,
    children: [
      { id: "website-settings", label: "Settings", href: "/website/settings" },
      { id: "website-reports", label: "Reports", href: "/website/reports" },
    ]
  },
  {
    id: "content",
    label: "Content",
    icon: PenTool,
    href: "/content",
    group: "main",
    order: 8,
    hasSubmenu: true,
    children: [
      { id: "content-creative", label: "Creative assistant", href: "/content/creative-assistant" },
      { id: "content-brand", label: "Brand kit", href: "/content/brand-kit" },
    ]
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Puzzle,
    href: "/integrations",
    group: "main",
    order: 9,
    hasSubmenu: true,
    children: [
      { id: "integrations-manage", label: "Manage", href: "/integrations/manage" },
    ]
  },

  // Bottom Group
  {
    id: "support",
    label: "Support",
    icon: LifeBuoy,
    href: "/support",
    group: "bottom",
    order: 1,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
    group: "bottom",
    order: 2,
  },
];
