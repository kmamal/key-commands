const { ObjectMatcher } = require('./object-matcher')
const { fromShortcut } = require('./shortcuts')

const options = { indexable: [ 'key' ] }

class KeyCommands {
	constructor (modes) {
		this._modes = modes

		let globalMode = modes.global
		if (!globalMode) {
			globalMode = []
			modes.global = globalMode
		}
		this._globalMode = globalMode

		for (const mode of Object.values(modes)) {
			const matcher = new ObjectMatcher(options)
			for (const binding of mode) {
				const pattern = fromShortcut(binding.shortcut)
				matcher.addPattern(pattern, binding)
			}
			mode.matcher = matcher
		}

		this._currentMode = globalMode
		this._currentModeName = 'global'
	}

	get modes () { return this._modes }
	get mode () { return this._currentMode }
	get modeName () { return this._currentModeName }

	setMode (modeName) {
		this._currentModeName = modeName
		this._currentMode = this._modes[modeName]

		if (!this._currentMode) { throw Object.assign(new Error("invalid mode"), { modeName }) }
	}

	dispatch (event) {
		{
			const matches = this._currentMode.matcher.match(event)
			if (matches.length > 0) {
				const binding = matches[0]
				binding.command(event, binding)
				return true
			}
		}

		{
			const globalMatches = this._globalMode.matcher.match(event)
			if (globalMatches.length > 0) {
				const binding = globalMatches[0]
				binding.command(event, binding)
				return true
			}
		}

		return false
	}
}

module.exports = { KeyCommands }
