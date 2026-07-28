const path = require('path');

const staticfile = require('./utils/staticfile');
const setCors = require('./utils/cors');
const graphqlController = require('./controllers/graphql');
const uploadController = require('./controllers/upload');
const loadFileController = require('./controllers/loadFile');

const DIST_UI = path.join(__dirname, '../dist');
const DIST_MASTER = path.join(__dirname, '../dist2');

const serveMaster = (req, res) => {
  const pathname = path.join(DIST_MASTER, req.url).split(/[?#]/)[0];
  staticfile(pathname, req, res, path.join(DIST_MASTER, '/index.html'), {}, DIST_MASTER);
};

// assets: không fallback về index.html, thiếu file thì trả 404
const serveMasterAsset = (req, res) => {
  const pathname = path.join(DIST_MASTER, req.url).split(/[?#]/)[0];
  staticfile(pathname, req, res, null, {}, DIST_MASTER);
};

const router = require('find-my-way')({
  ignoreTrailingSlash: true,
  ignoreDuplicateSlashes: true,
  defaultRoute: (req, res) => {
    const pathname = path.join(DIST_UI, req.url == '/' ? '/index.html' : req.url).split(/[?#]/)[0];
    staticfile(pathname, req, res, path.join(DIST_UI, '/index.html'), {}, DIST_UI);
  },
});

//------------------------------Health check----------------------------------------------
router.on('GET', '/healthz', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
});

router.on('OPTIONS', '*', (req, res, params) => {
  setCors(req, res);
  res.writeHead(204, {
    'Access-Control-Allow-Headers': 'token,content-type,tenant',
    'Access-Control-Allow-Methods': 'GET,POST',
    'Access-Control-Max-Age': '86400',
  }).end();
});

//------------------------------Graphql--------------------------------------------------
router.on('GET', '/graphql', graphqlController.graphiql);
router.on('POST', '/graphql', graphqlController.graphqlHandler);

//------------------------------Files----------------------------------------------------
router.on('GET', '/load-file/*', loadFileController);
router.on('POST', '/upload', uploadController);

//------------------------------UI master (Next static export)---------------------------
router.on('GET', '/master', serveMaster);
router.on('GET', '/master/*', serveMaster);
router.on('GET', '/_next/*', serveMasterAsset);
router.on('GET', '/config.env', serveMasterAsset);

module.exports = router;
