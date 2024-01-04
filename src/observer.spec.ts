/* eslint-disable ts/no-explicit-any -- Test file. */
/* eslint-disable ts/no-unsafe-call -- Test file. */
/// <reference types="@rbxts/testez/globals" />

import { ComponentInternalCreation, ComponentTypes } from "./component";
import { internal_resetGlobalState } from "./entity-manager";
import { World } from "./world";

function shallowEquals<T extends defined>(a: Array<T>, b: Array<T>): boolean {
	return a.join() === b.join();
}

let world = new (World as any)() as World;

export = (): void => {
	beforeEach(() => {
		internal_resetGlobalState();
		world = world = new (World as any)() as World;
	});

	describe("An observer should", () => {
		it("be called when a components data is changed", () => {
			const calledFunc: Array<number> = [];

			const component = ComponentInternalCreation.createComponent({
				x: ComponentTypes.Number,
			});

			const observer = world.createObserver(component);

			const id = world.add();
			world.addComponent(id, component);

			world.flush();

			for (const _ of observer.iter()) {
				calledFunc.push(1);
			}

			component.set(id, { x: 1 });

			for (const _ of observer.iter()) {
				calledFunc.push(2);
			}

			expect(shallowEquals(calledFunc, [])).to.equal(true);

			world.flush();

			for (const _ of observer.iter()) {
				calledFunc.push(3);
			}

			expect(shallowEquals(calledFunc, [3])).to.equal(true);
		});

		it("be able to have a required component", () => {
			const calledFunc: Array<number> = [];

			const component = ComponentInternalCreation.createComponent({
				x: ComponentTypes.Number,
			});

			const component2 = ComponentInternalCreation.createComponent({
				y: ComponentTypes.Number,
			});

			const observer = world.createObserver(component).with(component2);

			const id = world.add();
			const id2 = world.add();
			world.addComponent(id, component);
			world.addComponent(id2, component).addComponent(id2, component2);

			world.flush();

			component.set(id, { x: 1 });
			component.set(id2, { x: 1 });

			world.flush();

			for (const entityId of observer.iter()) {
				calledFunc.push(entityId);
			}

			expect(shallowEquals(calledFunc, [id2])).to.equal(true);
		});
	});
};
