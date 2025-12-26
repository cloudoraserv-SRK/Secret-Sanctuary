import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const supabase = createClient(
  "https://ratjdhsdrhyymbjqqsxb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdGpkaHNkcmh5eW1ianFxc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NzQ1MDcsImV4cCI6MjA4MjA1MDUwN30.lHKQ3nQPFx7L16DxceJI1J6ypA2MFTJF6AIWWNbAFsM"
);
