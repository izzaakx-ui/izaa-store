import { Suspense } from "react";
import ProductView from "@/components/ProductView";

export default function Page({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F4F2]" />}>
      <ProductView params={params} />
    </Suspense>
  );
}
