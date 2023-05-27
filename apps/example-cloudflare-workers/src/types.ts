/**
 * @note
 * These globals are injected by vite's `define
 */
declare global {
	const ENVIRONMENT: "production" | "development"
}

type Bindings = {}

type Variables = {}

export type HonoEnv = {
	Variables: Variables
	Bindings: Bindings
}
