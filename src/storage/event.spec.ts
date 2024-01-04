/* eslint-disable ts/no-unsafe-assignment -- Test file. */
/* eslint-disable id-length -- Test file. */
/// <reference types="@rbxts/testez/globals" />

import { bindEvent } from "./event";

export = (): void => {
	describe("an event should", () => {
		it("queue up events until the next iteration", () => {
			const event = new Instance("BindableEvent");

			const eventStorage = bindEvent(event.Event);
			eventStorage.setup();

			event.Fire("Hello", "World!", 7);
			expect(eventStorage.queue.size()).to.equal(1);

			let a, b, c;

			let callCount = 0;

			const eventFunc = function (): void {
				for (const [x, y, z] of eventStorage.iter()) {
					callCount += 1;
					a = x;
					b = y;
					c = z;
				}
			};

			eventFunc();

			expect(a).to.equal("Hello");
			expect(b).to.equal("World!");
			expect(c).to.equal(7);
			expect(callCount).to.equal(1);

			callCount = 0;

			eventFunc();

			event.Fire();
			event.Fire();
			event.Fire();

			expect(callCount).to.equal(0);
			expect(eventStorage.queue.size()).to.equal(3);

			eventFunc();

			expect(callCount).to.equal(3);
			expect(eventStorage.queue.size()).to.equal(0);
		});

		it("should not queue up events if the predicate returns false", () => {
			const event = new Instance("BindableEvent");

			const eventStorage = bindEvent<
				RBXScriptSignal<(argument0: string, argument1: string, argument2: number) => void>
			>(event.Event, (a, b, c) => {
				return a === "Hello" && b === "World!" && c === 7;
			});
			eventStorage.setup();

			event.Fire("Hello", "World!", 7);
			event.Fire("Hello", "World!", 8);

			expect(eventStorage.queue.size()).to.equal(1);
		});
	});
};
