import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

import { Application } from 'express';
import { engine } from 'express-handlebars';
import { routerApi } from './routes';
import { PORT } from './config/settings';
import { logger } from './logger';

const app: Application = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../templates/'));
routerApi(app);

app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Application listening');
});
