/**
 * API Automated Tests
 * Chạy: npm install node-fetch@2 && node tests/api.test.js
 */

// Node.js < 18 needs node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE = 'http://localhost:3000/api';
const API_KEY = 'boardgame-api-key-2024-secure';

let authToken = null;
let testResults = { passed: 0, failed: 0, tests: [] };

// Helper function
async function request(method, endpoint, body = null, requireAuth = false) {
    const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    };

    if (requireAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    return { status: res.status, data };
}

function test(name, fn) {
    return async () => {
        try {
            await fn();
            console.log(`✅ ${name}`);
            testResults.passed++;
            testResults.tests.push({ name, status: 'PASS' });
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
            testResults.failed++;
            testResults.tests.push({ name, status: 'FAIL', error: error.message });
        }
    };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

// ============== TEST CASES ==============

const tests = [
    // AUTH TESTS
    test('POST /auth/login - Valid credentials', async () => {
        const { status, data } = await request('POST', '/auth/login', {
            email: '01@gmail.com',
            password: '111111'
        });
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.success === true, 'Expected success: true');
        assert(data.data.token, 'Expected token in response');
        assert(data.data.user.is_admin === true, 'Expected admin user');
        authToken = data.data.token;
    }),

    test('POST /auth/login - Invalid credentials', async () => {
        const { status, data } = await request('POST', '/auth/login', {
            email: '01@gmail.com',
            password: 'wrongpassword'
        });
        assert(status === 401, `Expected 401, got ${status}`);
        assert(data.success === false, 'Expected success: false');
    }),

    test('GET /auth/me - With token', async () => {
        const { status, data } = await request('GET', '/auth/me', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.success === true, 'Expected success: true');
        assert(data.data.email === '01@gmail.com', 'Expected admin email');
    }),

    test('GET /auth/me - Without token', async () => {
        const { status } = await request('GET', '/auth/me');
        assert(status === 401, `Expected 401, got ${status}`);
    }),

    // GAMES TESTS
    test('GET /games - List all games', async () => {
        const { status, data } = await request('GET', '/games', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.success === true, 'Expected success: true');
        assert(Array.isArray(data.data), 'Expected array of games');
        assert(data.data.length >= 7, 'Expected at least 7 games');
    }),

    test('GET /games/1 - Get single game', async () => {
        const { status, data } = await request('GET', '/games/1', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.data.name === 'Caro Hàng 5', 'Expected Caro Hàng 5');
    }),

    // USERS TESTS
    test('GET /users - Search users', async () => {
        const { status, data } = await request('GET', '/users?search=player', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(Array.isArray(data.data), 'Expected array of users');
    }),

    // FRIENDS TESTS
    test('GET /friends - List friends', async () => {
        const { status, data } = await request('GET', '/friends', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.success === true, 'Expected success: true');
    }),

    test('GET /friends/requests - Pending requests', async () => {
        const { status } = await request('GET', '/friends/requests', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
    }),

    // MESSAGES TESTS
    test('GET /messages/conversations - List conversations', async () => {
        const { status, data } = await request('GET', '/messages/conversations', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.success === true, 'Expected success: true');
    }),

    // RANKINGS TESTS
    test('GET /rankings - Global rankings', async () => {
        const { status, data } = await request('GET', '/rankings', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.success === true, 'Expected success: true');
    }),

    test('GET /rankings/1 - Game specific rankings', async () => {
        const { status } = await request('GET', '/rankings/1', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
    }),

    // ADMIN TESTS
    test('GET /admin/statistics - Admin stats', async () => {
        const { status, data } = await request('GET', '/admin/statistics', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        // Check for any stats key (totalUsers, users, or similar)
        assert(data.data && Object.keys(data.data).length > 0, 'Expected stats data');
    }),

    test('GET /admin/users - Admin user list', async () => {
        const { status, data } = await request('GET', '/admin/users', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(Array.isArray(data.data), 'Expected array of users');
    }),

    test('GET /admin/games - Admin game list', async () => {
        const { status, data } = await request('GET', '/admin/games', null, true);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(Array.isArray(data.data), 'Expected array of games');
    }),
];

// ============== RUN TESTS ==============

async function runTests() {
    console.log('\n🧪 RUNNING API TESTS\n');
    console.log('='.repeat(50));

    for (const testFn of tests) {
        await testFn();
    }

    console.log('='.repeat(50));
    console.log(`\n📊 RESULTS: ${testResults.passed} passed, ${testResults.failed} failed\n`);

    if (testResults.failed > 0) {
        console.log('❌ FAILED TESTS:');
        testResults.tests
            .filter(t => t.status === 'FAIL')
            .forEach(t => console.log(`   - ${t.name}: ${t.error}`));
    }

    console.log('\n');
    process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
