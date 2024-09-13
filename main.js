import { FFmpeg } from './node_modules/@ffmpeg/ffmpeg/dist/esm/index.js'
import { toBlobURL, fetchFile } from './node_modules/@ffmpeg/util/dist/esm/index.js'

( async () => {
	const app = document.getElementById('app')

	const converting_list = document.createElement('ul')
	converting_list.id = 'converting-list'
	app.appendChild(converting_list)

	const log = document.createElement('p')
	log.className = 'log'
	app.appendChild(log)

	const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
	const ffmpeg = new FFmpeg()

	// /* Load WASM ffmpeg packages
	log.textContent = 'Loading ...'
	const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
	const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
	ffmpeg.load({ coreURL, wasmURL })
	log.textContent = ''
	// */

	const input = document.createElement('input')
	input.id = 'input-file-add'
	input.type = 'file'
	app.appendChild(input)

	const convert_button = document.createElement('button')
	convert_button.id = 'button-add'
	convert_button.textContent = 'Convert It!'
	convert_button.addEventListener('click', () => convertWEBMtoMP4())
	app.appendChild(convert_button)

	async function convertWEBMtoMP4() {
		if (!input.files[0]) {
			log.textContent = 'choose a file, please'
			return
		}

		for (let in_file of input.files) {
			const out = 'output.mp4'

			const converting_file_il = document.createElement('li')
			converting_file_il.className = 'converting-file'
			converting_list.appendChild(converting_file_il)

			const file_name = document.createElement('p')
			file_name.textContent = `${in_file.name} => ${out}`
			file_name.className = 'file-name'
			converting_file_il.appendChild(file_name)

			const progress_p = document.createElement('a')
			progress_p.className = 'progress_p'
			converting_file_il.appendChild(progress_p)

			ffmpeg.on('progress', ({progress, time}) => {
				progress_p.textContent = parseInt( progress * 100 ).toString() + "%"
			})

			await ffmpeg.writeFile(in_file.name, await fetchFile(in_file) )
			await ffmpeg.exec(['-i', in_file.name, out])
			const data = await ffmpeg.readFile(out)

			progress_p.textContent = 'end'

			const url = URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'}))

			progress_p.textContent = 'download this'
			progress_p.href = url
			progress_p.download = out
			progress_p.addEventListener('click', () => {
				converting_file_il.remove()
			})
			converting_file_il.appendChild(progress_p)
		}
	}
} )
.call(this)
