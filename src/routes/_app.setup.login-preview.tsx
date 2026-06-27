import { createFileRoute } from "@tanstack/react-router";
import { LoginPreviewPage } from "@/components/pages/LoginPreviewPage";
export const Route = createFileRoute("/_app/setup/login-preview")({ component: LoginPreviewPage });
