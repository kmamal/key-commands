const sdl = require('@kmamal/sdl')

const allModifiers = [ 'ctrl', 'shift', 'alt', 'super', 'altgr' ]

const modifiersPattern = `^(?<modifiers>(?:${allModifiers.join('|')})\\+)*`
const modifiersRegex = new RegExp(modifiersPattern, 'u')

const fromShortcut = (shortcut) => {
	const pattern = {}

	const { groups: { modifiers = '' } } = modifiersRegex.exec(shortcut)
	const setModifiers = new Set(modifiers.split('+').slice(0, -1))
	for (const modifier of allModifiers) {
		pattern[modifier] = setModifiers.has(modifier)
	}

	const key = shortcut.slice(modifiers.length)
	if (sdl.keyboard.getScancode(key)) {
		pattern.key = key
	} else {
		if (key.length > 1) {
			throw Object.assign(new Error("invalid key"), { shortcut, key })
		}
		pattern.text = key
	}

	return pattern
}

module.exports = { fromShortcut }
