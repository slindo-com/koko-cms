const Mustache = require('mustache')
const { writeFile, makePath } = require('./files.js')
const { storeGetAll } = require('./../../scripts/store.js')
const { templatesGet } = require('./../../scripts/templates.js')

exports.renderAreas = areasData => {
	let areasRendered = {}
	if(areasData) {
		for (const [areaSlug, areaData] of Object.entries(areasData)) {
			areasRendered[areaSlug] = (
				areaData.map(moduleData =>
					Mustache.render(templatesGet('modules')[moduleData.module], moduleData, {})
				)
			).join('')
		}
	}
	console.log(areasRendered)
	return areasRendered
}

exports.renderDebug = async () => {
	const storeData = JSON.stringify(storeGetAll()),
		pathMade = await makePath('serve/debug')
	writeFile('serve/debug/store.html', storeData)
}