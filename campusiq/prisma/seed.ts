
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding started...");

    await prisma.userActivity.deleteMany();
    await prisma.savedCollege.deleteMany();
    await prisma.college.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = bcrypt.hashSync("password123", 10);
    const demoUser = await prisma.user.create({
        data: {
            email: "demo@campusiq.com",
            password: hashedPassword,
            name: "Demo User",
        },
    });
    console.log(`Created demo user: ${demoUser.email}`);

    const collegesData = [
        {
            name: "IIT Bombay",
            location: "Mumbai",
            state: "Maharashtra",
            type: "PUBLIC",
            fees: 220000,
            rating: 4.9,
            entranceExam: "JEE",
            cutoffRank: 100,
            placementAvgSalary: 2350000,
            placementHighestSalary: 15000000,
            established: 1958,
            courses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering"],
        },
        {
            name: "IIT Delhi",
            location: "New Delhi",
            state: "Delhi",
            type: "PUBLIC",
            fees: 225000,
            rating: 4.8,
            entranceExam: "JEE",
            cutoffRank: 115,
            placementAvgSalary: 2280000,
            placementHighestSalary: 14000000,
            established: 1961,
            courses: ["Computer Science", "Chemical Engineering", "Electrical Engineering"],
        },
        {
            name: "IIT Madras",
            location: "Chennai",
            state: "Tamil Nadu",
            type: "PUBLIC",
            fees: 210000,
            rating: 4.9,
            entranceExam: "JEE",
            cutoffRank: 150,
            placementAvgSalary: 2200000,
            placementHighestSalary: 13000000,
            established: 1959,
            courses: ["Computer Science", "Civil Engineering", "Ocean Engineering"],
        },
        {
            name: "IIT Kharagpur",
            location: "Kharagpur",
            state: "West Bengal",
            type: "PUBLIC",
            fees: 215000,
            rating: 4.7,
            entranceExam: "JEE",
            cutoffRank: 300,
            placementAvgSalary: 1950000,
            placementHighestSalary: 12000000,
            established: 1951,
            courses: ["Computer Science", "Mining Engineering", "Agricultural Engineering"],
        },
        {
            name: "IIT Roorkee",
            location: "Roorkee",
            state: "Uttarakhand",
            type: "PUBLIC",
            fees: 220000,
            rating: 4.6,
            entranceExam: "JEE",
            cutoffRank: 450,
            placementAvgSalary: 1820000,
            placementHighestSalary: 11200000,
            established: 1847,
            courses: ["Computer Science", "Architecture", "Biotechnology"],
        },
        {
            name: "NIT Trichy",
            location: "Tiruchirappalli",
            state: "Tamil Nadu",
            type: "PUBLIC",
            fees: 140000,
            rating: 4.5,
            entranceExam: "JEE",
            cutoffRank: 1500,
            placementAvgSalary: 1500000,
            placementHighestSalary: 7500000,
            established: 1964,
            courses: ["Computer Science", "Production Engineering", "Chemical Engineering"],
        },
        {
            name: "NIT Warangal",
            location: "Warangal",
            state: "Telangana",
            type: "PUBLIC",
            fees: 150000,
            rating: 4.4,
            entranceExam: "JEE",
            cutoffRank: 2200,
            placementAvgSalary: 1400000,
            placementHighestSalary: 6500000,
            established: 1959,
            courses: ["Computer Science", "Electronics & Communication", "Biotechnology"],
        },
        {
            name: "BITS Pilani",
            location: "Pilani",
            state: "Rajasthan",
            type: "PRIVATE",
            fees: 550000,
            rating: 4.6,
            entranceExam: "BITSAT",
            cutoffRank: 320,
            placementAvgSalary: 1850000,
            placementHighestSalary: 9500000,
            established: 1964,
            courses: ["Computer Science", "Chemical Engineering", "Manufacturing Engineering"],
        },
        {
            name: "IIIT Hyderabad",
            location: "Hyderabad",
            state: "Telangana",
            type: "PRIVATE",
            fees: 360000,
            rating: 4.8,
            entranceExam: "JEE",
            cutoffRank: 1200,
            placementAvgSalary: 2600000,
            placementHighestSalary: 10200000,
            established: 1998,
            courses: ["Computer Science", "Electronics & Communication", "Computational Linguistics"],
        },
        {
            name: "VIT Vellore",
            location: "Vellore",
            state: "Tamil Nadu",
            type: "PRIVATE",
            fees: 198000,
            rating: 4.1,
            entranceExam: "VITEEE",
            cutoffRank: 8000,
            placementAvgSalary: 900000,
            placementHighestSalary: 4500000,
            established: 1984,
            courses: ["Computer Science", "Information Technology", "Biomedical Engineering"],
        },
        {
            name: "Jadavpur University",
            location: "Kolkata",
            state: "West Bengal",
            type: "PUBLIC",
            fees: 10000,
            rating: 4.6,
            entranceExam: "WBJEE",
            cutoffRank: 500,
            placementAvgSalary: 1450000,
            placementHighestSalary: 8500000,
            established: 1955,
            courses: ["Computer Science", "Chemical Engineering", "Power Engineering"],
        },
        {
            name: "DTU Delhi",
            location: "New Delhi",
            state: "Delhi",
            type: "PUBLIC",
            fees: 219000,
            rating: 4.3,
            entranceExam: "JEE",
            cutoffRank: 4500,
            placementAvgSalary: 1520000,
            placementHighestSalary: 6400000,
            established: 1941,
            courses: ["Computer Science", "Software Engineering", "Environmental Engineering"],
        },
    ];

    for (const college of collegesData) {
        await prisma.college.create({ data: college });
    }

    console.log(`Seeded ${collegesData.length} colleges successfully.`);
    console.log("Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });