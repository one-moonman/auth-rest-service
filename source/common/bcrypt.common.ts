import bcrypt from "bcrypt";

export async function generatePassword(password: string): Promise<{ salt: string, hash: string }> {
    const salt: string = await bcrypt.genSalt(12);
    const hash: string = await bcrypt.hash(password, salt);
    return { salt, hash };
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
