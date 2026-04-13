from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import simpy
import random
import numpy as np

# Arayüzden (React) gelecek verilerin formatını belirliyoruz
class SimulasyonParametreleri(BaseModel):
    sim_sure: int = 1440
    hasta_gelis_ort: float = 4.0
    n_triaj_hemsire: int = 2
    n_psikiyatrist: int = 1
    n_psikolog: int = 2
    n_gozlem_yatagi: int = 4

app = FastAPI(title="Psikiyatri Acil Servisi Simülasyon API")

# Next.js (3000 portu) ile Python (8000 portu) haberleşebilsin diye CORS izni veriyoruz
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simülasyon Motoru (Önceki yazdığımız kodun API'ye uyarlanmış hali)
def simulasyonu_calistir(param: SimulasyonParametreleri):
    env = simpy.Environment()
    
    # Her istekte metriklerin sıfırlanması çok önemli, yoksa veriler birbirine karışır
    metrikler = {
        "bekleme_sureleri": [],
        "ayrilanlar": 0,
        "oncelik_sayilari": {"P1": 0, "P2": 0, "P3": 0},
        "oncelik_bekleme": {"P1": [], "P2": [], "P3": []}
    }

    kaynaklar = {
        "triaj_hemsire": simpy.PriorityResource(env, capacity=param.n_triaj_hemsire),
        "psikiyatrist": simpy.PriorityResource(env, capacity=param.n_psikiyatrist),
        "psikolog": simpy.Resource(env, capacity=param.n_psikolog),
        "gozlem_yatagi": simpy.Resource(env, capacity=param.n_gozlem_yatagi),
    }

    TRIAJ_MIN, TRIAJ_MAX = 5, 10
    SEANS_SURE = {"P1": (30, 60), "P2": (20, 45), "P3": (15, 30)}
    ONCELIK_DAGILIM = ["P1", "P2", "P2", "P3", "P3", "P3"]
    RENEGING_ESIGI = {"P1": 15, "P2": 30, "P3": 60}

    def hasta_sureci(env, hasta_id, kaynaklar, metrikler):
        gelis_zamani = env.now
        oncelik = random.choice(ONCELIK_DAGILIM)
        metrikler["oncelik_sayilari"][oncelik] += 1
        oncelik_derecesi = int(oncelik[1])

        # Triyaj
        with kaynaklar["triaj_hemsire"].request(priority=oncelik_derecesi) as talep:
            sonuc = yield talep | env.timeout(RENEGING_ESIGI[oncelik])
            if talep not in sonuc:
                # Sadece talep.cancel() satırını sildik, metrik ekleyip çıkıyoruz
                metrikler["ayrilanlar"] += 1
                return
            yield env.timeout(random.uniform(TRIAJ_MIN, TRIAJ_MAX))

        triaj_bitis = env.now
        gerceklesme_suresi = 0

        # Yönlendirme
        if oncelik == "P1":
            with kaynaklar["psikiyatrist"].request(priority=1) as p_talep, \
                 kaynaklar["gozlem_yatagi"].request() as y_talep:
                yield p_talep & y_talep
                metrikler["oncelik_bekleme"][oncelik].append(env.now - triaj_bitis)
                gerceklesme_suresi = random.uniform(*SEANS_SURE[oncelik])
                yield env.timeout(gerceklesme_suresi)

        elif oncelik == "P2":
            p_talep = kaynaklar["psikiyatrist"].request(priority=2)
            ps_talep = kaynaklar["psikolog"].request()
            sonuc = yield p_talep | ps_talep
            
            if p_talep in sonuc:
                ps_talep.cancel()
                metrikler["oncelik_bekleme"][oncelik].append(env.now - triaj_bitis)
                gerceklesme_suresi = random.uniform(*SEANS_SURE[oncelik])
                yield env.timeout(gerceklesme_suresi)
                kaynaklar["psikiyatrist"].release(p_talep)
            else:
                p_talep.cancel()
                metrikler["oncelik_bekleme"][oncelik].append(env.now - triaj_bitis)
                gerceklesme_suresi = random.uniform(*SEANS_SURE[oncelik])
                yield env.timeout(gerceklesme_suresi)
                kaynaklar["psikolog"].release(ps_talep)

        else:
            with kaynaklar["psikolog"].request() as talep:
                yield talep
                metrikler["oncelik_bekleme"][oncelik].append(env.now - triaj_bitis)
                gerceklesme_suresi = random.uniform(*SEANS_SURE[oncelik])
                yield env.timeout(gerceklesme_suresi)

        metrikler["bekleme_sureleri"].append(max(0, env.now - gelis_zamani - gerceklesme_suresi))

    def hasta_ureteci(env, kaynaklar, metrikler):
        hasta_id = 0
        while True:
            yield env.timeout(random.expovariate(1.0 / param.hasta_gelis_ort))
            hasta_id += 1
            env.process(hasta_sureci(env, hasta_id, kaynaklar, metrikler))

    env.process(hasta_ureteci(env, kaynaklar, metrikler))
    env.run(until=param.sim_sure)
    
    return metrikler

# Arayüzün istek atacağı Endpoint
@app.post("/api/simule-et")
def simule_et(parametreler: SimulasyonParametreleri):
    sonuclar = simulasyonu_calistir(parametreler)
    
    # Numpy array'leri JSON formatına uymadığı için standart tiplere çeviriyoruz
    def guvenli_ortalama(liste):
        return round(float(np.mean(liste)), 2) if liste else 0.0

    return {
        "ozet": {
            "toplam_hasta": sum(sonuclar["oncelik_sayilari"].values()),
            "ayrilan_hasta": sonuclar["ayrilanlar"],
            "genel_ort_bekleme": guvenli_ortalama(sonuclar["bekleme_sureleri"])
        },
        "hasta_dagilimi": sonuclar["oncelik_sayilari"],
        "oncelik_ort_bekleme": {
            "P1": guvenli_ortalama(sonuclar["oncelik_bekleme"]["P1"]),
            "P2": guvenli_ortalama(sonuclar["oncelik_bekleme"]["P2"]),
            "P3": guvenli_ortalama(sonuclar["oncelik_bekleme"]["P3"]),
        }
    }
