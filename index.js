const fs = require('fs')
const watch = require('node-watch')
const yaml = require('js-yaml')
const express = require('express')
const sass = require('node-sass')

const { storeGet, storeSet } = require('./scripts/store.js')
const { templatesGet, templatesSet } = require('./scripts/templates.js')
const { assetsGet, assetsSet } = require('./scripts/assets.js')
const { generatorsSet } = require('./scripts/generators.js')
const { readFile, writeFile, makePath, deleteFolder, getFiles, getFilteredFiles } = require('./scripts/fn/files.js')
const { renderPages } = require('./scripts/renderer.js')

const { getCollection } = require('./scripts/collections.js')
const { generate } = require('./scripts/generator.js')

const site = express()
site.use('/', express.static('serve'))
site.listen(8080, function () {
	console.log('TO SEE SITE GO TO http://localhost:8080/')
})

watch('./src/data', { recursive: true }, async (e, fileName) => {
	console.log('DATA: %s changed.', fileName, e);

	switch(fileName.split('/')[2]) {
		case 'config.yml':
			await updateMainConfig()
			break;
		case 'collections':
			await updateCollections()
			break;
		case 'l18n':
			await console.log('LANGUAGES')
			break;
		case 'pages':
			await updatePages()
			break;
		case 'partials':
			await console.log('PARTIALS')
			break;
	}

	renderPages()
})

watch('./src/templates', { recursive: true }, async (e, fileName) => {

	switch(fileName.split('/')[2]) {
		case 'modules':
			await updateTemplateModules()
			break;
		case 'pages':
			await updateTemplatePages()
			break;
		case 'partials':
			await updateTemplatePartials()
			break;
	}

	renderPages()
})

watch('./src/styles', { recursive: true }, (e, fileName) => {
	renderSass()
})



//


const updateMainConfig = () => {
	const newMainConfig = getYmlFileAsJson('./src/data/config.yml')

	if(!newMainConfig.error) {
		storeSet('configData', newMainConfig.content)
	} else {
		console.warn('Please add your main config to your data!')
	}
}

const updateCollections = async () => {
	const collectionsFiles = await getFilteredFiles('./src/data/collections', /\.(yml)$/i)

	let collections = {}
	collectionsFiles.map(fileName => {
		const collectionKind = fileName.split('/')[3]

		if(!collections[collectionKind]) {
			collections[collectionKind] = []
		}

		const collectionItem = getYmlFileAsJson(fileName)
		if(!collectionItem.error) {
			collections[collectionKind].push(collectionItem.content)
		}
	})

	storeSet('collectionsData', collections)
}

const updatePages = async () => {
	const pagesFiles = await getFilteredFiles('./src/data/pages', /\.(yml)$/i)

	let pagesData = {}
	pagesFiles.map(fileName => {
		const pagePath = getPagePath(fileName)
		const pageConfig = getYmlFileAsJson(fileName)
		if(!pageConfig.error) {
			pagesData[pagePath] = pageConfig.content
		}
	})

	storeSet('pagesData', pagesData)
}


const updateTemplatePages = async () => {
	const pagesConfigFiles = await getFilteredFiles('./src/templates/pages', /\.(yml)$/i)
	const pagesTemplateFiles = await getFilteredFiles('./src/templates/pages', /\.(mustache)$/i)
	const pagesModifierFiles = await getFilteredFiles('./src/templates/pages', /(.*)modifier\.(js)$/i)
	const pagesGeneratorFiles = await getFilteredFiles('./src/templates/pages', /(.*)generator\.(js)$/i)

	let pagesConfig = {}
	pagesConfigFiles.map(fileName => {
		const pagesKind = fileName.split('/')[3]
		const pageConfig = getYmlFileAsJson(fileName)
		pagesConfig[pagesKind] = pageConfig.content
	})

	storeSet('pagesConfig', pagesConfig)


	let pagesTemplates = {}
	await Promise.all(
		pagesTemplateFiles.map(async fileName => {
			const pagesKind = fileName.split('/')[3]
			const pageTemplate = await readFile(fileName)
			pagesTemplates[pagesKind] = pageTemplate
		})
	)

	templatesSet('pages', pagesTemplates)


	let modifiers = {}
	await Promise.all(
		pagesModifierFiles.map(async fileName => {
			const pagesKind = fileName.split('/')[3]
			modifiers[pagesKind] = require('./../../' + fileName).default
		})
	)

	assetsSet('pageModifiers', modifiers)


	let generators = {}
	await Promise.all(
		pagesGeneratorFiles.map(async fileName => {
			const pagesKind = fileName.split('/')[3]
			generators[pagesKind] = require('./../../' + fileName).default
		})
	)

	generatorsSet(generators)
}



const updateTemplatePartials = async () => {
	const partialsTemplateFiles = await getFilteredFiles('./src/templates/partials', /\.(mustache)$/i)
	const partialsModifierFiles = await getFilteredFiles('./src/templates/pages', /\.(js)$/i)

	let partialsTemplates = {}
	await Promise.all(
		partialsTemplateFiles.map(async fileName => {
			const pagesKind = fileName.split('/')[3]
			const pageTemplate = await readFile(fileName)
			partialsTemplates[pagesKind] = pageTemplate
		})
	)

	templatesSet('partials', partialsTemplates)

	let modifiers = {}
	await Promise.all(
		partialsModifierFiles.map(async fileName => {
			const pagesKind = fileName.split('/')[3]
			modifiers[pagesKind] = require('./../../' + fileName).default
		})
	)

	assetsSet('partialModifiers', modifiers)
}

const updateTemplateModules = async () => {
	const modulesConfigFiles = await getFilteredFiles('./src/templates/modules', /\.(yml)$/i)
	const modulesTemplateFiles = await getFilteredFiles('./src/templates/modules', /\.(mustache)$/i)

	let modulesConfig = {}
	modulesConfigFiles.map(fileName => {
		const modulesKind = fileName.split('/')[3]
		const pageConfig = getYmlFileAsJson(fileName)
		modulesConfig[modulesKind] = pageConfig.content
	})

	storeSet('modulesConfig', modulesConfig)


	let modulesTemplates = {}
	await Promise.all(
		modulesTemplateFiles.map(async fileName => {
			const modulesKind = fileName.split('/')[3]
			const pageTemplate = await readFile(fileName)
			modulesTemplates[modulesKind] = pageTemplate
		})
	)

	templatesSet('modules', modulesTemplates)
}



const renderSass = async () => {
	await makePath('serve/styles')
	sass.render({
		file: './src/styles/styles.scss',
		outFile: './serve/styles/styles.css'
	}, async (err, val) => {
		if(!err) {
			await writeFile('serve/styles/styles.css', val.css)
		}
	})
}



//


const getPagePath = fileName => {
	let pagePath = fileName.split('/')
	pagePath.pop()
	pagePath.shift()
	pagePath.shift()
	pagePath.shift()
	return pagePath.join('/')
}




const getFileNameExtension = fileName => {
	const splitted = fileName.split('.')
	return splitted[splitted.length - 1]
}



const getYmlFileAsJson = fileName => {
	try {
		return {
			content: yaml.load(fs.readFileSync(fileName, 'utf8'))
		}
	} catch (e) {
		return {
			error: 'NOT_ABLE_TO_LOAD_JSON'
		}
	}
}

const init = async () => {
	await updateMainConfig()
	await updateCollections()
	await updatePages()

	await updateTemplatePages()
	await updateTemplatePartials()
	await updateTemplateModules()

	await renderPages()
	await renderSass()
}

init()

exports.getCollection = getCollection
exports.generate = generate
