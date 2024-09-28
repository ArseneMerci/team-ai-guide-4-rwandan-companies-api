import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
// NOTE: Middleware in Express make use of the number of arguments to work
// That means that unused variables in the middleware functions declarations
// should be kept in order to make them work as expected.

/**
 * Middleware that manage asynchronous errors inside controllers. Use it by wrapping the controller functions (pass them as parameters)
 * @param {RequestHandler} callback Callback function to return
 * @return {RequestHandler} Return the param function
 */
export const asyncMiddleware = (callback): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): RequestHandler => {
        return callback(req, res, next)
            .catch(next);
    };
};

/**
 * Middleware for managing 405 error. Must be put at the end of a router if no HTTP method has been matched.
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Function to go to the next middleware
 * @return {RequestHandler} Return the response with the error in json
 */
export const methodNotAllowedErrorHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    return res.status(405).json({ errors: [{ code: 405, msg: 'Method not allowed for the resource specified' }] });
};

/**
// Middleware for managing 404 error. Use it at the end of the routes specified in the app main router.
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Function to go to the next middleware
 * @return {RequestHandler} Return the response with the error in json
 */
export const notFoundErrorHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    return res.status(404).json({ errors: [{ code: 404, msg: 'Resource not found' }] });
};

/**
// Middleware where a request is sent if it has errored inside a controller.
 * @param {object} err Error in the request
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Function to go to the next middleware
 * @return {ErrorRequestHandler} Return the response with the error in json
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }
    return res.status(500).json({ errors: [{ code: 500, msg: 'Internal server error' }] });
};

/**
// Catches errors in JSON request bodies.
 * @param {object} err Error in the request
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Function to go to the next middleware
 * @return {ErrorRequestHandler} Return the response with the error in json
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jsonParseErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && err.message.includes('JSON')) {
        return res.status(400).json({ errors: [{ code: 400, msg: 'invalid JSON' }] });
    }

    next(err);
};

/**
// Catches errors when passing IDs that are not valid UUIDs for Sequelize ORM
 * @param {object} err Error in the request
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Function to go to the next middleware
 * @return {ErrorRequestHandler} Return the response with the error in json
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uuidErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'SequelizeDatabaseError' && err.message.includes('invalid input syntax for type uuid')) {
        return res.status(400).json({ errors: [{ code: 400, msg: 'invalid identifier format, must be an uuid' }] });
    }

    next(err);
};

/**
// Catches errors when payload exceed system limit
 * @param {object} err Error in the request
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Function to go to the next middleware
 * @return {ErrorRequestHandler} Return the response with the error in json
 */
export const payloadTooLargeErrorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ title: 'Payload Too Large' });
    }
    next(err);
};
