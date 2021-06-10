let templates = {}

const templatesGet = key => templates[key]
const templatesSet = (key, data) => templates[key] = data

exports.templatesGet = templatesGet
exports.templatesSet = templatesSet