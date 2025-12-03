@echo off
echo Suppression des migrations dupliquees...
del migrations\202507200147-add-createdAt-updatedAt-to-rooms.js 2>nul
del migrations\202507202350-fill-responsable-id-in-rooms.js 2>nul
del migrations\202507210848-add-role-enum-to-users.js 2>nul
del migrations\202507210851-add-statut-enum-to-reservations.js 2>nul

echo.
echo Reinitialisation base de donnees...
call npx sequelize-cli db:drop
call npx sequelize-cli db:create
call npx sequelize-cli db:migrate

echo.
echo Chargement des donnees...
call npx sequelize-cli db:seed --seed 20251202000001-demo-users.js
call npx sequelize-cli db:seed --seed 20251202110000-real-port-rooms.js
call npx sequelize-cli db:seed --seed 20251202110001-real-reservations.js

echo.
echo TERMINE - Base de donnees reinitialisee avec les 4 salles du port
pause
