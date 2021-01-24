import http from 'http'
import path from 'path'
import { rummageFolder, PathMap } from './import-mapper'
import { Logger } from './logger'

const mimeTypes: { [key: string]: string } = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  jpg: 'image/jpeg'
}

function runServer(files: PathMap[]) {
  const server = http.createServer(async (req, res) => {
    const urlArray = req.url?.split('/').filter(Boolean) || []
    const fileName = !urlArray.length || !req.url?.includes('.') ? ['index.html'] : urlArray
    const filePath = path.resolve('src', ...fileName)

    const [ , extension] = fileName.pop()?.split('.') || ''
    const contentType = extension in mimeTypes && mimeTypes[extension]

    if(!contentType) {
      return res.end('Content Type not allowed: ' + extension)
    }

    try {
      const fileContent = await loadFileContent(filePath)

      const configs = {
        'Content-Type': `${contentType}; charset=utf-8`,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      }
      
      res.writeHead(200, configs)
      res.end(fileContent)
    } catch(err) {
      console.log(err.message)
      return notFound(res)
    }
  })

  function loadFileContent(filePath: string) {
    return new Promise((resolve, reject) => {
      const file = files.find(file => file.path === filePath)

      if(!file) return reject(
        new Error(`File in path, not found ${filePath}`)
      )

      resolve(file.data)
    })
  }

  function notFound(res: http.ServerResponse) {
    res.writeHead(404)
    res.end()
  }

  const port = process.env.PORT || 3000
  server.listen(port, () => Logger.startServer(port))
}

async function run() {
  const compileResult = await rummageFolder({
    initialFolder: 'src',
    extensions: ['html', 'jpg', 'css', 'js']
  })

  if(compileResult.success) {
    runServer(compileResult.paths)
  } else {
    Logger.tscError(compileResult)
  }
}

run()
