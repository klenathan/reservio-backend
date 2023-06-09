import * as bcrypt from "bcryptjs";

const hashPassword = async (stringPassword: string): Promise<string> => {
  let salt = bcrypt.genSaltSync(10);
  let hash = await bcrypt.hash(stringPassword, salt).then((r: any) => {
    return r;
  });
  return hash;
};

export { hashPassword };

const comparePassword = async (
  stringPassword: string,
  hashPw: string
): Promise<Boolean> => {
  return await bcrypt.compare(stringPassword, hashPw);
};

export { comparePassword };
