import { createFileRoute } from "@tanstack/react-router";
import { ProductStockPage } from "@/components/pages/ProductStockPage";
export const Route = createFileRoute("/_app/sales/products")({ component: ProductStockPage });
