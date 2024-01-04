// eslint-disable-next-line ts/prefer-ts-expect-error, ts/ban-ts-comment -- /
// @ts-ignore
// @ts-nocheck
import style from "@roblox-ts/eslint-config";
 
export default style({
	formatters: true,
	gitignore: true,
	react: true,
	rules: {
		"perfectionist/sort-objects": [
			"warn",
			{
				"custom-groups": {
					id: "id",
					name: "name",
				},
				groups: ["id", "name", "unknown"],
				order: "asc",
				"partition-by-comment": "Part:**",
				type: "natural",
			},
		],
		"import/newline-after-import": "off",
		"ts/no-non-null-assertion": "off",
		"no-array-constructor": "off",
	},
	typescript: {
		parserOptions: {
			ecmaVersion: 2018,
			jsx: true,
			// project: true,
			sourceType: "module",
			useJSXTextNode: true,
		},
		tsconfigPath: "./tsconfig.json",
	},
});
 