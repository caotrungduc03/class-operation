export class ResponseDto {
  statusCode: number;
  message: string;
  data?: any;

  constructor(statusCode: number, message: string, data?: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
