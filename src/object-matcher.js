const { withHooks } = require('@kmamal/util/map/with-hooks')
const { matches } = require('@kmamal/util/object/matches')
const { indexOfWith } = require('@kmamal/util/array/index-of')
const { isEqual } = require('@kmamal/util/object/is-equal')

const _recurseEntries = function * (collection) {
	if (Array.isArray(collection)) {
		for (const entry of collection) { yield entry }
		return
	}

	for (const child of collection.values()) {
		yield* _recurseEntries(child)
	}
}

class ObjectMatcher {
	constructor (options = {}) {
		const { indexable = [] } = options

		this._indexable = indexable

		let factory = () => []
		for (let i = 0; i < indexable.length; i++) {
			const hooks = { factory }
			factory = () => withHooks(hooks)
		}
		this._entries = factory()
		this._size = 0
	}

	get size () { return this._size }

	* entries () {
		yield* _recurseEntries(this._entries)
	}

	* patterns () { for (const entry of this.entries()) { yield entry[0] } }
	* values () { for (const entry of this.entries()) { yield entry[1] } }

	addPattern (pattern, value) {
		let entries = this._entries
		for (const prop of this._indexable) {
			const key = pattern[prop]
			entries = entries.get(key)
		}

		entries.push([ pattern, value ])
		this._size++
	}

	removePattern (pattern, value) {
		let entries = this._entries
		for (const prop of this._indexable) {
			const key = pattern[prop]
			if (!entries.has(key)) { return }
			entries = entries.get(key)
		}

		const index = indexOfWith(entries, [ pattern, value ], isEqual)
		if (index === -1) { return }

		entries.splice(index, 1)
		this._size--
	}

	match (obj) {
		let entries = this._entries
		for (const prop of this._indexable) {
			const key = obj[prop]
			if (!entries.has(key)) { return [] }
			entries = entries.get(key)
		}

		const result = []
		for (const entry of entries) {
			if (!matches(obj, entry[0])) { continue }
			result.push(entry[1])
		}
		return result
	}
}

module.exports = { ObjectMatcher }
