import { createFileRoute } from "@tanstack/react-router";
import { FileImageKnowledgePage } from "@/components/pages/FileImageKnowledgePage";
export const Route = createFileRoute("/_app/ai/knowledge-files")({ component: FileImageKnowledgePage });
