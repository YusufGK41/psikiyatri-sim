from fastapi import FastAPI
import simpy
import numpy as np
import random

app = FastAPI()

@app.get("/")
def read_root():
    
    rastgele_sayi = random.randint(1, 100)
    numpy_ortalama = np.mean([10, 20, 30])
    
    return {
        "mesaj": "Backend tıkır tıkır çalışıyor!",
        "simpy_versiyon": simpy.__version__,
        "rastgele_sayi": rastgele_sayi,
        "ortalama": numpy_ortalama
    }