import { Hono } from "https://cdn.jsdelivr.net/npm/hono@3.2.7/mod.ts";
import { cors } from "https://cdn.jsdelivr.net/npm/hono@3.2.7/cors.ts";
import { logger } from "https://cdn.jsdelivr.net/npm/hono@3.2.7/logger.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.34.0/dist/supabase.js";
import * as kv from "./kv_store.tsx"; // keep this if you have it locally
