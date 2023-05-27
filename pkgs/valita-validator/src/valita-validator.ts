import type { Type, Infer, Err } from "@badrap/valita"
import type { Context, Env, MiddlewareHandler, ValidationTargets } from "hono"
import { validator } from "hono/validator"

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
	return validator(target, (data, ctx) => {
		let result = schema.try(data, parseOpts || { mode: "strict" })

		if (hook) {
			let hookResult = hook(
				result.ok
					? { success: true, data }
					: { success: false, errors: result.issues },
				ctx,
			)
			if (hookResult instanceof Response || hookResult instanceof Promise) {
				return hookResult
			}
		}

		if (result.ok) {
			return data
		} else {
			return ctx.json({ success: false, errors: result.issues }, 400)
		}
	})
}
