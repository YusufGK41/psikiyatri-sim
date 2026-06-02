from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import simpy
import random
import numpy as np
from typing import Optional, List
from itertools import product as iter_product
import math

class SimulasyonParametreleri(BaseModel):
    """Tekli simülasyon çalıştırma parametreleri."""
    sim_sure: int = 1440
    hasta_gelis_ort: float = 4.0
    n_triaj_hemsire: int = 2
    n_psikiyatrist: int = 1
    n_psikolog: int = 2
    n_gozlem_yatagi: int = 4
    seed: Optional[int] = None
    warmup: int = 0

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "sim_sure": 1440,
                "hasta_gelis_ort": 4.0,
                "n_triaj_hemsire": 2,
                "n_psikiyatrist": 1,
                "n_psikolog": 2,
                "n_gozlem_yatagi": 4,
            }]
        }
    }

    @field_validator("sim_sure")
    @classmethod
    def sim_sure_pozitif(cls, v):
        if v < 60 or v > 10080:
            raise ValueError("Simülasyon süresi 60-10080 dakika arasında olmalı")
        return v

    @field_validator("hasta_gelis_ort")
    @classmethod
    def hasta_gelis_pozitif(cls, v):
        if v < 0.5 or v > 60:
            raise ValueError("Hasta geliş ortalaması 0.5-60 dakika arasında olmalı")
        return v

    @field_validator("n_triaj_hemsire", "n_psikiyatrist", "n_psikolog", "n_gozlem_yatagi")
    @classmethod
    def kaynak_pozitif(cls, v):
        if v < 1 or v > 20:
            raise ValueError("Kaynak sayısı 1-20 arasında olmalı")
        return v


class MonteCarloParametreleri(BaseModel):
    """Monte Carlo tekrarlı simülasyon parametreleri. n_tekrar kadar bağımsız çalıştırma yapılır."""
    sim_sure: int = 1440
    hasta_gelis_ort: float = 4.0
    n_triaj_hemsire: int = 2
    n_psikiyatrist: int = 1
    n_psikolog: int = 2
    n_gozlem_yatagi: int = 4
    n_tekrar: int = 30

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "sim_sure": 1440,
                "hasta_gelis_ort": 4.0,
                "n_triaj_hemsire": 2,
                "n_psikiyatrist": 1,
                "n_psikolog": 2,
                "n_gozlem_yatagi": 4,
                "n_tekrar": 30,
            }]
        }
    }

    @field_validator("n_tekrar")
    @classmethod
    def tekrar_sinir(cls, v):
        if v < 5 or v > 100:
            raise ValueError("Tekrar sayısı 5-100 arasında olmalı")
        return v


class OptimizasyonParametreleri(BaseModel):
    """Kadro optimizasyonu parametreleri. Tüm kaynak kombinasyonları denenerek maliyet-performans dengesi aranır."""
    sim_sure: int = 1440
    hasta_gelis_ort: float = 4.0
    hedef_ayrilma_orani: float = 5.0
    hemsire_maliyet: float = 250.0
    psikiyatrist_maliyet: float = 800.0
    psikolog_maliyet: float = 400.0
    yatak_maliyet: float = 150.0
    max_hemsire: int = 5
    max_psikiyatrist: int = 4
    max_psikolog: int = 5
    max_yatak: int = 8


class DuyarlilikParametreleri(BaseModel):
    """Tek değişkenli duyarlılık analizi. Bir parametre belirli aralıkta değiştirilerek etki ölçülür."""
    sim_sure: int = 1440
    hasta_gelis_ort: float = 4.0
    n_triaj_hemsire: int = 2
    n_psikiyatrist: int = 1
    n_psikolog: int = 2
    n_gozlem_yatagi: int = 4
    degisken: str = "n_psikiyatrist"
    aralik_min: int = 1
    aralik_max: int = 6
    aralik_adim: int = 1

    @field_validator("degisken")
    @classmethod
    def gecerli_degisken(cls, v):
        gecerli = ["n_triaj_hemsire", "n_psikiyatrist", "n_psikolog", "n_gozlem_yatagi"]
        if v not in gecerli:
            raise ValueError(f"Geçerli değişkenler: {', '.join(gecerli)}")
        return v


