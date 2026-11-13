@echo off
setlocal
chcp 65001 >nul
title Raio-X do Mercado de Trabalho Industrial de SC

cd /d "%~dp0frontend"

where node >nul 2>nul
if errorlevel 1 goto sem_node
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit((a===20&&b>=19)||a>=22&&(a>22||b>=12)?0:1)"
if errorlevel 1 goto node_velho

if not exist node_modules (
  echo Primeira execucao: instalando dependencias, pode levar 1 a 2 minutos...
  call npm install
  if errorlevel 1 goto erro
)

echo.
echo Abrindo o painel no navegador. Para encerrar, feche esta janela ou aperte Ctrl+C.
echo.
call npm run dev -- --open
if errorlevel 1 goto erro
goto fim

:sem_node
echo.
echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org e rode este arquivo de novo.
start https://nodejs.org
goto fim

:node_velho
echo.
echo Seu Node.js e antigo. Precisa da versao 20.19 ou superior (ou 22.12+).
echo Versao atual:
node -v
echo Baixe a versao LTS em https://nodejs.org
start https://nodejs.org
goto fim

:erro
echo.
echo Algo deu errado. Leia a mensagem acima. Se for erro de rede, tente de novo.

:fim
echo.
pause
