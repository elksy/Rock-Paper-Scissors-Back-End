import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const DENO_ENV = (await Deno.env.get("DENO_ENV")) ?? "development";

config({ path: `./.env.${DENO_ENV}`, export: true });

const app = new Application();
const PORT = parseInt(Deno.env.get("PORT"));

const corsInputs = {
  methods: "GET",
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "Accept",
    "Origin",
    "User-Agent",
  ],
  credentials: true,
};

app.use(abcCors(corsInputs));
app.start({ port: PORT });
