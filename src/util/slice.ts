/**
 * Creates a slice of an array, similar to JavaScript's `Array.slice`
 */
export function slice<TValue extends defined>(
	array: ReadonlyArray<TValue>,
	start?: number,
	endPosition_?: number,
): Array<TValue> {
	let startIndex = start ?? 0;
	let endPosition = endPosition_ ?? array.size();

	if (startIndex < 0) {
		startIndex = array.size() + startIndex;
		endPosition = array.size();
	}

	if (endPosition < 0) {
		endPosition = array.size() + endPosition;
	}

	return array.move(math.max(0, startIndex), endPosition - 1, 0, []);
}