class HeatmapParametreleri(BaseModel):
    """2D duyarlılık heatmap parametreleri. İki değişken aynı anda değiştirilerek matris oluşturulur."""
    sim_sure: int = 1440
    hasta_gelis_ort: float = 4.0
    n_triaj_hemsire: int = 2
    n_psikiyatrist: int = 1
    n_psikolog: int = 2
    n_gozlem_yatagi: int = 4
    degisken1: str = "n_psikiyatrist"
    degisken2: str = "n_psikolog"

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "sim_sure": 1440,
                "hasta_gelis_ort": 4.0,
                "n_triaj_hemsire": 2,
                "n_psikiyatrist": 1,
                "n_psikolog": 2,
                "n_gozlem_yatagi": 4,
                "degisken1": "n_psikiyatrist",
                "degisken2": "n_psikolog",
            }]
        }
    }

    @field_validator("degisken1", "degisken2")
    @classmethod
    def gecerli_degisken(cls, v):
        gecerli = ["n_triaj_hemsire", "n_psikiyatrist", "n_psikolog", "n_gozlem_yatagi"]
        if v not in gecerli:
            raise ValueError(f"Geçerli değişkenler: {', '.join(gecerli)}")
        return v


DEGISKEN_ARALIK = {
    "n_triaj_hemsire": (1, 6),
    "n_psikiyatrist": (1, 5),
    "n_psikolog": (1, 6),
    "n_gozlem_yatagi": (1, 8),
}


