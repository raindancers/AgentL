"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerSize = void 0;
/**
 * GitHub Actions runner size. Controls the number of CPU cores available to the runner.
 * Larger runners are faster but cost more. Requires GitHub Team or Enterprise plan
 * for anything above STANDARD.
 */
var RunnerSize;
(function (RunnerSize) {
    /** 2 cores (default, free tier) */
    RunnerSize["STANDARD"] = "ubuntu-latest";
    /** 4 cores */
    RunnerSize["LARGE"] = "ubuntu-latest-4-cores";
    /** 8 cores */
    RunnerSize["XLARGE"] = "ubuntu-latest-8-cores";
    /** 16 cores */
    RunnerSize["XXLARGE"] = "ubuntu-latest-16-cores";
})(RunnerSize || (exports.RunnerSize = RunnerSize = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NoYXJlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFZQTs7OztHQUlHO0FBQ0gsSUFBWSxVQVNYO0FBVEQsV0FBWSxVQUFVO0lBQ3BCLG1DQUFtQztJQUNuQyx3Q0FBMEIsQ0FBQTtJQUMxQixjQUFjO0lBQ2QsNkNBQStCLENBQUE7SUFDL0IsY0FBYztJQUNkLDhDQUFnQyxDQUFBO0lBQ2hDLGVBQWU7SUFDZixnREFBa0MsQ0FBQTtBQUNwQyxDQUFDLEVBVFcsVUFBVSwwQkFBVixVQUFVLFFBU3JCIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBNZXJtYWlkRGlhZ3JhbU91dHB1dCB7XG4gIC8qKlxuICAgKiBUaGUgcGF0aCB3aGVyZSB0aGUgTWVybWFpZCBkaWFncmFtIHdpbGwgYmUgc2F2ZWQuIElmIG5vdCBwcm92aWRlZCBkZWZhdWx0cyB0byByb290XG4gICAqICovXG4gIHJlYWRvbmx5IHBhdGg/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE11c3QgZW5kIGluIGAubWRgLiBJZiBub3QgcHJvdmlkZWQsIGRlZmF1bHRzIHRvIGNkay1leHByZXNzLXBpcGVsaW5lLWRlcGxveW1lbnQtb3JkZXIubWRcbiAgICogKi9cbiAgcmVhZG9ubHkgZmlsZU5hbWU/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogR2l0SHViIEFjdGlvbnMgcnVubmVyIHNpemUuIENvbnRyb2xzIHRoZSBudW1iZXIgb2YgQ1BVIGNvcmVzIGF2YWlsYWJsZSB0byB0aGUgcnVubmVyLlxuICogTGFyZ2VyIHJ1bm5lcnMgYXJlIGZhc3RlciBidXQgY29zdCBtb3JlLiBSZXF1aXJlcyBHaXRIdWIgVGVhbSBvciBFbnRlcnByaXNlIHBsYW5cbiAqIGZvciBhbnl0aGluZyBhYm92ZSBTVEFOREFSRC5cbiAqL1xuZXhwb3J0IGVudW0gUnVubmVyU2l6ZSB7XG4gIC8qKiAyIGNvcmVzIChkZWZhdWx0LCBmcmVlIHRpZXIpICovXG4gIFNUQU5EQVJEID0gJ3VidW50dS1sYXRlc3QnLFxuICAvKiogNCBjb3JlcyAqL1xuICBMQVJHRSA9ICd1YnVudHUtbGF0ZXN0LTQtY29yZXMnLFxuICAvKiogOCBjb3JlcyAqL1xuICBYTEFSR0UgPSAndWJ1bnR1LWxhdGVzdC04LWNvcmVzJyxcbiAgLyoqIDE2IGNvcmVzICovXG4gIFhYTEFSR0UgPSAndWJ1bnR1LWxhdGVzdC0xNi1jb3JlcycsXG59Il19