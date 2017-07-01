let cachestore, localstore;
if(typeof(window)!=="undefined") {
	localstore = window.localStorage;
	cachestore = new Cachestore(window.localStorage);
} else {
	const CacheStore = require("../index.js"),
		BlockStore = require("blockstore");
	localstore = new BlockStore("./test/data",true,"utf8");
	cachestore = new CacheStore(localstore);
}


async function test() {
	const testsize = 10000;
	console.log("Test Size:",testsize);
	let start = Date.now();
	for(let i=0;i<testsize;i++) {
		await localstore.set(i+"l","test string " + i);
	}
	let end = Date.now();
	console.log("localStorage Write Records Sec:", testsize / ((end-start)/1000));
	start = Date.now();
	for(let i=0;i<testsize;i++) {
		await localstore.set(i+"l","test string " + i);
	}
	end = Date.now();
	console.log("localStorage Second Write Records Sec:", testsize / ((end-start)/1000));
	start = Date.now();
	for(let i=0;i<testsize;i++) {
		await cachestore.set(i+"c","test string " + i);
	}
	end = Date.now();
	console.log("CacheStore Write Records Sec:", testsize / ((end-start)/1000));
	start = Date.now();
	for(let i=0;i<testsize;i++) {
		await localstore.get(i+"l");
	}
	end = Date.now();
	console.log("localStore Read Records Sec:", testsize / ((end-start)/1000));
	start = Date.now();
	for(let i=0;i<testsize;i++) {
		await cachestore.get(i+"c");
	}
	end = Date.now();
	console.log("CacheStore Read Records Sec:", testsize / ((end-start)/1000));
	console.log(localstore.length,await cachestore.count());
}
test();