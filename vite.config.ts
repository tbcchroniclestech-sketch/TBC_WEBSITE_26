import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          motion: ["framer-motion", "gsap", "lenis"],
          three: ["three", "@react-three/fiber"],
        },
      },
    },
  },
});
