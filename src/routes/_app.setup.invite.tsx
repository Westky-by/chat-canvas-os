import { createFileRoute } from "@tanstack/react-router";
import { TeamInvitePage } from "@/components/pages/TeamInvitePage";
export const Route = createFileRoute("/_app/setup/invite")({ component: TeamInvitePage });
