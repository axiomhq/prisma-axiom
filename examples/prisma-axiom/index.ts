import logWithAxiom from '../../src/axiom';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function main() {
    // user axiom middleware
    prisma.$use(logWithAxiom());

    const user = await prisma.user.create({
        data: {
          name: 'Alice',
          email: 'alice@prisma.io',
        },
    });

    console.log('new user created', user);
    
    console.log(await prisma.user.findFirst());
}

main()
