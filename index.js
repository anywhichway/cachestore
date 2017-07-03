(function() {
	"use strict";
	const delegate = (object,delegateProperty,block=[]) => {
		  return new Proxy(object,{
		     get: (target,property) => {
		    	 // return value if property in in target instance
		    	 if(property in target) return target[property];
		    	 // selectively block forwarding
		    	 if(block.includes[property]) return;
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
		  })
		}

	class CacheStore {
		constructor(storageProvider,options={}) {
			!storageProvider || (this.storageProvider = storageProvider);
			this.options = Object.assign({},options);
			this.options.scavengeThreshold || (this.options.scavengeThreshold= 10000);
			this.cache = {};
			this.hits = 0;
			if(typeof(window)==="undefined") {
				this.baseline = require("os").freemem();
			} else {
				this.baseline = Infinity;
			}
			if(storageProvider) return delegate(this,"storageProvider");
			return this;
		}
		async count() {
			if(this.storageProvide) {
				if(this.storageProvider.length!==undefined) return this.storageProvider.length;
				return this.storageProvider.count();
			}
			return Object.keys(this.cache).length;
		}
		async delete(id) {
			this.flush(id);
			!this.storageProvider || (this.storageProvider.removeItem ? this.storageProvider.removeItem(id) : (this.storageProvider.del ? await this.storageProvider.del(id) : await this.storageProvider.delete(id)));
		}
		async get(id) {
			const record = this.cache[id] || (this.cache[id] = {hits:0});
			//console.log("get",id,data)
			if(record.value) {
				record.hits++;
				this.hits++;
				return record.value;
			}
			if(this.hits > this.options.scavengeThreshold || this.lowMemory()) { this.scavenge(); }
			return (this.storageProvider ? record.value = (await this.storageProvider.getItem ? await this.storageProvider.getItem(id) : await this.storageProvider.get(id)) : undefined);
		}
		scavenge(hitMin=3) { 
			for(let id in this.cache) {
				if(this.cache[id].hits<hitMin) delete this.cache[id];
			}
			if(typeof(global)!=="undefined" && global.gc) global.gc();
		}
		async replace(id,data) {
			const record = this.cache[id];
			if(record) {
				record.value = data;
				!this.storageProvider || await this.storageProvider.replace(id,data);
			}
			return id;
		}
		async set(id,data) {
			const record = this.cache[id] || (this.cache[id] = {value:data,hits:0});
			!this.storageProvider || (this.storageProvider.setItem ? await this.storageProvider.setItem(id,data) : await this.storageProvider.set(id,data));
			return id;
		}
		flush(id) {
			if(id) { delete this.cache[id]; }
			else {
				// help the gc along
				for(let key in this.cache) {
					delete this.cache[key];
				}
				delete this.cache; 
				this.cache = {};
			}
			if(typeof(global)!=="undefined" && global.gc) global.gc();
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