const path = require('path')
const Mustache = require('mustache')

const { readFile, writeFile, makePath } = require('./fn/files.js')
const { renderAreas } = require('./fn/render.js')

const { storeGet, storeGetAll } = require('./../scripts/store.js')
const { templatesGet } = require('./../scripts/templates.js')


const generate = async ({ path, page, slug, generated }) => {

	const renderedHtml = Mustache.render(templatesGet('pages')[page.template], {
		page,
		generated,
		areas: renderAreas(page.areas)
	}, templatesGet('partials'))

	await makePath('serve/' + path + '/' + slug)
	await writeFile('serve/' + path + '/' + slug + '/index.html', renderedHtml)
}

exports.generate = generate