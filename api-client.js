// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// api-client.js — Frontend API Client (ESM Ready Backend)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const API = (() => {
    'use strict';

    // ─── Config ─────────────────────────────
    // Dynamically pick the API base: use localhost in dev, same-origin /api in production
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const BASE_URL = isLocal ? 'http://127.0.0.1:5000/api' : '/api';
    const TOKEN_KEY = 'gohealthy_token';
    const USER_KEY = 'gohealthy_user';

    // ─── Token Management ───────────────────

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    function removeToken() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    function getUser() {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function setUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function isLoggedIn() {
        return !!getToken();
    }

    // ─── HTTP Helper ────────────────────────

    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            // 401 Unauthorized globally handles session expiration
            if (response.status === 401) {
                removeToken();
                if (!window.location.pathname.includes('sign_in.html')) {
                    window.location.href = 'sign_in.html';
                }
            }

            return { ok: response.ok, status: response.status, data };
        } catch (error) {
            console.error('API Error:', error);
            return {
                ok: false,
                status: 0,
                data: { success: false, error: 'Network error. Is the server running?' }
            };
        }
    }

    // ─── FormData Request (for file uploads) ─────
    // Do NOT set Content-Type — the browser will auto-set multipart/form-data with boundary
    async function requestFormData(endpoint, formData, method = 'POST') {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {};
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(url, { method, headers, body: formData });
            const data = await response.json();
            return { ok: response.ok, status: response.status, data };
        } catch (error) {
            console.error('API Error (FormData):', error);
            return { ok: false, status: 0, data: { success: false, error: 'Network error.' } };
        }
    }

    // ─── Auth APIs ──────────────────────────

    async function googleLogin(credential) {
        const result = await request('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token: credential })
        });

        if (result.ok && result.data.data?.token) {
            setToken(result.data.data.token);
            setUser(result.data.data.user);
        }

        return result;
    }

    async function login(email, password) {
        const result = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (result.ok && result.data.data?.token) {
            setToken(result.data.data.token);
            setUser(result.data.data.user);
        }

        return result;
    }

    async function register(name, email, password) {
        const result = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        if (result.ok && result.data.data?.token) {
            setToken(result.data.data.token);
            setUser(result.data.data.user);
        }

        return result;
    }

    function logout() {
        removeToken();
        window.location.href = 'sign_in.html';
    }


    // ─── User Profile APIs ───────────────────

    async function getProfile() {
        return await request('/user/profile');
    }

    async function updateProfile(data) {
        return await request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // ─── Dashboard APIs ──────────────────────

    async function getDashboard() {
        return await request('/dashboard');
    }

    async function updatePreferences(preferences) {
        return await request('/dashboard/preferences', {
            method: 'PUT',
            body: JSON.stringify(preferences)
        });
    }

    async function updateTheme(theme) {
        return await request('/dashboard/theme', {
            method: 'PUT',
            body: JSON.stringify({ theme })
        });
    }

    async function getDashboardStats() {
        return await request('/dashboard/stats');
    }

    // ─── Activity APIs ───────────────────────

    async function getActivities(page = 1, limit = 10) {
        return await request(`/activity?page=${page}&limit=${limit}`);
    }

    async function logActivity(data) {
        return await request('/activity', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function deleteActivity(id) {
        return await request(`/activity/${id}`, {
            method: 'DELETE'
        });
    }

    async function getActivityStats() {
        return await request('/activity/stats');
    }

    // ─── Blog APIs ──────────────────────────

    // Get admin-curated blogs (Public)
    async function getBlogs(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await request(`/blogs${query ? '?' + query : ''}`);
    }

    async function getBlogById(id) {
        return await request(`/blogs/${id}`);
    }

    // User-scoped saved blogs (Protected)
    async function getSavedBlogs(page = 1, limit = 10) {
        return await request(`/blogs/saved?page=${page}&limit=${limit}`);
    }

    async function saveBlog(blogData) {
        return await request('/blogs/save', {
            method: 'POST',
            body: JSON.stringify(blogData)
        });
    }

    async function unsaveBlog(blogId) {
        return await request(`/blogs/save/${blogId}`, {
            method: 'DELETE'
        });
    }

    async function checkBlogSaved(blogId) {
        return await request(`/blogs/saved/${blogId}`);
    }

    // ─── Theme Helper ────────────────────────

    // ─── Recipes API ────────────────────────

    async function getRecipes(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await request(`/recipes${query ? '?' + query : ''}`);
    }

    async function getRecipeById(id) {
        return await request(`/recipes/${id}`);
    }

    async function createRecipe(formData) {
        return await requestFormData('/recipes', formData, 'POST');
    }

    async function updateRecipe(id, formData) {
        return await requestFormData(`/recipes/${id}`, formData, 'PUT');
    }

    async function updateRecipeImage(id, formData) {
        return await requestFormData(`/recipes/${id}/image`, formData, 'PUT');
    }

    async function deleteRecipe(id) {
        return await request(`/recipes/${id}`, { method: 'DELETE' });
    }

    // ─── Water APIs ─────────────────────────

    async function getWater(date) {
        const q = date ? `?date=${date}` : '';
        return await request(`/water${q}`);
    }

    async function getWaterHistory(days = 7) {
        return await request(`/water/history?days=${days}`);
    }

    async function incrementWater() {
        return await request('/water/increment', { method: 'POST' });
    }

    async function decrementWater() {
        return await request('/water/decrement', { method: 'POST' });
    }

    // ─── Meal APIs (extended) ───────────────

    async function getMealsByDate(date) {
        const q = date ? `?date=${date}` : '';
        return await request(`/meals${q}`);
    }

    // ─── BMI API ────────────────────────────

    async function getBMI() {
        return await request('/user/bmi');
    }

    async function updateHealthProfile(data) {
        return await request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // ─── Meal Plan API ─────────────────────

    async function getMealPlan() {
        return await request('/mealplan');
    }

    async function saveMealPlan(data) {
        return await request('/mealplan', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function deleteMealPlan(id) {
        return await request(`/mealplan/${id}`, { method: 'DELETE' });
    }

    async function getMealPlanHistory() {
        return await request('/mealplan/history');
    }

    // ─── Theme Helper ────────────────────────────────

    function updateThemeIcon(theme) {
        document.querySelectorAll('#themeIcon').forEach(icon => {
            icon.className = theme === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-stars';
        });
    }

    async function applyTheme() {
        let theme = localStorage.getItem('gohealthy_theme') || 'dark';

        if (isLoggedIn()) {
            const result = await getDashboard();
            if (result.ok && result.data?.data?.theme) {
                theme = result.data.data.theme;
                localStorage.setItem('gohealthy_theme', theme);
            }
        }

        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
        return theme;
    }

    async function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('gohealthy_theme', next);
        updateThemeIcon(next);

        if (isLoggedIn()) {
            await updateTheme(next);
        }
    }

    // ─── UI Helpers ─────────────────────────

    function updateNavUI() {
        const user = getUser();
        const signInBtns = document.querySelectorAll('a[href="sign_in.html"]');

        if (user && isLoggedIn()) {
            let initials = 'U';
            if (user.name) {
                const parts = user.name.split(' ');
                initials = parts[0][0] + (parts[1] ? parts[1][0] : '');
            }

            const avatarHtml = user.profilePicture 
                ? `<img src="${user.profilePicture}" alt="${user.name}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`
                : `<div style="width: 24px; height: 24px; border-radius: 50%; background: var(--neon-green); color: var(--bg-primary); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px;">${initials.toUpperCase()}</div>`;

            signInBtns.forEach(btn => {
                if (btn.classList.contains('btn')) {
                    btn.outerHTML = `
                        <div class="dropdown">
                            <button class="btn btn-neon px-3 py-2 dropdown-toggle d-flex align-items-center gap-2"
                                    type="button" data-bs-toggle="dropdown" id="userDropdownBtn">
                                ${avatarHtml}
                                <span class="d-none d-md-inline">${user.name ? user.name.split(' ')[0] : 'User'}</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end" style="background: var(--bg-secondary); border: 1px solid var(--glass-border);">
                                <li><a class="dropdown-item" href="dashboard.html" style="color: var(--text-primary);">
                                    <i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
                                <li><hr class="dropdown-divider" style="border-color: var(--glass-border);"></li>
                                <li><a class="dropdown-item" href="#" onclick="API.logout(); return false;" style="color: var(--soft-orange);">
                                    <i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
                            </ul>
                        </div>`;
                }
            });
        }
    }

    // Auto-update nav on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            updateNavUI();
            applyTheme();
        });
    } else {
        updateNavUI();
        applyTheme();
    }

    // ─── Support / Contact ────────────
    async function submitContact(name, email, message) {
        return await request('/contact', {
            method: 'POST',
            body: JSON.stringify({ name, email, message })
        });
    }

    // ─── Public exported methods ────────────

    return {
        // Auth
        googleLogin,
        login,
        register,
        logout,
        isLoggedIn,
        getToken,
        getUser,

        // Profile
        getProfile,
        updateProfile,
        updateHealthProfile,
        getBMI,

        // Dashboard
        getDashboard,
        updatePreferences,
        updateTheme,
        getDashboardStats,

        // Contact
        submitContact,

        // Water
        getWater,
        getWaterHistory,
        incrementWater,
        decrementWater,

        // Meals
        getMealsByDate,

        // Activity
        getActivities,
        logActivity,
        deleteActivity,
        getActivityStats,

        // Blogs
        getBlogs,
        getBlogById,
        getSavedBlogs,
        saveBlog,
        unsaveBlog,
        checkBlogSaved,

        // Recipes
        getRecipes,
        getRecipeById,
        createRecipe,
        updateRecipe,
        updateRecipeImage,
        deleteRecipe,

        // Meal Plan
        getMealPlan,
        saveMealPlan,
        deleteMealPlan,
        getMealPlanHistory,

        // Theme
        applyTheme,
        toggleTheme,

        // UI
        updateNavUI,
        BASE_URL
    };
})();
