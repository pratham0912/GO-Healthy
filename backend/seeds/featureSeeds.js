// seeds/featureSeeds.js — Seed Modal Content + Images (ESM)
// Run: node seeds/featureSeeds.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ModalContent from '../models/ModalContent.js';
import Image from '../models/Image.js';

dotenv.config();

const modalSeeds = [
    {
        title: 'Welcome to Go Healthy!',
        body: 'Start your health journey today. Track your meals, explore nutritious recipes, and get personalized meal plans — all powered by AI. Sign up now to unlock your dashboard!',
        type: 'welcome',
        icon: 'bi-heart-pulse-fill',
        ctaText: 'Get Started',
        ctaLink: 'sign_in.html',
        priority: 10,
        active: true
    },
    {
        title: 'Daily Health Tip',
        body: 'Drinking a glass of warm water with lemon first thing in the morning can kickstart your metabolism, improve digestion, and hydrate your body after hours of sleep. Try it for a week and notice the difference!',
        type: 'health-tip',
        icon: 'bi-lightbulb',
        ctaText: 'More Tips',
        ctaLink: '#',
        priority: 5,
        active: true
    },
    {
        title: 'New: AI Meal Planner',
        body: 'Our AI-powered meal planner now creates personalized weekly plans based on your dietary preferences, fitness goals, and calorie targets. Try it out and take the guesswork out of healthy eating!',
        type: 'announcement',
        icon: 'bi-calendar-check',
        ctaText: 'Plan Your Meals',
        ctaLink: 'Mealplanner.html',
        priority: 8,
        active: true
    },
    {
        title: 'Stay Hydrated!',
        body: 'Your body is about 60% water. Dehydration can cause fatigue, headaches, and poor concentration. Aim for at least 8 glasses of water daily. Use the water tracker on your dashboard to stay on track!',
        type: 'health-tip',
        icon: 'bi-droplet-half',
        ctaText: 'Track Water',
        ctaLink: 'dashboard.html',
        priority: 3,
        active: true
    }
];

const imageSeeds = [
    { url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80', category: 'fitness', title: 'Strength Training', description: 'Build lean muscle with progressive resistance training' },
    { url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80', category: 'fitness', title: 'Home Workout', description: 'Effective bodyweight exercises you can do anywhere' },
    { url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80', category: 'fitness', title: 'Running Outdoors', description: 'Cardiovascular exercise in nature for body and mind' },
    { url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80', category: 'nutrition', title: 'Colorful Salad Bowl', description: 'A rainbow of nutrients in every bite' },
    { url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80', category: 'nutrition', title: 'Balanced Meal Prep', description: 'Planning your meals for consistent nutrition' },
    { url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80', category: 'nutrition', title: 'Fresh Fruits', description: 'Natural vitamins and antioxidants from whole fruits' },
    { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80', category: 'yoga', title: 'Morning Yoga', description: 'Start your day with flexibility and mindfulness' },
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80', category: 'yoga', title: 'Meditation Practice', description: 'Calm your mind and reduce stress through meditation' },
    { url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&auto=format&fit=crop&q=80', category: 'yoga', title: 'Yoga Flow', description: 'Flowing through poses for strength and balance' },
    { url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80', category: 'recipes', title: 'Healthy Pancakes', description: 'Protein-packed pancakes for a nutritious breakfast' },
    { url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80', category: 'recipes', title: 'Green Smoothie Bowl', description: 'Packed with spinach, banana, and superfoods' },
    { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', category: 'recipes', title: 'Avocado Toast', description: 'Simple, delicious, and full of healthy fats' },
    { url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80', category: 'mental-health', title: 'Quality Sleep', description: 'Rest and recovery for optimal mental health' },
    { url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&auto=format&fit=crop&q=80', category: 'mental-health', title: 'Nature Therapy', description: 'Spending time in nature reduces anxiety and stress' },
    { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80', category: 'wellness', title: 'Active Lifestyle', description: 'Movement is medicine for body and soul' },
    { url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&auto=format&fit=crop&q=80', category: 'wellness', title: 'Health Journaling', description: 'Track your progress and celebrate small wins' },
];

const seedFeatures = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await ModalContent.deleteMany({});
        await Image.deleteMany({});
        console.log('Cleared existing modal content and images');

        await ModalContent.insertMany(modalSeeds);
        console.log(`Seeded ${modalSeeds.length} modal contents`);

        await Image.insertMany(imageSeeds);
        console.log(`Seeded ${imageSeeds.length} images`);

        console.log('\nAll feature seeds completed!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};

seedFeatures();
