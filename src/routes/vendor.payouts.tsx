import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/vendor/payouts")({
  beforeLoad: () => {
    throw redirect({ to: "/vendor/transactions" });
  },
  component: () => null,
});
