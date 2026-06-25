"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonPatch = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const core_1 = require("fast-json-patch/commonjs/core");
/**
 * Utility for applying RFC-6902 JSON-Patch to a document.
 *
 * Use the the `JsonPatch.apply(doc, ...ops)` function to apply a set of
 * operations to a JSON document and return the result.
 *
 * Operations can be created using the factory methods `JsonPatch.add()`,
 * `JsonPatch.remove()`, etc.
 *
 * const output = JsonPatch.apply(input,
 *   JsonPatch.replace('/world/hi/there', 'goodbye'),
 *   JsonPatch.add('/world/foo/', 'boom'),
 *   JsonPatch.remove('/hello'),
 * );
 *
 */
class JsonPatch {
    /**
     * Adds a value to an object or inserts it into an array. In the case of an
     * array, the value is inserted before the given index. The - character can be
     * used instead of an index to insert at the end of an array.
     *
     * @example JsonPatch.add('/milk', true)
     * @example JsonPatch.add('/biscuits/1', { "name": "Ginger Nut" })
     */
    static add(path, value) {
        return { op: 'add', path, value };
    }
    /**
     * Removes a value from an object or array.
     *
     * @example JsonPatch.remove('/biscuits')
     * @example JsonPatch.remove('/biscuits/0')
     */
    static remove(path) {
        return { op: 'remove', path };
    }
    /**
     * Replaces a value. Equivalent to a “remove” followed by an “add”.
     *
     * @example JsonPatch.replace('/biscuits/0/name', 'Chocolate Digestive')
     */
    static replace(path, value) {
        return { op: 'replace', path, value };
    }
    /**
     * Copies a value from one location to another within the JSON document. Both
     * from and path are JSON Pointers.
     *
     * @example JsonPatch.copy('/biscuits/0', '/best_biscuit')
     */
    static copy(from, path) {
        return { op: 'copy', from, path };
    }
    /**
     * Moves a value from one location to the other. Both from and path are JSON Pointers.
     *
     * @example JsonPatch.move('/biscuits', '/cookies')
     */
    static move(from, path) {
        return { op: 'move', from, path };
    }
    /**
     * Tests that the specified value is set in the document. If the test fails,
     * then the patch as a whole should not apply.
     *
     * @example JsonPatch.test('/best_biscuit/name', 'Choco Leibniz')
     */
    static test(path, value) {
        return { op: 'test', path, value };
    }
    /**
     * Applies a set of JSON-Patch (RFC-6902) operations to `document` and returns the result.
     * @param document The document to patch
     * @param ops The operations to apply
     * @returns The result document
     */
    patch(document, ...ops) {
        const result = (0, core_1.applyPatch)(document, ops);
        return result.newDocument;
    }
}
exports.JsonPatch = JsonPatch;
_a = JSII_RTTI_SYMBOL_1;
JsonPatch[_a] = { fqn: "@raindancers/agentl.JsonPatch", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9qc29uLXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0RBQXNFO0FBVXRFOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILE1BQWEsU0FBUztJQUNwQjs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFZLEVBQUUsS0FBVTtRQUN4QyxPQUFPLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFZO1FBQy9CLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFZLEVBQUUsS0FBVTtRQUM1QyxPQUFPLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFZLEVBQUUsSUFBWTtRQUMzQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQVksRUFBRSxJQUFZO1FBQzNDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQVksRUFBRSxLQUFVO1FBQ3pDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxLQUFLLENBQUMsUUFBYSxFQUFFLEdBQUcsR0FBWTtRQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFBLGlCQUFVLEVBQ3ZCLFFBQVEsRUFDUixHQUFrQixDQUNuQixDQUFDO1FBQ0YsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7O0FBekVILDhCQTBFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9wZXJhdGlvbiwgYXBwbHlQYXRjaCB9IGZyb20gJ2Zhc3QtanNvbi1wYXRjaC9jb21tb25qcy9jb3JlJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFBhdGNoIHtcbiAgcmVhZG9ubHkgb3A6IHN0cmluZztcbiAgcmVhZG9ubHkgcGF0aDogc3RyaW5nO1xuICByZWFkb25seSB2YWx1ZT86IGFueTtcbiAgcmVhZG9ubHkgZnJvbT86IHN0cmluZztcbn1cblxuLyoqXG4gKiBVdGlsaXR5IGZvciBhcHBseWluZyBSRkMtNjkwMiBKU09OLVBhdGNoIHRvIGEgZG9jdW1lbnQuXG4gKlxuICogVXNlIHRoZSB0aGUgYEpzb25QYXRjaC5hcHBseShkb2MsIC4uLm9wcylgIGZ1bmN0aW9uIHRvIGFwcGx5IGEgc2V0IG9mXG4gKiBvcGVyYXRpb25zIHRvIGEgSlNPTiBkb2N1bWVudCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gKlxuICogT3BlcmF0aW9ucyBjYW4gYmUgY3JlYXRlZCB1c2luZyB0aGUgZmFjdG9yeSBtZXRob2RzIGBKc29uUGF0Y2guYWRkKClgLFxuICogYEpzb25QYXRjaC5yZW1vdmUoKWAsIGV0Yy5cbiAqXG4gKiBjb25zdCBvdXRwdXQgPSBKc29uUGF0Y2guYXBwbHkoaW5wdXQsXG4gKiAgIEpzb25QYXRjaC5yZXBsYWNlKCcvd29ybGQvaGkvdGhlcmUnLCAnZ29vZGJ5ZScpLFxuICogICBKc29uUGF0Y2guYWRkKCcvd29ybGQvZm9vLycsICdib29tJyksXG4gKiAgIEpzb25QYXRjaC5yZW1vdmUoJy9oZWxsbycpLFxuICogKTtcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBKc29uUGF0Y2gge1xuICAvKipcbiAgICogQWRkcyBhIHZhbHVlIHRvIGFuIG9iamVjdCBvciBpbnNlcnRzIGl0IGludG8gYW4gYXJyYXkuIEluIHRoZSBjYXNlIG9mIGFuXG4gICAqIGFycmF5LCB0aGUgdmFsdWUgaXMgaW5zZXJ0ZWQgYmVmb3JlIHRoZSBnaXZlbiBpbmRleC4gVGhlIC0gY2hhcmFjdGVyIGNhbiBiZVxuICAgKiB1c2VkIGluc3RlYWQgb2YgYW4gaW5kZXggdG8gaW5zZXJ0IGF0IHRoZSBlbmQgb2YgYW4gYXJyYXkuXG4gICAqXG4gICAqIEBleGFtcGxlIEpzb25QYXRjaC5hZGQoJy9taWxrJywgdHJ1ZSlcbiAgICogQGV4YW1wbGUgSnNvblBhdGNoLmFkZCgnL2Jpc2N1aXRzLzEnLCB7IFwibmFtZVwiOiBcIkdpbmdlciBOdXRcIiB9KVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhZGQocGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KTogUGF0Y2gge1xuICAgIHJldHVybiB7IG9wOiAnYWRkJywgcGF0aCwgdmFsdWUgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSBhbiBvYmplY3Qgb3IgYXJyYXkuXG4gICAqXG4gICAqIEBleGFtcGxlIEpzb25QYXRjaC5yZW1vdmUoJy9iaXNjdWl0cycpXG4gICAqIEBleGFtcGxlIEpzb25QYXRjaC5yZW1vdmUoJy9iaXNjdWl0cy8wJylcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVtb3ZlKHBhdGg6IHN0cmluZyk6IFBhdGNoIHtcbiAgICByZXR1cm4geyBvcDogJ3JlbW92ZScsIHBhdGggfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyBhIHZhbHVlLiBFcXVpdmFsZW50IHRvIGEg4oCccmVtb3Zl4oCdIGZvbGxvd2VkIGJ5IGFuIOKAnGFkZOKAnS5cbiAgICpcbiAgICogQGV4YW1wbGUgSnNvblBhdGNoLnJlcGxhY2UoJy9iaXNjdWl0cy8wL25hbWUnLCAnQ2hvY29sYXRlIERpZ2VzdGl2ZScpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlcGxhY2UocGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KTogUGF0Y2gge1xuICAgIHJldHVybiB7IG9wOiAncmVwbGFjZScsIHBhdGgsIHZhbHVlIH07XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIGEgdmFsdWUgZnJvbSBvbmUgbG9jYXRpb24gdG8gYW5vdGhlciB3aXRoaW4gdGhlIEpTT04gZG9jdW1lbnQuIEJvdGhcbiAgICogZnJvbSBhbmQgcGF0aCBhcmUgSlNPTiBQb2ludGVycy5cbiAgICpcbiAgICogQGV4YW1wbGUgSnNvblBhdGNoLmNvcHkoJy9iaXNjdWl0cy8wJywgJy9iZXN0X2Jpc2N1aXQnKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjb3B5KGZyb206IHN0cmluZywgcGF0aDogc3RyaW5nKTogUGF0Y2gge1xuICAgIHJldHVybiB7IG9wOiAnY29weScsIGZyb20sIHBhdGggfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyBhIHZhbHVlIGZyb20gb25lIGxvY2F0aW9uIHRvIHRoZSBvdGhlci4gQm90aCBmcm9tIGFuZCBwYXRoIGFyZSBKU09OIFBvaW50ZXJzLlxuICAgKlxuICAgKiBAZXhhbXBsZSBKc29uUGF0Y2gubW92ZSgnL2Jpc2N1aXRzJywgJy9jb29raWVzJylcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbW92ZShmcm9tOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IFBhdGNoIHtcbiAgICByZXR1cm4geyBvcDogJ21vdmUnLCBmcm9tLCBwYXRoIH07XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgdGhhdCB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIHNldCBpbiB0aGUgZG9jdW1lbnQuIElmIHRoZSB0ZXN0IGZhaWxzLFxuICAgKiB0aGVuIHRoZSBwYXRjaCBhcyBhIHdob2xlIHNob3VsZCBub3QgYXBwbHkuXG4gICAqXG4gICAqIEBleGFtcGxlIEpzb25QYXRjaC50ZXN0KCcvYmVzdF9iaXNjdWl0L25hbWUnLCAnQ2hvY28gTGVpYm5peicpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRlc3QocGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KTogUGF0Y2gge1xuICAgIHJldHVybiB7IG9wOiAndGVzdCcsIHBhdGgsIHZhbHVlIH07XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBhIHNldCBvZiBKU09OLVBhdGNoIChSRkMtNjkwMikgb3BlcmF0aW9ucyB0byBgZG9jdW1lbnRgIGFuZCByZXR1cm5zIHRoZSByZXN1bHQuXG4gICAqIEBwYXJhbSBkb2N1bWVudCBUaGUgZG9jdW1lbnQgdG8gcGF0Y2hcbiAgICogQHBhcmFtIG9wcyBUaGUgb3BlcmF0aW9ucyB0byBhcHBseVxuICAgKiBAcmV0dXJucyBUaGUgcmVzdWx0IGRvY3VtZW50XG4gICAqL1xuICBwdWJsaWMgcGF0Y2goZG9jdW1lbnQ6IGFueSwgLi4ub3BzOiBQYXRjaFtdKTogYW55IHtcbiAgICBjb25zdCByZXN1bHQgPSBhcHBseVBhdGNoKFxuICAgICAgZG9jdW1lbnQsXG4gICAgICBvcHMgYXMgT3BlcmF0aW9uW10sXG4gICAgKTtcbiAgICByZXR1cm4gcmVzdWx0Lm5ld0RvY3VtZW50O1xuICB9XG59Il19