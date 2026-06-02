import { defineConfig } from "prisma/config";

export default defineConfig({
  migrate: {
    migrationsPath: "./prisma/migrations",
    // 6.x 中没有 url 配置，这个要放在 schema.prisma 里
  },
});