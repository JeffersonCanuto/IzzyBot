import express, { Request, Response, NextFunction } from 'express';

import ChatRoutes from '@src/routes/ChatRoute';

import Paths from '@src/constants/Paths';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { RouteError } from '@src/utils/route-errors';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Add APIs, must be after middleware
app.use(Paths.Base, ChatRoutes);

// Redirect to chat route by default
app.get('/', (_: Request, res: Response) => {
  return res.redirect('/chat');
});

// Add 404 error handler
app.use((req: Request, res: Response) => {
  res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Not found' });
});

// Add other errors handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  return next(err);
});

export default app;