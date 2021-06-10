const fs = require('fs')
const path = require('path')
const mkpath = require('mkpath')
const { promisify } = require('./main.js')

const readFileRaw = ({ pathToRead }, resolve, reject) =>
    fs.readFile(pathToRead, 'utf8',
      (err, val) =>
      !err ? resolve(val) : reject('err: read-file' + err)
    )

exports.readFile = pathToRead => promisify(readFileRaw, { pathToRead })

const writeFileRaw = ({ pathToWrite, content }, resolve, reject) =>
    fs.writeFile(pathToWrite, content, 'utf8',
      err =>
      !err ? resolve(true) : reject('err: write-file' + err)
    )

exports.writeFile = (pathToWrite, content) => promisify(writeFileRaw, { pathToWrite, content })

const makePathRaw = ({ dirToMake }, resolve, reject) =>
    mkpath(dirToMake,
      err =>
      !err ? resolve(true) : reject('err: mkpath')
    )

exports.makePath = dirToMake => promisify(makePathRaw, { dirToMake })

const deleteFolder = dirToDelete => {
  if (fs.existsSync(dirToDelete)) {
    fs.readdirSync(dirToDelete).forEach(file => {
      const curPath = dirToDelete + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(dirToDelete)
  }
}

exports.deleteFolder = deleteFolder

const getFiles = dir => {
  return fs.statSync(dir).isDirectory()
        ? Array.prototype.concat(...fs.readdirSync(dir).map(f => getFiles(path.join(dir, f))))
        : dir
}

exports.getFilteredFiles = async (dir, filter) => {
  return getFiles(dir).filter(val => val.match(filter))
}

exports.getFiles = getFiles
