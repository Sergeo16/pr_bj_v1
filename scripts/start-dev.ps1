# Script pour demarrer l'application en mode developpement local (Windows)
# Usage: npm run start:dev
# Encoding: UTF-8 with BOM

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "[*] Demarrage de l'application en mode developpement..." -ForegroundColor Cyan
Write-Host ""

# Verifier que Docker est demarre
$dockerRunning = $false
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
    }
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    Write-Host "[X] Docker n'est pas demarre. Veuillez demarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Docker est demarre" -ForegroundColor Green
Write-Host ""

# Verifier si le conteneur de base de donnees existe
$dbContainerExists = docker ps -a --format '{{.Names}}' | Select-String -Pattern "^pr2026_db$"

if ($dbContainerExists) {
    Write-Host "[*] Conteneur de base de donnees trouve" -ForegroundColor Yellow
    
    # Verifier s'il est en cours d'execution
    $dbContainerRunning = docker ps --format '{{.Names}}' | Select-String -Pattern "^pr2026_db$"
    
    if ($dbContainerRunning) {
        Write-Host "[OK] Base de donnees deja demarree" -ForegroundColor Green
    } else {
        Write-Host "[*] Demarrage de la base de donnees..." -ForegroundColor Yellow
        docker start pr2026_db
        Write-Host "[*] Attente que PostgreSQL soit pret..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Write-Host "[OK] Base de donnees demarree" -ForegroundColor Green
    }
} else {
    Write-Host "[*] Creation du conteneur de base de donnees..." -ForegroundColor Yellow
    docker run -d `
      --name pr2026_db `
      -e POSTGRES_USER=pr2026_user `
      -e POSTGRES_PASSWORD=pr2026_password `
      -e POSTGRES_DB=pr2026_db `
      -p 5432:5432 `
      postgres:15-alpine
    Write-Host "[*] Attente que PostgreSQL soit pret..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Write-Host "[OK] Base de donnees creee et demarree" -ForegroundColor Green
}

Write-Host ""
Write-Host "[*] Verification de la base de donnees..." -ForegroundColor Cyan

# Verifier si les tables existent
$ErrorActionPreference = "SilentlyContinue"
$tablesExist = docker exec pr2026_db psql -U pr2026_user -d pr2026_db -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('departement', 'duo');" 2>$null
$ErrorActionPreference = "Continue"

if ([string]::IsNullOrWhiteSpace($tablesExist) -or $tablesExist.Trim() -eq "0") {
    Write-Host "[!] Les tables n'existent pas. Execution des migrations..." -ForegroundColor Yellow
    npm run migrate
    
    Write-Host ""
    Write-Host "[*] Chargement des donnees..." -ForegroundColor Cyan
    npm run seed
    Write-Host ""
} else {
    Write-Host "[OK] Base de donnees deja initialisee" -ForegroundColor Green
}

Write-Host ""
Write-Host "[*] Demarrage de Next.js..." -ForegroundColor Cyan
Write-Host ""

# Demarrer Next.js
npm run dev
