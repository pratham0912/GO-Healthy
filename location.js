/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOCATION.JS — Go Healthy Location Intelligence
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const GoLocation = (function () {
    'use strict';

    let cachedLocation = null;

    /* ——— Regional Food Database ——— */
    const REGIONAL_FOODS = {
        'India': {
            staples: ['Rice', 'Roti/Chapati', 'Dal', 'Paneer', 'Curd/Yogurt'],
            proteins: ['Paneer', 'Lentils (Dal)', 'Chickpeas (Chana)', 'Tofu', 'Eggs', 'Chicken', 'Fish'],
            vegetables: ['Spinach (Palak)', 'Cauliflower (Gobi)', 'Okra (Bhindi)', 'Potato (Aloo)', 'Brinjal (Baingan)', 'Bottle Gourd (Lauki)'],
            grains: ['Bajra (Millet)', 'Jowar', 'Ragi', 'Poha', 'Oats', 'Quinoa'],
            breakfastIdeas: ['Poha with peanuts', 'Moong Dal Chilla', 'Idli + Sambar', 'Upma', 'Paratha + Curd', 'Oats Uttapam'],
            lunchIdeas: ['Dal + Brown Rice + Sabzi + Salad', 'Rajma Chawal', 'Chole + Roti', 'Khichdi + Raita', 'Paneer Bhurji + Roti'],
            dinnerIdeas: ['Roti + Mixed Sabzi + Dal', 'Grilled Chicken + Salad', 'Palak Paneer + Brown Rice', 'Egg Curry + Roti', 'Fish Curry + Rice'],
            snacks: ['Roasted Makhana', 'Sprouts Chaat', 'Buttermilk', 'Roasted Chana', 'Fruit Chaat', 'Peanut Butter Toast'],
            currency: '₹',
            costMultiplier: 1,
            dietTip: 'Indian diets are naturally high in fiber and plant-based protein. Focus on dal, paneer, and seasonal sabzi for balanced nutrition.',
            cuisine: 'Indian'
        },
        'United States': {
            staples: ['Oats', 'Quinoa', 'Brown Rice', 'Sweet Potato', 'Whole Wheat Bread'],
            proteins: ['Chicken Breast', 'Turkey', 'Salmon', 'Greek Yogurt', 'Eggs', 'Tofu', 'Whey Protein'],
            vegetables: ['Broccoli', 'Kale', 'Spinach', 'Bell Peppers', 'Zucchini', 'Asparagus'],
            grains: ['Oats', 'Quinoa', 'Brown Rice', 'Farro', 'Barley'],
            breakfastIdeas: ['Overnight Oats + Berries', 'Egg White Omelette + Toast', 'Protein Smoothie Bowl', 'Avocado Toast + Eggs', 'Greek Yogurt Parfait'],
            lunchIdeas: ['Grilled Chicken Caesar Salad', 'Turkey Wrap + Veggies', 'Quinoa Bowl + Roasted Veggies', 'Salmon Poke Bowl', 'Chicken Burrito Bowl'],
            dinnerIdeas: ['Grilled Salmon + Asparagus', 'Chicken Stir-Fry + Brown Rice', 'Turkey Meatballs + Zucchini Noodles', 'Lean Steak + Sweet Potato', 'Shrimp Tacos + Slaw'],
            snacks: ['Protein Bar', 'Mixed Nuts', 'Apple + Almond Butter', 'Hummus + Carrots', 'Trail Mix', 'Rice Cakes + PB'],
            currency: '$',
            costMultiplier: 3.5,
            dietTip: 'Focus on lean proteins, whole grains, and plenty of vegetables. Meal prep on Sundays for consistent nutrition throughout the week.',
            cuisine: 'American'
        },
        'United Kingdom': {
            staples: ['Oats', 'Whole Grain Bread', 'Potatoes', 'Rice', 'Pasta'],
            proteins: ['Chicken', 'Salmon', 'Cod', 'Eggs', 'Greek Yogurt', 'Beans'],
            vegetables: ['Peas', 'Broccoli', 'Carrots', 'Brussels Sprouts', 'Green Beans', 'Cabbage'],
            grains: ['Oats', 'Barley', 'Whole Wheat', 'Quinoa'],
            breakfastIdeas: ['Porridge + Banana', 'Eggs on Toast', 'Smoked Salmon Bagel', 'Overnight Oats', 'Full English (Healthy)'],
            lunchIdeas: ['Jacket Potato + Beans + Salad', 'Chicken & Avocado Wrap', 'Soup + Crusty Bread', 'Tuna Nicoise Salad', 'Falafel Bowl'],
            dinnerIdeas: ['Grilled Salmon + New Potatoes', 'Chicken Stir-Fry', 'Lean Beef Stew', 'Fish Pie + Greens', 'Bean Chilli + Rice'],
            snacks: ['Oat Cakes + Hummus', 'Rice Cakes', 'Fruit + Yogurt', 'Nuts', 'Dark Chocolate'],
            currency: '£',
            costMultiplier: 3,
            dietTip: 'British cuisine offers excellent protein from fish and legumes. Incorporate seasonal root vegetables for fiber and micronutrients.',
            cuisine: 'British'
        },
        'Mediterranean': {
            staples: ['Olive Oil', 'Whole Grain Bread', 'Couscous', 'Pasta', 'Rice'],
            proteins: ['Fish', 'Chicken', 'Lentils', 'Chickpeas', 'Feta Cheese', 'Eggs'],
            vegetables: ['Tomatoes', 'Cucumbers', 'Eggplant', 'Zucchini', 'Olives', 'Peppers'],
            grains: ['Bulgur', 'Couscous', 'Farro', 'Whole Wheat Pasta', 'Barley'],
            breakfastIdeas: ['Greek Yogurt + Honey + Walnuts', 'Shakshuka', 'Mediterranean Omelette', 'Labneh + Olive Oil + Za\'atar', 'Fruit + Cheese Plate'],
            lunchIdeas: ['Greek Salad + Grilled Chicken', 'Falafel Wrap + Hummus', 'Lentil Soup + Bread', 'Tabbouleh + Grilled Fish', 'Stuffed Peppers'],
            dinnerIdeas: ['Grilled Sea Bass + Roasted Veggies', 'Chicken Souvlaki + Tzatziki', 'Moussaka (Light)', 'Pasta Primavera', 'Stuffed Grape Leaves + Rice'],
            snacks: ['Hummus + Pita', 'Mixed Olives', 'Fresh Figs', 'Nuts + Dried Fruit', 'Cucumber + Tzatziki'],
            currency: '€',
            costMultiplier: 3.2,
            dietTip: 'The Mediterranean diet is one of the healthiest in the world. Prioritize olive oil, fish, legumes, and seasonal produce.',
            cuisine: 'Mediterranean'
        },
        'default': {
            staples: ['Rice', 'Oats', 'Bread', 'Potato', 'Pasta'],
            proteins: ['Chicken', 'Fish', 'Eggs', 'Lentils', 'Tofu', 'Greek Yogurt'],
            vegetables: ['Broccoli', 'Spinach', 'Carrots', 'Tomatoes', 'Bell Peppers'],
            grains: ['Oats', 'Brown Rice', 'Quinoa', 'Whole Wheat'],
            breakfastIdeas: ['Oats + Banana', 'Eggs + Toast', 'Smoothie Bowl', 'Yogurt + Granola'],
            lunchIdeas: ['Grilled Chicken Salad', 'Rice + Vegetables', 'Wrap + Protein', 'Soup + Bread'],
            dinnerIdeas: ['Grilled Fish + Veggies', 'Stir-Fry + Rice', 'Pasta + Lean Meat', 'Curry + Rice'],
            snacks: ['Nuts', 'Fruit', 'Yogurt', 'Protein Bar'],
            currency: '$',
            costMultiplier: 1,
            dietTip: 'Focus on whole foods, lean proteins, and plenty of vegetables for optimal health.',
            cuisine: 'International'
        }
    };

    /* ——— Diet-Specific Meal Overrides Per Region ——— */
    const DIET_SPECIFIC_MEALS = {
        'India': {
            vegetarian: {
                breakfast: ['Poha with Peanuts', 'Moong Dal Chilla', 'Idli + Sambar', 'Upma + Coconut Chutney', 'Paneer Paratha + Curd', 'Oats Uttapam', 'Besan Chilla + Mint Chutney'],
                lunch: ['Rajma Chawal + Salad', 'Chole + Roti + Raita', 'Paneer Bhurji + Roti', 'Dal Tadka + Brown Rice + Sabzi', 'Khichdi + Kadhi + Papad', 'Palak Paneer + Jeera Rice', 'Stuffed Capsicum + Dal + Roti'],
                dinner: ['Roti + Mixed Sabzi + Dal', 'Palak Paneer + Brown Rice', 'Paneer Tikka + Salad + Roti', 'Aloo Gobi + Dal + Roti', 'Vegetable Biryani + Raita', 'Mushroom Matar + Roti', 'Baingan Bharta + Chapati'],
                snacks: ['Roasted Makhana', 'Sprouts Chaat', 'Buttermilk', 'Roasted Chana', 'Fruit Chaat', 'Peanut Butter Toast', 'Paneer Tikka Bites']
            },
            vegan: {
                breakfast: ['Poha with Peanuts', 'Vegetable Upma', 'Ragi Dosa + Chutney', 'Oats with Almond Milk + Banana', 'Besan Chilla + Tomato Chutney', 'Nachni Porridge', 'Moong Sprouts Salad'],
                lunch: ['Rajma Chawal + Salad', 'Chole + Roti', 'Dal Tadka + Brown Rice + Sabzi', 'Khichdi + Pickle', 'Mixed Veg Curry + Jowar Roti', 'Sambar Rice + Papad', 'Mushroom Masala + Chapati'],
                dinner: ['Roti + Mixed Sabzi + Dal', 'Vegetable Biryani', 'Tofu Bhurji + Chapati', 'Lauki Dal + Roti', 'Baingan Bharta + Brown Rice', 'Chana Masala + Jeera Rice', 'Mixed Sprouts Curry + Roti'],
                snacks: ['Roasted Makhana', 'Sprouts Chaat', 'Coconut Water', 'Roasted Chana', 'Fruit Chaat', 'Peanut Butter on Ragi Toast', 'Poha Chivda']
            },
            keto: {
                breakfast: ['Paneer Bhurji + Avocado', 'Egg Omelette + Cheese', 'Coconut Chia Pudding', 'Bulletproof Coffee + Boiled Eggs', 'Almond Flour Dosa + Chutney', 'Cheese Stuffed Mushrooms', 'Spinach Egg Muffins'],
                lunch: ['Paneer Tikka + Green Salad', 'Grilled Chicken + Cauliflower Rice', 'Palak Paneer (No Roti)', 'Egg Curry + Cauliflower Mash', 'Tandoori Chicken + Raita', 'Mutton Keema + Salad', 'Butter Chicken (No Naan) + Greens'],
                dinner: ['Grilled Fish + Sauteed Veggies', 'Paneer Steak + Mushroom Sauce', 'Chicken Tikka + Caesar Salad', 'Egg Bhurji + Avocado', 'Tandoori Prawns + Salad', 'Mutton Seekh Kebab + Raita', 'Cauliflower Crust Pizza'],
                snacks: ['Cheese Cubes', 'Almonds + Walnuts', 'Boiled Eggs', 'Peanut Butter Fat Bombs', 'Cucumber + Cream Cheese', 'Coconut Chips', 'Flax Seed Crackers']
            },
            highprotein: {
                breakfast: ['Moong Dal Chilla + Paneer', 'Egg White Omelette + Toast', 'Protein Smoothie (Whey + Banana)', 'Sprouts Poha + Boiled Eggs', 'Besan Chilla + Greek Yogurt', 'Paneer Paratha + Curd', 'Soy Milk Oats + Nuts'],
                lunch: ['Chicken Breast + Brown Rice + Dal', 'Rajma + Rice + Egg Curry', 'Grilled Fish + Roti + Salad', 'Soya Chunk Curry + Rice', 'Paneer Tikka + Dal + Roti', 'Egg Biryani + Raita', 'Chicken Keema + Chapati + Salad'],
                dinner: ['Grilled Chicken + Palak + Roti', 'Fish Curry + Brown Rice + Salad', 'Paneer Bhurji + Roti + Dal', 'Tandoori Chicken + Mixed Salad', 'Egg Curry + Quinoa', 'Soya Chunks Stir-Fry + Roti', 'Chicken Tikka + Greek Yogurt Dip'],
                snacks: ['Protein Bar', 'Boiled Eggs', 'Greek Yogurt + Nuts', 'Roasted Chana + Peanuts', 'Paneer Cubes + Seeds', 'Whey Protein Shake', 'Sprouts Salad']
            }
        },
        'United States': {
            vegetarian: {
                breakfast: ['Greek Yogurt Parfait + Granola', 'Avocado Toast + Poached Eggs', 'Veggie Egg Omelette + Toast', 'Overnight Oats + Berries', 'Banana Pancakes + Maple Syrup', 'Mushroom + Cheese Frittata', 'Smoothie Bowl + Chia Seeds'],
                lunch: ['Veggie Burrito Bowl + Guacamole', 'Caprese Sandwich + Side Salad', 'Black Bean Soup + Cornbread', 'Quinoa Bowl + Roasted Veggies', 'Grilled Cheese + Tomato Soup', 'Falafel Wrap + Hummus', 'Mac and Cheese + Steamed Broccoli'],
                dinner: ['Vegetable Stir-Fry + Brown Rice', 'Eggplant Parmesan + Side Salad', 'Mushroom Risotto + Greens', 'Stuffed Bell Peppers + Quinoa', 'Veggie Lasagna', 'Black Bean Tacos + Slaw', 'Cauliflower Steak + Mashed Potatoes'],
                snacks: ['Trail Mix', 'Apple + Peanut Butter', 'Hummus + Carrots', 'Rice Cakes + Almond Butter', 'Cheese + Crackers', 'Yogurt + Granola', 'Edamame']
            },
            vegan: {
                breakfast: ['Smoothie Bowl + Granola', 'Avocado Toast + Cherry Tomatoes', 'Overnight Oats (Oat Milk) + Berries', 'Tofu Scramble + Toast', 'Banana Oat Pancakes', 'Chia Pudding + Mango', 'Peanut Butter Banana Wrap'],
                lunch: ['Buddha Bowl + Tahini Dressing', 'Black Bean Burrito Bowl', 'Lentil Soup + Crusty Bread', 'Quinoa Salad + Roasted Veggies', 'Falafel Wrap + Hummus', 'Sweet Potato + Black Bean Tacos', 'Mediterranean Couscous Salad'],
                dinner: ['Tofu Stir-Fry + Brown Rice', 'Vegetable Curry + Coconut Rice', 'Stuffed Peppers + Quinoa', 'Vegan Pasta Primavera', 'Chickpea Tikka Masala + Rice', 'Bean Chili + Cornbread', 'Lentil Bolognese + Spaghetti'],
                snacks: ['Mixed Nuts', 'Fruit + Almond Butter', 'Hummus + Veggies', 'Trail Mix', 'Rice Cakes + Avocado', 'Dark Chocolate + Almonds', 'Roasted Chickpeas']
            },
            keto: {
                breakfast: ['Bacon + Eggs + Avocado', 'Bulletproof Coffee + Cheese Omelette', 'Keto Smoothie (MCT Oil + Berries)', 'Sausage + Egg Muffins', 'Cream Cheese Pancakes', 'Smoked Salmon + Cream Cheese', 'Chia Pudding (Coconut Milk)'],
                lunch: ['Grilled Chicken Caesar (No Croutons)', 'Bunless Burger + Side Salad', 'Tuna Salad Lettuce Wraps', 'Steak + Buttered Asparagus', 'Salmon Salad + Olive Oil', 'Chicken Thigh + Broccoli', 'Shrimp + Zucchini Noodles'],
                dinner: ['Grilled Salmon + Roasted Cauliflower', 'Steak + Sauteed Mushrooms', 'Chicken Thighs + Creamed Spinach', 'Pork Chops + Green Beans', 'Butter Shrimp + Cauliflower Rice', 'Bunless Bacon Cheeseburger + Salad', 'Lamb Chops + Asparagus'],
                snacks: ['Cheese Crisps', 'Almonds', 'Beef Jerky', 'Avocado + Lime', 'Pork Rinds', 'Boiled Eggs', 'Celery + Cream Cheese']
            },
            highprotein: {
                breakfast: ['Egg White Omelette + Turkey Bacon', 'Protein Pancakes + Berries', 'Greek Yogurt + Granola + Whey', 'Chicken Sausage + Scrambled Eggs', 'Protein Smoothie (Whey + Banana + PB)', 'Cottage Cheese + Fruit', 'Smoked Salmon Bagel'],
                lunch: ['Grilled Chicken Breast + Quinoa + Broccoli', 'Turkey Meatball Sub + Salad', 'Salmon Poke Bowl + Rice', 'Chicken Burrito Bowl + Black Beans', 'Tuna Steak + Sweet Potato', 'Lean Beef Burger + Side Salad', 'Shrimp + Brown Rice + Veggies'],
                dinner: ['Grilled Salmon + Asparagus + Rice', 'Chicken Breast + Roasted Veggies', 'Lean Steak + Baked Potato + Greens', 'Turkey Meatballs + Zucchini Noodles', 'Grilled Shrimp + Quinoa Pilaf', 'Baked Cod + Sweet Potato Fries', 'Chicken Stir-Fry + Brown Rice'],
                snacks: ['Protein Bar', 'Greek Yogurt', 'Beef Jerky', 'Hard-Boiled Eggs', 'Cottage Cheese + Pineapple', 'Whey Shake + Banana', 'Tuna + Crackers']
            }
        },
        'United Kingdom': {
            vegetarian: {
                breakfast: ['Porridge + Banana + Honey', 'Veggie English Breakfast (No Meat)', 'Eggs on Toast + Avocado', 'Overnight Oats + Berries', 'Mushroom + Cheese Toastie', 'Yogurt + Granola + Fruit', 'Pancakes + Maple Syrup'],
                lunch: ['Jacket Potato + Beans + Cheese', 'Veggie Wrap + Hummus + Salad', 'Tomato Soup + Grilled Cheese', 'Falafel Bowl + Tabbouleh', 'Mac and Cheese + Salad', 'Veggie Quiche + Side Salad', 'Halloumi Burger + Sweet Potato Fries'],
                dinner: ['Mushroom Stroganoff + Rice', 'Vegetable Pie + Mash + Greens', 'Bean Chilli + Rice', 'Spinach + Ricotta Pasta', 'Cauliflower Cheese + Roasted Veggies', 'Vegetable Curry + Naan', 'Stuffed Peppers + Couscous'],
                snacks: ['Oat Cakes + Hummus', 'Fruit + Yogurt', 'Nuts + Seeds', 'Rice Cakes + PB', 'Dark Chocolate', 'Cheese + Crackers', 'Veggie Sticks + Tzatziki']
            },
            vegan: {
                breakfast: ['Porridge (Oat Milk) + Banana', 'Avocado on Toast + Tomatoes', 'Smoothie Bowl + Seeds', 'Overnight Oats (Almond Milk)', 'Toast + Peanut Butter + Banana', 'Chia Pudding + Berries', 'Granola + Coconut Yogurt'],
                lunch: ['Lentil Soup + Crusty Bread', 'Falafel Wrap + Hummus', 'Sweet Potato + Bean Chili', 'Roasted Veggie Couscous Bowl', 'Mushroom + Walnut Bolognese Pasta', 'Jacket Potato + Beans', 'Buddha Bowl + Tahini'],
                dinner: ['Vegetable Curry + Coconut Rice', 'Bean Chilli + Rice', 'Tofu Stir-Fry + Noodles', 'Lentil Shepherds Pie', 'Roasted Cauliflower Steak + Greens', 'Chickpea + Spinach Stew', 'Vegan Pad Thai'],
                snacks: ['Hummus + Carrot Sticks', 'Mixed Nuts', 'Rice Cakes + Almond Butter', 'Fruit Salad', 'Dark Chocolate', 'Oat Bars', 'Edamame']
            },
            keto: {
                breakfast: ['Full English (Bacon + Eggs + Sausage)', 'Smoked Salmon + Cream Cheese', 'Cheese Omelette + Avocado', 'Bulletproof Coffee + Eggs', 'Keto Granola + Greek Yogurt', 'Mushroom + Spinach Frittata', 'Boiled Eggs + Bacon'],
                lunch: ['Chicken Caesar Salad (No Croutons)', 'Tuna Mayo Lettuce Wraps', 'Steak + Buttered Greens', 'Prawn Salad + Olive Oil', 'Bunless Burger + Coleslaw', 'Chicken + Avocado Bowl', 'Salmon + Asparagus'],
                dinner: ['Grilled Salmon + Cauliflower Mash', 'Roast Chicken + Brussels Sprouts', 'Lamb Chops + Green Beans', 'Cod + Buttered Spinach', 'Steak + Mushroom Sauce + Greens', 'Pork Belly + Sauerkraut', 'Chicken Thighs + Roasted Veggies'],
                snacks: ['Cheese + Celery', 'Pork Scratchings', 'Boiled Eggs', 'Almonds + Walnuts', 'Beef Jerky', 'Cream Cheese + Cucumber', 'Olives']
            },
            highprotein: {
                breakfast: ['Eggs on Toast + Smoked Salmon', 'Protein Porridge + Banana', 'Full English Breakfast', 'Greek Yogurt + Granola + Honey', 'Chicken Sausage + Scrambled Eggs', 'Protein Smoothie (Whey + Oats)', 'Cottage Cheese + Toast'],
                lunch: ['Chicken + Avocado Wrap + Salad', 'Tuna Nicoise Salad', 'Turkey + Cheese Sandwich + Soup', 'Salmon Salad Bowl', 'Chicken Breast + Jacket Potato', 'Lean Beef Mince + Rice', 'Prawn + Quinoa Bowl'],
                dinner: ['Grilled Salmon + New Potatoes + Greens', 'Chicken Stir-Fry + Rice', 'Lean Beef Stew + Crusty Bread', 'Fish Pie + Peas', 'Roast Chicken + Roasted Veggies', 'Turkey Meatballs + Spaghetti', 'Baked Cod + Sweet Potato + Broccoli'],
                snacks: ['Protein Bar', 'Beef Jerky', 'Greek Yogurt', 'Hard-Boiled Eggs', 'Cottage Cheese + Pineapple', 'Nuts + Seeds', 'Tuna + Rice Cakes']
            }
        },
        'Mediterranean': {
            vegetarian: {
                breakfast: ['Greek Yogurt + Honey + Walnuts', 'Shakshuka (Eggs in Tomato)', 'Mediterranean Omelette + Olives', 'Labneh + Olive Oil + Bread', 'Fruit + Feta Plate', 'Spinach + Feta Borek', 'Avocado Toast + Poached Egg'],
                lunch: ['Greek Salad + Halloumi + Bread', 'Falafel Wrap + Hummus + Tabbouleh', 'Lentil Soup + Pita Bread', 'Stuffed Peppers + Rice + Feta', 'Caprese Salad + Quinoa', 'Spanakopita + Greek Salad', 'Mushroom + Olive Pasta'],
                dinner: ['Pasta Primavera + Parmesan', 'Stuffed Grape Leaves + Rice + Salad', 'Vegetable Moussaka', 'Eggplant Parmesan + Salad', 'Mushroom Risotto + Greens', 'Chickpea + Vegetable Tagine', 'Caprese Pasta + Garlic Bread'],
                snacks: ['Hummus + Pita', 'Mixed Olives', 'Fresh Figs + Cheese', 'Nuts + Dried Fruit', 'Cucumber + Tzatziki', 'Dates + Almonds', 'Grapes + Feta']
            },
            vegan: {
                breakfast: ['Coconut Yogurt + Granola + Fruit', 'Avocado Toast + Cherry Tomatoes', 'Olive Oil + Zaatar + Flatbread', 'Fruit Salad + Nuts', 'Smoothie (Date + Banana + Almond Milk)', 'Chia Pudding + Fig', 'Tahini Toast + Date Syrup'],
                lunch: ['Falafel Wrap + Hummus', 'Lentil Soup + Crusty Bread', 'Tabbouleh + Stuffed Grape Leaves', 'Mediterranean Couscous + Veggies', 'Chickpea Salad + Olive Oil', 'Roasted Veggie + Quinoa Bowl', 'White Bean + Tomato Stew'],
                dinner: ['Stuffed Peppers + Couscous', 'Pasta Primavera (No Cheese)', 'Vegetable Tagine + Rice', 'Lentil Moussaka', 'Chickpea + Spinach Stew', 'Roasted Eggplant + Tahini + Pilaf', 'Bean + Olive Stew + Bread'],
                snacks: ['Hummus + Veggies', 'Mixed Olives', 'Dates + Walnuts', 'Dried Fruit + Nuts', 'Fresh Figs', 'Rice Cakes + Tahini', 'Roasted Chickpeas']
            },
            keto: {
                breakfast: ['Shakshuka (No Bread)', 'Greek Yogurt + Walnuts', 'Mediterranean Omelette + Feta', 'Smoked Salmon + Cream Cheese', 'Boiled Eggs + Olives + Cheese', 'Avocado + Prosciutto', 'Spinach + Feta Scramble'],
                lunch: ['Grilled Chicken + Greek Salad (No Pita)', 'Grilled Fish + Roasted Veggies', 'Lamb Kofta + Tzatziki + Salad', 'Shrimp + Zucchini Noodles', 'Tuna + Olive + Feta Salad', 'Chicken Souvlaki (No Pita) + Greens', 'Sardines + Tomato + Olive Salad'],
                dinner: ['Grilled Sea Bass + Sauteed Greens', 'Lamb Chops + Roasted Vegetables', 'Chicken Souvlaki + Tzatziki + Salad', 'Baked Salmon + Asparagus', 'Moussaka (No Potato Layer)', 'Grilled Prawns + Mediterranean Salad', 'Steak + Grilled Zucchini + Feta'],
                snacks: ['Olives + Cheese', 'Almonds + Walnuts', 'Cucumber + Feta', 'Sardines', 'Boiled Eggs', 'Prosciutto + Mozzarella', 'Avocado + Olive Oil']
            },
            highprotein: {
                breakfast: ['Shakshuka + Bread', 'Greek Yogurt + Honey + Nuts + Seeds', 'Mediterranean Omelette + Feta + Toast', 'Labneh + Eggs + Olive Oil + Bread', 'Protein Smoothie + Dates', 'Smoked Salmon Bagel + Cream Cheese', 'Egg White Frittata + Veggies'],
                lunch: ['Greek Salad + Grilled Chicken', 'Grilled Fish + Tabbouleh', 'Lamb Kofta + Hummus + Salad', 'Salmon Poke Bowl + Quinoa', 'Chicken Souvlaki + Rice + Salad', 'Tuna + White Bean Salad', 'Shrimp + Couscous + Veggies'],
                dinner: ['Grilled Sea Bass + Roasted Veggies', 'Chicken Souvlaki + Tzatziki + Rice', 'Grilled Lamb + Quinoa + Greens', 'Baked Salmon + Sweet Potato', 'Shrimp + Pasta + Tomato Sauce', 'Steak + Roasted Peppers + Rice', 'Fish Stew + Crusty Bread'],
                snacks: ['Greek Yogurt + Nuts', 'Hummus + Pita', 'Boiled Eggs + Olives', 'Tuna + Crackers', 'Protein Bar', 'Cottage Cheese + Fruit', 'Nuts + Dried Fruit']
            }
        },
        'default': {
            vegetarian: {
                breakfast: ['Oats + Banana + Honey', 'Veggie Omelette + Toast', 'Smoothie Bowl + Granola', 'Yogurt + Berries + Nuts', 'Pancakes + Fruit', 'Avocado Toast + Poached Egg', 'Cheese Toast + Tomato'],
                lunch: ['Veggie Wrap + Hummus', 'Quinoa Salad + Roasted Veggies', 'Grilled Cheese + Tomato Soup', 'Falafel Bowl + Tahini', 'Pasta + Marinara + Cheese', 'Black Bean Tacos', 'Mushroom Risotto'],
                dinner: ['Vegetable Stir-Fry + Rice', 'Pasta Primavera + Parmesan', 'Stuffed Peppers + Quinoa', 'Bean Chili + Rice', 'Eggplant Parmesan + Salad', 'Veggie Curry + Naan', 'Mushroom Burger + Sweet Potato Fries'],
                snacks: ['Nuts + Dried Fruit', 'Fruit + Yogurt', 'Hummus + Veggies', 'Trail Mix', 'Cheese + Crackers', 'Protein Bar', 'Rice Cakes + PB']
            },
            vegan: {
                breakfast: ['Oats (Plant Milk) + Banana', 'Smoothie Bowl + Seeds', 'Avocado Toast + Tomatoes', 'Chia Pudding + Berries', 'PB Banana Wrap', 'Granola + Coconut Yogurt', 'Tofu Scramble + Toast'],
                lunch: ['Buddha Bowl + Tahini', 'Lentil Soup + Bread', 'Black Bean Burrito Bowl', 'Falafel Wrap + Hummus', 'Roasted Veggie Salad + Quinoa', 'Sweet Potato + Chickpea Bowl', 'Mushroom + Walnut Pasta'],
                dinner: ['Tofu Stir-Fry + Rice', 'Vegetable Curry + Rice', 'Lentil Bolognese + Pasta', 'Bean Chili + Cornbread', 'Stuffed Peppers + Couscous', 'Chickpea Tikka Masala', 'Vegan Pad Thai'],
                snacks: ['Mixed Nuts', 'Fruit', 'Hummus + Carrots', 'Dark Chocolate', 'Rice Cakes + Almond Butter', 'Roasted Chickpeas', 'Edamame']
            },
            keto: {
                breakfast: ['Eggs + Bacon + Avocado', 'Cheese Omelette', 'Bulletproof Coffee + Eggs', 'Chia Pudding (Coconut Milk)', 'Smoked Salmon + Cream Cheese', 'Keto Smoothie + MCT Oil', 'Sausage + Egg Muffins'],
                lunch: ['Grilled Chicken Salad', 'Bunless Burger + Salad', 'Tuna Lettuce Wraps', 'Steak + Buttered Veggies', 'Salmon + Asparagus', 'Shrimp + Zucchini Noodles', 'Chicken + Avocado Bowl'],
                dinner: ['Grilled Salmon + Cauliflower', 'Steak + Mushrooms + Greens', 'Chicken Thighs + Creamed Spinach', 'Pork Chops + Green Beans', 'Lamb Chops + Roasted Veggies', 'Butter Shrimp + Cauliflower Rice', 'Bunless Cheeseburger + Salad'],
                snacks: ['Cheese Cubes', 'Almonds', 'Boiled Eggs', 'Beef Jerky', 'Avocado + Salt', 'Pork Rinds', 'Olives']
            },
            highprotein: {
                breakfast: ['Egg White Omelette + Toast', 'Protein Smoothie + Banana', 'Greek Yogurt + Granola', 'Chicken Sausage + Eggs', 'Cottage Cheese + Fruit', 'Protein Pancakes', 'Smoked Salmon Bagel'],
                lunch: ['Grilled Chicken + Rice + Veggies', 'Tuna Salad + Quinoa', 'Turkey Wrap + Side Salad', 'Salmon Bowl + Brown Rice', 'Lean Beef Stir-Fry + Noodles', 'Chicken Burrito Bowl', 'Shrimp + Pasta'],
                dinner: ['Grilled Fish + Sweet Potato', 'Chicken Breast + Quinoa + Broccoli', 'Lean Steak + Baked Potato', 'Turkey Meatballs + Pasta', 'Baked Cod + Rice + Greens', 'Grilled Shrimp + Salad + Rice', 'Chicken Stir-Fry + Brown Rice'],
                snacks: ['Protein Bar', 'Greek Yogurt', 'Boiled Eggs', 'Beef Jerky', 'Cottage Cheese', 'Whey Shake', 'Nuts + Seeds']
            }
        }
    };

    /* ——— Seasonal Produce Calendar ——— */
    const SEASONAL_PRODUCE = {
        'India': {
            1: { fruits: ['Guava', 'Orange', 'Papaya', 'Strawberry'], vegs: ['Carrot', 'Methi', 'Palak', 'Radish', 'Green Peas'] },
            2: { fruits: ['Guava', 'Strawberry', 'Kiwi'], vegs: ['Methi', 'Palak', 'Cabbage', 'Cauliflower'] },
            3: { fruits: ['Mango (raw)', 'Watermelon', 'Papaya'], vegs: ['Capsicum', 'Onion', 'Cucumber', 'Beans'] },
            4: { fruits: ['Mango', 'Watermelon', 'Jackfruit', 'Litchi'], vegs: ['Bottle Gourd', 'Ridge Gourd', 'Cucumber', 'Onion'] },
            5: { fruits: ['Mango', 'Watermelon', 'Muskmelon', 'Litchi'], vegs: ['Bitter Gourd', 'Bottle Gourd', 'Okra', 'Tinda'] },
            6: { fruits: ['Mango', 'Jamun', 'Plum', 'Peach'], vegs: ['Okra', 'Tinda', 'Karela', 'Pointed Gourd'] },
            7: { fruits: ['Jamun', 'Plum', 'Pear', 'Peach'], vegs: ['Okra', 'Pumpkin', 'Snake Gourd', 'Brinjal'] },
            8: { fruits: ['Banana', 'Pomegranate', 'Pear', 'Custard Apple'], vegs: ['Brinjal', 'Pumpkin', 'Corn', 'Drumstick'] },
            9: { fruits: ['Pomegranate', 'Apple', 'Custard Apple'], vegs: ['Brinjal', 'Taro', 'Sweet Potato', 'Corn'] },
            10: { fruits: ['Apple', 'Pomegranate', 'Guava', 'Banana'], vegs: ['Methi', 'Palak', 'Carrot', 'Beetroot'] },
            11: { fruits: ['Guava', 'Orange', 'Amla', 'Apple'], vegs: ['Methi', 'Palak', 'Green Peas', 'Turnip'] },
            12: { fruits: ['Orange', 'Guava', 'Grape', 'Papaya'], vegs: ['Methi', 'Palak', 'Carrot', 'Radish', 'Green Peas'] }
        },
        'United States': {
            1: { fruits: ['Grapefruit', 'Orange', 'Tangerine'], vegs: ['Brussels Sprouts', 'Kale', 'Leeks', 'Turnips'] },
            2: { fruits: ['Grapefruit', 'Orange', 'Lemon'], vegs: ['Brussels Sprouts', 'Cabbage', 'Celery'] },
            3: { fruits: ['Pineapple', 'Mango'], vegs: ['Artichoke', 'Asparagus', 'Broccoli', 'Lettuce'] },
            4: { fruits: ['Strawberry', 'Pineapple'], vegs: ['Asparagus', 'Peas', 'Rhubarb', 'Spinach'] },
            5: { fruits: ['Strawberry', 'Cherry', 'Apricot'], vegs: ['Asparagus', 'Corn', 'Zucchini', 'Snap Peas'] },
            6: { fruits: ['Blueberry', 'Cherry', 'Peach', 'Watermelon'], vegs: ['Corn', 'Cucumber', 'Green Beans', 'Tomatoes'] },
            7: { fruits: ['Blueberry', 'Blackberry', 'Peach', 'Plum', 'Watermelon'], vegs: ['Corn', 'Tomato', 'Zucchini', 'Bell Pepper'] },
            8: { fruits: ['Peach', 'Plum', 'Fig', 'Melon'], vegs: ['Corn', 'Eggplant', 'Tomato', 'Pepper'] },
            9: { fruits: ['Apple', 'Grape', 'Pear', 'Fig'], vegs: ['Butternut Squash', 'Sweet Potato', 'Cauliflower'] },
            10: { fruits: ['Apple', 'Cranberry', 'Pear', 'Pomegranate'], vegs: ['Pumpkin', 'Sweet Potato', 'Turnip', 'Kale'] },
            11: { fruits: ['Apple', 'Cranberry', 'Orange', 'Pear'], vegs: ['Brussels Sprouts', 'Parsnip', 'Sweet Potato'] },
            12: { fruits: ['Grapefruit', 'Orange', 'Tangerine', 'Pear'], vegs: ['Kale', 'Leeks', 'Turnips', 'Winter Squash'] }
        }
    };

    /* ——— Grocery Price Estimates (per kg/unit in base currency $) ——— */
    const BASE_PRICES = {
        'Chicken Breast': 5.50, 'Eggs (12)': 3.50, 'Salmon': 9.00, 'Tofu': 2.50,
        'Greek Yogurt': 4.00, 'Paneer': 4.00, 'Lentils': 1.50, 'Chickpeas': 1.80,
        'Rice': 1.20, 'Oats': 2.50, 'Quinoa': 5.00, 'Brown Rice': 1.80,
        'Bread (Whole Wheat)': 2.50, 'Sweet Potato': 1.50, 'Pasta': 1.50,
        'Broccoli': 2.00, 'Spinach': 2.50, 'Tomatoes': 1.80, 'Bell Peppers': 2.50,
        'Bananas': 0.80, 'Apples': 2.00, 'Berries': 4.00, 'Avocado': 1.50,
        'Olive Oil': 6.00, 'Peanut Butter': 3.50, 'Almonds': 8.00, 'Milk': 1.50,
        'Cheese': 4.50, 'Butter': 3.00, 'Honey': 5.00
    };

    /* ——— Country → Region Mapping ——— */
    const COUNTRY_REGION_MAP = {
        'India': 'India',
        'United States': 'United States', 'US': 'United States',
        'United Kingdom': 'United Kingdom', 'UK': 'United Kingdom',
        'Italy': 'Mediterranean', 'Spain': 'Mediterranean', 'Greece': 'Mediterranean',
        'Turkey': 'Mediterranean', 'France': 'Mediterranean', 'Portugal': 'Mediterranean',
        'Canada': 'United States', 'Australia': 'United States',
        'Germany': 'United Kingdom', 'Netherlands': 'United Kingdom',
    };

    /* ——— Detect Location ——— */
    async function detectLocation() {
        if (cachedLocation) return cachedLocation;

        // Try browser Geolocation first
        try {
            const pos = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) reject(new Error('No geolocation'));
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            const { latitude, longitude } = pos.coords;
            const geo = await reverseGeocode(latitude, longitude);
            if (geo) {
                cachedLocation = geo;
                return cachedLocation;
            }
        } catch (e) {
            console.log('Browser geolocation unavailable, trying IP fallback...');
        }

        // IP-based fallback
        try {
            const resp = await fetch('https://ipapi.co/json/');
            const data = await resp.json();
            cachedLocation = {
                city: data.city || 'Unknown',
                state: data.region || '',
                country: data.country_name || 'Unknown',
                countryCode: data.country_code || '',
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone || '',
                currency: data.currency || 'USD',
                climate: guessClimate(data.latitude)
            };
            return cachedLocation;
        } catch (e) {
            console.log('IP geolocation failed, using defaults');
            cachedLocation = {
                city: 'Unknown', state: '', country: 'Unknown',
                countryCode: '', latitude: 0, longitude: 0,
                timezone: '', currency: 'USD', climate: 'temperate'
            };
            return cachedLocation;
        }
    }

    async function reverseGeocode(lat, lng) {
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`);
            const data = await resp.json();
            const addr = data.address || {};
            return {
                city: addr.city || addr.town || addr.village || 'Unknown',
                state: addr.state || '',
                country: addr.country || 'Unknown',
                countryCode: addr.country_code?.toUpperCase() || '',
                latitude: lat,
                longitude: lng,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                currency: guessCurrency(addr.country_code),
                climate: guessClimate(lat)
            };
        } catch (e) {
            return null;
        }
    }

    function guessCurrency(countryCode) {
        const map = { 'IN': 'INR', 'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'CA': 'CAD', 'AU': 'AUD', 'JP': 'JPY' };
        return map[countryCode?.toUpperCase()] || 'USD';
    }

    function guessClimate(lat) {
        const absLat = Math.abs(lat);
        if (absLat < 15) return 'tropical';
        if (absLat < 30) return 'subtropical';
        if (absLat < 50) return 'temperate';
        return 'continental';
    }

    /* ——— Get Regional Food Data ——— */
    function getRegionalFoods(country) {
        const region = COUNTRY_REGION_MAP[country] || 'default';
        return REGIONAL_FOODS[region] || REGIONAL_FOODS['default'];
    }

    /* ——— Get Seasonal Produce ——— */
    function getSeasonalProduce(country, month) {
        const m = month || (new Date().getMonth() + 1);
        const region = COUNTRY_REGION_MAP[country] || country;
        const calendar = SEASONAL_PRODUCE[region];
        if (calendar && calendar[m]) return calendar[m];
        // Default seasonal produce
        return {
            fruits: ['Banana', 'Apple', 'Orange', 'Berries'],
            vegs: ['Spinach', 'Broccoli', 'Carrots', 'Tomatoes']
        };
    }

    /* ——— Estimate Grocery Cost ——— */
    function estimateGroceryCost(items, country) {
        const regional = getRegionalFoods(country);
        const multiplier = regional.costMultiplier || 1;
        const symbol = regional.currency || '$';
        let total = 0;

        items.forEach(item => {
            const basePrice = BASE_PRICES[item] || 2.50;
            total += basePrice * multiplier;
        });

        return { total: Math.round(total * 100) / 100, currency: symbol, items: items.length };
    }

    /* ——— Generate Location-Based Meal Suggestions ——— */
    function getLocationMealPlan(country, goal, dietPref) {
        const foods = getRegionalFoods(country);
        const region = COUNTRY_REGION_MAP[country] || 'default';
        const month = new Date().getMonth() + 1;
        const seasonal = getSeasonalProduce(country, month);

        // Check if a specific diet preference is selected and we have data for it
        if (dietPref && dietPref !== 'any') {
            const regionDiets = DIET_SPECIFIC_MEALS[region] || DIET_SPECIFIC_MEALS['default'];
            const dietMeals = regionDiets[dietPref];
            if (dietMeals) {
                return {
                    cuisine: foods.cuisine,
                    dietTip: foods.dietTip,
                    breakfast: dietMeals.breakfast,
                    lunch: dietMeals.lunch,
                    dinner: dietMeals.dinner,
                    snacks: dietMeals.snacks,
                    seasonal: seasonal,
                    proteins: foods.proteins,
                    staples: foods.staples,
                    currency: foods.currency
                };
            }
        }

        // Default: return regional general meals (no diet filter)
        return {
            cuisine: foods.cuisine,
            dietTip: foods.dietTip,
            breakfast: foods.breakfastIdeas,
            lunch: foods.lunchIdeas,
            dinner: foods.dinnerIdeas,
            snacks: foods.snacks,
            seasonal: seasonal,
            proteins: foods.proteins,
            staples: foods.staples,
            currency: foods.currency
        };
    }

    /* ——— Format Location Card HTML ——— */
    function renderLocationCard(loc) {
        const seasonal = getSeasonalProduce(loc.country);
        const foods = getRegionalFoods(loc.country);
        return `
            <div class="glass-card p-4 location-card">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="icon-circle green"><i class="bi bi-geo-alt-fill"></i></div>
                    <div>
                        <div class="fw-bold" style="color: var(--text-primary);">${loc.city}, ${loc.state}</div>
                        <small style="color: var(--text-muted);">${loc.country} · ${loc.climate} climate</small>
                    </div>
                    <span class="badge-neon ms-auto" style="padding: 4px 12px; font-size: 0.7rem;">${foods.cuisine}</span>
                </div>
                <div class="mb-3">
                    <div class="overline mb-2" style="font-size: 0.65rem;">In Season Now</div>
                    <div class="d-flex flex-wrap gap-1">
                        ${seasonal.fruits.slice(0, 4).map(f => `<span class="badge-orange" style="padding: 3px 10px; font-size: 0.7rem;">${f}</span>`).join('')}
                        ${seasonal.vegs.slice(0, 4).map(v => `<span class="badge-cyan" style="padding: 3px 10px; font-size: 0.7rem;">${v}</span>`).join('')}
                    </div>
                </div>
                <small style="color: var(--text-secondary); font-size: 0.8rem;"><i class="bi bi-lightbulb me-1" style="color: var(--soft-orange);"></i>${foods.dietTip}</small>
            </div>
        `;
    }

    /* ——— Public API ——— */
    return {
        detect: detectLocation,
        getRegionalFoods,
        getSeasonalProduce,
        estimateGroceryCost,
        getLocationMealPlan,
        renderLocationCard,
        getCache: () => cachedLocation,
        BASE_PRICES
    };

})();
