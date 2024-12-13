import express from 'express';
import routes from './routes/index';
// import startServer from './libs/boot';
// import injectRoutes from './routes';
// import injectMiddlewares from './libs/middlewares';

const app = express();
const port = process.env.PORT || 5000;
app.use(routes);
// injectMiddlewares(server);
// injectRoutes(server);
// startServer(server);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
