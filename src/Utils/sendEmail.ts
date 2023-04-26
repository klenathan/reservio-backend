// import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import * as nodemailer from "nodemailer";
import fetch from 'node-fetch';

export default async function sendEmail(
  subject: string,
  data: string,
  email: string
) {

  // https://06ufwajgc6.execute-api.ap-southeast-1.amazonaws.com/
  const response = await fetch('https://httpbin.org/post', {method: 'POST', body: 'a=1'});
  // // create a transporter
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: "rmit.clubapp@gmail.com",
  //     pass: process.env.EMAIL_PW,
  //   },
  // });

  // // create email message
  // const message = {
  //   from: "rmit.clubapp@gmail.com",
  //   to: email,
  //   subject: subject,
  //   html: data,
  // };

  // // send email
  // const info = await transporter.sendMail(message, async (error, info) => {
  //   if (error) {
  //     console.log(error);
  //     return process.exit(1);
  //   }
  //   process.exit(0);
  // });
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
