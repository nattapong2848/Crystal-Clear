# Crystal Clear Back Office Lite

เวอร์ชั่นนี้ทำให้ใช้ง่ายที่สุด: มีแค่หน้าเดียวสำหรับ

- ดู Dashboard
- เพิ่มลูกค้า / เพิ่มเคส
- เปลี่ยนสถานะ
- บันทึกรายได้
- บันทึกต้นทุน
- ใส่ลิงก์รูปพิมพ์ปูน / รีเทนเนอร์ / รีวิว
- อัปขึ้น GitHub Pages ได้เลย

## วิธีอัปขึ้น GitHub Pages

1. สร้าง Repository ใหม่ใน GitHub
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้
3. ไปที่ Settings > Pages
4. Source เลือก Deploy from a branch
5. Branch เลือก main / root
6. รอ GitHub สร้างลิงก์เว็บ

## วิธีต่อ Google Sheet

1. เปิด Google Sheet ที่ต้องการใช้เก็บข้อมูล
2. ไปที่ Extensions > Apps Script
3. สร้างไฟล์ `Code.gs`
4. วางโค้ดจาก `apps-script/Code.gs`
5. กด Deploy > New deployment > Web app
6. Execute as: Me
7. Who has access: Anyone
8. Copy Web App URL
9. เปิดเว็บ Crystal Clear > ตั้งค่า > วาง URL > บันทึก

ถ้ายังไม่ต่อ Google Sheet เว็บจะเก็บข้อมูลในเครื่องด้วย LocalStorage ก่อน
