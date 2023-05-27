/// <reference types="vitest" />
import { resolve } from "node:path"

import { defineConfig } from "vite"

import localPkgJson from "./package.json" assert { type: "json" }

export default defineConfig({
	test: {
		useAtomics: true,
		coverage: {
			all: true,
			src: ["./src"],
			reporter: ["lcov", "text"],
		},
	},
	build: {
		lib: {
			entry: [resolve(__dirname, "src", "valita-validator.ts")],
			formats: ["cjs", "es"],
			fileName: "valita-validator",
		},
		minify: false,
		rollupOptions: {
			external: [
				...Object.keys({
					...localPkgJson.devDependencies,
					...localPkgJson.peerDependencies,
				}),
				"hono/validator",
			],
		},
	},
})
