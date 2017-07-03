var storage, expect;
if(typeof(window)!=="undefined") {
	// wrapping around localStorage is for testing only. localSorage runs faster without a cache.
	const localstore = window.localStorage;
	storage = new CacheStore(window.localStorage);
} else {
	const CacheStore = require("../index.js"),
		BlockStore = require("blockstore");
	expect = require("chai").expect;
	const localstore = new BlockStore("./test/data",true,"utf8");
	storage = new CacheStore(localstore);
}


describe("tests",function() {
	it("should set, get, delete",done => {
		storage.set("testid1","test data").then(() => {
			storage.get("testid1").then(data => {
				expect(data.toString()).to.equal("test data");
				storage.delete("testid1").then(result => {
					expect(result).to.equal(undefined);
					storage.get("testid1").then(data => {
						expect(data==null).to.equal(true);
						done();
					});
				});
			});
		});
	});
});