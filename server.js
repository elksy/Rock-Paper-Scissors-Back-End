import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();
const PORT = 8080;

const corsInputs = {
  methods: "POST, GET",
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
