import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export default async function sendEmail(
  subject: string,
  data: string,
  email: string
) {
  const sesClient = new SESClient({ region: "ap-southeast-1" });
  const paramsForEmail = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: data,
        },
      },
      Subject: { Data: subject },
    },
    Source: "rmit.clubapp@gmail.com",
  };
  await sesClient.send(new SendEmailCommand(paramsForEmail));
  sesClient.destroy();
}
