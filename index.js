(function() {
	"use strict";
	const delegate = (object,delegateProperty,block=[]) => {
		return new Proxy(object,{
			get: (target,property) => {
				// return value if property in in target instance
				if(property in target) { return target[property]; }
				// selectively block forwarding
				if(block.includes(property)) { return; }
				// get the property from the delegate
				const value = target[delegateProperty][property];
				if(typeof(value)==="function") {
					// if it is a function, proxy it so that scope is correct
					return new Proxy(value,{
						apply: (f,thisArg,argumentsList) => {
							// if trying to call on target, then use delegate
							// else call on provided thisArg
							const scope = (thisArg===target
									? target[delegateProperty]
							: thisArg);
							return f.apply(scope,argumentsList);
						}
					});
				}
				return value;
			}
		});
	}

	class CacheStore {
		constructor(storageProvider,options={}) {
			!storageProvider || (this.storageProvider = storageProvider);
			this.options = Object.assign({},options);
			this.options.scavengeThreshold || (this.options.scavengeThreshold= 10000);
			this.size = 0;
			this.keys = {};
			this.cache = {};
			this.hits = 0;
			if(typeof(window)==="undefined") {
				this.baseline = require("os").freemem();
			} else {
				this.baseline = Infinity;
			}
			if(storageProvider) { return delegate(this,"storageProvider"); }
			return this;
		}
		async clear() {
			const storageProvider = this.storageProvider;
			if(storageProvider) {
				await storageProvider.clear();
			}
			this.flush();
		}
		async count() {
			const storageProvider = this.storageProvider;
			if(storageProvider) {
				if(typeof(storageProvider.length)==="number") { return storageProvider.length; }
				return storageProvider.count();
			}
			return this.size;
		}
		async delete(id) {
			const storageProvider = this.storageProvider;
			this.flush(id);
			!storageProvider || (storageProvider.removeItem ? storageProvider.removeItem(id) : (storageProvider.del ? await storageProvider.del(id) : await storageProvider.delete(id)));
		}
		async get(id) {
			let record = this.cache[id];
			if(record) {
				record.hits++;
				return record.value;
			}
			const storageProvider = this.storageProvider,
				value = (storageProvider ? (await storageProvider.getItem ? await storageProvider.getItem(id) : await storageProvider.get(id)) : undefined);
			if(value===undefined) { return; }
			this.cache[id] = {hits:1,value:value};
			this.keys[this.size++] = id;
			//console.log("get",id,data)
			/*if(record.value) {
				record.hits++;
				this.hits++;
				return record.value;
			}
			if(this.hits > this.options.scavengeThreshold || this.lowMemory()) { this.scavenge(); }*/
			return value;
		}
		async key(number) {
			return this.keys[number];
		}
		async put(data,id) {
			if(!id) {
				const parts = this.options.keyPath.split(".");
				let node = data;
				for(let part of parts) {
					node = node[part];
					if(!node) { throw new Error("No key available for put! " + JSON.stringify(data)); }
				}
				id = node;
			}
			return await this.set(id,data);
		}
		scavenge(hitMin=3) { 
			for(let id in this.cache) {
				if(this.cache[id].hits<hitMin) { delete this.cache[id]; }
			}
			if(typeof(global)!=="undefined" && global.gc) { global.gc(); }
		}
		async set(id,data) {
			if(this.storageProvider) {
				this.storageProvider.setItem ? await this.storageProvider.setItem(id,data) : await this.storageProvider.set(id,data);
			}
			if(!this.cache[id]) {
				this.cache[id] = {value:data,hits:0};
				this.keys[this.size++] = id;
			}
			this.cache[id].value = data;
			return id;
		}
		flush(id) {
			if(id) {
				delete this.cache[id];
				for(let number in this.keys) {
					if(this.keys[number]===id) {
						delete this.keys[number];
						this.size--;
						break;
					}
				}
			}
			else {
				// help the gc along
				for(let key in this.cache) {
					delete this.cache[key];
				}
				delete this.cache; 
				this.cache = {};
				delete this.keys; 
				this.keys = {};
				this.size = 0;
			}
			if(typeof(global)!=="undefined" && global.gc) { global.gc(); }
		}
	}
	if(typeof(window)==="undefined") {
		const os = require("os");
		CacheStore.prototype.lowMemory = function(floor=0.2) {
			return  (os.freemem()/this.baseline) < floor;
		}
	} else {
		CacheStore.prototype.lowMemory = function(floor=0.2) {
			//window.performance.memory
			/*
			{
				  totalJSHeapSize: 29400000,
				  usedJSHeapSize: 15200000,
				  jsHeapSizeLimit: 1530000000
				}*/
			return true;
		}
	}
	CacheStore.prototype.getItem = CacheStore.prototype.get;
	CacheStore.prototype.setItem = CacheStore.prototype.set;
	CacheStore.prototype.removeItem = CacheStore.prototype.del = CacheStore.prototype.delete;
	if(typeof(module)!=="undefined") {
		module.exports = CacheStore;
	}
	if(typeof(window)!=="undefined") {
		window.CacheStore = CacheStore;
	}
}).call(this);