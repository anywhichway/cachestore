# cachestore

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5d0b3507599946679d1e37302facb607)](https://www.codacy.com/app/syblackwell/cachestore?utm_source=github.com&utm_medium=referral&utm_content=anywhichway/cachestore&utm_campaign=badger)

A standalone memory cache and wrapper for storage engines supporting the localStore, Redis or similar APIs

# installation

npm install cachestore

# usage

`new CacheStore(window.localStorage)`

`new CacheStore(new BlockStore("./db",true,"utf8"))`


# Release History (reverse chronological order)

v0.0.2 2017-07-01 Fixed issues related to compatibility with localStorage API

v0.0.1 2017-07-01 First public release (Still needs work an LRU scavenging)
