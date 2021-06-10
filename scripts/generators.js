let generators = {}

const generatorsGet = key => generators[key]
const generatorsSet = data => generators = data

exports.generatorsGet = generatorsGet
exports.generatorsSet = generatorsSet