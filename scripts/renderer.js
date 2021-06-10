const path = require('path')
const Mustache = require('mustache')

const { readFile, writeFile, makePath } = require('./fn/files.js')
const { renderDebug, renderAreas } = require('./fn/render.js')
// const { markdownToJson, markdownModulesToJson } = require('./fn/markdown.js')


const { storeGet } = require('./../scripts/store.js')
const { templatesGet } = require('./../scripts/templates.js')
const { generatorsGet } = require('./../scripts/generators.js')
const { assetsGet } = require('./../scripts/assets.js')


const renderPages = async () => {
	renderDebug()

	for (const [pagePath, pageConfig] of Object.entries(storeGet('pagesData'))) {

		const pageConfigModified = assetsGet('pageModifiers')[pageConfig.template]
			? await assetsGet('pageModifiers')[pageConfig.template](pageConfig)
			: pageConfig		

		const renderedHtml = Mustache.render(templatesGet('pages')[pageConfig.template], {
			page: pageConfigModified,
			areas: renderAreas(pageConfig.areas)
		}, templatesGet('partials'))

		await makePath('serve/' + pagePath)
		await writeFile('serve/' + pagePath + '/index.html', renderedHtml)

		if(generatorsGet(pageConfig.template)) {
			generatorsGet(pageConfig.template)(pagePath, pageConfig)
		}
	}

}

exports.renderPages = renderPages