import CustomError from "./CustomError";

export default class NotFoundError extends CustomError {
  constructor(name: string, message: string) {
    super(name, message, 404);
  }
}
