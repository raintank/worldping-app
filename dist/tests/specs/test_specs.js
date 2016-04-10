"use strict";

System.register(["./test_utils"], function (_export, _context) {
  var describe, it, expect;
  return {
    setters: [function (_test_utils) {
      describe = _test_utils.describe;
      it = _test_utils.it;
      expect = _test_utils.expect;
    }],
    execute: function () {

      describe("testing testing", function () {

        it("should work", function () {
          expect(true).to.be(true);
        });
      });
    }
  };
});
//# sourceMappingURL=test_specs.js.map
