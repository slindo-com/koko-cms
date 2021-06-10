let assets = {}

const assetsGet = key => assets[key]
const assetsGetAll = () => assets
const assetsSet = (key, data) => assets[key] = data

exports.assetsGet = assetsGet
exports.assetsGetAll = assetsGetAll
exports.assetsSet = assetsSet