Proyecto Docentes - Entregas

Estructura:
- backend/: NestJS minimal starter (TypeScript)
- frontend/: React + Vite simple panel

Pasos para ejecutar (local):
1. Backend:
   - cd backend
   - npm install
   - Copiar .env.example a .env y ajustar MONGO_URI y datos SMTP
   - npm run start:dev

2. Frontend:
   - cd frontend
   - npm install
   - npm run dev

Nota:
- El backend expone endpoints en /docentes. El frontend hace proxy a /api/docentes.
- Implementa la lógica de detección de faltas en NotificacionesService.checkAndNotifyMissingAttendances().
# Backen
