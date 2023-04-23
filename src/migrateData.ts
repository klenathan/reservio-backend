import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { hashPassword } from "./Modules/Authentication/Utils/passwordUtils";

let prisma = new PrismaClient({ errorFormat: "minimal" });

function migrateUsers() {
  let admin = {
    username: "admin",
    firstName: "ADMIN",
    password: "$2a$10$zrT0C4kYZzkeNTuIIIWE2.v9o5OC7MOWQjVzOssgJFnBArUNreoTu",
    email: "admin@reservio.com",
    phoneNo: "0900000000",
    avatar: "avatar/ddd012da-fb24-4b1b-9ad0-3fa1bd3eaf75-samsung_monitor.jpg",
  };
  let users = [admin];
  for (let i = 0; i < 100; i++) {
    let newUser = {
      username: faker.internet.userName().toLocaleLowerCase(),
      firstName: faker.name.firstName(),
      password: "$2a$10$zrT0C4kYZzkeNTuIIIWE2.v9o5OC7MOWQjVzOssgJFnBArUNreoTu",
      email: faker.internet.email(),
      phoneNo: faker.phone.number("09########"),
      avatar: "avatar/ddd012da-fb24-4b1b-9ad0-3fa1bd3eaf75-samsung_monitor.jpg",
    };
    users.push(newUser);
  }

  prisma.user
    .createMany({
      data: users,
      skipDuplicates: true,
    })
    .then((r) => {
      console.log("done");
    });
}

async function migrateServices() {
  let services = [];
  for (let i = 0; i < 100; i++) {
    let newService = {
      vendorId: "clgt63tz80000xnja2hjlhxim", //pvdong
      name: faker.commerce.productName(),
      images: ["a83f578e-77e4-44c8-ab40-73314ba28ceb-current_best.png"],
      address:
        "702 Đ. Nguyễn Văn Linh, Tân Hưng, Quận 7, Thành phố Hồ Chí Minh",
      price: 192000,
      desc: faker.commerce.productDescription(),
    };
    services.push(newService);
  }

  await prisma.product
    .createMany({
      data: services,
      skipDuplicates: true,
    })
    .then((r) => {
      console.log("done");
    });
}

async function migrateDiscount() {
  let discounts = [];

  for (let i = 0; i < 15; i++) {
    let newDiscount = {
      id: faker.vehicle.vin(),
      name: faker.company.name() + " Promotion",
      desc: faker.commerce.productDescription(),
      amount: Math.floor(Math.random() * 30) + 10,
      image: "avatar/ddd012da-fb24-4b1b-9ad0-3fa1bd3eaf75-samsung_monitor.jpg",
      end: new Date(1924905600000), //157680000
    };
    discounts.push(newDiscount);
  }

  await prisma.discount
    .createMany({
      data: discounts,
      skipDuplicates: true,
    })
    .then((r) => {
      console.log("done");
    });
}

async function migrateReview() {
  let reviews = [];
  let users = await prisma.user.findMany({
    take: 20,
  });

  let products = await prisma.product.findMany();

  for (let i = 0; i < products.length; i++) {
    let numberOfReview = Math.floor(Math.random() * users.length) + 10;
    for (let j = 0; j < numberOfReview; j++) {
      //   console.log(users[j]);
      if (users[j] == undefined) continue;
      let newReview = {
        productId: products[i].id,
        userId: users[j].id || "pvdong",
        rating: Math.floor(Math.random() * 5) + 2,
        feedback: faker.lorem.sentence(),
      };
      reviews.push(newReview);
    }
  }

  await prisma.review
    .createMany({
      data: reviews,
      skipDuplicates: true,
    })
    .then((r) => {
      console.log("done");
    })
    .catch((e) => {
      console.log(e);
    });
}

// migrateUsers()
// migrateServices()
// migrateDiscount()
// migrateReview();
