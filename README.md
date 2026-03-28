# line-cli

CLI สำหรับส่ง LINE Push Message จาก terminal

## ติดตั้ง
```bash
npm install
```

## ตั้งค่า `.env`
คัดลอกไฟล์ตัวอย่างแล้วใส่ค่า token/secret:

```bash
cp .env.example .env
```

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `USER_ID` (ค่าเริ่มต้นเป็น `U9c8980e7533bb6b46fb3e3c7b6d48b46`)

## ใช้งานแบบ CLI
### แบบไม่ติดตั้ง global
```bash
npm run line:send -- "สวัสดีครับ"
```

### แบบใช้คำสั่ง `line-cli` ตรงๆ ใน terminal
ติดตั้งลิงก์คำสั่งก่อน 1 ครั้ง:
```bash
npm link
```

จากนั้นใช้งานได้เลย:
```bash
line-cli "สวัสดีครับ"
```