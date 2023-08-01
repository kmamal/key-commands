const { ObjectMatcher } = require('./object-matcher')
const { fromShortcut, allModifiers } = require('./shortcuts')
const { pick } = require('@kmamal/util/object/pick')

const options = { indexable: [ (x) => x['key'] ?? x['text'] ] }

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
			mode.unshift({
				shortcut: '?',
				description: "Print help",
				command: () => { this.printHelp() },
			})

			const matcher = new ObjectMatcher(options)
			for (const binding of mode) {
				const pattern = fromShortcut(binding.shortcut)
				matcher.addPattern(pattern, binding)
			}
			mode.matcher = matcher
		}

		this._currentMode = globalMode
		this._currentModeName = 'global'

		this._window = null
		this._onKeyDown = null
		this._onTextInput = null
	}

	get modes () { return this._modes }
	get mode () { return this._currentMode }
	get modeName () { return this._currentModeName }

	setMode (modeName) {
		this._currentModeName = modeName
		this._currentMode = this._modes[modeName]

		if (!this._currentMode) { throw Object.assign(new Error("invalid mode"), { modeName }) }
		return this
	}

	_dispatch (event) {
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

	attach (window) {
		if (this._window) { this.detach() }
		this._window = window

		let lastModifiers = {}

		this._onKeyDown = (event) => {
			lastModifiers = pick(event, allModifiers)
			this._dispatch(event)
		}

		this._onTextInput = (event) => {
			this._dispatch({
				...event,
				...lastModifiers,
			})
		}

		window.on('keyDown', this._onKeyDown)
		window.on('textInput', this._onTextInput)
		return this
	}

	detach () {
		this._window.off('keyDown', this._onKeyDown)
		this._window.off('textInput', this._onTextInput)
		this._window = null
		this._onKeyDown = null
		this._onTextInput = null
		return this
	}

	printHelp () {
		for (const [ modeName, bindings ] of Object.entries(this.modes)) {
			if (bindings.length === 0) { continue }
			console.log(`${modeName}-mode commands:`)
			let maxLength = 0
			for (const { shortcut } of bindings) {
				maxLength = Math.max(maxLength, shortcut.length)
			}
			for (const { shortcut, description } of bindings) {
				console.log(`  ${shortcut.padEnd(maxLength)}  ${description}`)
			}
		}
		return this
	}
}

module.exports = { KeyCommands }
