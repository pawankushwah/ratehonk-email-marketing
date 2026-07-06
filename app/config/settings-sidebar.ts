import {
  Globe,
  Building2,
  CreditCard,
  Users,
  ShieldCheck,
  Webhook
} from "lucide-react";
import { MenuItem } from "./sidebar";

export const SETTINGS_MENUS: MenuItem[] = [
  {
    id: "general",
    label: "General Settings",
    icon: Globe,
    href: "/settings/general",
    group: "main",
    order: 1,
  },
  {
    id: "organization",
    label: "Organization",
    icon: Building2,
    href: "/settings/organization",
    group: "main",
    order: 2,
  },
  {
    id: "billing",
    label: "Billing & Plans",
    icon: CreditCard,
    href: "/settings/billing",
    group: "main",
    order: 3,
  },
  {
    id: "team",
    label: "Team Management",
    icon: Users,
    href: "/settings/team",
    group: "main",
    order: 4,
  },
  {
    id: "sender",
    label: "Sender Auth",
    icon: ShieldCheck,
    href: "/settings/sender",
    group: "main",
    order: 5,
  },
  {
    id: "api",
    label: "API & Integrations",
    icon: Webhook,
    href: "/settings/api",
    group: "main",
    order: 6,
  },
];
