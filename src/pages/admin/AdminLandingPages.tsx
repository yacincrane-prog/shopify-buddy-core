import { LandingPageBuilder } from "@/components/admin/LandingPageBuilder";
export default function AdminLandingPages() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Landing Pages</h1><p className="text-muted-foreground text-sm mt-1">Build high-converting product landing pages</p></div>
      <LandingPageBuilder />
    </div>
  );
}
