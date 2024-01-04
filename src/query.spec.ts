/* eslint-disable ts/no-empty-function -- Test file. */
/// <reference types="@rbxts/testez/globals" />

import { ComponentInternalCreation } from "./component";
import { internal_resetGlobalState } from "./entity-manager";
import { ALL, ANY, NOT, Query } from "./query";
import { World } from "./world";

const components = new Array<MockComponent>(32);

const world = {} as World;

interface MockComponent {
	clone(): void;
	componentData: Array<never>;
	componentId: number;
	reset(): void;
	set(): void;
}

function shallowEquals<T extends defined>(a: Array<T>, b: Array<T>): boolean {
	return a.join() === b.join();
}

function createMockComponent(id: number): MockComponent {
	return {
		clone(): void {},
		componentData: [],
		componentId: id,
		reset(): void {},
		set(): void {},
	};
}

export = (): void => {
	beforeEach(() => {
		for (let index = 0; index < 33; index++) {
			components.push(createMockComponent(index));
		}
	});

	describe("A query should", (): void => {
		it("should throw if no arguments provided", () => {
			expect(() => {
				ALL();
			}).to.throw();

			expect(() => {
				ANY();
			}).to.throw();
		});

		describe("match", () => {
			it("empty", () => {
				const query = new Query({} as World).mask;

				for (let index = 0; index < 20; index++) {
					expect(
						Query.match(new Array<number>(math.floor(math.random() * 1000)), query),
					).to.equal(true);
				}
			});

			it("ALL", () => {
				const query = new Query(world, ALL(components[0]!, components[2]!, components[3]!))
					.mask;
				expect(Query.match([13], query)).to.equal(true);
				expect(Query.match([14], query)).to.equal(false);
				expect(Query.match([15, 0], query)).to.equal(true);
				expect(Query.match([16, 0], query)).to.equal(false);
			});

			it("NOT", () => {
				const query = new Query(world, NOT(components[1]!)).mask;
				expect(Query.match([0], query)).to.equal(true);
				expect(Query.match([5], query)).to.equal(true);
				expect(Query.match([7], query)).to.equal(false);
				expect(Query.match([13, 4], query)).to.equal(true);
				expect(Query.match([15, 0], query)).to.equal(false);
			});

			it("ANY", () => {
				const query = new Query(world, ANY(components[0]!, components[2]!, components[5]!))
					.mask;
				expect(Query.match([0], query)).to.equal(false);
				expect(Query.match([10], query)).to.equal(false);
				expect(Query.match([13], query)).to.equal(true);
				expect(Query.match([15, 5], query)).to.equal(true);
				expect(Query.match([16, 0], query)).to.equal(false);
			});

			// TODO: Move away from 32 bit operators since lua doesn't support them
			it("more than 32 components", () => {
				const query = new Query(world, ALL(components[0]!, components[32]!)).mask;
				expect(Query.match([1, 1], query)).to.equal(true);
				expect(Query.match([1, 2, 1], query)).to.equal(false);
				expect(Query.match([3, 3, 0], query)).to.equal(true);
				// expect(query.match([1], query)).to.equal(false);
				expect(Query.match([0, 1], query)).to.equal(false);
			});

			it("complex query #1", () => {
				const query = new Query(
					world,
					ALL(components[1]!, ANY(components[2]!, NOT(components[0]!))),
				).mask;
				expect(Query.match([2], query)).to.equal(true);
				expect(Query.match([3], query)).to.equal(false);
				expect(Query.match([5, 0], query)).to.equal(false);
				expect(Query.match([6, 1], query)).to.equal(true);
				expect(Query.match([7, 43], query)).to.equal(true);
			});

			it("complex query #2", () => {
				const query = new Query(
					world,
					ALL(NOT(ANY(components[0]!, components[1]!)), components[3]!),
				).mask;
				expect(Query.match([1], query)).to.equal(false);
				expect(Query.match([8], query)).to.equal(true);
				expect(Query.match([9, 0], query)).to.equal(false);
				expect(Query.match([10, 10], query)).to.equal(false);
				expect(Query.match([12, 2], query)).to.equal(true);
			});

			it("complex query #3", () => {
				const query = new Query(
					world,
					ALL(
						ANY(components[0]!, components[3]!),
						ANY(components[2]!, NOT(components[4]!)),
					),
				).mask;
				expect(Query.match([1], query)).to.equal(true);
				expect(Query.match([2], query)).to.equal(false);
				expect(Query.match([8, 0], query)).to.equal(true);
				expect(Query.match([17, 1], query)).to.equal(false);
				expect(Query.match([21, 9], query)).to.equal(true);
				expect(Query.match([29, 16], query)).to.equal(true);
			});
		});

		describe("have a correct size", () => {
			it("empty", () => {
				const query = new Query(world, ALL(components[0]!));
				expect(query.size()).to.equal(0);
			});

			it("multiple entities", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({
					componentData: [],
				});

				const id1 = temporaryWorld.add();
				const id2 = temporaryWorld.add();

				temporaryWorld.addComponent(id1, component);
				temporaryWorld.addComponent(id2, component);

				temporaryWorld.flush();

				const query = temporaryWorld.createQuery(component);

				expect(query.size()).to.equal(2);

				temporaryWorld.removeComponent(id1, component);

				temporaryWorld.flush();

				expect(query.size()).to.equal(1);

				temporaryWorld.removeComponent(id2, component);

				temporaryWorld.flush();

				expect(query.size()).to.equal(0);
			});
		});

		describe("items", () => {
			it("get all entities", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({});

				const component1 = ComponentInternalCreation.createComponent({});

				const id1 = temporaryWorld.add();
				const id2 = temporaryWorld.add();
				const id3 = temporaryWorld.add();
				const id4 = temporaryWorld.add();
				const id5 = temporaryWorld.add();

				temporaryWorld.addComponent(id1, component);
				temporaryWorld.addComponent(id2, component);
				temporaryWorld.addComponent(id3, component).addComponent(id3, component1);
				temporaryWorld.addComponent(id4, component).addComponent(id4, component1);
				temporaryWorld.addComponent(id5, component1);

				temporaryWorld.flush();

				const query = temporaryWorld.createQuery(ALL(component));
				const allEntities = query.items();

				expect(allEntities.size()).to.equal(4);
			});

			it("have a size of 0 when no entities match", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({});

				const component1 = ComponentInternalCreation.createComponent({});

				const id1 = temporaryWorld.add();

				temporaryWorld.addComponent(id1, component);

				temporaryWorld.flush();

				const query = temporaryWorld.createQuery(ALL(component1));
				const allEntities = query.items();

				expect(allEntities.size()).to.equal(0);
				expect(shallowEquals(allEntities, [])).to.equal(true);
			});
		});

		describe("enteredQuery", () => {
			it("allow for entities to enter the query", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({
					componentData: [],
				});

				const id = temporaryWorld.add();

				const query = temporaryWorld.createQuery(ALL(component));

				temporaryWorld.addComponent(id, component);

				temporaryWorld.flush();

				let callCount = 0;

				for (const _entityId of query.enteredQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(1);
			});

			it("allow for multiple entities to enter the query", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({
					componentData: [],
				});

				const id1 = temporaryWorld.add();
				const id2 = temporaryWorld.add();

				const query = temporaryWorld.createQuery(ALL(component));

				temporaryWorld.addComponent(id1, component);
				temporaryWorld.addComponent(id2, component);

				temporaryWorld.flush();

				let callCount = 0;

				for (const _entityId of query.enteredQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(2);
			});

			it("not be present on next iteration of query", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({});

				const id = temporaryWorld.add();

				const query = temporaryWorld.createQuery(component);

				temporaryWorld.addComponent(id, component);

				temporaryWorld.flush();

				let callCount = 0;

				for (const _entityId of query.enteredQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(1);

				for (const _entityId of query.enteredQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(1);
			});

			it("should not enter the query if the entity already exists in the query", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({});

				const component1 = ComponentInternalCreation.createComponent({});

				const id = temporaryWorld.add();

				const query = temporaryWorld.createQuery(component);

				temporaryWorld.addComponent(id, component);

				temporaryWorld.flush();

				let callCount = 0;

				for (const _entityId of query.enteredQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(1);

				temporaryWorld.addComponent(id, component1);
				temporaryWorld.flush();

				for (const _entityId of query.enteredQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(1);
			});
		});

		describe("exitedQuery", () => {
			it("allow for entities to exit the query", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({});

				const id = temporaryWorld.add();

				const query = temporaryWorld.createQuery(component);

				temporaryWorld.addComponent(id, component);
				temporaryWorld.flush();
				temporaryWorld.removeComponent(id, component);
				temporaryWorld.flush();

				let callCount = 0;

				// We need to ensure that the entity is not entered and exited
				// at the same time
				for (const _entityId of query.enteredQuery()) {
					callCount += 1;
				}

				for (const _entityId of query.exitedQuery()) {
					callCount += 10;
				}

				expect(callCount).to.equal(10);
			});

			it("allow for multiple entities to exit the query", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({
					componentData: [],
				});

				const id1 = temporaryWorld.add();
				const id2 = temporaryWorld.add();

				const query = temporaryWorld.createQuery(ALL(component));

				temporaryWorld.addComponent(id1, component);
				temporaryWorld.addComponent(id2, component);

				temporaryWorld.flush();

				temporaryWorld.removeComponent(id1, component);
				temporaryWorld.removeComponent(id2, component);

				temporaryWorld.flush();

				let callCount = 0;

				for (const _entityId of query.exitedQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(2);
			});

			it("not be present on next iteration of query", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({});

				const id = temporaryWorld.add();

				const query = temporaryWorld.createQuery(component);

				temporaryWorld.addComponent(id, component);
				temporaryWorld.flush();
				temporaryWorld.removeComponent(id, component);
				temporaryWorld.flush();

				let callCount = 0;

				for (const _entityId of query.exitedQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(1);

				for (const _entityId of query.exitedQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(1);
			});

			it("not be present on next iteration of query if the entity is removed", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({});
				const id = temporaryWorld.add();

				const query = temporaryWorld.createQuery(component);

				temporaryWorld.addComponent(id, component);
				temporaryWorld.flush();
				temporaryWorld.remove(id);
				temporaryWorld.flush();

				let callCount = 0;

				for (const entityId of query.exitedQuery()) {
					callCount += 1;
					temporaryWorld.remove(entityId);
				}

				temporaryWorld.flush();

				expect(callCount).to.equal(1);

				for (const _entityId of query.exitedQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(1);
			});

			it("should not exit the query if the entity already exists in the query", () => {
				internal_resetGlobalState();
				const temporaryWorld = new World();

				const component = ComponentInternalCreation.createComponent({
					componentData: [],
				});

				const component1 = ComponentInternalCreation.createComponent({
					componentData: [],
				});

				const id = temporaryWorld.add();

				const query = temporaryWorld.createQuery(component);

				temporaryWorld.addComponent(id, component);

				temporaryWorld.flush();

				let callCount = 0;

				for (const _entityId of query.exitedQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(0);

				temporaryWorld.addComponent(id, component1);
				temporaryWorld.flush();

				for (const _entityId of query.exitedQuery()) {
					callCount += 1;
				}

				expect(callCount).to.equal(0);
			});
		});
	});
};
