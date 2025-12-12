# 🧪 Testing Guide - Verify All Fixes

This guide helps you verify that all issues have been resolved.

## Quick Test Checklist

### ✅ 1. Text Visibility Test

**What to check:** All text should be visible (not white on white)

**Steps:**
1. Open http://localhost:3000
2. Check that you can read all text clearly
3. Text should be dark/black on light backgrounds
4. All pages (home, login, dashboard) should have visible text

**Expected Result:**
- ✅ Home page: Black text on blue gradient background
- ✅ Login page: Black text visible on all elements
- ✅ Dashboard: All text and cards clearly readable

**If text is white/invisible:**
- Your browser may be in dark mode
- **Fix applied:** CSS now forces light mode
- Clear browser cache: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

### ✅ 2. Docker Node.js Version Test

**What to check:** Backend container using Node.js 20+

**Steps:**
```bash
# Check container status
docker-compose ps

# Verify Node version
docker-compose exec backend node --version

# Expected output: v20.x.x (not v18.x.x)
```

**If showing Node 18.x.x:**
```bash
# Run the fix script
./fix-node-version.sh

# Or manual fix
docker-compose down
docker rmi solid-umbrella-backend:latest
docker-compose build --no-cache backend
docker-compose up -d
```

---

### ✅ 3. Login Flow Test

**What to check:** Login works and redirects to dashboard

**Steps:**
1. Go to http://localhost:3000/login
2. Check browser console (F12) - should see: "Fazendo login em: http://localhost:5000/api/v1/auth/login"
3. Use test credentials:
   - Email: `admin@empresa.com`
   - Password: `senha123`
4. Click "Entrar"

**Expected Result:**
- ✅ If backend is running: Redirects to dashboard
- ✅ If backend is down: Clear error message with API URL
- ✅ If wrong credentials: "Email ou senha incorretos"

**Possible Errors & Solutions:**

**Error: "Endpoint de login não encontrado (404)"**
- Backend is not running or wrong port
- **Fix:**
  ```bash
  docker-compose logs -f backend
  # Check if backend started successfully
  ```

**Error: "Erro ao conectar com o servidor"**
- Backend container not started
- **Fix:**
  ```bash
  docker-compose up -d backend
  docker-compose logs -f backend
  ```

**Error: "Email ou senha incorretos"**
- Wrong credentials
- **Fix:** Use the test credentials above

---

### ✅ 4. Authentication Protection Test

**What to check:** Dashboard requires login

**Steps:**
1. Open new incognito/private window
2. Go directly to http://localhost:3000/dashboard
3. Should immediately redirect to /login
4. Login with test credentials
5. Should redirect back to dashboard
6. Dashboard should show user name in header

**Expected Result:**
- ✅ Cannot access dashboard without login
- ✅ Shows loading spinner briefly during auth check
- ✅ Redirects to login if not authenticated
- ✅ Dashboard shows after successful login

---

### ✅ 5. Already Logged In Test

**What to check:** Auto-redirect if already authenticated

**Steps:**
1. Login successfully to dashboard
2. Go back to http://localhost:3000/login
3. Should automatically redirect to dashboard

**Expected Result:**
- ✅ Login page redirects to dashboard if already logged in
- ✅ No need to login again

---

### ✅ 6. Logout Test

**What to check:** Logout clears session and redirects

**Steps:**
1. While logged in on dashboard
2. Click "Sair" button in header
3. Should redirect to login page
4. Try to access /dashboard again
5. Should redirect back to login

**Expected Result:**
- ✅ Logout clears authentication
- ✅ Redirects to login
- ✅ Cannot access protected pages after logout

---

## Complete System Test

### Prerequisites

```bash
# 1. Check all containers are running
docker-compose ps

# Expected output:
# service_management_db        Up
# service_management_api       Up
# service_management_web       Up

# 2. Check backend logs
docker-compose logs backend | tail -20

# Should see: "Server running on port 5000"

# 3. Check frontend logs
docker-compose logs frontend | tail -20

# Should see: "ready - started server on 0.0.0.0:3000"
```

### Full Flow Test

1. **Home Page**
   ```
   Open: http://localhost:3000
   Check: ✅ Text visible
   Check: ✅ "Fazer Login" button visible
   Click: "Fazer Login"
   ```

2. **Login Page**
   ```
   Check: ✅ Form fields visible
   Check: ✅ Test credentials buttons visible
   Click: "👤 Admin" test credentials button
   Check: ✅ Email and password filled automatically
   Click: "Entrar"
   ```

3. **Dashboard Page**
   ```
   Check: ✅ Redirected to /dashboard
   Check: ✅ Header shows "Bem-vindo, Admin"
   Check: ✅ Stats cards visible (OS Hoje, Receita, etc.)
   Check: ✅ Quick actions buttons visible
   Check: ✅ Próximas Visitas list visible
   ```

4. **Logout**
   ```
   Click: "Sair" in header
   Check: ✅ Redirected to /login
   ```

5. **Protected Route**
   ```
   Try: http://localhost:3000/dashboard
   Check: ✅ Redirected to /login
   ```

---

## Troubleshooting

### Issue: Text is white/invisible

**Cause:** Browser dark mode or cache issue

**Fix:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Try incognito/private window
4. The CSS now forces light mode, so this should be fixed

### Issue: "undefined/auth/login" in console

**Cause:** This was the original error before fixes

**Fix:** Already fixed! Now uses centralized config with fallback values

**Verify fix:**
- Open browser console (F12)
- Try to login
- Should see: "Fazendo login em: http://localhost:5000/api/v1/auth/login"
- NOT: "undefined/auth/login"

### Issue: Backend connection error

**Cause:** Backend not running or database not ready

**Fix:**
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Nuclear option (last resort)
docker-compose down
docker-compose up -d
```

### Issue: Node.js version error

**Cause:** Old Docker image with Node 18

**Fix:**
```bash
./fix-node-version.sh
```

---

## Success Criteria

All these should work:

- ✅ Text is visible on all pages (not white)
- ✅ Login page shows correctly
- ✅ Login with test credentials works
- ✅ Dashboard requires authentication
- ✅ Dashboard shows after login
- ✅ Logout works
- ✅ Cannot access dashboard without login
- ✅ Backend runs on Node 20+
- ✅ No "undefined" in API URLs

---

## Still Having Issues?

1. **Check documentation:**
   - [QUICK_FIX.md](QUICK_FIX.md) - Quick fixes
   - [FIXES_APPLIED.md](FIXES_APPLIED.md) - What was fixed
   - [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md) - Docker issues

2. **Get logs:**
   ```bash
   docker-compose logs > logs.txt
   ```

3. **Open an issue:**
   https://github.com/sanpaa/solid-umbrella/issues

Include:
- What you tested
- What went wrong
- Error messages
- Screenshots if applicable

---

**If all tests pass: 🎉 System is working correctly!**
