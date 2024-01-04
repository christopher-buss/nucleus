import type { ComponentMethods } from "component";

export type EntityId = number;
export type ComponentId = number;

export declare type PartialComponentToKeys<T extends ComponentData> = {
	[K in keyof T]?: T[K][EntityId];
};

export declare type GetComponentSchema<C> = C extends Component<infer T> ? T : never;

export declare type AllComponentTypes<T = unknown> = AnyComponent<T> | TagComponent;

export declare type ComponentData = Record<string, Array<unknown>>;

export declare type Component<T extends ComponentData> = T & ComponentMethods<T>;
export declare type TagComponent = object & Record<string, never>;

export declare type AnyComponent<T = unknown> = T extends ComponentData
	? Component<T>
	: // eslint-disable-next-line ts/ban-types -- This is intentional.
		Component<{}>;
