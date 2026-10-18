import {
  BadgeCheck,
  BarChart3,
  Boxes,
  CalendarClock,
  CalendarRange,
  CircleUserRound,
  Gauge,
  LifeBuoy,
  Megaphone,
  MessagesSquare,
  PackageCheck,
  Receipt,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Users,
  Wallet,
  LayoutDashboard,
} from "lucide-react";
import type { NavItem } from "./shell";

const i = "size-4";

/** `primary` items live in the mobile bottom bar; everything else goes in the menu. */
export const vendorNav: NavItem[] = [
  { label: "Home", to: "/vendor", icon: <Gauge className={i} />, primary: true },
  { label: "Orders", to: "/vendor/orders", icon: <PackageCheck className={i} />, primary: true },
  { label: "Products", to: "/vendor/products", icon: <Store className={i} />, primary: true },
  { label: "Chats", to: "/vendor/messages", icon: <MessagesSquare className={i} />, primary: true },
  { label: "Profile", to: "/vendor/profile", icon: <CircleUserRound className={i} />, primary: true },
  { label: "Services", to: "/vendor/services", icon: <CalendarClock className={i} /> },
  { label: "Bookings", to: "/vendor/bookings", icon: <CalendarRange className={i} /> },
  { label: "Customers", to: "/vendor/customers", icon: <Users className={i} /> },
  { label: "Inventory", to: "/vendor/inventory", icon: <Boxes className={i} /> },
  { label: "Transactions", to: "/vendor/transactions", icon: <Receipt className={i} /> },
  { label: "Payouts", to: "/vendor/payouts", icon: <Wallet className={i} /> },
  { label: "Promotions", to: "/vendor/promotions", icon: <Megaphone className={i} /> },
  { label: "Reviews", to: "/vendor/reviews", icon: <Star className={i} /> },
  { label: "Analytics", to: "/vendor/analytics", icon: <BarChart3 className={i} /> },
  { label: "Verification", to: "/vendor/verification", icon: <BadgeCheck className={i} /> },
  { label: "Store settings", to: "/vendor/settings", icon: <Settings className={i} /> },
  { label: "Support", to: "/vendor/support", icon: <LifeBuoy className={i} /> },
];

export const adminNav: NavItem[] = [
  { label: "Overview", to: "/admin", icon: <LayoutDashboard className={i} />, primary: true },
  { label: "Vendors", to: "/admin/vendors", icon: <Store className={i} />, primary: true },
  { label: "Customers", to: "/admin/customers", icon: <Users className={i} /> },
  { label: "Orders", to: "/admin/orders", icon: <ShoppingBag className={i} />, primary: true },
  { label: "Transactions", to: "/admin/transactions", icon: <Receipt className={i} /> },
  { label: "Payouts", to: "/admin/payouts", icon: <Wallet className={i} /> },
  { label: "Verification", to: "/admin/verification", icon: <BadgeCheck className={i} />, primary: true, badge: "12" },
  { label: "Disputes", to: "/admin/disputes", icon: <LifeBuoy className={i} />, badge: "4" },
  { label: "Categories", to: "/admin/categories", icon: <Boxes className={i} /> },
  { label: "Reviews", to: "/admin/reviews", icon: <Star className={i} /> },
  { label: "Promotions", to: "/admin/promotions", icon: <Megaphone className={i} /> },
  { label: "Analytics", to: "/admin/analytics", icon: <BarChart3 className={i} /> },
  { label: "Platform settings", to: "/admin/settings", icon: <Settings className={i} />, primary: true },
];
