import bcrypt from "bcryptjs";
export const hashPassword = async (pwd) => await bcrypt.hash(pwd, 10);
export const verifyPassword = async (pwd, hash) => await bcrypt.compare(pwd, hash);

