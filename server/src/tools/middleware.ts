import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { verify } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { getUserFromField, storeInUser, getGlobalPreferences } from '../database';
import { logger } from './logger';
import { Spotify } from './oauth/Provider';
import {
  GlobalPreferencesRequest,
  LoggedRequest,
  OptionalLoggedRequest,
  SpotifyRequest,
} from './types';
import { getUserImporterState } from '../database/queries/importer';

type Location = 'body' | 'params' | 'query';

export const validating =
  (schema: AnyZodObject, location: Location = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = schema.parse(req[location]);
      req[location] = value;
      return next();
    } catch (e) {
      logger.error(e);
      return res.status(400).end();
    }
  };

const baselogged = async (req: Request) => {
  const auth = req.cookies.token;

  if (!auth) return null;

  if (auth) {
    try {
      const userId = verify(auth, 'MyPrivateKey') as { userId: string };

      const user = await getUserFromField('_id', new Types.ObjectId(userId.userId), false);

      if (!user) {
        return null;
      }
      return user;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const logged = async (req: Request, res: Response, next: NextFunction) => {
  const user = await baselogged(req);
  if (!user) {
    return res.status(401).end();
  }
  (req as LoggedRequest).user = user;
  return next();
};

export const optionalLogged = async (req: Request, res: Response, next: NextFunction) => {
  const user = await baselogged(req);
  (req as OptionalLoggedRequest).user = user;
  return next();
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as LoggedRequest;

  if (!user || !user.admin) {
    return res.status(401).end();
  }
  return next();
};

export const withHttpClient = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as LoggedRequest;

  let tokens = {
    accessToken: user.accessToken,
    expiresIn: user.expiresIn,
  };

  if (Date.now() > user.expiresIn - 1000 * 120) {
    try {
      if (!user.refreshToken) {
        return;
      }
      const newTokens = await Spotify.refresh(user.refreshToken);
      await storeInUser('_id', user._id, newTokens);
      tokens = newTokens;
    } catch (e) {
      if (e.response) {
        logger.error(e.response.data);
      } else {
        logger.error(e);
      }
      return res.status(400).end();
    }
  }
  if (!tokens.accessToken) {
    logger.error(`There was an error with account ${user.username}`);
    return next();
  }
  const client = Spotify.getHttpClient(tokens.accessToken);
  (req as SpotifyRequest & LoggedRequest).client = client;
  return next();
};

export const withGlobalPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pref = await getGlobalPreferences();
    if (!pref) {
      logger.error('No global preferences, this is critical, try restarting the app');
      return;
    }
    (req as GlobalPreferencesRequest).globalPreferences = pref;
    return next();
  } catch (e) {
    return res.status(500).end();
  }
};

export const notAlreadyImporting = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req as LoggedRequest;
  const imports = await getUserImporterState(user._id.toString());
  if (imports.some((imp) => imp.status === 'progress')) {
    return res.status(400).send({ code: 'ALREADY_IMPORTING' });
  }
  return next();
};
