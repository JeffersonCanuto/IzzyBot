/// <reference types="node" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const key = fs.readFileSync(path.resolve(__dirname, "certs/key.pem"));
const cert = fs.readFileSync(path.resolve(__dirname, "certs/cert.pem"));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: { key, cert }
  }
});