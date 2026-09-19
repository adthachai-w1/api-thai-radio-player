# กู่แก้วเรดิโอ — Redesign (React + Vite)

## รันโปรเจกต์
```bash
npm install
npm run dev
```

## Build สำหรับ production
```bash
npm run build
```
ไฟล์ output จะอยู่ที่ `dist/`

## Deploy บน Vercel
1. Push โฟลเดอร์นี้ขึ้น GitHub repo
2. ไปที่ vercel.com → New Project → Import repo นี้
3. Vercel จะตรวจพบ Vite framework อัตโนมัติ (Build command: `npm run build`, Output dir: `dist`)
4. กด Deploy

หรือใช้ Vercel CLI:
```bash
npm i -g vercel
vercel
```
