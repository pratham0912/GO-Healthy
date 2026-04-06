// seeds/blogSeeds.js — Seed Sample Blogs (ESM)
// Run: node seeds/blogSeeds.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';

dotenv.config();

const sampleBlogs = [
    {
        title: 'The Science Behind Intermittent Fasting',
        content: `Intermittent fasting (IF) has gained massive popularity in recent years — and for good reason. Research shows that IF can aid weight loss, improve metabolic health, and even boost brain function.\n\nThe most popular methods include the 16:8 method (fast for 16 hours, eat within an 8-hour window) and the 5:2 method (eat normally for 5 days, restrict calories for 2 days).\n\nKey benefits include:\n- Improved insulin sensitivity\n- Enhanced cellular repair processes (autophagy)\n- Reduced inflammation\n- Better heart health markers\n\nHowever, IF isn't for everyone. Pregnant women, people with eating disorders, and those with certain medical conditions should consult a healthcare provider before starting.`,
        excerpt: 'Discover how intermittent fasting works, its proven health benefits, and whether it is right for you.',
        category: 'nutrition',
        author: 'Dr. Priya Sharma',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80',
        tags: ['intermittent-fasting', 'weight-loss', 'metabolism']
    },
    {
        title: '10 High-Protein Vegetarian Foods for Muscle Building',
        content: `Building muscle on a vegetarian diet is absolutely possible. Here are ten plant-based protein powerhouses:\n\n1. Paneer (Cottage Cheese) — 18g protein per 100g\n2. Lentils (Dal) — 9g protein per 100g cooked\n3. Chickpeas — 15g protein per 100g\n4. Greek Yogurt — 10g protein per 100g\n5. Tofu — 8g protein per 100g\n6. Quinoa — 4g protein per 100g cooked\n7. Edamame — 11g protein per 100g\n8. Peanut Butter — 25g protein per 100g\n9. Almonds — 21g protein per 100g\n10. Cottage Cheese — 11g protein per 100g\n\nCombine these with resistance training and adequate calories for optimal muscle growth.`,
        excerpt: 'You do not need meat to build muscle. These 10 vegetarian foods are packed with protein for serious gains.',
        category: 'muscle-gain',
        author: 'Rahul Patel',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
        tags: ['protein', 'vegetarian', 'muscle-building']
    },
    {
        title: 'Understanding Macros: Protein, Carbs, and Fats Explained',
        content: `Macronutrients (macros) are the three main nutrients your body needs in large quantities: protein, carbohydrates, and fats.\n\nProtein (4 cal/g): Essential for muscle repair, immune function, and enzyme production. Aim for 0.8-2g per kg of bodyweight depending on activity level.\n\nCarbohydrates (4 cal/g): Your body's primary energy source. Choose complex carbs (whole grains, vegetables) over simple sugars.\n\nFats (9 cal/g): Critical for hormone production, brain health, and nutrient absorption. Focus on healthy fats from avocados, nuts, olive oil, and fatty fish.\n\nA balanced macro split might look like:\n- Weight loss: 40% protein, 30% carbs, 30% fat\n- Maintenance: 30% protein, 40% carbs, 30% fat\n- Muscle gain: 30% protein, 45% carbs, 25% fat`,
        excerpt: 'Learn what macros are, why they matter, and how to calculate the right balance for your fitness goals.',
        category: 'nutrition',
        author: 'GoHealthy Team',
        image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
        tags: ['macros', 'protein', 'carbs', 'fats', 'nutrition-basics']
    },
    {
        title: '5 Morning Habits That Boost Your Metabolism',
        content: `Starting your day right can set the tone for your metabolism all day long. Here are five science-backed morning habits:\n\n1. Drink Water First Thing — Hydrating after 7-8 hours of sleep kickstarts your metabolism by up to 30%.\n\n2. Get Sunlight Exposure — Morning sunlight helps regulate your circadian rhythm and improves metabolic function.\n\n3. Eat a Protein-Rich Breakfast — Protein has a high thermic effect, meaning your body burns more calories digesting it.\n\n4. Move Your Body — Even 10 minutes of morning exercise can boost your metabolic rate for hours.\n\n5. Practice Cold Exposure — A cold shower activates brown fat, which burns calories to generate heat.`,
        excerpt: 'Simple morning routines that can boost your metabolic rate and help you burn more calories throughout the day.',
        category: 'wellness',
        author: 'Ananya Desai',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
        tags: ['metabolism', 'morning-routine', 'wellness', 'habits']
    },
    {
        title: 'HIIT vs Steady-State Cardio: Which Burns More Fat?',
        content: `The debate between High-Intensity Interval Training (HIIT) and steady-state cardio has been going on for years. Here is what the science says:\n\nHIIT involves short bursts of intense exercise followed by rest periods. A typical session lasts 20-30 minutes. Benefits include:\n- Higher calorie burn in less time\n- EPOC (excess post-exercise oxygen consumption) — you keep burning calories after the workout\n- Improved cardiovascular fitness\n- Better insulin sensitivity\n\nSteady-State Cardio involves maintaining a consistent moderate pace for 30-60+ minutes. Benefits include:\n- Easier to recover from\n- Better for beginners\n- Lower injury risk\n- Can be done daily\n\nThe verdict? Both are effective. HIIT is more time-efficient, but steady-state is more sustainable long-term. The best approach is to include both in your routine.`,
        excerpt: 'Comparing HIIT and steady-state cardio for fat loss — the science-backed answer might surprise you.',
        category: 'fitness',
        author: 'GoHealthy Team',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80',
        tags: ['hiit', 'cardio', 'fat-loss', 'exercise']
    },
    {
        title: 'How Sleep Affects Weight Loss and Muscle Recovery',
        content: `Sleep is often the most overlooked factor in fitness and weight management. Here is why it matters:\n\nWeight Loss:\n- Sleep deprivation increases ghrelin (hunger hormone) and decreases leptin (satiety hormone)\n- Poor sleep leads to increased cravings for high-calorie foods\n- Just one night of poor sleep can reduce insulin sensitivity by up to 30%\n\nMuscle Recovery:\n- Growth hormone (essential for muscle repair) is primarily released during deep sleep\n- Sleep is when your body repairs muscle tissue damaged during exercise\n- Athletes who sleep 8+ hours recover faster and perform better\n\nTips for Better Sleep:\n- Keep a consistent sleep schedule\n- Avoid screens 1 hour before bed\n- Keep your room cool (18-20 degrees Celsius)\n- Avoid caffeine after 2 PM\n- Try magnesium supplementation`,
        excerpt: 'Why getting enough quality sleep is crucial for both weight loss and muscle building goals.',
        category: 'wellness',
        author: 'Dr. Priya Sharma',
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
        tags: ['sleep', 'recovery', 'weight-loss', 'muscle-building']
    },
    {
        title: 'Indian Superfoods You Should Be Eating Daily',
        content: `India has a rich tradition of nutritious foods that modern science is now validating. Here are superfoods you should include in your diet:\n\n1. Turmeric (Haldi) — Contains curcumin, a powerful anti-inflammatory and antioxidant.\n\n2. Moringa (Drumstick Leaves) — Packed with vitamins A, C, and E, plus calcium and potassium.\n\n3. Amla (Indian Gooseberry) — One of the richest sources of Vitamin C. Boosts immunity and skin health.\n\n4. Ghee — Rich in butyric acid (gut health), fat-soluble vitamins, and CLA.\n\n5. Ragi (Finger Millet) — High in calcium, iron, and fiber. Excellent for diabetics.\n\n6. Sattu (Roasted Gram Flour) — High-protein, cooling drink ingredient popular in Bihar.\n\n7. Jackfruit Seeds — Often discarded but rich in protein, potassium, and iron.`,
        excerpt: 'Traditional Indian superfoods backed by modern science that deserve a place in your daily diet.',
        category: 'nutrition',
        author: 'Ananya Desai',
        image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80',
        tags: ['indian-food', 'superfoods', 'nutrition', 'ayurveda']
    },
    {
        title: 'Mental Health and Nutrition: The Gut-Brain Connection',
        content: `Your gut is often called your "second brain" — and for good reason. The gut-brain axis is a bidirectional communication system that profoundly affects your mental health.\n\n90% of serotonin (the "happy hormone") is produced in the gut. This means what you eat directly impacts your mood, anxiety levels, and cognitive function.\n\nFoods That Support Mental Health:\n- Fermented foods (yogurt, kimchi, idli) — provide probiotics\n- Omega-3 fatty acids (walnuts, flaxseeds) — reduce inflammation\n- Dark chocolate — boosts serotonin and contains magnesium\n- Leafy greens — rich in folate, which supports neurotransmitter production\n- Turmeric — curcumin can cross the blood-brain barrier and has anti-depressant properties\n\nFoods to Limit:\n- Processed sugar — causes inflammation and mood crashes\n- Ultra-processed foods — disrupt gut microbiome\n- Excessive caffeine — can worsen anxiety`,
        excerpt: 'How your diet directly affects your mental health through the fascinating gut-brain connection.',
        category: 'mental-health',
        author: 'GoHealthy Team',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
        tags: ['mental-health', 'gut-brain', 'nutrition', 'serotonin']
    },
    {
        title: 'A Beginner Guide to Tracking Calories Without Obsessing',
        content: `Calorie tracking can be a powerful tool for weight management — but it can also become unhealthy if you obsess over every number. Here is how to do it right:\n\n1. Start Simple — Track for just 2-3 days to understand your baseline. You do not need to track forever.\n\n2. Focus on Portions, Not Perfection — Use your hand as a guide:\n   - Palm = protein portion\n   - Fist = vegetable portion\n   - Cupped hand = carb portion\n   - Thumb = fat portion\n\n3. Use a Food Scale Initially — Weigh your food for the first week to calibrate your eye.\n\n4. Do Not Skip Meals to "Save" Calories — This leads to overeating later.\n\n5. Track Trends, Not Days — One bad day will not ruin your progress. Look at weekly averages.\n\n6. Know When to Stop Tracking — Once you develop an intuitive understanding of portions, you can stop active tracking.`,
        excerpt: 'Learn to track calories effectively without developing an unhealthy relationship with food.',
        category: 'weight-loss',
        author: 'Rahul Patel',
        image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&auto=format&fit=crop&q=80',
        tags: ['calorie-tracking', 'weight-loss', 'beginners', 'portions']
    },
    {
        title: 'Quick 15-Minute Home Workouts for Busy People',
        content: `No gym? No problem. These quick home workouts require zero equipment and can be done in just 15 minutes:\n\nWorkout A — Full Body Blast:\n- Jumping Jacks: 45 sec\n- Push-ups: 30 sec\n- Bodyweight Squats: 45 sec\n- Mountain Climbers: 30 sec\n- Plank: 45 sec\n- Rest: 30 sec\n- Repeat 3 rounds\n\nWorkout B — Core Focus:\n- Crunches: 40 sec\n- Bicycle Kicks: 40 sec\n- Leg Raises: 40 sec\n- Russian Twists: 40 sec\n- Plank: 60 sec\n- Rest: 30 sec\n- Repeat 3 rounds\n\nWorkout C — Lower Body:\n- Squats: 45 sec\n- Lunges: 45 sec\n- Glute Bridges: 45 sec\n- Wall Sit: 45 sec\n- Calf Raises: 45 sec\n- Rest: 30 sec\n- Repeat 3 rounds\n\nDo each workout on alternate days for a balanced routine!`,
        excerpt: 'Effective 15-minute workouts you can do at home with no equipment — perfect for busy schedules.',
        category: 'fitness',
        author: 'GoHealthy Team',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
        tags: ['home-workout', 'no-equipment', 'fitness', 'quick-workouts']
    }
];

const seedBlogs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Blog.deleteMany({});
        console.log('Cleared existing blogs');

        await Blog.insertMany(sampleBlogs);
        console.log(`Seeded ${sampleBlogs.length} blogs successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};

seedBlogs();
