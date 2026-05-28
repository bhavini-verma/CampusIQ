import { PrismaClient, CollegeType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    await prisma.userActivity.deleteMany();
    await prisma.comparison.deleteMany();
    await prisma.savedCollege.deleteMany();
    await prisma.college.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
        data: {
            email: "demo@campusiq.com",
            password: hashedPassword,
        },
    });
    console.log("✅ Created demo user:", user.email);

    await prisma.college.createMany({
        data: [
            {
                name: "IIT Bombay",
                location: "Mumbai",
                state: "Maharashtra",
                fees: 250000,
                rating: 4.9,
                entranceExam: "JEE",
                cutoffRank: 500,
                placementAvgSalary: 2200000,
                placementHighestSalary: 12000000,
                established: 1958,
                type: CollegeType.PUBLIC,
                courses: ["B.Tech", "M.Tech", "MBA", "PhD"],
            },
            {
                name: "IIT Delhi",
                location: "New Delhi",
                state: "Delhi",
                fees: 250000,
                rating: 4.9,
                entranceExam: "JEE",
                cutoffRank: 450,
                placementAvgSalary: 2300000,
                placementHighestSalary: 13000000,
                established: 1961,
                type: CollegeType.PUBLIC,
                courses: ["B.Tech", "M.Tech", "MBA", "PhD"],
            },
            {
                name: "IIT Madras",
                location: "Chennai",
                state: "Tamil Nadu",
                fees: 250000,
                rating: 4.8,
                entranceExam: "JEE",
                cutoffRank: 600,
                placementAvgSalary: 2100000,
                placementHighestSalary: 11000000,
                established: 1959,
                type: CollegeType.PUBLIC,
                courses: ["B.Tech", "M.Tech", "PhD"],
            },
            {
                name: "IIT Kanpur",
                location: "Kanpur",
                state: "Uttar Pradesh",
                fees: 250000,
                rating: 4.8,
                entranceExam: "JEE",
                cutoffRank: 700,
                placementAvgSalary: 2000000,
                placementHighestSalary: 10000000,
                established: 1959,
                type: CollegeType.PUBLIC,
                courses: ["B.Tech", "M.Tech", "PhD"],
            },
            {
                name: "IIT Kharagpur",
                location: "Kharagpur",
                state: "West Bengal",
                fees: 250000,
                rating: 4.7,
                entranceExam: "JEE",
                cutoffRank: 800,
                placementAvgSalary: 1900000,
                placementHighestSalary: 9500000,
                established: 1951,
                type: CollegeType.PUBLIC,
                courses: ["B.Tech", "M.Tech", "MBA", "PhD"],
            },
            {
                name: "NIT Trichy",
                location: "Tiruchirappalli",
                state: "Tamil Nadu",
                fees: 150000,
                rating: 4.5,
                entranceExam: "JEE",
                cutoffRank: 5000,
                placementAvgSalary: 1200000,
                placementHighestSalary: 6000000,
                established: 1964,
                type: CollegeType.PUBLIC,
                courses: ["B.Tech", "M.Tech", "MBA"],
            },
            {
                name: "NIT Warangal",
                location: "Warangal",
                state: "Telangana",
                fees: 150000,
                rating: 4.4,
                entranceExam: "JEE",
                cutoffRank: 6000,
                placementAvgSalary: 1100000,
                placementHighestSalary: 5500000,
                established: 1959,
                type: CollegeType.PUBLIC,
                courses: ["B.Tech", "M.Tech"],
            },
            {
                name: "BITS Pilani",
                location: "Pilani",
                state: "Rajasthan",
                fees: 550000,
                rating: 4.7,
                entranceExam: "BITSAT",
                cutoffRank: 300,
                placementAvgSalary: 1800000,
                placementHighestSalary: 9000000,
                established: 1964,
                type: CollegeType.PRIVATE,
                courses: ["B.Tech", "M.Tech", "MBA", "PhD"],
            },
            {
                name: "IIIT Hyderabad",
                location: "Hyderabad",
                state: "Telangana",
                fees: 350000,
                rating: 4.6,
                entranceExam: "JEE",
                cutoffRank: 3000,
                placementAvgSalary: 1600000,
                placementHighestSalary: 8000000,
                established: 1998,
                type: CollegeType.PRIVATE,
                courses: ["B.Tech", "M.Tech", "PhD"],
            },
            {
                name: "VIT Vellore",
                location: "Vellore",
                state: "Tamil Nadu",
                fees: 400000,
                rating: 4.2,
                entranceExam: "VITEEE",
                cutoffRank: 50000,
                placementAvgSalary: 800000,
                placementHighestSalary: 4000000,
                established: 1984,
                type: CollegeType.PRIVATE,
                courses: ["B.Tech", "M.Tech", "MBA"],
            },
            {
                name: "Jadavpur University",
                location: "Kolkata",
                state: "West Bengal",
                fees: 50000,
                rating: 4.4,
                entranceExam: "WBJEE",
                cutoffRank: 2000,
                placementAvgSalary: 1000000,
                placementHighestSalary: 5000000,
                established: 1955,
                type: CollegeType.PUBLIC,
                courses: ["B.Tech", "M.Tech", "PhD"],
            },
            {
                name: "DTU Delhi",
                location: "New Delhi",
                state: "Delhi",
                fees: 180000,
                rating: 4.3,
                entranceExam: "JEE",
                cutoffRank: 8000,
                placementAvgSalary: 1100000,
                placementHighestSalary: 5500000,
                established: 1941,
                type: CollegeType.PUBLIC,
                courses: ["B.Tech", "M.Tech", "MBA"],
            },
        ],
    });

    console.log("✅ Created 12 colleges");
    console.log("🎉 Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });