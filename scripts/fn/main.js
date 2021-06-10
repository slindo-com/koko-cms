// const bcrypt = require('bcrypt');

const _pipe = (f, g) => (...args) => g(f(...args))
exports.pipe = (...fns) => fns.reduce(_pipe)

exports.promisify = async function (fn, args) {
  return new Promise((resolve, reject) => fn(args, resolve, reject))
}
