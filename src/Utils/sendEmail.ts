import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const confirmationEmail = `
<p>              
  Hello world!
</p>
`;

export default async function sendEmail(email: string, code: string) {
  const sesClient = new SESClient({ region: "ap-southeast-1" });
  const paramsForEmail = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
                    <p>              
                      Your code is ${code}
                    </p>
                    `,
        },
      },
      Subject: { Data: "Hello World" },
    },
    Source: "rmit.clubapp@gmail.com",
  };
  const resultEmail = await sesClient.send(
    new SendEmailCommand(paramsForEmail)
  );
  sesClient.destroy();
}
