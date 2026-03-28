# LINE Webhook + Push Message

## 1) ติดตั้ง
```bash
npm install
```

## 2) ตั้งค่า ENV
คัดลอกไฟล์ `.env.example` เป็น `.env` แล้วกรอกค่า

```bash
cp .env.example .env
```

- `LINE_CHANNEL_ACCESS_TOKEN` จาก LINE Developers
- `LINE_CHANNEL_SECRET` จาก LINE Developers

## 3) รันเซิร์ฟเวอร์
```bash
npm start
```

เซิร์ฟเวอร์จะรันที่ `http://localhost:3000`

## Endpoint
- `POST /webhook` รับ LINE webhook และ reply กลับอัตโนมัติ
- `POST /push-message` ส่งข้อความแบบ push
- `GET /health` ตรวจสุขภาพระบบ

## ตัวอย่างส่ง push message
```bash
curl -X POST http://localhost:3000/push-message \
  -H "Content-Type: application/json" \
  -d '{"to":"Uxxxxxxxxxxxxxxxx","text":"สวัสดีจาก webhook"}'
```

## ตั้งค่า Webhook URL ใน LINE Developers
ใส่ URL เป็น:
`https://your-domain.com/webhook`

(ถ้าทดสอบ local ให้ใช้ ngrok/cloudflared เปิด public URL ก่อน)
