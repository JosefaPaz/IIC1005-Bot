# IIC1005-Bot

Bot de discord para registrar asistencia directamente a google sheets

## Instalación

Requisitos: Node.js, discord.js

```
git clone https://github.com/raespinoza4/bot-asistencia-discord.git
cd bot-asistencia-discord
npm install discord.js
```

## Configuración

1. [Guia para obtener credenciales OAuth2 de google](https://gspread.readthedocs.io/en/latest/oauth2.html#using-signed-credentials). Seguir los pasos hasta el numero 5, guardar google-credentials.json en carpeta bot-discord-asistencia
2. Crear una planilla en google sheets y dar permisos de escritura al email que se encuentra en google-credentials.json
3. [Guia para crear un "bot application" en la web de Discord](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) seguir los pasos y copiar el token obtenido
4. Crear archivo .env con las siguientes variables:
```
TOKEN=discordToken (paso 3)
PREFIX=$
```
*Nota: Puedes elegir el prefix que tu prefieras para utilizar los comandos del bot ^^*

5. [Invitar al bot a tu servidor](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)
6. Completar spreadsheetId y range en funcion gswriteassistanceAlumno ubicada en archivo main.js (linea 29) con la información de la planilla a utilizar, ejemplo:
```
const appendOptions = {
    spreadsheetId: '13Rx5uOgIuobFpT_nfopaIZFZ0Iz9',
    range: 'Asistencia-Alumnos!A1',
    valueInputOption: 'USER_ENTERED',
    resource: { values: data},
};
```
*Nota: El spreadsheetId lo puedes encontrar en el link de tu planilla entre el "/d/" y "/edit", para mas info: [Click aqui](https://developers.google.com/sheets/api/guides/concepts)*

7. Reemplazar la id del rol que va a utilizar en el comando $asistencia en main.js , de lo contrario quitar el "if (message.member.roles.cache.has(alumno_role_id))"


7. Finalmente ejecutar
```
node .
```
8. Enjoy 🎉

## Comandos base

1. $asistencia : Escribe [Usuario, Dia, nDia, Mes, Hora] en la planilla configurada.
2. $ping: Comando de test, bot responde "Pong!"
3. $borrar: Comando para borrar facilmente mensajes, forma de uso: "$borrar 5" -> Borra los ultimos 5 mensajes del canal.

## Info final

Hecho con 💙 por Rodrigo Espinoza 🦊 [@raespinoza4](https://github.com/raespinoza4) inicialmente para el ramo "Introduccion a la programación" (IIC1103) en PUC.

Agradecimientos especiales a la guia https://discordjs.guide/ !
