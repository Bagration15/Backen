# Script para crear archivo .env
$envContent = @"
# Configuración de Base de Datos MongoDB
MONGODB_URI=mongodb+srv://Proyecto_DS_II:5tGOjQkDhH67sf9t@cluster0.uux2ndk.mongodb.net/registro-universidad?retryWrites=true&w=majority&appName=Cluster0

# Configuración del Servidor
PORT=3000

# Configuración JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Configuración SMTP para envío de emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=anyo1515@gmail.com
SMTP_PASS=tsrib sdij hfyv slfa
SMTP_FROM=anyo1515@gmail.com
"@

$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host "⚠️  El archivo .env ya existe en: $envPath"
    $response = Read-Host "¿Deseas sobrescribirlo? (S/N)"
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "❌ Operación cancelada"
        exit 0
    }
}

Set-Content -Path $envPath -Value $envContent -Force

if (Test-Path $envPath) {
    Write-Host "✅ Archivo .env creado exitosamente en: $envPath"
    Write-Host "📄 Contenido verificado:"
    Get-Content $envPath | ForEach-Object { Write-Host "   $_" }
} else {
    Write-Host "❌ Error al crear el archivo .env"
    exit 1
}

