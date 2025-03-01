import { Suspense } from "react";
import { PlanDetails } from "./PlanDetails";

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  // First, await the params
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  console.log(`Plan page rendering with ID: ${id}`);
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PlanDetails id={id} />
    </Suspense>
  );
} 