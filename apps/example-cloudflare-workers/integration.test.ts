import { test, expect } from "vitest"
import { createFetch } from "ofetch"

let $yeet = createFetch({
	fetch: globalThis.fetch,
	Headers: globalThis.Headers,
	defaults: {
		baseURL: "http://0.0.0.0:3001",
	},
})

test("No error messages when payload matches schema", async () => {
	let name = "A. N. Other"
	let res = await $yeet("/hello", { method: "POST", body: { name } })

	expect(res).toEqual({ your: name })
})

test("Error messages when payload matches DOES NOT match schema", async () => {
	let res = await $yeet("/hello", {
		method: "POST",
		body: { notInSchema: [] },
	}).catch((e) => ({ data: e.data, status: e.status }))

	expect(res.status).toEqual(400)
	expect(res.data).toMatchInlineSnapshot(`
		{
		  "errors": [
		    {
		      "code": "unrecognized_keys",
		      "keys": [
		        "notInSchema",
		      ],
		      "path": [],
		    },
		    {
		      "code": "missing_value",
		      "path": [
		        "name",
		      ],
		    },
		  ],
		  "success": false,
		}
	`)
})
