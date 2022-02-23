module.exports = {
  name: 'borrar',
  description: 'Borra los n últimos mensajes',
  args: true,
  usage: '<cantidad>',
  guildOnly: true,
  execute(message, args) {
    if (!message.member.roles.cache.some((role) => role.name === 'Ayudantes')) return;
    const amount = parseInt(args[0], 10) + 1;

    if (Number.isNaN(amount)) {
      return message.reply('Amigazo, eso no es un número');
    } if (amount <= 1 || amount > 100) {
      return message.reply('Debe ser un número entre 1 y 99 (incluidos)');
    }

    message.channel.bulkDelete(amount, true).catch((err) => {
      console.error(err);
      message.channel.send('Ocurrió un error en el proceso!');
    });

    message.channel.send('Aquí no pasó nada .-.');
  },
};
