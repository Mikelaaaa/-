#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/scaffold-command.js <category/command> [--desc "Description"] [--force]');
  console.log('Example: node scripts/scaffold-command.js economy/balance --desc "Check balance"');
}

const argv = process.argv.slice(2);
if (!argv[0]) {
  usage();
  process.exit(1);
}

let target = argv[0];
let desc = 'No description provided';
let force = false;

for (let i = 1; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--force') force = true;
  if (a === '--desc' && argv[i+1]) {
    desc = argv[i+1];
    i++;
  }
}

const parts = target.split('/').filter(Boolean);
if (parts.length < 2) {
  console.error('Error: target must be in form <category>/<command>');
  usage();
  process.exit(1);
}

const category = parts.slice(0, -1).join('/');
const commandName = parts[parts.length - 1];

const destDir = path.join(__dirname, '..', 'src', 'commands', category);
const destFile = path.join(destDir, `${commandName}.js`);

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
if (fs.existsSync(destFile) && !force) {
  console.error('Error: file exists. Use --force to overwrite:', destFile);
  process.exit(1);
}

const template = `/**
 * Command: ${commandName}
 */

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('${commandName}')
        .setDescription('${desc}')
        .setDMPermission(false),

    async execute(interaction, client) {
        await interaction.deferReply();
        try {
            // TODO: implement command logic
            await interaction.editReply({ content: 'Not implemented yet.' });
        } catch (error) {
            client.logger?.error('${commandName} command error:', error);
            await interaction.editReply({ embeds: [ new EmbedBuilder().setTitle('❌ Error').setDescription('An error occurred.').setColor(Colors.Red) ] });
        }
    }
};
`;

fs.writeFileSync(destFile, template, { encoding: 'utf8' });
console.log('Created command:', destFile);
