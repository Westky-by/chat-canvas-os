import { createFileRoute } from "@tanstack/react-router";
import { SettingsSecretsVaultPage } from "@/components/pages/SettingsSecretsVaultPage";
export const Route = createFileRoute("/_app/admin/secrets")({ component: SettingsSecretsVaultPage });
