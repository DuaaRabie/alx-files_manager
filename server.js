import express from 'express';
// import startServer from './libs/boot';
// import injectRoutes from './routes';
// import injectMiddlewares from './libs/middlewares';

const app = express();
app.use('/', require('./routes/index'));
// injectMiddlewares(server);
// injectRoutes(server);
// startServer(server);
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
