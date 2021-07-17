const { KeyCommands } = require('.')

const commands = new KeyCommands({
	global: [
		{
			shortcut: 'a',
			command: () => { console.log('a') },
		},
		{
			shortcut: 'b',
			command: () => {
				console.log('b')
				commands.setMode(commands.modeName === 'global' ? 'edit' : 'global')
			},
		},
	],
	edit: [
		{
			shortcut: 'a',
			command: () => { console.log('edit - a') },
		},
		{
			shortcut: 'ctrl+a',
			command: () => { console.log('ctrl - a') },
		},
	],
})

const sdl = require('@kmamal/sdl')
// const Canvas = require('canvas')

const window = sdl.video.createWindow({ resizable: true })

// let width
// let height
// let ctx

// window.on('resize', () => {
// 	({ width, height } = window)
// 	const canvas = Canvas.createCanvas(window.width, window.height)
// 	ctx = canvas.getContext('2d')

// 	render()
// })

// const render = () => {
// 	ctx.clearRect(0, 0)
// }

window.on('keyDown', (event) => {
	commands.dispatch(event)
})
