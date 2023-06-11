import { validator } from "hono/validator"

import type { Type, Infer, Err } from "@badrap/valita"
import type { Context, Env, MiddlewareHandler, ValidationTargets } from "hono"

type Hook<T extends Type, E extends Env, P extends string> = (
	result:
		| { success: true; data: Infer<T> }
		| { success: false; errors: Err["issues"] },
	c: Context<E, P>,
) => Response | Promise<Response> | void

export function valitaValidator<
	T extends Type,
	Target extends keyof ValidationTargets,
	E extends Env,
	P extends string,
	V extends {
		in: { [K in Target]: Infer<T> }
		out: { [K in Target]: Infer<T> }
	},
>(
	target: Target,
	{ schema, parseOpts }: { schema: T; parseOpts?: Parameters<T["try"]>[1] },
	hook?: Hook<T, E, P>,
): MiddlewareHandler<E, P, V> {
	// eslint-disable-next-line @typescript-eslint/promise-function-async
	return validator(target, (data, ctx) => {
		let result = schema.try(data, parseOpts || { mode: "strict" })

		if (hook) {
			let hookResult = hook(
				result.ok
					? { success: true, data: result.value }
					: { success: false, errors: result.issues },
				ctx,
			)
			if (hookResult instanceof Response || hookResult instanceof Promise) {
				return hookResult
			}
		}

		if (result.ok) {
			return result.value
		} else {
			return ctx.json({ success: false, errors: result.issues }, 400)
		}
	})
}
