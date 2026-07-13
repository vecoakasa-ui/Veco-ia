import PublicExplorerClient from "./ExplorerClient";
import { createClient } from "@supabase/supabase-js";
import { Property } from "@/lib/types";

// Revalidate this page every 60 seconds so it loads instantly but stays fresh
export const revalidate = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nunntgrphkkebbmbumxs.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bm50Z3JwaGtrZWJibWJ1bXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mzg0NjMsImV4cCI6MjA5NzExNDQ2M30.oshJ6ldeAziRxdOAjNFL3nRhipgQNxLsCrcYgswN53Y";

export default async function PublicExplorerPage() {
  // Fetch data on the server
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "vacant")
    .not("type", "in", "('building','cour_commune','residence','lotissement')")
    .order("name", { ascending: true })
    .limit(24);
    
  const vacantProperties = (data || []) as Property[];

  return <PublicExplorerClient initialProperties={vacantProperties} />;
}
