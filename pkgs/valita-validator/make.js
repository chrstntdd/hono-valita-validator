import ES from "esbuild"

import localPkgJson from "./package.json" assert { type: "json" }

/** @type ES.BuildOptions */
const SHARED_ESBUILD_OPTIONS = {
	bundle: true,
	entryPoints: ["./src/valita-validator.ts"],
	minify: true,
	target: "esnext",
	external: [
		...Object.keys({
			...localPkgJson.peerDependencies,
			...localPkgJson.devDependencies,
		}),
	],
}

make()

async function make() {
	await Promise.all([
		ES.build({
			...SHARED_ESBUILD_OPTIONS,
			format: "esm",
			outfile: localPkgJson.module,
		}),
		ES.build({
			...SHARED_ESBUILD_OPTIONS,
			format: "cjs",
			outfile: localPkgJson.main,
		}),
	])
}
