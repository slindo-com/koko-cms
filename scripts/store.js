let store = {}

const storeGet = key => store[key]
const storeGetAll = () => store
const storeSet = (key, data) => store[key] = data

exports.storeGet = storeGet
exports.storeGetAll = storeGetAll
exports.storeSet = storeSet