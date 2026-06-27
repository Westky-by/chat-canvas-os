import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceSetupPage } from "@/components/pages/WorkspaceSetupPage";
export const Route = createFileRoute("/_app/setup/workspace")({ component: WorkspaceSetupPage });
