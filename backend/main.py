"""Ponto de entrada do backend: roda o pipeline completo de dados.

Uso:
    python backend/main.py

Lê as bases em raw/ e grava os indicadores em data/processed/,
que alimentam o dashboard (dashboard/app.py).
"""
import pipeline

if __name__ == "__main__":
    pipeline.main()
