# -*- coding: utf-8 -*-
"""
Psikiyatri Acil Servisi Karar Destek Sistemi - Akademik Rapor Oluşturucu
fpdf2 ile profesyonel PDF rapor üretir.
"""

import os
from fpdf import FPDF

FONT_DIR = r"C:\Windows\Fonts"
IMG_DIR = os.path.join(os.path.dirname(__file__), "report_images")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "Psikiyatri_Acil_Servisi_Rapor.pdf")


class AkademikRapor(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=25)
        self._register_fonts()
        self.chapter_num = 0

    def _register_fonts(self):
        self.add_font("TNR", "", os.path.join(FONT_DIR, "times.ttf"))
        self.add_font("TNR", "B", os.path.join(FONT_DIR, "timesbd.ttf"))
        self.add_font("TNR", "I", os.path.join(FONT_DIR, "timesi.ttf"))
        self.add_font("TNR", "BI", os.path.join(FONT_DIR, "timesbi.ttf"))
        self.add_font("Cal", "", os.path.join(FONT_DIR, "calibri.ttf"))
        self.add_font("Cal", "B", os.path.join(FONT_DIR, "calibrib.ttf"))

    def header(self):
        if self.page_no() <= 1:
            return
        self.set_font("TNR", "I", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, "Psikiyatri Acil Servisi Karar Destek Sistemi", align="L")
        self.cell(0, 8, f"Sayfa {self.page_no()}", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(200, 200, 200)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)
        self.set_text_color(0, 0, 0)

    def footer(self):
        pass

    # ── Helper methods ──

    def _body_font(self, size=12):
        self.set_font("TNR", "", size)
        self.set_text_color(30, 30, 30)

    def _bold_font(self, size=12):
        self.set_font("TNR", "B", size)
        self.set_text_color(30, 30, 30)

    def _italic_font(self, size=12):
        self.set_font("TNR", "I", size)
        self.set_text_color(30, 30, 30)

    def _section_title(self, title):
        self.chapter_num += 1
        if self.get_y() > 230:
            self.add_page()
        self.ln(6)
        self.set_font("TNR", "B", 16)
        self.set_text_color(25, 55, 109)
        self.cell(0, 12, f"{self.chapter_num}. {title}", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(25, 55, 109)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(6)
        self.set_text_color(30, 30, 30)

    def _subsection_title(self, title):
        if self.get_y() > 245:
            self.add_page()
        self.ln(4)
        self.set_font("TNR", "B", 13)
        self.set_text_color(50, 80, 140)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        self.set_text_color(30, 30, 30)

    def _paragraph(self, text, indent=True):
        self._body_font(11)
        first_line_indent = "     " if indent else ""
        self.multi_cell(0, 6.5, first_line_indent + text)
        self.ln(3)

    def _bullet(self, text):
        self._body_font(11)
        x = self.get_x()
        self.cell(8, 6.5, "\u2022")
        self.multi_cell(0, 6.5, text)
        self.ln(1)

    def _add_image_centered(self, img_name, caption="", width=160):
        img_path = os.path.join(IMG_DIR, img_name)
        if not os.path.exists(img_path):
            self._italic_font(10)
            self.cell(0, 8, f"[Görsel bulunamadı: {img_name}]", align="C", new_x="LMARGIN", new_y="NEXT")
            return
        if self.get_y() > 180:
            self.add_page()
        x = (self.w - width) / 2
        self.image(img_path, x=x, w=width)
        if caption:
            self.ln(2)
            self._italic_font(9)
            self.set_text_color(80, 80, 80)
            self.cell(0, 6, caption, align="C", new_x="LMARGIN", new_y="NEXT")
            self.set_text_color(30, 30, 30)
        self.ln(4)

    def _table(self, headers, rows, col_widths=None):
        if self.get_y() > 220:
            self.add_page()
        usable_w = self.w - self.l_margin - self.r_margin
        if col_widths is None:
            col_widths = [usable_w / len(headers)] * len(headers)
        else:
            total = sum(col_widths)
            col_widths = [w / total * usable_w for w in col_widths]

        self.set_font("TNR", "B", 10)
        self.set_fill_color(25, 55, 109)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 9, h, border=1, fill=True, align="C")
        self.ln()

        self.set_font("TNR", "", 10)
        self.set_text_color(30, 30, 30)
        fill = False
        for row in rows:
            if self.get_y() > 265:
                self.add_page()
                self.set_font("TNR", "B", 10)
                self.set_fill_color(25, 55, 109)
                self.set_text_color(255, 255, 255)
                for i, h in enumerate(headers):
                    self.cell(col_widths[i], 9, h, border=1, fill=True, align="C")
                self.ln()
                self.set_font("TNR", "", 10)
                self.set_text_color(30, 30, 30)
                fill = False

            if fill:
                self.set_fill_color(240, 244, 250)
            else:
                self.set_fill_color(255, 255, 255)
            max_h = 9
            for i, cell in enumerate(row):
                self.cell(col_widths[i], max_h, str(cell), border=1, fill=True, align="C")
            self.ln()
            fill = not fill
        self.ln(4)


