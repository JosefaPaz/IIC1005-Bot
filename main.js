require('dotenv').config();

const { google } = require('googleapis');
const fileSystem = require('fs');
const Discord = require('discord.js');
const keys = require('./google-credentials.json');

const client = new Discord.Client({
  ws: { intents: Discord.Intents.NON_PRIVILEGED },
});
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const { clientEmail, privateKey } = keys; // this or client_email and private_key?
const clientSheet = process.env.SPREADSHEET_ID;
const prefix = process.env.PREFIX;
const token = process.env.TOKEN;

const googleClient = new google.auth.JWT(clientEmail, null, privateKey, [
  'https://www.googleapis.com/auth/spreadsheets',
]);

const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function countInstances(string, word) {
  return string.split(word).length - 1;
}

async function googleSheetWrite(data, sheetRange) {
  const googleSheetApi = google.sheets({ version: 'v4', auth: client });
  const appendOptions = {
    spreadsheetId: clientSheet,
    range: sheetRange,
    valueInputOption: 'USER_ENTERED',
    resource: { values: data },
  };

  const response = await googleSheetApi.spreadsheets.values.append(appendOptions);
  console.log(response);
}

const commandFiles = fileSystem
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  // eslint-disable-next-line import/no-dynamic-require
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('guildMemberAdd', (member) => {
  member
    .send(`Welcome to the server, ${member.username}!`)
    .then((sentEmbed) => {
      sentEmbed.react('👍');
    });
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const data = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = data.shift().toLowerCase();
  const marks = countInstances(data, '"');

  console.log('[LOG] ---- New information ------\n', data);
  console.log('[LOG] ---- New message ------\n', message);
  console.log('[LOG] ---- number of instances: ', marks);

  // casual: content of the DIY + optional file
  if (commandName in ['casual:', 'leyend:', 'pro:']) {
    console.log('[LOG] ---- writing DIY ------');
    const timestamp = new Date();
    const time = `${timestamp.getHours().toString()}:${timestamp.getMinutes().toString()}:${timestamp
      .getSeconds()
      .toString()}`;

    const description = data.slice(1).join(' ');

    googleClient.authorize((err) => {
      if (err) {
        console.log('[ERROR] ----', err);
      } else {
        const student = message.author.username;
        const finalData = [
          student,
          days[timestamp.getDay()],
          `${timestamp.getDate()} ${months[timestamp.getMonth()]}`,
          time,
          description,
          message.url,
        ];
        const range = 'TODO: RANGE FOR GOOGLESHEET';
        return googleSheetWrite(finalData, range);
      }
    });
    message.reply(`¡Se ha registrado tu DIY nivel ${commandName}, felicitaciones! 😎👩‍💻`);
  } else if (commandName === 'asistencia-ayudante') {
    if (message.member.roles.cache.some((role) => role.name === 'Ayudantes')) {
      console.log(`[LOG] ---- writing TA assistance for ${message.author} ------`);
      const timestamp = new Date();
      const time = `${timestamp.getHours().toString()}:${timestamp.getMinutes().toString()}:${timestamp
        .getSeconds()
        .toString()}`;

      googleClient.authorize((err) => {
        if (err) {
          console.log('[ERROR] ----', err);
        } else {
          const finalData = [
            message.author.username,
            days[timestamp.getDay()],
            `${timestamp.getDate()} ${months[timestamp.getMonth()]}`,
            time,
          ];
          const range = 'TODO: RANGE FOR GOOGLESHEET';
          return googleSheetWrite(finalData, range);
        }
      });
      message.reply('He registrado correctamente tu asistencia ✅');
    } else {
      message.reply('Debes ser ayudante para utilizar este comando ❌');
    }
  }

  if (message.content === '/join') {
    console.log('Se ejecuto el join !');
    console.log(message.author);
    message.delete(1000);
    return client.emit('guildMemberAdd', message.author);
  }

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply(
      'No puedo ejecutar este comando en un chat privado, debes usarlo en el canal correspondiente :)',
    );
  }

  if (command.args && !data.length) {
    let reply = `No pusiste los argumentos necesarios! ${message.author}`;

    if (command.usage) {
      reply += `\nLa forma correcta de usar el comando es: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `Por favor espera ${timeLeft.toFixed(
          1,
        )} segundo(s) mas antes de volver a usar el comando \`${command.name}\``,
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, data);
  } catch (error) {
    console.error(error);
    message.reply('Ocurrió un error al momento de ejecutar el comando :(');
  }
});

client.login(token);