app = FastAPI(
    title="Psikiyatri Acil Servisi Simülasyon API",
    description="Psikiyatri acil servisi için ayrık olay simülasyonu (DES) tabanlı karar destek sistemi API'si. "
                "SimPy kütüphanesi kullanılarak hasta gelişi, triyaj, tedavi ve taburcu süreçleri modellenmiştir.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TRIAJ_MIN, TRIAJ_MAX = 5, 10
SEANS_SURE = {"P1": (30, 60), "P2": (20, 45), "P3": (15, 30)}
ONCELIK_DAGILIM = ["P1", "P2", "P2", "P3", "P3", "P3"]
RENEGING_ESIGI = {"P1": 15, "P2": 30, "P3": 60}


def simulasyonu_calistir(param: SimulasyonParametreleri, olay_kaydi=False):
    if param.seed is not None:
        random.seed(param.seed)
        np.random.seed(param.seed)

    warmup = param.warmup
    toplam_sure = param.sim_sure + warmup

    env = simpy.Environment()

    metrikler = {
        "bekleme_sureleri": [],
        "ayrilanlar": 0,
        "ayrilanlar_oncelik": {"P1": 0, "P2": 0, "P3": 0},
        "hizmet_alinan": {"P1": 0, "P2": 0, "P3": 0},
        "oncelik_sayilari": {"P1": 0, "P2": 0, "P3": 0},
        "oncelik_bekleme": {"P1": [], "P2": [], "P3": []},
        "triaj_bekleme": [],
        "saatlik_gelis": {},
        "kaynak_kullanim": {
            "triaj_hemsire": [],
            "psikiyatrist": [],
            "psikolog": [],
            "gozlem_yatagi": [],
        },
    }

    olaylar = [] if olay_kaydi else None

    kaynaklar = {
        "triaj_hemsire": simpy.PriorityResource(env, capacity=param.n_triaj_hemsire),
        "psikiyatrist": simpy.PriorityResource(env, capacity=param.n_psikiyatrist),
        "psikolog": simpy.Resource(env, capacity=param.n_psikolog),
        "gozlem_yatagi": simpy.Resource(env, capacity=param.n_gozlem_yatagi),
    }

    def kaynak_izleyici(env, kaynaklar, metrikler, param):
        while True:
            yield env.timeout(10)
            if env.now < warmup:
                continue
            metrikler["kaynak_kullanim"]["triaj_hemsire"].append(
                len(kaynaklar["triaj_hemsire"].users) / param.n_triaj_hemsire
            )
            metrikler["kaynak_kullanim"]["psikiyatrist"].append(
                len(kaynaklar["psikiyatrist"].users) / param.n_psikiyatrist
            )
            metrikler["kaynak_kullanim"]["psikolog"].append(
                len(kaynaklar["psikolog"].users) / param.n_psikolog
            )
            metrikler["kaynak_kullanim"]["gozlem_yatagi"].append(
                len(kaynaklar["gozlem_yatagi"].users) / param.n_gozlem_yatagi
            )

    def log_olay(zaman, hasta_id, oncelik, olay_tipi, detay=""):
        if olaylar is not None and len(olaylar) < 200 and zaman >= warmup:
            olaylar.append({
                "zaman": round(zaman - warmup, 1),
                "hasta_id": hasta_id,
                "oncelik": oncelik,
                "olay": olay_tipi,
                "detay": detay,
            })

    def hasta_sureci(env, hasta_id, kaynaklar, metrikler):
        gelis_zamani = env.now
        oncelik = random.choice(ONCELIK_DAGILIM)
        kayit_aktif = gelis_zamani >= warmup

        if kayit_aktif:
            metrikler["oncelik_sayilari"][oncelik] += 1
            saat = int((gelis_zamani - warmup) // 60) % 24
            saat_str = f"{saat:02d}:00"
            metrikler["saatlik_gelis"][saat_str] = metrikler["saatlik_gelis"].get(saat_str, 0) + 1

        log_olay(env.now, hasta_id, oncelik, "GELIS", "Acile başvurdu")

        oncelik_derecesi = int(oncelik[1])

        with kaynaklar["triaj_hemsire"].request(priority=oncelik_derecesi) as talep:
            sonuc = yield talep | env.timeout(RENEGING_ESIGI[oncelik])
            if talep not in sonuc:
                if kayit_aktif:
                    metrikler["ayrilanlar"] += 1
                    metrikler["ayrilanlar_oncelik"][oncelik] += 1
                log_olay(env.now, hasta_id, oncelik, "AYRILDI", f"Bekleme sınırı aşıldı ({RENEGING_ESIGI[oncelik]} dk)")
                return
            triaj_bekleme = env.now - gelis_zamani
            if kayit_aktif:
                metrikler["triaj_bekleme"].append(triaj_bekleme)
            log_olay(env.now, hasta_id, oncelik, "TRIAJ_BASLADI", f"Bekleme: {triaj_bekleme:.0f} dk")
            yield env.timeout(random.uniform(TRIAJ_MIN, TRIAJ_MAX))

        log_olay(env.now, hasta_id, oncelik, "TRIAJ_BITTI", "Değerlendirme tamamlandı")

        triaj_bitis = env.now
        gerceklesme_suresi = 0

        if oncelik == "P1":
            with kaynaklar["psikiyatrist"].request(priority=1) as p_talep, \
                 kaynaklar["gozlem_yatagi"].request() as y_talep:
                yield p_talep & y_talep
                if kayit_aktif:
                    metrikler["oncelik_bekleme"][oncelik].append(env.now - triaj_bitis)
                gerceklesme_suresi = random.uniform(*SEANS_SURE[oncelik])
                log_olay(env.now, hasta_id, oncelik, "TEDAVI_BASLADI", f"Psikiyatrist + gözlem ({gerceklesme_suresi:.0f} dk)")
                yield env.timeout(gerceklesme_suresi)

        elif oncelik == "P2":
            p_talep = kaynaklar["psikiyatrist"].request(priority=2)
            ps_talep = kaynaklar["psikolog"].request()
            sonuc = yield p_talep | ps_talep

            if p_talep in sonuc:
                ps_talep.cancel()
                if kayit_aktif:
                    metrikler["oncelik_bekleme"][oncelik].append(env.now - triaj_bitis)
                gerceklesme_suresi = random.uniform(*SEANS_SURE[oncelik])
                log_olay(env.now, hasta_id, oncelik, "TEDAVI_BASLADI", f"Psikiyatrist ({gerceklesme_suresi:.0f} dk)")
                yield env.timeout(gerceklesme_suresi)
                kaynaklar["psikiyatrist"].release(p_talep)
            else:
                p_talep.cancel()
                if kayit_aktif:
                    metrikler["oncelik_bekleme"][oncelik].append(env.now - triaj_bitis)
                gerceklesme_suresi = random.uniform(*SEANS_SURE[oncelik])
                log_olay(env.now, hasta_id, oncelik, "TEDAVI_BASLADI", f"Psikolog ({gerceklesme_suresi:.0f} dk)")
                yield env.timeout(gerceklesme_suresi)
                kaynaklar["psikolog"].release(ps_talep)

        else:
            with kaynaklar["psikolog"].request() as talep:
                yield talep
                if kayit_aktif:
                    metrikler["oncelik_bekleme"][oncelik].append(env.now - triaj_bitis)
                gerceklesme_suresi = random.uniform(*SEANS_SURE[oncelik])
                log_olay(env.now, hasta_id, oncelik, "TEDAVI_BASLADI", f"Psikolog ({gerceklesme_suresi:.0f} dk)")
                yield env.timeout(gerceklesme_suresi)

        if kayit_aktif:
            metrikler["hizmet_alinan"][oncelik] += 1
            metrikler["bekleme_sureleri"].append(max(0, env.now - gelis_zamani - gerceklesme_suresi))
        log_olay(env.now, hasta_id, oncelik, "TABURCU", f"Toplam süre: {env.now - gelis_zamani:.0f} dk")

    def hasta_ureteci(env, kaynaklar, metrikler):
        hasta_id = 0
        while True:
            yield env.timeout(random.expovariate(1.0 / param.hasta_gelis_ort))
            hasta_id += 1
            env.process(hasta_sureci(env, hasta_id, kaynaklar, metrikler))

    env.process(hasta_ureteci(env, kaynaklar, metrikler))
    env.process(kaynak_izleyici(env, kaynaklar, metrikler, param))
    env.run(until=toplam_sure)

    if olay_kaydi:
        return metrikler, olaylar
    return metrikler


def guvenli_ortalama(liste):
    return round(float(np.mean(liste)), 2) if liste else 0.0


def guvenli_medyan(liste):
    return round(float(np.median(liste)), 2) if liste else 0.0


def metrik_ozetini_cikar(sonuclar):
    toplam_hasta = sum(sonuclar["oncelik_sayilari"].values())
    return {
        "toplam_hasta": toplam_hasta,
        "ayrilan_hasta": sonuclar["ayrilanlar"],
        "hizmet_alan_hasta": sum(sonuclar["hizmet_alinan"].values()),
        "genel_ort_bekleme": guvenli_ortalama(sonuclar["bekleme_sureleri"]),
        "genel_medyan_bekleme": guvenli_medyan(sonuclar["bekleme_sureleri"]),
        "ort_triaj_bekleme": guvenli_ortalama(sonuclar["triaj_bekleme"]),
        "ayrilma_orani": round(sonuclar["ayrilanlar"] / toplam_hasta * 100, 1) if toplam_hasta > 0 else 0,
    }


# ───────── Endpoint 1: Tekli Simülasyon ─────────

@app.post(
    "/api/simule-et",
    summary="Tekli Simülasyon Çalıştır",
    description="Verilen parametrelerle tek bir ayrık olay simülasyonu çalıştırır. "
                "Sonuçta özet metrikler, öncelik bazlı bekleme süreleri, kaynak kullanım oranları ve saatlik hasta dağılımı döndürülür.",
    response_description="Simülasyon özeti, hasta dağılımı, bekleme süreleri ve kaynak kullanım oranları",
)
def simule_et(parametreler: SimulasyonParametreleri):
    try:
        sonuclar = simulasyonu_calistir(parametreler)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simülasyon hatası: {str(e)}")

    toplam_hasta = sum(sonuclar["oncelik_sayilari"].values())

    saatlik = []
    for saat in range(24):
        saat_str = f"{saat:02d}:00"
        saatlik.append({
            "saat": saat_str,
            "hasta": sonuclar["saatlik_gelis"].get(saat_str, 0),
        })

    return {
        "ozet": metrik_ozetini_cikar(sonuclar),
        "hasta_dagilimi": sonuclar["oncelik_sayilari"],
        "hizmet_alinan": sonuclar["hizmet_alinan"],
        "ayrilanlar_oncelik": sonuclar["ayrilanlar_oncelik"],
        "oncelik_ort_bekleme": {
            k: guvenli_ortalama(v) for k, v in sonuclar["oncelik_bekleme"].items()
        },
        "oncelik_medyan_bekleme": {
            k: guvenli_medyan(v) for k, v in sonuclar["oncelik_bekleme"].items()
        },
        "kaynak_kullanim": {
            k: round(float(np.mean(v)) * 100, 1) if v else 0
            for k, v in sonuclar["kaynak_kullanim"].items()
        },
        "saatlik_gelis": saatlik,
    }


# ───────── Endpoint 2: Detaylı Simülasyon (Olay Logu) ─────────

@app.post(
    "/api/simule-et-detayli",
    summary="Detaylı Simülasyon — Olay Akış Logu",
    description="Tekli simülasyona ek olarak her hasta için detaylı olay kaydı döndürür. "
                "GELIS, TRIAJ_BASLADI, TRIAJ_BITTI, TEDAVI_BASLADI, TABURCU, AYRILDI olaylarını içerir. "
                "Performans için maksimum 200 olay döndürülür.",
    response_description="Simülasyon özeti ve kronolojik olay listesi",
)
def simule_et_detayli(parametreler: SimulasyonParametreleri):
    try:
        sonuclar, olaylar = simulasyonu_calistir(parametreler, olay_kaydi=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detaylı simülasyon hatası: {str(e)}")

    return {
        "ozet": metrik_ozetini_cikar(sonuclar),
        "olaylar": olaylar,
    }


# ───────── Endpoint 3: Monte Carlo Analizi ─────────

@app.post(
    "/api/monte-carlo",
    summary="Monte Carlo Tekrarlı Analiz",
    description="Aynı parametrelerle n_tekrar kadar bağımsız simülasyon çalıştırarak istatistiksel güvenilirlik sağlar. "
                "Ortalama, standart sapma, %95 güven aralığı ve histogram verileri döndürülür.",
    response_description="İstatistiksel özet, güven aralıkları ve histogram dağılımları",
)
def monte_carlo(parametreler: MonteCarloParametreleri):
    try:
        tekrar_sonuclari = []
        for i in range(parametreler.n_tekrar):
            param = SimulasyonParametreleri(
                sim_sure=parametreler.sim_sure,
                hasta_gelis_ort=parametreler.hasta_gelis_ort,
                n_triaj_hemsire=parametreler.n_triaj_hemsire,
                n_psikiyatrist=parametreler.n_psikiyatrist,
                n_psikolog=parametreler.n_psikolog,
                n_gozlem_yatagi=parametreler.n_gozlem_yatagi,
                seed=i * 1000 + 42,
            )
            sonuc = simulasyonu_calistir(param)
            ozet = metrik_ozetini_cikar(sonuc)
            tekrar_sonuclari.append(ozet)

        bekleme_listesi = [s["genel_ort_bekleme"] for s in tekrar_sonuclari]
        ayrilma_listesi = [s["ayrilma_orani"] for s in tekrar_sonuclari]
        hasta_listesi = [s["toplam_hasta"] for s in tekrar_sonuclari]
        triaj_listesi = [s["ort_triaj_bekleme"] for s in tekrar_sonuclari]

        n = len(bekleme_listesi)
        z = 1.96

        def ci(values):
            m = float(np.mean(values))
            s = float(np.std(values, ddof=1)) if n > 1 else 0
            margin = z * s / math.sqrt(n)
            return {
                "ortalama": round(m, 2),
                "std": round(s, 2),
                "ci_alt": round(m - margin, 2),
                "ci_ust": round(m + margin, 2),
                "min": round(float(np.min(values)), 2),
                "max": round(float(np.max(values)), 2),
            }

        histogram_bekleme = []
        if bekleme_listesi:
            counts, bin_edges = np.histogram(bekleme_listesi, bins=min(15, n))
            for j in range(len(counts)):
                histogram_bekleme.append({
                    "aralik": f"{bin_edges[j]:.1f}-{bin_edges[j+1]:.1f}",
                    "sayi": int(counts[j]),
                })

        histogram_ayrilma = []
        if ayrilma_listesi:
            counts, bin_edges = np.histogram(ayrilma_listesi, bins=min(15, n))
            for j in range(len(counts)):
                histogram_ayrilma.append({
                    "aralik": f"{bin_edges[j]:.1f}-{bin_edges[j+1]:.1f}",
                    "sayi": int(counts[j]),
                })

        return {
            "n_tekrar": n,
            "bekleme": ci(bekleme_listesi),
            "ayrilma": ci(ayrilma_listesi),
            "hasta": ci(hasta_listesi),
            "triaj_bekleme": ci(triaj_listesi),
            "histogram_bekleme": histogram_bekleme,
            "histogram_ayrilma": histogram_ayrilma,
            "tum_sonuclar": [
                {"tekrar": i + 1, "bekleme": b, "ayrilma": a, "hasta": h}
                for i, (b, a, h) in enumerate(zip(bekleme_listesi, ayrilma_listesi, hasta_listesi))
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monte Carlo hatası: {str(e)}")


# ───────── Endpoint 4: Optimizasyon ─────────

@app.post(
    "/api/optimizasyon",
    summary="Kadro Optimizasyonu",
    description="Tüm olası kaynak kombinasyonlarını deneyerek belirlenen hedef ayrılma oranını karşılayan "
                "en düşük maliyetli kadro yapısını bulur. Brute-force arama yöntemi kullanılır.",
    response_description="En iyi yapılandırma, alternatifler ve tüm kombinasyonların sıralı listesi",
)
def optimizasyon(p: OptimizasyonParametreleri):
    try:
        sonuclar = []
        hemsire_range = range(1, p.max_hemsire + 1)
        psikiyatrist_range = range(1, p.max_psikiyatrist + 1)
        psikolog_range = range(1, p.max_psikolog + 1)
        yatak_range = range(1, p.max_yatak + 1)

        for h, ps, pg, y in iter_product(hemsire_range, psikiyatrist_range, psikolog_range, yatak_range):
            toplam_ayrilma = 0
            toplam_bekleme = 0
            toplam_hasta = 0
            n_run = 3

            for run in range(n_run):
                param = SimulasyonParametreleri(
                    sim_sure=p.sim_sure,
                    hasta_gelis_ort=p.hasta_gelis_ort,
                    n_triaj_hemsire=h,
                    n_psikiyatrist=ps,
                    n_psikolog=pg,
                    n_gozlem_yatagi=y,
                    seed=run * 777 + h * 100 + ps * 10 + pg,
                )
                sim = simulasyonu_calistir(param)
                ozet = metrik_ozetini_cikar(sim)
                toplam_ayrilma += ozet["ayrilma_orani"]
                toplam_bekleme += ozet["genel_ort_bekleme"]
                toplam_hasta += ozet["toplam_hasta"]

            ort_ayrilma = toplam_ayrilma / n_run
            ort_bekleme = toplam_bekleme / n_run
            saat = p.sim_sure / 60
            gunluk_maliyet = (h * p.hemsire_maliyet + ps * p.psikiyatrist_maliyet +
                              pg * p.psikolog_maliyet + y * p.yatak_maliyet) * saat

            sonuclar.append({
                "n_triaj_hemsire": h,
                "n_psikiyatrist": ps,
                "n_psikolog": pg,
                "n_gozlem_yatagi": y,
                "ayrilma_orani": round(ort_ayrilma, 1),
                "ort_bekleme": round(ort_bekleme, 2),
                "toplam_hasta": round(toplam_hasta / n_run),
                "gunluk_maliyet": round(gunluk_maliyet, 0),
            })

        uygun = [s for s in sonuclar if s["ayrilma_orani"] <= p.hedef_ayrilma_orani]
        if uygun:
            uygun.sort(key=lambda x: x["gunluk_maliyet"])
            en_iyi = uygun[0]
            alternatifler = uygun[1:6]
        else:
            sonuclar.sort(key=lambda x: x["ayrilma_orani"])
            en_iyi = sonuclar[0]
            alternatifler = sonuclar[1:6]

        tum_sonuclar_sorted = sorted(sonuclar, key=lambda x: (x["ayrilma_orani"], x["gunluk_maliyet"]))

        return {
            "en_iyi": en_iyi,
            "alternatifler": alternatifler,
            "hedef_karsilandi": len(uygun) > 0,
            "uygun_kombinasyon_sayisi": len(uygun),
            "toplam_kombinasyon": len(sonuclar),
            "tum_sonuclar": tum_sonuclar_sorted[:30],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimizasyon hatası: {str(e)}")


# ───────── Endpoint 5: Duyarlılık Analizi ─────────

@app.post(
    "/api/duyarlilik",
    summary="Tek Değişkenli Duyarlılık Analizi",
    description="Seçilen bir parametreyi belirli aralıkta değiştirerek her adımda simülasyon çalıştırır. "
                "Parametrenin sistem performansına etkisini ölçmek için kullanılır.",
    response_description="Her adımdaki ayrılma oranı, bekleme süresi ve hasta sayısı",
)
def duyarlilik(p: DuyarlilikParametreleri):
    try:
        sonuclar = []
        for deger in range(p.aralik_min, p.aralik_max + 1, p.aralik_adim):
            params_dict = {
                "sim_sure": p.sim_sure,
                "hasta_gelis_ort": p.hasta_gelis_ort,
                "n_triaj_hemsire": p.n_triaj_hemsire,
                "n_psikiyatrist": p.n_psikiyatrist,
                "n_psikolog": p.n_psikolog,
                "n_gozlem_yatagi": p.n_gozlem_yatagi,
            }
            params_dict[p.degisken] = deger

            toplam_ayrilma = 0
            toplam_bekleme = 0
            toplam_hasta = 0
            toplam_triaj = 0
            n_run = 3

            for run in range(n_run):
                param = SimulasyonParametreleri(**params_dict, seed=run * 500 + deger * 10)
                sim = simulasyonu_calistir(param)
                ozet = metrik_ozetini_cikar(sim)
                toplam_ayrilma += ozet["ayrilma_orani"]
                toplam_bekleme += ozet["genel_ort_bekleme"]
                toplam_hasta += ozet["toplam_hasta"]
                toplam_triaj += ozet["ort_triaj_bekleme"]

            sonuclar.append({
                "deger": deger,
                "ayrilma_orani": round(toplam_ayrilma / n_run, 1),
                "ort_bekleme": round(toplam_bekleme / n_run, 2),
                "toplam_hasta": round(toplam_hasta / n_run),
                "ort_triaj_bekleme": round(toplam_triaj / n_run, 2),
            })

        return {
            "degisken": p.degisken,
            "sonuclar": sonuclar,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duyarlılık hatası: {str(e)}")


# ───────── Endpoint 6: 2D Heatmap Analizi ─────────

@app.post(
    "/api/heatmap",
    summary="2D Duyarlılık Heatmap Analizi",
    description="İki parametre aynı anda değiştirilerek ayrılma oranı matris olarak hesaplanır. "
                "Her hücrede 2 bağımsız çalıştırma ortalaması alınır. Sonuç renk kodlu heatmap görselleştirme için uygundur.",
    response_description="İki boyutlu matris: her hücrede ayrılma oranı ve ortalama bekleme süresi",
)
def heatmap(p: HeatmapParametreleri):
    try:
        if p.degisken1 == p.degisken2:
            raise HTTPException(status_code=400, detail="İki farklı değişken seçilmelidir")

        aralik1 = DEGISKEN_ARALIK.get(p.degisken1, (1, 5))
        aralik2 = DEGISKEN_ARALIK.get(p.degisken2, (1, 5))

        matris = []
        for d1 in range(aralik1[0], aralik1[1] + 1):
            satir = {"d1": d1, "degerler": []}
            for d2 in range(aralik2[0], aralik2[1] + 1):
                params_dict = {
                    "sim_sure": p.sim_sure,
                    "hasta_gelis_ort": p.hasta_gelis_ort,
                    "n_triaj_hemsire": p.n_triaj_hemsire,
                    "n_psikiyatrist": p.n_psikiyatrist,
                    "n_psikolog": p.n_psikolog,
                    "n_gozlem_yatagi": p.n_gozlem_yatagi,
                }
                params_dict[p.degisken1] = d1
                params_dict[p.degisken2] = d2

                toplam_ayrilma = 0
                toplam_bekleme = 0
                n_run = 2

                for run in range(n_run):
                    param = SimulasyonParametreleri(**params_dict, seed=run * 333 + d1 * 50 + d2)
                    sim = simulasyonu_calistir(param)
                    ozet = metrik_ozetini_cikar(sim)
                    toplam_ayrilma += ozet["ayrilma_orani"]
                    toplam_bekleme += ozet["genel_ort_bekleme"]

                satir["degerler"].append({
                    "d2": d2,
                    "ayrilma_orani": round(toplam_ayrilma / n_run, 1),
                    "ort_bekleme": round(toplam_bekleme / n_run, 2),
                })
            matris.append(satir)

        return {
            "degisken1": p.degisken1,
            "degisken2": p.degisken2,
            "matris": matris,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Heatmap hatası: {str(e)}")
