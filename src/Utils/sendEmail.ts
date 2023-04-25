import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import * as nodemailer from "nodemailer";

async function sendNodeMail() {
  "bixkapgslsahvvwo";
}

export default async function sendEmail(
  subject: string,
  data: string,
  email: string
) {
  // create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rmit.clubapp@gmail.com",
      pass: process.env.EMAIL_PW,
    },
  });

  // create email message
  const message = {
    from: "rmit.clubapp@gmail.com",
    to: email,
    subject: subject,
    html: data,
  };

  // send email
  transporter.sendMail(message, (error, info) => {
    if (error) {
      return process.exit(1);
    }
    process.exit(0);
  });
}

// Old SES code

// const sesClient = new SESClient({ region: "ap-southeast-1" });
// const paramsForEmail = {
//   Destination: {
//     ToAddresses: [email],
//   },
//   Message: {
//     Body: {
//       Html: {
//         Charset: "UTF-8",
//         Data: data,
//       },
//     },
//     Subject: { Data: subject },
//   },
//   Source: "rmit.clubapp@gmail.com",
// };
// await sesClient.send(new SendEmailCommand(paramsForEmail));
// sesClient.destroy();
