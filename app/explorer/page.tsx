import PublicExplorerClient from "./ExplorerClient";
import { createClient } from "@supabase/supabase-js";
import { Property } from "@/lib/types";

// Revalidate this page every 60 seconds so it loads instantly but stays fresh
export const revalidate = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nunntgrphkkebbmbumxs.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_YsaZPBjgSudqX1qinVk9uA_ZkszI3zy";

export default async function PublicExplorerPage() {
  // Fetch data on the server
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "vacant")
    .in("type", ['apartment', 'studio', 'villa', 'house', 'terrain'])
    .order("name", { ascending: true })
    .limit(24);
    
  const vacantProperties = (data || []) as Property[];

  return <PublicExplorerClient initialProperties={vacantProperties} />;
}
