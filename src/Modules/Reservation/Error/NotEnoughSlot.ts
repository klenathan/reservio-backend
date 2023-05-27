import CustomError from "@/Errors/CustomError";

export default class NotEnoughSlot extends CustomError {
  name: string;
  statusCode: number;
  slotLeft: number;
  constructor(
    name: string,
    statusCode: number,
    message: string,
    slotLeft: number
  ) {
    super(name, message, statusCode);
    this.name = name;
    this.statusCode = statusCode;
    this.slotLeft = slotLeft;
  }
}
