const { storeGet } = require('./../scripts/store.js')

exports.getCollection = async collectionType => {
	return storeGet('collectionsData')[collectionType]
		? storeGet('collectionsData')[collectionType]
		: []
}