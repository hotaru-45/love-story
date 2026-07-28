const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const http = require('http');
const https = require('https');
const fs = require('fs');

const cluster = require('cluster');
const numCPUs = require('os').availableParallelism();
const process = require('process');

const mongoose = require('mongoose');

const router = require('./router');
const { UserMasters, Companies, Users } = require('./models');
const { SECRET, SECRET_MASTER } = require('./constants');
const { hashPassword } = require('./graphql/utils/passwordHash');
const { seedLoveStoryContent } = require('./seed/seedLoveStoryContent');

const EventEmitter = require('node:events');
const logger = require('./logger');
const myEvents = new EventEmitter();

async function starting() {
  var server_1 = undefined;
  var server_2 = undefined;
  if (process.env.PORT_SSL) {
    const options = {
      key: fs.readFileSync(path.join(__dirname, './ssl/server_new.key')),
      cert: fs.readFileSync(path.join(__dirname, './ssl/server.crt')),
    };
    server_1 = https.createServer(options, (req, res) => {
      req.myEvents = myEvents;
      router.lookup(req, res);
    });
    server_2 = http.createServer((req, res) => {
      req.myEvents = myEvents;
      res.writeHead(301, { Location: `https://${process.env.URL ? process.env.URL : req.headers.host}${req.url}` });
      res.end();
    });
  } else {
    server_1 = http.createServer((req, res) => {
      req.myEvents = myEvents;
      router.lookup(req, res);
    });
  }

  if (server_1) {
    const port = process.env.PORT_SSL ? process.env.PORT_SSL : process.env.PORT;
    server_1.listen(parseInt(port), () => {
      logger.info('Server listening on http://localhost:' + port + '/ ...');
      if (!fs.existsSync(path.resolve(__dirname, './uploads/index.html'))) {
        fs.mkdirSync(path.resolve(__dirname, './imports'), { recursive: true });
        fs.mkdirSync(path.resolve(__dirname, './uploads'), { recursive: true });
        fs.writeFile(path.resolve(__dirname, './uploads/index.html'), 'attachments', (err) => {
          if (err) {
            logger.error(err.stack ? err.stack : err);
          }
        });
      }
    });
  }
  if (server_2) {
    server_2.listen(parseInt(process.env.PORT), () => {
      logger.info('Server listening on http://localhost:' + process.env.PORT + '/ ...');
    });
  }
}

const { LRUCache } = require('lru-cache');
const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 180,
});
const pendingQueries = new Map();

// Company/user dùng cho trang Login của website kỷ niệm (FE: love-story).
// Đăng nhập thật qua GraphQL `login(code_company, username, password)`.
const COUPLE_COMPANY_CODE = 'LOVESTORY';
const COUPLE_USERNAME = 'love';
const COUPLE_PASSWORD = '123456';
// Cố định (không dùng randomUUID) — id_tenant ghép với NAME_APP thành tên
// database Mongo thật (`${NAME_APP}_${id_tenant}`), UUID đầy đủ (36 ký tự)
// làm tên database vượt giới hạn 38 byte của MongoDB Atlas.
const COUPLE_TENANT_ID = 'lovestory';

async function seedCoupleAccount() {
  let company = await Companies().findOne({ code_company: COUPLE_COMPANY_CODE }).lean();
  if (!company) {
    const id_tenant = COUPLE_TENANT_ID;
    company = { id_tenant, code_company: COUPLE_COMPANY_CODE, name_company: 'Love Story' };
    await Companies().insertMany([company]);
    logger.info(`Seeded company ${COUPLE_COMPANY_CODE}`);
  }

  const existingUser = await Users(company.id_tenant).findOne({ username: COUPLE_USERNAME }).lean();
  if (existingUser) return;

  await Users(company.id_tenant).insertMany([
    {
      username: COUPLE_USERNAME,
      password: await hashPassword(COUPLE_PASSWORD, SECRET.SECRET_PASS + company.id_tenant),
      full_name: 'Love Story',
      permission: 'ADMIN',
      is_super_admin: true,
    },
  ]);
  logger.info(`Seeded user "${COUPLE_USERNAME}" for tenant ${COUPLE_COMPANY_CODE}`);
}

async function seedCoupleContent() {
  const company = await Companies().findOne({ code_company: COUPLE_COMPANY_CODE }).lean();
  if (!company) return;
  await seedLoveStoryContent(company.id_tenant);
}

async function setup() {
  mongoose
    .connect(process.env.MONGODB_DATA_URL)
    .then(async () => {
      logger.info('Setup DB!');
      UserMasters().findOne({ username: 'sadmin' })
        .lean()
        .then(async (v) => {
          if (v !== null) return;
          UserMasters().insertMany([
            {
              username: 'sadmin',
              password: await hashPassword('sadmin', SECRET_MASTER.SECRET_PASS),
              full_name: "sadmin",
            },
          ]);
        });

      seedCoupleAccount()
        .then(() => seedCoupleContent())
        .catch((err) => logger.error(err.stack ? err.stack : err.message));
    })
    .catch((err) => logger.error(err.stack ? err.stack : err.message));
}

(async () => {
  const envCLUSTER = parseInt(process.env.CLUSTER);
  if (cluster.isPrimary) {
    logger.info(`Primary ${process.pid} is running`);
    await setup().catch((err) => logger.error(err.stack ? err.stack : err.message));
  }

  if (cluster.isPrimary && envCLUSTER >= 0) {
    for (let i = 0; i < (envCLUSTER > 0 ? envCLUSTER : numCPUs); i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      logger.info('worker is dead:', worker.isDead());
      cluster.fork();
    });
  } else {
    logger.info(`Worker ${process.pid} started`);
    await mongoose.connect(process.env.MONGODB_DATA_URL);
    await starting().catch((err) => logger.error(err.stack ? err.stack : err.message));
  }
})().catch((e) => {
  logger.error(e.stack);
});
