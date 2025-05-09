import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://gjyjtbsgwiihnvagmzdl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqeWp0YnNnd2lpaG52YWdtemRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTYyNjAsImV4cCI6MjA2MTA3MjI2MH0._9lpPFJZRo3pqsm7mblgGGf3HdL_ZcTsglfEHq3r1B8"
);
