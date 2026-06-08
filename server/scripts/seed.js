import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Post from '../models/Post.js';

// Load config
dotenv.config({ path: './config/.env' });

const categories = ['CULTURE', 'ECONOMY', 'POLITICS', 'SCIENCE', 'TECHNOLOGY', 'TRAVEL', 'WORLD'];

// Map categories to default visual assets
const categoryImages = {
  SCIENCE: ['/hero_bg.png', '/science_lab.png', '/earth_space.png', '/moon_projection.png'],
  CULTURE: ['/torii_gate.png', '/terracotta_warriors.png', '/golden_pagoda.png', '/city_woman.png'],
  ECONOMY: ['/harbor.png', '/bitcoin.png'],
  POLITICS: ['/industrial_factory.png', '/protest_megaphone.png', '/protest_flags.png', '/laptop_chart.png'],
  TRAVEL: ['/ocean.png', '/cliff_girl.png', '/hikers.png'],
  TECHNOLOGY: ['/laptop_chart.png'],
  WORLD: ['/earth_space.png']
};

const getCategoryImage = (category, index) => {
  const images = categoryImages[category] || ['/hero_bg.png'];
  return images[index % images.length];
};

const generateDummyContent = (category, title) => {
  return `
    <p>This is a dynamically generated article discussing the latest insights in the field of <strong>${category}</strong>. As we look at the changing landscapes around the world, understanding the foundational concepts behind these developments becomes critical.</p>
    
    <h2>The Evolution of ${category}</h2>
    <p>Over the last decade, we have seen exponential growth and shifting paradigms. Experts suggest that these patterns are not temporary trends but permanent indicators of where our society is heading. By analyzing the data gathered from global surveys, we can establish key benchmarks.</p>
    
    <blockquote>
      "The key to understanding future developments is looking closely at the intersection of local culture and global technology. When these two forces align, we witness real progression."
    </blockquote>
    
    <h2>Future Outlook and Challenges</h2>
    <p>Of course, this journey is not without its hurdles. Infrastructure limits, regulatory frameworks, and resource distribution present significant challenges that will require international collaboration. However, the potential benefits far outweigh these temporary roadblocks, paving the way for a more connected and stable future.</p>
  `;
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected successfully!');

    // Clear existing records
    console.log('Clearing database (Users & Posts)...');
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Database cleared!');

    // 1. Create 20 Users
    console.log('Generating 20 users...');
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        name: `Author User ${i}`,
        email: `author${i}@example.com`,
        password: 'password123', // password will be hashed automatically by pre-save middleware
        role: i === 1 ? 'admin' : 'user', // first user is admin
        avatar: `avatar_${i}.png`,
        isActive: true
      });
      users.push(user);
    }
    console.log('20 Users created successfully!');

    // 2. Create 20 Posts for each User (total 400 posts)
    console.log('Generating 20 posts for each of the 20 users (total 400 posts)...');
    const postsToInsert = [];
    
    for (let u = 0; u < users.length; u++) {
      const user = users[u];
      
      for (let p = 1; p <= 20; p++) {
        // Distribute categories evenly
        const categoryIndex = (u + p) % categories.length;
        const category = categories[categoryIndex];
        const title = `${category.charAt(0) + category.slice(1).toLowerCase()} Breakthrough: Insight ${p} by ${user.name}`;
        const excerpt = `A deep dive into the latest updates in ${category.toLowerCase()} authored by ${user.name}. Discover the implications of recent research.`;
        const content = generateDummyContent(category, title);
        const image = getCategoryImage(category, u + p);

        postsToInsert.push({
          title,
          content,
          excerpt,
          author: user._id,
          status: 'published',
          tags: [category.toLowerCase()],
          featuredImage: image,
          views: Math.floor(Math.random() * 250) + 10,
          isPublic: true
        });
      }
    }

    // Insert all posts in bulk for performance
    console.log('Inserting 400 posts into database...');
    await Post.insertMany(postsToInsert);
    console.log('400 posts created successfully!');

    console.log('Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
