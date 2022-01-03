import { User, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default {
    findByEmail: async (email: string) => {
        try {
            return await prisma.user.findUnique({ where: { email: email } })
        } catch (err) {
            console.error(err);
        }
    },
    findById: async (id: string) => {
        try {
            return await prisma.user.findFirst({ where: { id: id } })
        } catch (err) {
            console.error(err);
        }
    },
    createNew: async (data: object) => {
        try {
            return await prisma.user.create({ data: data as User });
        } catch (err) {
            console.error(err);
        }
    }
}
