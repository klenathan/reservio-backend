import CustomError from "./CustomError";

export default class UnauthenticatedError extends CustomError {
  constructor(name: string, message: string) {
    super(name, message, 401);
  }
}
