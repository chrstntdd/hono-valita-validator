module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
		ecmaVersion: 12,
		sourceType: "module",
	},
	settings: {
		"import/resolver": {
			typescript: {},
		},
	},
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"prettier",
	],
	plugins: ["@typescript-eslint", "import"],
	overrides: [
		{
			files: ["*.spec.ts", "*.spec.tsx"],
			rules: {
				"@typescript-eslint/ban-ts-comment": 0,
			},
		},
	],
	rules: {
		"@typescript-eslint/no-extra-semi": "off",
		"no-unused-vars": "off",
		"prefer-const": "off",
		"no-await-in-loop": ["error"],
		"no-promise-executor-return": ["error"],
		"no-async-promise-executor": ["error"],
		"require-atomic-updates": ["error"],
		"no-return-await": ["error"],
		"@typescript-eslint/await-thenable": ["error"],
		"@typescript-eslint/no-floating-promises": ["error"],
		"@typescript-eslint/no-misused-promises": ["error"],
		"@typescript-eslint/promise-function-async": ["error"],
		"import/order": [
			"error",
			{
				"newlines-between": "always",
				pathGroups: [
					{
						pattern: "~/**",
						group: "external",
						position: "after",
					},
				],
				groups: [
					"builtin",
					"external",
					"internal",
					"parent",
					"sibling",
					"index",
					"object",
					"type",
				],
			},
		],
		"no-cond-assign": "error",
		"no-constant-condition": "error",
		"no-unreachable": "error",
		"no-unused-expressions": "error",
		"no-constant-binary-expression": "error",
		"no-sequences": "error",
		"@typescript-eslint/switch-exhaustiveness-check": "error",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"no-var": "off",
	},
}
