import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { hashPassword } from "./Modules/Authentication/Utils/passwordUtils";

let prisma = new PrismaClient({ errorFormat: "minimal" });

const avatars = [
  "avatar/325082895_731199964907498_8681959452548683267_n.jpg",
  "avatar/IMG_1021.JPG",
  "avatar/IMG_2969.png",
  "avatar/pets_FILL0_wght400_GRAD0_opsz48.png",
];

function migrateUsers() {
  let admin = {
    username: "admin",
    firstName: "ADMIN",
    password: "$2a$10$zrT0C4kYZzkeNTuIIIWE2.v9o5OC7MOWQjVzOssgJFnBArUNreoTu",
    email: "admin@reservio.com",
    // status: "ACTIVATE",
    phoneNo: "0900000000",
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
  };

  let dong = {
    id: "pvdong111",
    username: "pvdong",
    firstName: "Pham Vo Dong",
    password: "$2a$10$zrT0C4kYZzkeNTuIIIWE2.v9o5OC7MOWQjVzOssgJFnBArUNreoTu",
    email: "pvdong@reservio.com",
    // status: "ACTIVATE",
    phoneNo: "0900000000",
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
  };
  let users = [admin, dong];
  for (let i = 0; i < 100; i++) {
    let newUser = {
      username: faker.internet.userName().toLocaleLowerCase(),
      firstName: faker.name.firstName(),
      password: "$2a$10$zrT0C4kYZzkeNTuIIIWE2.v9o5OC7MOWQjVzOssgJFnBArUNreoTu",
      email: faker.internet.email(),
      phoneNo: faker.phone.number("09########"),
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
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

const products = ["products/1.jpg", "products/5.jpg", "products/7.jpg"];
async function migrateServices() {
  let vendor = await prisma.vendor.create({data: {
    id: "pvdong111",
    name: "dong #1 wjbu",
    desc: "Dong shop",
    username: "pvdong",
    userId: "pvdong111"
  }})
  let services = [];
  for (let i = 0; i < 100; i++) {
    let newService = {
      vendorId: "pvdong111", //pvdong
      name: faker.commerce.productName(),
      images: [
        products[Math.floor(Math.random() * products.length)],
        products[Math.floor(Math.random() * products.length)],
      ],
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
  let reservation = await prisma.reservation.findMany({
    include: { customer: true },
  });

  for (let i = 0; i < reservation.length; i++) {
    // if (users[j] == undefined) continue;
    let newReview = {
      productId: reservation[i].productId,
      userId: reservation[i].customer.id,
      reservationId: reservation[i].id,
      rating: Math.floor(Math.random() * 4) + 2,
      feedback: faker.lorem.sentence(),
    };
    reviews.push(newReview);
    console.log(newReview);
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

migrateUsers();
// migrateServices();
// migrateDiscount();
// migrateReview();
