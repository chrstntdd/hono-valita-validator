import { Hono } from "hono"
import * as v from "@badrap/valita"
import { describe, test, expect } from "vitest"

import { valitaValidator } from "../src/valita-validator"

describe("json body", () => {
	let app = new Hono()

	let bodySchema = v.object({ name: v.string() })

	app.post(
		"/hello",
		valitaValidator("json", { schema: bodySchema }),
		async (ctx) => {
			let { name } = ctx.req.valid("json")

			return ctx.json({ your: name })
		},
	)

	test("No error messages when payload matches schema", async () => {
		let name = "Whomst"
		let res = await app.request(
			new Request("http://localhost/hello", {
				method: "POST",
				body: JSON.stringify({ name }),
			}),
		)

		expect(res.status).toEqual(200)
		expect(await res.json()).toEqual({ your: name })
	})

	test("Error messages when payload matches DOES NOT match schema", async () => {
		let res = await app.request(
			new Request("http://localhost/hello", {
				method: "POST",
				body: JSON.stringify({
					notInSchema: ["never"],
					ever: "ever",
				}),
			}),
		)

		let respBody = await res.json()
		expect(res.status).toEqual(400)
		expect(respBody.success).toEqual(false)
		expect(respBody.errors).toMatchInlineSnapshot(`
			[
			  {
			    "code": "unrecognized_keys",
			    "keys": [
			      "notInSchema",
			      "ever",
			    ],
			    "path": [],
			  },
			  {
			    "code": "missing_value",
			    "path": [
			      "name",
			    ],
			  },
			]
		`)
	})
})

describe("form body", () => {
	let app = new Hono()

	let formSchema = v.object({ id: v.string() })

	app.post(
		"/form",
		valitaValidator("form", {
			schema: formSchema,
		}),
		async (ctx) => {
			let { id } = ctx.req.valid("form")
			return ctx.json({ your: id })
		},
	)

	test("No error messages when payload matches schema", async () => {
		let id = "11"
		let fd = new FormData()
		fd.append("id", id)
		let res = await app.request(
			new Request(`http://localhost/form`, { method: "POST", body: fd }),
		)

		expect(res.status).toEqual(200)
		expect(await res.json()).toEqual({ your: id })
	})

	test("Error messages when payload matches DOES NOT match schema", async () => {
		let id = "11"
		let fd = new FormData()
		fd.append("eyeD", id)
		let res = await app.request(
			new Request(`http://localhost/form`, { method: "POST", body: fd }),
		)

		let respBody = await res.json()

		expect(res.status).toEqual(400)
		expect(respBody.success).toEqual(false)
		expect(respBody.errors).toMatchInlineSnapshot(`
			[
			  {
			    "code": "unrecognized_keys",
			    "keys": [
			      "eyeD",
			    ],
			    "path": [],
			  },
			  {
			    "code": "missing_value",
			    "path": [
			      "id",
			    ],
			  },
			]
		`)
	})
})

describe("path param", () => {
	let app = new Hono()
	let pathParamSchema = v.object({
		id: v
			.string()
			.chain((rawVal) =>
				Number.isSafeInteger(+rawVal)
					? v.ok(rawVal)
					: v.err("Invalid path param"),
			),
	})

	app.get(
		"/thing/:id",
		valitaValidator("param", { schema: pathParamSchema }),
		async (ctx) => {
			let { id } = ctx.req.valid("param")

			return ctx.json({ your: id })
		},
	)

	test("No error messages when payload matches schema", async () => {
		let id = "36"
		let res = await app.request(new Request(`http://localhost/thing/${id}`))

		expect(res.status).toEqual(200)
		expect(await res.json()).toEqual({ your: id })
	})

	test("Error messages when payload matches DOES NOT match schema", async () => {
		let id = "42.11"
		let res = await app.request(new Request(`http://localhost/thing/${id}`))

		let respBody = await res.json()
		expect(res.status).toEqual(400)
		expect(respBody.success).toEqual(false)
		expect(respBody.errors).toMatchInlineSnapshot(`
			[
			  {
			    "code": "custom_error",
			    "error": "Invalid path param",
			    "path": [
			      "id",
			    ],
			  },
			]
		`)
	})
})

describe("combos", () => {
	let app = new Hono()
	let pathParamSchema = v.object({ id: v.string() })
	let jsonBodySchema = v.object({ bod: v.array(v.number()) })

	app.post(
		"/thing/:id",
		valitaValidator("param", { schema: pathParamSchema }),
		valitaValidator("json", { schema: jsonBodySchema }),
		async (ctx) => {
			let { id } = ctx.req.valid("param")
			let { bod } = ctx.req.valid("json")

			return ctx.json({ your: id, bod })
		},
	)

	test("No error messages when payload matches schema", async () => {
		let id = "36"
		let bod = [11, Math.PI]
		let res = await app.request(
			new Request(`http://localhost/thing/${id}`, {
				method: "POST",
				body: JSON.stringify({ bod }),
			}),
		)

		expect(res.status).toEqual(200)
		expect(await res.json()).toEqual({ your: id, bod })
	})
})

describe("hooks", () => {
	let app = new Hono()
	let jsonBodySchema = v.object({ hookId: v.string() })

	app.post(
		"/hooks",
		valitaValidator("json", { schema: jsonBodySchema }, async (r, ctx) => {
			if (!r.success) {
				// Never happens
				return ctx.text("Boo", 418)
			}
			let { hookId } = r.data
			return ctx.json({ your: hookId })
		}),
	)

	test("No error messages when payload matches schema", async () => {
		let hookId = "some_id"
		let res = await app.request(
			new Request("http://localhost/hooks", {
				method: "POST",
				body: JSON.stringify({ hookId: hookId }),
			}),
		)

		expect(res.ok).toBeTruthy()
	})

	test("Error messages when payload matches DOES NOT match schema", async () => {
		let hookId = "some_id"
		let res = await app.request(
			new Request("http://localhost/hooks", {
				method: "POST",
				body: JSON.stringify({ hook_id: hookId }),
			}),
		)
		let responseText = await res.text()
		expect(responseText).toMatchInlineSnapshot('"Boo"')
		expect(res.ok).not.toBeTruthy()
		expect(res.status).toEqual(418)
	})
})

describe("parsed value available to user", () => {
	let bodySchema = v.object({
		name: v.string(),
		optWithFallback: v.string().optional().default(null),
	})

	test("Works for middleware use", async () => {
		let app = new Hono()

		app.post(
			"/hello",
			valitaValidator("json", { schema: bodySchema }),
			async (ctx) => {
				let bod = ctx.req.valid("json")

				return ctx.json(bod)
			},
		)
		let name = "Whomst"
		let res = await app.request(
			new Request("http://localhost/hello", {
				method: "POST",
				body: JSON.stringify({ name }),
			}),
		)

		expect(res.status).toEqual(200)
		expect(await res.json()).toEqual({ name, optWithFallback: null })
	})

	test("Works for hooks", async () => {
		let app = new Hono()
		app.post(
			"/hooks",
			valitaValidator("json", { schema: bodySchema }, async (r, ctx) => {
				let bod = r.success ? r.data : null

				return ctx.json(bod)
			}),
		)
		let name = "Hooky"
		let res = await app.request(
			new Request("http://localhost/hooks", {
				method: "POST",
				body: JSON.stringify({ name }),
			}),
		)

		expect(res.status).toEqual(200)
		expect(await res.json()).toEqual({ name, optWithFallback: null })
	})
})
