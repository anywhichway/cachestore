# cachestore
A standalone memory cache and wrapper for storage engines supporting the localStore, Redis or similar APIs

# installation

npm install cachestore

# usage

`new CacheStore(window.localStorage)`

`new CacheStore(new BlockStore("./db",true,"utf8"))`


# Release History (reverse chronological order)

v0.0.1 First public release (Still needs work an LRU scavenging)
