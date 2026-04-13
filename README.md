# 🏥 Ruh Sağlığı Acil Servisi — Triyaj ve Kapasite Planlama DSS

Bu proje, yüksek yoğunluklu psikiyatri acil servislerinde hasta akışını, triyaj süreçlerini ve kaynak yönetimini optimize etmek amacıyla geliştirilmiş bir **Karar Destek Sistemi (DSS)** ve **Kesikli Olay Simülasyonu (Discrete-Event Simulation)** uygulamasıdır.

## 📌 Projenin Amacı

Ruh sağlığı acil servisleri, kriz düzeylerine göre hızlı ve hassas müdahale gerektiren dinamik ortamlardır. Bu simülasyon aracı, hastane yöneticilerine şu gibi kritik senaryoları test etme imkanı sunar:

- "1 yerine 2 psikiyatrist olsaydı bekleme süreleri ne kadar kısalırdı?"
- "Hasta geliş hızı %20 artarsa kaç kişi hizmet alamadan ayrılır (Reneging)?"

## 🚀 Temel Özellikler

- **Hiyerarşik Triyaj:** Hastalar P1 (Akut), P2 (Orta) ve P3 (Hafif) olarak sınıflandırılır. Akut vakalar kuyrukta otomatik olarak en öne alınır.
- **Akıllı Kaynak Atama:** Kriz seviyesine göre müsait olan uzman doktor veya psikolog ataması gerçek zamanlı yapılır.
- **Vazgeçme (Reneging) Analizi:** Bekleme toleransını aşan hastaların sistemi terk etme oranları matematiksel olarak izlenir.
- **Gerçek Zamanlı Dashboard:** Simülasyon çıktıları (bekleme süreleri, kuyruk uzunluğu, doktor doluluk oranları) anlık grafiklerle görselleştirilir.

## 💻 Kullanılan Teknolojiler

**Backend (Simülasyon ve API Katmanı):**

- **Python:** Temel mantık ve veri katmanı
- **SimPy:** Kesikli olay simülasyon motoru
- **FastAPI:** Yüksek performanslı REST API altyapısı
- **NumPy:** İstatistiksel ve matematiksel hesaplamalar

**Frontend (Kullanıcı Arayüzü):**

- **Next.js & React:** Bileşen tabanlı, hızlı kullanıcı arayüzü
- **Tailwind CSS:** Modern ve duyarlı (responsive) tasarım
- **Recharts:** Simülasyon verilerinin anlık grafik görselleştirmesi
- **Axios:** Backend ile API iletişimi

---

## 🛠️ Kurulum ve Çalıştırma Rehberi

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.
-
### 1. Repoyu Klonlayın

```bash
git clone [https://github.com/YusufGK41/psikiyatri-sim.git](https://github.com/YusufGK41/psikiyatri-sim.git)
cd psikiyatri-sim




Backend Sunucusunu Başlatın
Yeni bir terminal açın ve sırasıyla şu komutları girin:

cd backend
python -m venv venv
# Sanal ortamı aktif edin (Windows için):
venv\Scripts\activate
# (Mac/Linux için): source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload


Frontend Arayüzünü Başlatın
Yeni bir terminal daha açın ve şu komutları girin:


cd frontend
npm install
npm run dev
```

👥 Geliştirici Ekibi
Bu proje takım çalışmasıyla aşağıdaki görev dağılımına göre geliştirilmektedir:

Yusuf Gürkan: Proje Lideri & Sistem Entegrasyonu

Ömer Faruk Yalçınkaya: Backend Geliştirme & SimPy Mantığı

Kaan Gerçek: Frontend Geliştirme & Veri Görselleştirme
