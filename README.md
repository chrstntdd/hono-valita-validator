# Valita validator middleware for Hono

[![Main CI](https://github.com/chrstntdd/hono-valita-validator/actions/workflows/ci.yaml/badge.svg)](https://github.com/chrstntdd/hono-valita-validator/actions/workflows/ci.yaml)

Validator middleware using [Valita](https://github.com/badrap/valita) for [Hono](https://honojs.dev) applications.
Define your schemas with Valita and validate requests.

Valita is particularly well suited for the Cloudflare Workers platform where resources are limited.

## Usage

As plain middleware

```ts
import { Hono } from "hono"
import * as v from "@badrap/valita"
import { valitaValidator } from "@chrstntdd/valita-validator"

let app = new Hono()

let schema = v.object({ name: v.string() })

app.post("/hello", valitaValidator("json", { schema }), async (ctx) => {
	let { name } = ctx.req.valid("json")

	return ctx.json({ your: name })
})
```

Combine middlewares to validate multiple components of the request.

```ts
import { Hono } from "hono"
import * as v from "@badrap/valita"
import { valitaValidator } from "@chrstntdd/valita-validator"

let app = new Hono()

let pathSchema = v.string()
let bodySchema = v.object({ details: v.string() })

app.post(
	"/item/:id",
	valitaValidator("param", { schema: pathSchema }),
	valitaValidator("json", { schema: bodySchema }),
	async (ctx) => {
		let { id } = ctx.req.valid("param")
		let { details } = ctx.req.valid("json")

		return ctx.json({ id, details })
	},
)
```

You can use the hook based API instead to control the failure case.

```ts
import { Hono } from "hono"
import * as v from "@badrap/valita"
import { valitaValidator } from "@chrstntdd/valita-validator"

let app = new Hono()

let schema = v.object({ name: v.string() })

app.post(
	"/hooks",
	valitaValidator("json", { schema }, async (r, ctx) => {
		if (!r.success) {
			return ctx.text("Tea", 418)
		}
		let { name } = r.data
		return ctx.json({ your: name })
	}),
)
```
