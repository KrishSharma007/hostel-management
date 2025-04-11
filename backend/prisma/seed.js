const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  // Clear existing data
  await clearDatabase();

  // Create hostels
  const hostels = await createHostels();
  console.log(`Created ${hostels.length} hostels`);

  // Create rooms for each hostel
  const rooms = await createRooms(hostels);
  console.log(`Created ${rooms.length} rooms`);

  // Create persons (students, wardens, attendants)
  const persons = await createPersons();
  console.log(`Created ${persons.length} persons`);

  // Create students
  const students = await createStudents(persons);
  console.log(`Created ${students.length} students`);

  // Create wardens
  const wardens = await createWardens(persons);
  console.log(`Created ${wardens.length} wardens`);

  // Create attendants
  const attendants = await createAttendants(persons);
  console.log(`Created ${attendants.length} attendants`);

  // Create room allocations
  const allocations = await createRoomAllocations(students, rooms);
  console.log(`Created ${allocations.length} room allocations`);

  // Create warden assignments
  const wardenAssignments = await createWardenAssignments(wardens, hostels);
  console.log(`Created ${wardenAssignments.length} warden assignments`);

  // Create attendant duties
  const attendantDuties = await createAttendantDuties(attendants, hostels);
  console.log(`Created ${attendantDuties.length} attendant duties`);

  // Create mess bills
  const messBills = await createMessBills(students);
  console.log(`Created ${messBills.length} mess bills`);

  console.log("Seeding completed successfully!");
}

async function clearDatabase() {
  console.log("Clearing existing data...");

  // Delete in reverse order of dependencies
  await prisma.messBill.deleteMany();
  await prisma.roomAllocation.deleteMany();
  await prisma.attendantDuty.deleteMany();
  await prisma.hostelWardenAssignment.deleteMany();
  await prisma.room.deleteMany();
  await prisma.student.deleteMany();
  await prisma.warden.deleteMany();
  await prisma.attendant.deleteMany();
  await prisma.personalAddress.deleteMany();
  await prisma.hostelAddress.deleteMany();
  await prisma.person.deleteMany();
  await prisma.hostel.deleteMany();

  console.log("Database cleared successfully!");
}

async function createHostels() {
  const hostelData = [
    {
      name: "Boys Hostel A",
      contactNo: "+91-9876543210",
      hostelAddress: {
        create: {
          building: "Building A",
          street: "University Road",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          landmark: "Near University Gate",
        },
      },
    },
    {
      name: "Girls Hostel B",
      contactNo: "+91-9876543211",
      hostelAddress: {
        create: {
          building: "Building B",
          street: "University Road",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400002",
          landmark: "Near University Gate",
        },
      },
    },
    {
      name: "Boys Hostel C",
      contactNo: "+91-9876543212",
      hostelAddress: {
        create: {
          building: "Building C",
          street: "University Road",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400003",
          landmark: "Near University Gate",
        },
      },
    },
  ];

  const hostels = [];
  for (const data of hostelData) {
    const hostel = await prisma.hostel.create({ data });
    hostels.push(hostel);
  }

  return hostels;
}

async function createRooms(hostels) {
  const rooms = [];

  for (const hostel of hostels) {
    // Create different types of rooms for each hostel
    const roomTypes = ["SINGLE", "DOUBLE", "TRIPLE", "DORMITORY"];
    const roomCounts = [5, 10, 8, 2]; // Count for each room type

    for (let i = 0; i < roomTypes.length; i++) {
      const roomType = roomTypes[i];
      const count = roomCounts[i];

      for (let j = 0; j < count; j++) {
        const room = await prisma.room.create({
          data: {
            hostelId: hostel.id,
            roomType: roomType,
            capacity: getRoomCapacity(roomType),
            furnitureDetails: `Standard ${roomType.toLowerCase()} room furniture`,
          },
        });
        rooms.push(room);
      }
    }
  }

  return rooms;
}

function getRoomCapacity(roomType) {
  switch (roomType) {
    case "SINGLE":
      return 1;
    case "DOUBLE":
      return 2;
    case "TRIPLE":
      return 3;
    case "DORMITORY":
      return 10;
    default:
      return 1;
  }
}

