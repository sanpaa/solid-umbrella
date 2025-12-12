# 🚨 Quick Fix for Common Docker Issues

## ❌ Error: "This package requires Node.js 20+ to run reliably"

If you see this error when running Docker:

```
npm error ❌ This package requires Node.js 20+ to run reliably.
npm error    You are using Node.js 18.x.x
```

### ✅ Solution (30 seconds)

Run this command:

```bash
./fix-node-version.sh
```

**OR** run these commands manually:

```bash
docker-compose down
docker rmi solid-umbrella-backend:latest
docker-compose build --no-cache backend
docker-compose up -d
```

### Why does this happen?

You're using an **old cached Docker image** that was built with Node.js 18. The Dockerfile is correct (uses Node 20), but Docker is reusing the old image from cache.

The fix forces Docker to rebuild the image from scratch using Node.js 20.

---

## 📚 More Help

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Complete setup guide
- **[DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md)** - All Docker issues
- **[README.md](README.md)** - Project overview

---

## 🆘 Still Not Working?

1. **Check your Node version in the container:**
   ```bash
   docker-compose exec backend node --version
   ```
   Should show: `v20.x.x`

2. **Check container logs:**
   ```bash
   docker-compose logs -f backend
   ```

3. **Nuclear option (removes all data):**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up -d
   ```

4. **Open an issue:**
   https://github.com/sanpaa/solid-umbrella/issues
