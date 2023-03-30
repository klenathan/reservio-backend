import CustomError from "./CustomError";

export default class UnauthorizedError extends CustomError {
  constructor(name: string, message: string) {
    super(name, message, 403);
  }
}
