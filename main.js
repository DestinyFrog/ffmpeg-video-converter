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

	// /* Load WASM ffmpeg packages
	log.textContent = 'Loading ...'
	const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
	const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
	const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
	log.textContent = ''
	// */

	const input = document.createElement('input')
	input.id = 'input-file-add'
	input.type = 'file'
	app.appendChild(input)

	const select_out_extension = document.createElement('select')
	app.appendChild(select_out_extension)

	const extensions = [ 'mp4', 'mkv', 'mov', 'avi', 'webm' ]
	extensions.forEach(ext => {
		const option_out_extension = document.createElement('option')
		option_out_extension.value = ext
		option_out_extension.textContent = ext
		select_out_extension.appendChild(option_out_extension)
	})

	const convert_button = document.createElement('button')
	convert_button.id = 'button-add'
	convert_button.textContent = 'Convert It!'
	convert_button.addEventListener('click', () => convertTo())
	app.appendChild(convert_button)

	async function loadVideo(in_file) {
		const ffmpeg = new FFmpeg()
		await ffmpeg.load({ coreURL, wasmURL })
		const out = `output.${select_out_extension.value}`

		const converting_file_il = document.createElement('li')
		converting_file_il.className = 'converting-file'
		converting_list.appendChild(converting_file_il)

		const file_name = document.createElement('p')
		file_name.textContent = `${in_file.name} ➡️ ${out}`
		file_name.className = 'file-name'
		converting_file_il.appendChild(file_name)

		const progress_bar = document.createElement('div')
		progress_bar.className = 'progress-bar'
	 	converting_file_il.appendChild(progress_bar)

		const inner_progress_bar = document.createElement('div')
		inner_progress_bar.className = 'inner-progress-bar'
		progress_bar.appendChild(inner_progress_bar)

		ffmpeg.on('progress', ({progress}) => {
			const percent = progress * 100
			inner_progress_bar.style.width = `${percent}%`
		})

		await ffmpeg.writeFile(in_file.name, await fetchFile(in_file) )
		await ffmpeg.exec(['-i', in_file.name, out])
		const data = await ffmpeg.readFile(out)
		const url = URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'}))

		const result_p = document.createElement('a')
		converting_file_il.appendChild(result_p)
		result_p.textContent = 'download this'
		result_p.href = url
		result_p.download = out
		result_p.addEventListener('click', () => {
			converting_file_il.remove()
		})
		converting_file_il.appendChild(result_p)
	}

	async function convertTo() {
		if (!input.files[0]) {
			log.textContent = 'choose a file, please'
			return
		}

		for (let in_file of input.files)
			loadVideo(in_file)

		input.value = ''

	}
} )
.call(this)