async function createPersons() {
  const persons = [];

  // Create students
  const studentNames = [
    "Rahul Sharma",
    "Priya Patel",
    "Amit Kumar",
    "Neha Singh",
    "Raj Malhotra",
    "Anjali Gupta",
    "Vikram Reddy",
    "Sneha Verma",
    "Arun Mehta",
    "Pooja Joshi",
    "Karan Kapoor",
    "Divya Sharma",
    "Rohan Singh",
    "Meera Patel",
    "Aditya Kumar",
  ];

  for (const name of studentNames) {
    const person = await prisma.person.create({
      data: {
        name: name,
        personType: "Student",
        contactNo: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        personalAddress: {
          create: {
            hNo: `${Math.floor(Math.random() * 100) + 1}`,
            street: "Sample Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
          },
        },
      },
    });
    persons.push(person);
  }

  // Create wardens
  const wardenNames = [
    "Dr. Rajesh Kumar",
    "Dr. Meena Sharma",
    "Dr. Arun Patel",
  ];

  for (const name of wardenNames) {
    const person = await prisma.person.create({
      data: {
        name: name,
        personType: "Warden",
        contactNo: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        personalAddress: {
          create: {
            hNo: `${Math.floor(Math.random() * 100) + 1}`,
            street: "Warden Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
          },
        },
      },
    });
    persons.push(person);
  }

  // Create attendants
  const attendantNames = [
    "Ram Singh",
    "Lakshmi Devi",
    "Mohan Kumar",
    "Geeta Sharma",
    "Ramesh Patel",
  ];

  for (const name of attendantNames) {
    const person = await prisma.person.create({
      data: {
        name: name,
        personType: "Attendant",
        contactNo: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        personalAddress: {
          create: {
            hNo: `${Math.floor(Math.random() * 100) + 1}`,
            street: "Attendant Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
          },
        },
      },
    });
    persons.push(person);
  }

  return persons;
}

async function createStudents(persons) {
  const students = [];
  const studentPersons = persons.filter((p) => p.personType === "Student");

  for (const person of studentPersons) {
    const student = await prisma.student.create({
      data: {
        personId: person.id,
        remark: "Regular student",
        emergencyContact: `+91-${
          Math.floor(Math.random() * 9000000000) + 1000000000
        }`,
        fatherContact: `+91-${
          Math.floor(Math.random() * 9000000000) + 1000000000
        }`,
        motherContact: `+91-${
          Math.floor(Math.random() * 9000000000) + 1000000000
        }`,
      },
    });
    students.push(student);
  }

  return students;
}

async function createWardens(persons) {
  const wardens = [];
  const wardenPersons = persons.filter((p) => p.personType === "Warden");

  for (const person of wardenPersons) {
    const warden = await prisma.warden.create({
      data: {
        personId: person.id,
      },
    });
    wardens.push(warden);
  }

  return wardens;
}

async function createAttendants(persons) {
  const attendants = [];
  const attendantPersons = persons.filter((p) => p.personType === "Attendant");

  for (const person of attendantPersons) {
    const attendant = await prisma.attendant.create({
      data: {
        personId: person.id,
      },
    });
    attendants.push(attendant);
  }

  return attendants;
}

async function createRoomAllocations(students, rooms) {
  const allocations = [];
  const academicYear = "2023-2024";
  const startDate = new Date("2023-08-01");

  // Allocate students to rooms
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const room = rooms[i % rooms.length]; // Cycle through rooms

    const allocation = await prisma.roomAllocation.create({
      data: {
        studentId: student.id,
        roomId: room.id,
        academicYear: academicYear,
        startDate: startDate,
      },
    });
    allocations.push(allocation);
  }

  return allocations;
}

async function createWardenAssignments(wardens, hostels) {
  const assignments = [];
  const assignmentDate = new Date("2023-08-01");

  // Assign wardens to hostels
  for (let i = 0; i < hostels.length; i++) {
    const hostel = hostels[i];
    const warden = wardens[i % wardens.length]; // Cycle through wardens

    const assignment = await prisma.hostelWardenAssignment.create({
      data: {
        hostelId: hostel.id,
        wardenId: warden.id,
        assignmentDate: assignmentDate,
      },
    });
    assignments.push(assignment);
  }

  return assignments;
}

async function createAttendantDuties(attendants, hostels) {
  const duties = [];
  const dutyTypes = [
    "CLEANING",
    "ROOM_MANAGEMENT",
    "BASIC_ASSISTANCE",
    "SECURITY",
  ];
  const shiftTypes = ["MORNING", "EVENING", "NIGHT"];

  // Create duties for the next 7 days
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const dutyDate = new Date(today);
    dutyDate.setDate(today.getDate() + i);

    for (const hostel of hostels) {
      for (const dutyType of dutyTypes) {
        for (const shiftType of shiftTypes) {
          const attendant =
            attendants[Math.floor(Math.random() * attendants.length)];

          const duty = await prisma.attendantDuty.create({
            data: {
              attendantId: attendant.id,
              hostelId: hostel.id,
              dutyDate: dutyDate,
              dutyType: dutyType,
              shiftType: shiftType,
            },
          });
          duties.push(duty);
        }
      }
    }
  }

  return duties;
}

async function createMessBills(students) {
  const bills = [];
  const billGenerationDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days

  // Create bills for each student
  for (const student of students) {
    const billAmount = Math.floor(Math.random() * 5000) + 2000; // Random amount between 2000 and 7000
    const status = Math.random() > 0.7 ? "PAID" : "GENERATED"; // 30% chance of being paid

    const billDepositDate = status === "PAID" ? new Date() : null;

    const bill = await prisma.messBill.create({
      data: {
        studentId: student.id,
        billAmount: billAmount,
        billGenerationDate: billGenerationDate,
        dueDate: dueDate,
        billDepositDate: billDepositDate,
        fine: 0,
        status: status,
      },
    });
    bills.push(bill);
  }

  return bills;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
