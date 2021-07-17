
const allModifiers = [ 'ctrl', 'shift', 'alt', 'super', 'altgr' ]

const modifiersPattern = `^(?<modifiers>(?:${allModifiers.join('|')})\\+)*`
const modifiersRegex = new RegExp(modifiersPattern, 'u')

const fromShortcut = (_pattern) => {
	const pattern = {}
	const { groups: { modifiers = '' } } = modifiersRegex.exec(_pattern)
	const setModifiers = new Set(modifiers.split('+').slice(0, -1))
	for (const modifier of allModifiers) {
		pattern[modifier] = setModifiers.has(modifier)
	}
	pattern.key = _pattern.slice(modifiers.length)
	return pattern
}

module.exports = { fromShortcut }
