const studentsData=require('../students.json');
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const MessMenu = require('../models/MessMenu');

const connectDB = async () => {
  // await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management');
  
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  console.log('MongoDB connected');
};

const seedData = async () => {
  await connectDB();
  await User.deleteMany({});
  await Student.deleteMany({});

  try {
    // Clear existing data (optional - comment out to preserve)
    // await User.deleteMany({});
    // await Student.deleteMany({});

    // Create Super Admin
    const existingSA = await User.findOne({ email: 'superadmin@hostel.com' });
    if (!existingSA) {
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@hostel.com',
        password: 'superadmin123',
        role: 'super_admin',
        employeeId: 'SA001',
        mobile: '9999999990',
        isActive: true,
        isVerified: true
      });
      console.log('✅ Super Admin created: superadmin@hostel.com / superadmin123');
    }

    // Create Warden
    const existingWarden = await User.findOne({ email: 'warden@hostel.com' });
    if (!existingWarden) {
      await User.create({
        name: 'Mr. Rajesh Kumar',
        email: 'warden@hostel.com',
        password: 'warden123',
        role: 'warden',
        employeeId: 'W001',
        mobile: '9999999991',
        isActive: true,
        isVerified: true
      });
      console.log('✅ Warden created: warden@hostel.com / warden123 (EmployeeID: W001)');
    }

    // Create Mess Admin
    const existingMessAdmin = await User.findOne({ email: 'messadmin@hostel.com' });
    if (!existingMessAdmin) {
      await User.create({
        name: 'Mrs. Priya Sharma',
        email: 'messadmin@hostel.com',
        password: 'mess123',
        role: 'mess_admin',
        employeeId: 'M001',
        mobile: '9999999992',
        isActive: true,
        isVerified: true
      });
      console.log('✅ Mess Admin created: messadmin@hostel.com / mess123 (EmployeeID: M001)');
    }

    // Create Worker
    const existingWorker = await User.findOne({ email: 'worker@hostel.com' });
    if (!existingWorker) {
      await User.create({
        name: 'Ramesh Electrician',
        email: 'worker@hostel.com',
        password: 'worker123',
        role: 'worker',
        employeeId: 'EW001',
        mobile: '9999999993',
        isActive: true,
        isVerified: true
      });
      console.log('✅ Worker created: worker@hostel.com / worker123 (EmployeeID: EW001)');
    }

    // Create sample student
    const existingStudentUser = await User.findOne({ email: 'student@college.edu' });
    if (!existingStudentUser) {
      const studentUser = await User.create({
        name: 'Bindu',
        email: 'bindunitkkr@gmail.com',
        password: '9413817850',
        role: 'student',
        mobile: '9876543210',
        address: '123, Green Park, New Delhi',
        isActive: true,
        isVerified: true
      });
      await Student.create({
        userId: studentUser._id,
        rollNumber: 'CS2020',
        roomNumber: 'A-101',
        parentName: 'Suresh Verma',
        parentMobile: '8306088104',
        parentEmail: '124102020@nitkkr.ac.in',
        course: 'B.Tech CSE',
        year: 3,
        hostelBlock: 'Block A'
      });
      console.log('✅ Sample Student created: student@college.edu / 9876543210 (Roll: CS2021001)');
    }
    console.log("Adding 400 students (fast mode)...");

    const usersArray = await Promise.all(
      studentsData.map(async (student) => ({
        name: student.name,
        email: student.email,
        password: await bcrypt.hash(student.password, 10),
        role: "student",
        mobile: student.mobile,
        address: "Hostel Campus",
        isActive: true,
        isVerified: true
      }))
    );

// Insert all users at once
const insertedUsers = await User.insertMany(usersArray);

// Prepare student documents
const studentDocs = insertedUsers.map((user, index) => ({
  userId: user._id,
  rollNumber: studentsData[index].rollNumber,
  roomNumber: studentsData[index].roomNumber,
  parentName: studentsData[index].parentName,
  parentMobile: studentsData[index].parentMobile,
  parentEmail: studentsData[index].parentEmail,
  course: studentsData[index].course,
  year: studentsData[index].year,
  hostelBlock: studentsData[index].hostelBlock
}));

// Insert all students at once
await Student.insertMany(studentDocs);

console.log("✅ 400 students inserted successfully");
    // Seed weekly mess menu
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      d.setHours(0,0,0,0);
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const menus = [
        { breakfast: 'Poha, Jalebi, Tea/Coffee, Milk', lunch: 'Dal Tadka, Jeera Rice, Roti, Sabzi, Salad, Curd', dinner: 'Paneer Butter Masala, Naan, Rice, Dal, Salad' },
        { breakfast: 'Idli Sambhar, Chutney, Tea/Coffee', lunch: 'Rajma, Rice, Roti, Mixed Veg, Salad', dinner: 'Dal Makhani, Jeera Rice, Roti, Aloo Sabzi' },
        { breakfast: 'Bread Butter Jam, Boiled Eggs/Upma, Tea', lunch: 'Chole, Bhature/Rice, Salad, Curd', dinner: 'Kadhi Pakora, Rice, Roti, Sabzi' },
        { breakfast: 'Paratha, Pickle, Curd, Tea/Coffee', lunch: 'Sambar, Rice, Roti, Poriyal, Papad', dinner: 'Palak Paneer, Roti, Rice, Dal' },
        { breakfast: 'Dosa, Sambhar, Chutney, Tea', lunch: 'Dal Fry, Rice, Roti, Bhindi Sabzi, Salad', dinner: 'Shahi Paneer, Naan, Rice, Soup' },
        { breakfast: 'Poha, Tea/Coffee, Fruit', lunch: 'Special Biryani, Raita, Salad, Papad', dinner: 'Matar Paneer, Roti, Rice, Dal Soup' },
        { breakfast: 'Chole Bhature, Tea/Coffee', lunch: 'Sunday Special - Pulao, Dal, Paneer Gravy, Kheer', dinner: 'Mixed Dal, Roti, Rice, Sabzi, Ice Cream' },
      ];
      const existing = await MessMenu.findOne({ date: d });
      if (!existing) {
        await MessMenu.create({
          date: d,
          dayOfWeek: days[d.getDay()],
          ...menus[i % 7]
        });
      }
    }
    console.log('✅ Weekly mess menu seeded');
    
    console.log('\n🎉 Seeding complete! Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Super Admin: superadmin@hostel.com | Password: superadmin123');
    console.log('👮 Warden: EmployeeID: W001 | Password: warden123');
    console.log('🍽️  Mess Admin: EmployeeID: M001 | Password: mess123');
    console.log('⚡ Worker: EmployeeID: EW001 | Password: worker123');
    console.log('🎓 Student: Roll: CS2021001 OR email: student@college.edu | Password: 9876543210');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('Seeding error:', error);
  }
  
  mongoose.connection.close();
};


seedData();
