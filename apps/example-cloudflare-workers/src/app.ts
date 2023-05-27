import { Hono } from "hono"
import * as v from "@badrap/valita"
import { valitaValidator } from "@ct/valita-validator"

import type { HonoEnv } from "~/types"

let app = new Hono<HonoEnv>()

let bodySchema = v.object({
	name: v.string(),
})

app.post(
	"/hello",
	valitaValidator("json", {
		schema: bodySchema,
		parseOpts: { mode: "strict" },
	}),
	async (ctx) => {
		let { name } = ctx.req.valid("json")

		return ctx.json({ your: name })
	},
)

export { app }
