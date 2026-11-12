import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

const sampleUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    location: 'San Francisco, CA',
    bio: 'Full-stack developer passionate about Python and web technologies. Love teaching and learning new skills!',
    availability: 'both',
    skillsOffered: [
      { name: 'Python Programming', level: 'Expert', mode: 'Both' },
      { name: 'Web Development', level: 'Intermediate', mode: 'Online' },
      { name: 'JavaScript', level: 'Intermediate', mode: 'Online' },
    ],
    skillsWanted: [
      { name: 'Spanish Language', level: 'Beginner', mode: 'Online' },
      { name: 'Graphic Design', level: 'Beginner', mode: 'Both' },
      { name: 'Photography', level: 'Beginner', mode: 'Offline' },
    ],
    skillCredits: 100,
  },
  {
    name: 'Bob Martinez',
    email: 'bob@example.com',
    password: 'password123',
    location: 'San Francisco, CA',
    bio: 'Creative designer with 8 years of experience in UX/UI. Always excited to help others design beautiful products.',
    availability: 'both',
    skillsOffered: [
      { name: 'Graphic Design', level: 'Expert', mode: 'Both' },
      { name: 'UX Design', level: 'Expert', mode: 'Online' },
      { name: 'Brand Strategy', level: 'Intermediate', mode: 'Both' },
    ],
    skillsWanted: [
      { name: 'Python Programming', level: 'Beginner', mode: 'Both' },
      { name: 'Photography', level: 'Intermediate', mode: 'Offline' },
      { name: 'Video Editing', level: 'Beginner', mode: 'Both' },
    ],
    skillCredits: 100,
  },
  {
    name: 'Carol Chen',
    email: 'carol@example.com',
    password: 'password123',
    location: 'San Francisco, CA',
    bio: 'Marketing strategist and content creator. Specializing in social media and digital marketing. Let\'s grow together!',
    availability: 'online',
    skillsOffered: [
      { name: 'Social Media Marketing', level: 'Expert', mode: 'Online' },
      { name: 'Content Writing', level: 'Intermediate', mode: 'Online' },
      { name: 'Digital Marketing', level: 'Intermediate', mode: 'Online' },
    ],
    skillsWanted: [
      { name: 'Video Editing', level: 'Beginner', mode: 'Online' },
      { name: 'Web Development', level: 'Beginner', mode: 'Online' },
      { name: 'Photography', level: 'Intermediate', mode: 'Offline' },
    ],
    skillCredits: 100,
  },
  {
    name: 'David Lee',
    email: 'david@example.com',
    password: 'password123',
    location: 'San Francisco, CA',
    bio: 'Professional photographer and videographer. Love capturing moments and teaching others the art of visual storytelling.',
    availability: 'both',
    skillsOffered: [
      { name: 'Photography', level: 'Expert', mode: 'Offline' },
      { name: 'Video Editing', level: 'Expert', mode: 'Both' },
      { name: 'Visual Design', level: 'Intermediate', mode: 'Both' },
    ],
    skillsWanted: [
      { name: 'Spanish Language', level: 'Beginner', mode: 'Online' },
      { name: 'UX Design', level: 'Beginner', mode: 'Both' },
      { name: 'Social Media Marketing', level: 'Intermediate', mode: 'Online' },
    ],
    skillCredits: 100,
  },
  {
    name: 'Emma Wilson',
    email: 'emma@example.com',
    password: 'password123',
    location: 'San Francisco, CA',
    bio: 'Language instructor and travel enthusiast. Fluent in Spanish, French, and Mandarin. Let\'s learn together!',
    availability: 'both',
    skillsOffered: [
      { name: 'Spanish Language', level: 'Expert', mode: 'Both' },
      { name: 'French Language', level: 'Intermediate', mode: 'Online' },
      { name: 'English Tutoring', level: 'Intermediate', mode: 'Both' },
    ],
    skillsWanted: [
      { name: 'Python Programming', level: 'Beginner', mode: 'Online' },
      { name: 'Graphic Design', level: 'Beginner', mode: 'Both' },
      { name: 'Web Development', level: 'Beginner', mode: 'Online' },
    ],
    skillCredits: 100,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('✓ Cleared existing users');

    // Hash passwords and create users
    for (const userData of sampleUsers) {
      const hashedPassword = await bcryptjs.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      await user.save();
      console.log(`✓ Created user: ${userData.name} (${userData.email})`);
    }

    console.log('\n✨ Sample database seeded successfully!');
    console.log('\nTest Users:');
    sampleUsers.forEach(user => {
      console.log(`  - Email: ${user.email}, Password: ${user.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