def build_report():
    pdf = AkademikRapor()
    pdf.set_margin(25)

    # ══════════════════════════════════════════════════
    # KAPAK SAYFASI
    # ══════════════════════════════════════════════════
    pdf.add_page()

    pdf.ln(30)
    pdf.set_font("TNR", "B", 14)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 10, "T.C.", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("TNR", "B", 18)
    pdf.cell(0, 12, "MERSİN ÜNİVERSİTESİ", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("TNR", "", 14)
    pdf.cell(0, 10, "Bilişim Sistemleri ve Teknolojileri Bölümü", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(15)
    pdf.set_draw_color(25, 55, 109)
    pdf.set_line_width(0.6)
    pdf.line(50, pdf.get_y(), pdf.w - 50, pdf.get_y())
    pdf.ln(15)

    pdf.set_font("TNR", "B", 22)
    pdf.set_text_color(25, 55, 109)
    pdf.cell(0, 14, "PSİKİYATRİ ACİL SERVİSİ", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 14, "KARAR DESTEK SİSTEMİ", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    pdf.set_font("TNR", "I", 16)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 10, "Triyaj ve Kapasite Planlama Simülasyonu", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(10)
    pdf.set_draw_color(25, 55, 109)
    pdf.line(50, pdf.get_y(), pdf.w - 50, pdf.get_y())
    pdf.ln(20)

    info_data = [
        ["Proje Türü", "Karar Destek Sistemi ve Kesikli Olay Simülasyonu"],
        ["Konu", "Psikiyatri acil servislerinde hasta akışı, triyaj ve kaynak planlama"],
        ["Teknoloji", "Python, SimPy, FastAPI, Next.js, React, Tailwind CSS, Recharts"],
        ["Ekip", "Kaan Gerçek  |  Yusuf Gürkan  |  Ömer Faruk Yalçınkaya"],
    ]

    col1_w = 45
    col2_w = pdf.w - pdf.l_margin - pdf.r_margin - col1_w
    pdf.set_font("TNR", "B", 11)
    for label, value in info_data:
        pdf.set_fill_color(240, 244, 250)
        pdf.set_font("TNR", "B", 11)
        pdf.cell(col1_w, 10, label, border=1, fill=True)
        pdf.set_font("TNR", "", 11)
        pdf.set_fill_color(255, 255, 255)
        pdf.cell(col2_w, 10, value, border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(15)
    pdf.set_font("TNR", "", 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, "Mayıs 2025", align="C", new_x="LMARGIN", new_y="NEXT")

    # ══════════════════════════════════════════════════
    # ÖZET
    # ══════════════════════════════════════════════════
    pdf.add_page()
    pdf.set_font("TNR", "B", 18)
    pdf.set_text_color(25, 55, 109)
    pdf.cell(0, 14, "Özet", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    pdf._paragraph(
        "Bu çalışma, psikiyatri acil servislerinde hasta yoğunluğu, triyaj önceliği ve personel "
        "kapasitesi arasındaki ilişkiyi inceleyen web tabanlı bir karar destek sistemi sunmaktadır. "
        "Geliştirilen sistem, kesikli olay simülasyonu (DES) yöntemiyle hastaların P1 (akut kriz), "
        "P2 (orta kriz) ve P3 (hafif durum) öncelik seviyelerine ayrılmasını, kaynakların bu "
        "önceliklere göre dinamik atanmasını ve farklı kapasite senaryolarının bekleme süresi ile "
        "hizmet alamadan ayrılma oranı üzerindeki etkisini simüle etmektedir."
    )

    pdf._paragraph(
        "Sistem; Monte Carlo tekrarlı analiz, tek ve çok değişkenli duyarlılık analizi, brute-force "
        "kadro optimizasyonu, warm-up (geçiş dönemi) desteği, varsayım doğrulama tablosu ve otomatik "
        "bulgular bölümü gibi ileri düzey akademik analiz yöntemlerini içermektedir. Ayrıca beş hazır "
        "senaryo, karanlık mod, etkileşimli grafikler, olay zaman çizelgesi ve çok sekmeli PDF rapor "
        "dışa aktarma gibi profesyonel özelliklerle donatılmıştır."
    )

    pdf._paragraph(
        "Böylece hastane yöneticilerinin gerçek sistem üzerinde risk almadan alternatif personel ve "
        "hasta geliş senaryolarını değerlendirebilmesi, darboğaz noktalarını tespit edebilmesi ve "
        "maliyet-etkinlik dengesini sayısal olarak analiz edebilmesi amaçlanmıştır."
    )

    pdf.ln(2)
    pdf._bold_font(11)
    pdf.cell(0, 7, "Anahtar Kelimeler:", new_x="LMARGIN", new_y="NEXT")
    pdf._italic_font(11)
    pdf.multi_cell(0, 6.5,
        "Kesikli olay simülasyonu, triyaj, karar destek sistemi, kapasite planlama, Monte Carlo analizi, "
        "duyarlılık analizi, optimizasyon, SimPy, FastAPI, Next.js, React."
    )

    # ══════════════════════════════════════════════════
    # BÖLÜM 1 — PROJENİN AMACI VE KAPSAMI
    # ══════════════════════════════════════════════════
    pdf.add_page()
    pdf._section_title("Projenin Amacı ve Kapsamı")

    pdf._paragraph(
        "Psikiyatri acil servisleri; hasta geliş hızının değişken olduğu, kriz düzeylerinin "
        "farklılaştığı ve kaynakların sınırlı kullanıldığı kritik sağlık ortamlarıdır. Bu proje, "
        "söz konusu ortamda hasta akışını dijital olarak modelleyerek yöneticilere sayısal karar "
        "desteği sağlamayı hedeflemektedir. Geliştirilen sistem, gerçek bir psikiyatri acil "
        "servisinin işleyişini bilgisayar ortamında simüle ederek farklı senaryoların sonuçlarını "
        "risk almadan değerlendirme imkânı sunmaktadır."
    )

    pdf._subsection_title("Projenin Hedefleri")
    pdf._bullet("Hasta geliş hızına göre sistem yoğunluğunu analiz etmek.")
    pdf._bullet("Triyaj önceliğine bağlı bekleme sürelerini karşılaştırmak.")
    pdf._bullet("Psikiyatrist, psikolog ve triyaj hemşiresi kapasitesinin sonuçlara etkisini göstermek.")
    pdf._bullet("Hizmet alamadan ayrılan hasta sayısını senaryolar üzerinden değerlendirmek.")
    pdf._bullet("Monte Carlo analizi ile istatistiksel güvenilirlik sağlamak.")
    pdf._bullet("Duyarlılık analizi ile kritik parametreleri belirlemek.")
    pdf._bullet("Kadro optimizasyonu ile maliyet-etkinlik dengesini bulmak.")
    pdf._bullet("Warm-up (geçiş) dönemi ile kararlı durum istatistikleri elde etmek.")

    # ══════════════════════════════════════════════════
    # BÖLÜM 2 — YÖNTEM VE SİSTEM MODELİ
    # ══════════════════════════════════════════════════
    pdf._section_title("Yöntem ve Sistem Modeli")

    pdf._paragraph(
        "Model, kesikli olay simülasyonu (Discrete-Event Simulation, DES) yaklaşımıyla "
        "tasarlanmıştır. Bu yaklaşımda hastaların sisteme gelişi, triyaj kuyruğuna alınması, "
        "uygun kaynağa yönlendirilmesi, beklemesi, hizmet alması veya bekleme eşiğini aşması "
        "halinde sistemden ayrılması olaylar dizisi şeklinde yürütülür. SimPy kütüphanesi ile "
        "Python ortamında gerçekleştirilen simülasyon, üstel dağılıma dayalı hasta geliş süreleri "
        "ve uniform dağılıma dayalı tedavi süreleri kullanmaktadır."
    )

    pdf._subsection_title("Hasta Öncelik Düzeyleri")
    pdf._table(
        ["Öncelik", "Tanım", "Kaynak Ataması", "Bekleme Toleransı"],
        [
            ["P1 - Akut Kriz", "En yüksek öncelik", "Psikiyatrist + Gözlem yatağı", "45 dk"],
            ["P2 - Orta Kriz", "Dinamik yönlendirme", "Psikiyatrist veya Psikolog", "30 dk"],
            ["P3 - Hafif Durum", "Düşük öncelik", "Psikolog", "20 dk"],
        ],
        col_widths=[20, 25, 35, 20]
    )

    pdf._subsection_title("Modelde Kullanılan Mekanizmalar")
    pdf._bullet("PriorityResource yapısı ile acil hastalar kuyrukta öncelik kazanır.")
    pdf._bullet("AND/OR kaynak talepleri ile bir hastanın aynı anda birden fazla kaynağa veya ilk boş kaynağa yönlenmesi sağlanır.")
    pdf._bullet("Reneging mekanizması ile bekleme toleransını aşan hastaların sistemi terk etmesi modellenir.")
    pdf._bullet("Üstel dağılım (Exponential) ile rastgele hasta gelişi sağlanır.")
    pdf._bullet("Warm-up dönemi ile simülasyonun geçiş fazı istatistiklerden çıkarılır.")
    pdf._bullet("Seed parametresi ile tekrarlanabilir sonuçlar elde edilir.")

    pdf._subsection_title("Hasta Akış Süreci")
    pdf._paragraph(
        "Simülasyondaki hasta akış süreci şu adımlardan oluşmaktadır: (1) Hasta sisteme üstel "
        "dağılıma göre rastgele aralıklarla gelir. (2) Hasta triyaj kuyruğuna alınır ve ilk "
        "müsait triyaj hemşiresi tarafından değerlendirilir (3-8 dk). (3) Triyaj sonucunda "
        "hastaya P1, P2 veya P3 öncelik düzeyi atanır. (4) P1 hastası psikiyatrist ve gözlem "
        "yatağını aynı anda talep eder. P2 hastası psikiyatrist veya psikoloğun ilk müsait "
        "olanına yönlendirilir. P3 hastası psikolog kaynağını bekler. (5) Bekleme toleransı "
        "aşılırsa hasta sistemden ayrılır (reneging). (6) Tedavi tamamlanınca hasta taburcu edilir."
    )

    pdf._subsection_title("Monte Carlo Analizi")
    pdf._paragraph(
        "Aynı parametre setiyle birden fazla bağımsız simülasyon çalıştırılarak sonuçların "
        "istatistiksel güvenilirliği artırılır. Her tekrarda farklı rastgele sayı tohumu "
        "kullanılır. Sonuçlar üzerinden ortalama, standart sapma ve %95 güven aralığı "
        "hesaplanır. Bu yöntem, tek bir simülasyon çalıştırmasının rastgele varyasyonundan "
        "kaynaklanan belirsizliği azaltmak için tercih edilmiştir."
    )

    pdf._subsection_title("Kadro Optimizasyonu")
    pdf._paragraph(
        "Tüm olası kaynak kombinasyonları sistematik olarak taranarak (brute-force) belirlenen "
        "hedef ayrılma oranını karşılayan en düşük maliyetli kadro yapısı bulunur. Her "
        "kombinasyon için birden fazla simülasyon çalıştırılarak ortalaması alınır. Sonuçlar "
        "maliyet ve ayrılma oranına göre sıralanarak yöneticiye alternatifler sunulur."
    )

    pdf._subsection_title("Duyarlılık Analizi")
    pdf._paragraph(
        "Tek değişkenli analizde seçilen parametre belirli bir aralıkta değiştirilirken diğer "
        "parametreler sabit tutulur. Çok değişkenli (2D heatmap) analizde ise iki parametre aynı "
        "anda değiştirilerek etkileşim etkileri görselleştirilir. Bu yöntemler, sistemin hangi "
        "parametrelere daha duyarlı olduğunu ve darboğaz noktalarını tespit etmek için kullanılır."
    )

    pdf._subsection_title("Warm-up (Geçiş Dönemi) Mekanizması")
    pdf._paragraph(
        "Simülasyonun ilk dakikaları, sistemin boş durumdan dolu duruma geçtiği geçici bir dönemdir. "
        "Bu döneme ait veriler, kararlı durum istatistiklerini bozabilir. Warm-up parametresi ile "
        "kullanıcının belirlediği süre boyunca toplanan istatistikler raporlamadan çıkarılır; "
        "yalnızca kararlı durumdaki performans metrikleri değerlendirmeye alınır. Akademik DES "
        "projelerinde bu yaklaşım standart bir uygulamadır."
    )

    # ══════════════════════════════════════════════════
    # BÖLÜM 3 — TEKNOLOJİK MİMARİ
    # ══════════════════════════════════════════════════
    pdf._section_title("Teknolojik Mimari")

    pdf._paragraph(
        "Sistem, modern web teknolojileri kullanılarak istemci-sunucu mimarisinde geliştirilmiştir. "
        "Backend tarafında Python ekosistemi ile simülasyon mantığı ve REST API servisi "
        "sağlanırken, frontend tarafında React tabanlı etkileşimli bir kullanıcı arayüzü "
        "sunulmaktadır."
    )

    pdf._table(
        ["Katman", "Teknoloji", "Görev"],
        [
            ["Backend", "Python 3.12", "Ana programlama dili"],
            ["Backend", "SimPy", "Kesikli olay simülasyon motoru"],
            ["Backend", "FastAPI", "REST API servisi (OpenAPI/Swagger)"],
            ["Backend", "NumPy", "Sayısal hesaplamalar ve istatistik"],
            ["Backend", "Pydantic", "Veri doğrulama ve tip güvenliği"],
            ["Frontend", "Next.js & React", "Etkileşimli kullanıcı arayüzü"],
            ["Frontend", "Tailwind CSS", "Modern ve responsive tasarım"],
            ["Frontend", "Recharts", "Grafik ve veri görselleştirme"],
            ["Frontend", "Axios", "API iletişimi"],
            ["Frontend", "html2canvas + jsPDF", "PDF rapor dışa aktarma"],
        ],
        col_widths=[20, 30, 50]
    )

    pdf._subsection_title("API Uç Noktaları (Endpoints)")
    pdf._table(
        ["Endpoint", "Yöntem", "Açıklama"],
        [
            ["/api/simule-et", "POST", "Tekli simülasyon çalıştırma"],
            ["/api/simule-et-detayli", "POST", "Detaylı olay logu ile simülasyon"],
            ["/api/monte-carlo", "POST", "Monte Carlo tekrarlı analiz"],
            ["/api/optimizasyon", "POST", "Kadro optimizasyonu (brute-force)"],
            ["/api/duyarlilik", "POST", "Tek değişkenli duyarlılık analizi"],
            ["/api/heatmap", "POST", "2D çok değişkenli duyarlılık"],
        ],
        col_widths=[30, 15, 55]
    )

    # ══════════════════════════════════════════════════
    # BÖLÜM 4 — ARAYÜZ, SENARYOLAR VE BULGULAR
    # ══════════════════════════════════════════════════
    pdf.add_page()
    pdf._section_title("Arayüz, Senaryolar ve Bulgular")

    pdf._paragraph(
        "Arayüzde kullanıcı; hasta geliş aralığı, triyaj hemşiresi, psikiyatrist, psikolog sayısı, "
        "gözlem yatağı kapasitesi ve warm-up süresini değiştirerek simülasyonu başlatabilir. "
        "Çıktılar; toplam hasta sayısı, hizmet alamadan ayrılan hasta sayısı, genel ortalama "
        "bekleme süresi, önceliğe göre bekleme grafiği, kaynak kullanım oranları ve saatlik "
        "hasta dağılımı olarak sunulur."
    )

    pdf._subsection_title("Kullanıcı Arayüzü Özellikleri")
    pdf._bullet("Dört sekmeli yapı: Dashboard, Analiz, Optimizasyon, Metodoloji")
    pdf._bullet("Sol panel: Parametre kontrolleri, hazır senaryolar ve simülasyon başlatma")
    pdf._bullet("KPI kartları: Animasyonlu sayısal göstergeler")
    pdf._bullet("Etkileşimli grafikler: Tam ekran görüntüleme desteği")
    pdf._bullet("Simülasyon yorumları: Kural tabanlı otomatik değerlendirme")
    pdf._bullet("Olay zaman çizelgesi: Hasta bazlı kronolojik olay takibi")
    pdf._bullet("Karanlık mod: Göz yorgunluğunu azaltan alternatif tema")
    pdf._bullet("Başlangıç rehberi (onboarding): İlk kullanım kılavuzu")
    pdf._bullet("Senaryo karşılaştırma: Birden fazla çalıştırma sonucunu tablo ile kıyaslama")
    pdf._bullet("PDF rapor dışa aktarma: Tüm sekmeleri kapsayan çok sayfalı rapor")

    pdf._add_image_centered("image2.png",
        "Şekil 1. Simülasyon dashboard ekranı — KPI kartları ve parametre paneli.")

    pdf._subsection_title("Hazır Senaryolar")
    pdf._paragraph(
        "Kullanıcıların hızla farklı durumları test edebilmesi için beş hazır senaryo "
        "tanımlanmıştır. Her senaryo, tüm parametreleri otomatik olarak yükler:"
    )
    pdf._table(
        ["Senaryo", "Hasta Geliş", "Hemşire", "Psikiyatrist", "Psikolog", "Yatak", "Warm-up"],
        [
            ["Normal Mesai", "4 dk", "2", "1", "2", "4", "0 dk"],
            ["Yoğun Acil", "2 dk", "3", "2", "3", "6", "60 dk"],
            ["İdeal Kadro", "4 dk", "3", "2", "3", "6", "0 dk"],
            ["Gece Nöbeti", "8 dk", "1", "1", "1", "3", "0 dk"],
            ["Kriz Senaryosu", "1.5 dk", "4", "3", "4", "8", "120 dk"],
        ],
        col_widths=[22, 15, 13, 15, 13, 10, 12]
    )

    pdf._add_image_centered("image3.png",
        "Şekil 2. Dengeli kapasite senaryosunda bekleme süreleri ve kaynak kullanım oranları.")

    pdf._subsection_title("Bulgular ve Değerlendirme")
    pdf._paragraph(
        "Karşılaştırmalı sonuçlar, sistemdeki en kritik darboğazın psikiyatrist ve triyaj kapasitesi "
        "olduğunu göstermektedir. Hasta geliş aralığı kısaldıkça düşük öncelikli hasta gruplarında "
        "(P3) bekleme süresi daha hızlı yükselmekte, kaynak artırımı ise özellikle hizmet alamadan "
        "ayrılma oranını azaltmaktadır. P1 hastalarının öncelikli kaynak ataması sayesinde bekleme "
        "süresi genellikle düşük kalmakta; ancak sistem kapasitesinin aşırı zorlandığı durumlarda "
        "P1 hastaları da etkilenmektedir."
    )

    pdf._paragraph(
        "Kaynak kullanım oranları incelendiğinde; psikiyatrist kaynağının çoğu senaryoda %80 "
        "üzerinde kullanıldığı, psikolog kaynağının orta düzeyde yüklendiği ve gözlem yataklarının "
        "yalnızca P1 hastalarına ayrılması nedeniyle düşük yoğunluklu senaryolarda atıl kaldığı "
        "gözlemlenmektedir."
    )

    pdf._add_image_centered("image4.png",
        "Şekil 3. Kaynak kapasitesi azaldığında genel bekleme süresi belirgin biçimde artmaktadır.")

    # ══════════════════════════════════════════════════
    # BÖLÜM 5 — İLERİ ANALİZ VE YOĞUNLUK DEĞERLENDİRMESİ
    # ══════════════════════════════════════════════════
    pdf._section_title("İleri Analiz Yöntemleri ve Yoğunluk Değerlendirmesi")

    pdf._subsection_title("Monte Carlo Tekrarlı Analiz")
    pdf._paragraph(
        "Monte Carlo analizi, aynı parametre setiyle birden fazla bağımsız simülasyon çalıştırarak "
        "sonuçların istatistiksel güvenilirliğini test eder. Sistemde 10 ile 100 arasında tekrar "
        "yapılabilmektedir. Her tekrarın sonucunda ortalama bekleme süresi, ayrılma oranı ve "
        "toplam hasta sayısı kaydedilir. Bu veriler üzerinden %95 güven aralığı hesaplanarak "
        "sonuçların ne kadar kararlı olduğu değerlendirilir. Histogram grafikleri ile dağılım "
        "görselleştirilir."
    )

    pdf._subsection_title("Duyarlılık Analizi ve Heatmap")
    pdf._paragraph(
        "Tek değişkenli duyarlılık analizinde seçilen bir parametre (örneğin psikiyatrist sayısı) "
        "belirli bir aralıkta sistematik olarak değiştirilirken diğer parametreler sabit tutulur. "
        "Her adımda üç bağımsız simülasyon ortalaması alınır. Sonuçlar çizgi grafiklerle "
        "gösterilir. Çok değişkenli analizde ise iki parametre aynı anda değiştirilerek "
        "etkileşim etkileri renk kodlu heatmap tablosuyla görselleştirilir. Bu sayede hangi "
        "kaynak kombinasyonlarının en etkili olduğu görsel olarak tespit edilebilir."
    )

    pdf._subsection_title("Kadro Optimizasyonu")
    pdf._paragraph(
        "Optimizasyon modülü, belirli bir hedef ayrılma oranını karşılayan en düşük maliyetli "
        "kadro yapısını bulmak için tüm olası kombinasyonları sistematik olarak tarar. Her "
        "kaynak türü (hemşire, psikiyatrist, psikolog, yatak) için maksimum değerler "
        "belirlenir ve her kombinasyon üç bağımsız simülasyonla test edilir. Sonuçlar, "
        "günlük maliyet ve ayrılma oranına göre sıralanarak en iyi yapılandırma ve "
        "alternatifler sunulur."
    )

    pdf._subsection_title("Yoğunluk Senaryosu Değerlendirmesi")
    pdf._paragraph(
        "Yüksek yoğunluk senaryosunda (hasta geliş aralığı 1.5-2 dakika) toplam gelen hasta "
        "sayısı belirgin biçimde artmış, sistemden hizmet alamadan ayrılan hasta sayısı "
        "yükselmiş ve genel ortalama bekleme süresi ciddi biçimde artmıştır. Bu sonuç, "
        "simülasyonun yalnızca mevcut durumu göstermediğini; aynı zamanda kapasite "
        "yetersizliğini erken tespit eden bir karar destek aracı olarak kullanılabileceğini "
        "göstermektedir."
    )

    pdf._add_image_centered("image5.png",
        "Şekil 4. Yüksek yoğunluk senaryosunda bekleme süresi ve ayrılan hasta sayısı artmaktadır.")

    pdf._subsection_title("Varsayım Doğrulama")
    pdf._paragraph(
        "Modelin gerçekçiliğini değerlendirmek amacıyla, kullanılan parametreler literatür "
        "verileriyle karşılaştırılmıştır. Aşağıdaki tabloda temel varsayımların doğrulama "
        "durumu özetlenmektedir:"
    )

    pdf._table(
        ["Parametre", "Model Değeri", "Literatür", "Durum"],
        [
            ["Hasta Geliş Dağılımı", "Üstel (ort. 4 dk)", "Üstel dağılım", "Uyumlu"],
            ["P1 Hasta Oranı", "~%16.7", "%15–20", "Uyumlu"],
            ["P2 Hasta Oranı", "~%33.3", "%30–40", "Uyumlu"],
            ["P3 Hasta Oranı", "~%50.0", "%40–50", "Kısmi Uyum"],
            ["Triaj Süresi", "3–8 dk", "5–10 dk", "Uyumlu"],
            ["P1 Tedavi Süresi", "30–90 dk", "30–120 dk", "Uyumlu"],
            ["Reneging Mekanizması", "Mevcut", "Literatürde önerilen", "Uyumlu"],
        ],
        col_widths=[28, 22, 22, 18]
    )

    # ══════════════════════════════════════════════════
    # SONUÇ
    # ══════════════════════════════════════════════════
    pdf.add_page()
    pdf.ln(4)
    pdf.set_font("TNR", "B", 18)
    pdf.set_text_color(25, 55, 109)
    pdf.cell(0, 14, "Sonuç", align="L", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(25, 55, 109)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(8)

    pdf._paragraph(
        "Geliştirilen karar destek sistemi, psikiyatri acil servislerinde hasta akışının ve "
        "kapasite kararlarının simülasyon tabanlı olarak değerlendirilmesini sağlamaktadır. "
        "Sistem; triyaj önceliği, kaynak atama, bekleme süresi ve hizmet alamadan ayrılma gibi "
        "kritik göstergeleri aynı arayüzde birleştirerek yönetsel karar alma sürecine sayısal "
        "ve görsel destek sunmaktadır."
    )

    pdf._paragraph(
        "Proje kapsamında gerçekleştirilen Monte Carlo analizi, sonuçların tekrarlanabilir ve "
        "istatistiksel olarak anlamlı olduğunu ortaya koymuştur. Duyarlılık analizi ile "
        "sistemin hangi parametrelere en duyarlı olduğu tespit edilmiş; kadro optimizasyonu "
        "ile belirlenen hedef ayrılma oranını karşılayan en düşük maliyetli personel "
        "yapılandırması belirlenmiştir. Warm-up mekanizması sayesinde geçiş döneminin etkisi "
        "istatistiklerden çıkarılarak kararlı durum performansı daha doğru ölçülmüştür."
    )

    pdf._paragraph(
        "Varsayım doğrulama tablosu, modelde kullanılan parametrelerin büyük ölçüde literatür "
        "verileriyle tutarlı olduğunu göstermektedir. Otomatik bulgular bölümü, her simülasyon "
        "çalıştırmasında sistemin darboğaz noktalarını ve kapasite durumunu akademik dilde "
        "özetleyerek kullanıcıya hızlı değerlendirme imkânı tanımaktadır."
    )

    pdf._paragraph(
        "Sonuç olarak bu sistem, psikiyatri acil servislerinde kaynak planlamasına yönelik "
        "kapsamlı bir karar destek aracı niteliği taşımakta olup, farklı sağlık kurumlarının "
        "kendi koşullarına uyarlanabilecek esnek bir altyapı sunmaktadır."
    )

    # ══════════════════════════════════════════════════
    # KAYNAKÇA
    # ══════════════════════════════════════════════════
    pdf.add_page()
    pdf.set_font("TNR", "B", 18)
    pdf.set_text_color(25, 55, 109)
    pdf.cell(0, 14, "Kaynakça", align="L", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(25, 55, 109)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(8)

    refs = [
        "[1] Banks, J., Carson, J. S., Nelson, B. L., & Nicol, D. M. (2010). Discrete-Event System Simulation. Pearson.",
        "[2] Law, A. M. (2014). Simulation Modeling and Analysis (5th ed.). McGraw-Hill Education.",
        "[3] SimPy Documentation. (2024). SimPy — Discrete Event Simulation for Python. https://simpy.readthedocs.io/",
        "[4] FastAPI Documentation. (2024). FastAPI — Modern Web APIs with Python. https://fastapi.tiangolo.com/",
        "[5] Günal, M. M., & Pidd, M. (2010). Discrete event simulation for performance modelling in health care: a review of the literature. Journal of Simulation, 4(1), 42-51.",
        "[6] Yeh, J. Y., & Lin, W. S. (2007). Using simulation technique and genetic algorithm to improve the quality care of a hospital emergency department. Expert Systems with Applications, 32(4), 1073-1083.",
        "[7] Hoot, N. R., & Aronsky, D. (2008). Systematic review of emergency department crowding: causes, effects, and solutions. Annals of Emergency Medicine, 52(2), 126-136.",
        "[8] Zeinali, F., Mahootchi, M., & Sepehri, M. M. (2015). Resource planning in the emergency departments: A simulation-based metamodeling approach. Simulation Modelling Practice and Theory, 53, 123-138.",
    ]

    pdf._body_font(10)
    for ref in refs:
        pdf.multi_cell(0, 6, ref)
        pdf.ln(3)

    # ── Save ──
    pdf.output(OUTPUT_PATH)
    print(f"Rapor oluşturuldu: {OUTPUT_PATH}")
    return OUTPUT_PATH


if __name__ == "__main__":
    build_report()
