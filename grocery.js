/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GROCERY.JS — Go Healthy Grocery List Generator
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const GoGrocery = (function () {
    'use strict';

    /* ——— Meal → Ingredients Map ——— */
    const MEAL_INGREDIENTS = {
        // Indian
        'Poha with peanuts': ['Flattened Rice (Poha)', 'Peanuts', 'Onion', 'Green Chili', 'Turmeric', 'Lemon'],
        'Moong Dal Chilla': ['Moong Dal', 'Green Chili', 'Ginger', 'Coriander'],
        'Idli + Sambar': ['Rice', 'Urad Dal', 'Toor Dal', 'Mixed Vegetables', 'Sambar Powder'],
        'Upma': ['Semolina (Rava)', 'Onion', 'Green Peas', 'Peanuts', 'Mustard Seeds'],
        'Paratha + Curd': ['Whole Wheat Flour', 'Potato', 'Curd', 'Butter'],
        'Oats Uttapam': ['Oats', 'Curd', 'Onion', 'Tomato', 'Capsicum'],
        'Dal + Brown Rice + Sabzi + Salad': ['Toor Dal', 'Brown Rice', 'Mixed Vegetables', 'Salad Greens', 'Onion', 'Tomato'],
        'Rajma Chawal': ['Kidney Beans (Rajma)', 'Rice', 'Onion', 'Tomato', 'Ginger-Garlic Paste'],
        'Chole + Roti': ['Chickpeas', 'Whole Wheat Flour', 'Onion', 'Tomato', 'Spices'],
        'Khichdi + Raita': ['Rice', 'Moong Dal', 'Curd', 'Cucumber', 'Cumin'],
        'Paneer Bhurji + Roti': ['Paneer', 'Whole Wheat Flour', 'Onion', 'Tomato', 'Capsicum'],
        'Roti + Mixed Sabzi + Dal': ['Whole Wheat Flour', 'Mixed Vegetables', 'Toor Dal', 'Spices'],
        'Grilled Chicken + Salad': ['Chicken Breast', 'Lettuce', 'Cucumber', 'Tomato', 'Olive Oil', 'Lemon'],
        'Palak Paneer + Brown Rice': ['Spinach', 'Paneer', 'Brown Rice', 'Onion', 'Garlic'],
        'Egg Curry + Roti': ['Eggs', 'Whole Wheat Flour', 'Onion', 'Tomato', 'Spices'],
        'Fish Curry + Rice': ['Fish', 'Rice', 'Coconut Milk', 'Onion', 'Tomato'],
        // American
        'Overnight Oats + Berries': ['Oats', 'Milk', 'Chia Seeds', 'Mixed Berries', 'Honey'],
        'Egg White Omelette + Toast': ['Eggs', 'Whole Wheat Bread', 'Spinach', 'Mushrooms'],
        'Protein Smoothie Bowl': ['Protein Powder', 'Banana', 'Mixed Berries', 'Granola', 'Honey'],
        'Avocado Toast + Eggs': ['Avocado', 'Whole Wheat Bread', 'Eggs', 'Cherry Tomatoes'],
        'Greek Yogurt Parfait': ['Greek Yogurt', 'Granola', 'Mixed Berries', 'Honey'],
        'Grilled Chicken Caesar Salad': ['Chicken Breast', 'Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
        'Turkey Wrap + Veggies': ['Turkey Slices', 'Whole Wheat Tortilla', 'Lettuce', 'Tomato', 'Mustard'],
        'Quinoa Bowl + Roasted Veggies': ['Quinoa', 'Bell Peppers', 'Zucchini', 'Sweet Potato', 'Olive Oil'],
        'Salmon Poke Bowl': ['Salmon', 'Sushi Rice', 'Avocado', 'Cucumber', 'Soy Sauce', 'Sesame Seeds'],
        'Chicken Burrito Bowl': ['Chicken Breast', 'Rice', 'Black Beans', 'Corn', 'Salsa', 'Avocado'],
        'Grilled Salmon + Asparagus': ['Salmon', 'Asparagus', 'Olive Oil', 'Lemon', 'Garlic'],
        'Chicken Stir-Fry + Brown Rice': ['Chicken Breast', 'Brown Rice', 'Bell Peppers', 'Broccoli', 'Soy Sauce'],
    };

    /* ——— Category Mapping ——— */
    const CATEGORY_MAP = {
        'Chicken Breast': 'protein', 'Turkey Slices': 'protein', 'Eggs': 'protein',
        'Salmon': 'protein', 'Fish': 'protein', 'Paneer': 'protein', 'Tofu': 'protein',
        'Greek Yogurt': 'dairy', 'Curd': 'dairy', 'Milk': 'dairy', 'Cheese': 'dairy',
        'Parmesan': 'dairy', 'Butter': 'dairy', 'Coconut Milk': 'dairy',
        'Rice': 'grains', 'Brown Rice': 'grains', 'Oats': 'grains', 'Quinoa': 'grains',
        'Whole Wheat Flour': 'grains', 'Whole Wheat Bread': 'grains', 'Pasta': 'grains',
        'Whole Wheat Tortilla': 'grains', 'Semolina (Rava)': 'grains', 'Granola': 'grains',
        'Spinach': 'produce', 'Broccoli': 'produce', 'Tomato': 'produce', 'Onion': 'produce',
        'Lettuce': 'produce', 'Cucumber': 'produce', 'Bell Peppers': 'produce',
        'Capsicum': 'produce', 'Avocado': 'produce', 'Sweet Potato': 'produce',
        'Zucchini': 'produce', 'Asparagus': 'produce', 'Mushrooms': 'produce',
        'Cherry Tomatoes': 'produce', 'Green Peas': 'produce', 'Corn': 'produce',
        'Mixed Vegetables': 'produce', 'Salad Greens': 'produce', 'Romaine Lettuce': 'produce',
        'Banana': 'fruits', 'Mixed Berries': 'fruits', 'Lemon': 'fruits', 'Apple': 'fruits',
        'Olive Oil': 'pantry', 'Soy Sauce': 'pantry', 'Honey': 'pantry',
        'Spices': 'pantry', 'Turmeric': 'pantry', 'Cumin': 'pantry',
        'Chia Seeds': 'pantry', 'Peanuts': 'pantry', 'Sesame Seeds': 'pantry',
        'Protein Powder': 'pantry', 'Mustard': 'pantry',
    };

    const CATEGORY_LABELS = {
        protein: { label: 'Protein', color: 'var(--neon-green)' },
        dairy: { label: 'Dairy', color: 'var(--electric-cyan)' },
        grains: { label: 'Grains & Bread', color: 'var(--soft-orange)' },
        produce: { label: 'Vegetables', color: 'var(--neon-green)' },
        fruits: { label: 'Fruits', color: 'var(--soft-orange)' },
        pantry: { label: 'Pantry & Spices', color: 'var(--purple-accent)' },
        other: { label: 'Other', color: 'var(--text-secondary)' }
    };

    /* ——— Generate Grocery List from Meal Names ——— */
    function generateFromMeals(mealNames) {
        const allIngredients = new Set();

        mealNames.forEach(meal => {
            const ingredients = MEAL_INGREDIENTS[meal];
            if (ingredients) {
                ingredients.forEach(i => allIngredients.add(i));
            }
        });

        return groupByCategory([...allIngredients]);
    }

    /* ——— Group by Category ——— */
    function groupByCategory(ingredients) {
        const grouped = {};
        ingredients.forEach(item => {
            const cat = CATEGORY_MAP[item] || 'other';
            if (!grouped[cat]) grouped[cat] = [];
            if (!grouped[cat].includes(item)) grouped[cat].push(item);
        });
        return grouped;
    }

    /* ——— Estimate Total Cost ——— */
    function estimateCost(ingredients, country) {
        const foods = GoLocation ? GoLocation.getRegionalFoods(country) : { costMultiplier: 1, currency: '$' };
        let total = 0;
        const prices = (GoLocation && GoLocation.BASE_PRICES) || {};

        ingredients.forEach(item => {
            total += (prices[item] || 2.00) * (foods.costMultiplier || 1);
        });

        return {
            total: Math.round(total * 100) / 100,
            currency: foods.currency || '$',
            perDay: Math.round((total / 7) * 100) / 100
        };
    }

    /* ——— Render Grocery List HTML ——— */
    function renderGroceryList(grouped, costInfo) {
        let html = `
            <div class="glass-card p-4 grocery-list-card">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold mb-0" style="color: var(--text-primary);">
                        <i class="bi bi-cart3 me-2" style="color: var(--neon-green);"></i>Grocery List
                    </h5>
                    <div class="text-end">
                        <div class="fw-bold" style="color: var(--neon-green); font-size: 1.2rem;">${costInfo.currency}${costInfo.total}</div>
                        <small style="color: var(--text-muted);">~${costInfo.currency}${costInfo.perDay}/day</small>
                    </div>
                </div>
        `;

        for (const [cat, items] of Object.entries(grouped)) {
            const catInfo = CATEGORY_LABELS[cat] || CATEGORY_LABELS.other;
            html += `
                <div class="mb-3">
                    <div class="overline mb-2" style="font-size: 0.65rem; color: ${catInfo.color};">${catInfo.label}</div>
                    <div class="d-flex flex-wrap gap-2">
                        ${items.map(item => `
                            <label class="grocery-item">
                                <input type="checkbox" class="grocery-check">
                                <span>${item}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += `
                <div class="text-center mt-4">
                    <button class="btn btn-ghost btn-sm" onclick="GoGrocery.downloadList()">
                        <i class="bi bi-download me-1"></i>Download List
                    </button>
                </div>
            </div>
        `;
        return html;
    }

    /* ——— Download as Text ——— */
    function downloadList() {
        const checks = document.querySelectorAll('.grocery-item');
        let text = 'Go Healthy — Grocery List\n';
        text += '═══════════════════════════\n\n';
        checks.forEach(item => {
            const name = item.querySelector('span').textContent;
            const checked = item.querySelector('input').checked;
            text += `${checked ? '[x]' : '[ ]'} ${name}\n`;
        });
        text += '\n— Generated by GoHealthy.com';

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'GoHealthy_Grocery_List.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    return {
        generateFromMeals,
        groupByCategory,
        estimateCost,
        renderGroceryList,
        downloadList,
        MEAL_INGREDIENTS
    };

})();
