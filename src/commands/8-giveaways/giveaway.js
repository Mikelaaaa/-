/**
 * MODULE 8: GIVEAWAYS
 * Command: giveaway - Advanced giveaway management
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
} = require('discord.js');
const { StringHelper, TimeHelper } = require('../../utils/Helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('🎉 Create and manage giveaways')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub
                .setName('start')
                .setDescription('Start a new giveaway')
                .addStringOption(option =>
                    option
                        .setName('prize')
                        .setDescription('Prize description')
                        .setRequired(true)
                        .setMaxLength(256)
                )
                .addStringOption(option =>
                    option
                        .setName('duration')
                        .setDescription('Duration (e.g., 1h, 30m, 2d)')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('winners')
                        .setDescription('Number of winners')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(100)
                )
                .addRoleOption(option =>
                    option
                        .setName('required_role')
                        .setDescription('Required role to enter')
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option
                        .setName('required_level')
                        .setDescription('Required level to enter')
                        .setRequired(false)
                        .setMinValue(1)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('list')
                .setDescription('List active giveaways')
        )
        .addSubcommand(sub =>
            sub
                .setName('reroll')
                .setDescription('Reroll giveaway winners')
                .addStringOption(option =>
                    option
                        .setName('giveaway_id')
                        .setDescription('Giveaway ID to reroll')
                        .setRequired(true)
                )
        ),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'start':
                await this.handleStart(interaction, client);
                break;
            case 'list':
                await this.handleList(interaction, client);
                break;
            case 'reroll':
                await this.handleReroll(interaction, client);
                break;
        }
    },

    async handleStart(interaction, client) {
        await interaction.deferReply();

        try {
            const prize = interaction.options.getString('prize');
            const durationStr = interaction.options.getString('duration');
            const winners = interaction.options.getInteger('winners') || 1;
            const requiredRole = interaction.options.getRole('required_role');
            const requiredLevel = interaction.options.getInteger('required_level') || 0;

            // Parse duration
            const durationMs = TimeHelper.parseDuration(durationStr);
            if (durationMs === 0) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Invalid Duration')
                            .setDescription('Use format: 1h, 30m, 2d30m')
                            .setColor(Colors.Red),
                    ],
                });
            }

            const endTime = new Date(Date.now() + durationMs);
            const giveawayId = `giveaway_${StringHelper.generateRandom(8)}`;

            // Create giveaway embed
            const embed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY')
                .setDescription(prize)
                .addFields(
                    { name: 'Prize', value: prize, inline: false },
                    { name: 'Winners', value: `${winners}`, inline: true },
                    { name: 'Ends In', value: TimeHelper.formatTime(durationMs), inline: true },
                    { name: 'Entries', value: '0', inline: true }
                )
                .setFooter({ text: `Giveaway ID: ${giveawayId}` })
                .setColor(Colors.Gold)
                .setTimestamp(endTime);

            // Add conditions if applicable
            if (requiredRole) {
                embed.addFields({
                    name: 'Required Role',
                    value: requiredRole.toString(),
                    inline: true,
                });
            }
            if (requiredLevel > 0) {
                embed.addFields({
                    name: 'Required Level',
                    value: `${requiredLevel}`,
                    inline: true,
                });
            }

            // Create button
            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`giveaway_enter_${giveawayId}`)
                    .setLabel('🎉 Enter Giveaway')
                    .setStyle(ButtonStyle.Success)
            );

            // Send giveaway message
            const giveawayMessage = await interaction.channel.send({
                embeds: [embed],
                components: [button],
            });

            // Save to database
            await client.db.createGiveaway({
                giveawayId,
                messageId: giveawayMessage.id,
                channelId: interaction.channelId,
                guildId: interaction.guildId,
                prize,
                hostId: interaction.user.id,
                winners,
                endTime,
                requiredRoleId: requiredRole?.id,
                requiredLevel,
                participants: [],
                winnerIds: [],
            });

            // Setup auto-end timer
            const delay = durationMs;
            setTimeout(async () => {
                await this.endGiveaway(giveawayId, client);
            }, delay);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('✅ Giveaway Created')
                        .setDescription(`Giveaway started in ${interaction.channel}`)
                        .setColor(Colors.Green),
                ],
            });

        } catch (error) {
            client.logger.error('Giveaway start error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not create giveaway.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },

    async handleList(interaction, client) {
        await interaction.deferReply();

        try {
            // Fetch active giveaways from database
            const Giveaway = require('../../database/models/index').Giveaway;
            const giveaways = await Giveaway.find({
                guildId: interaction.guildId,
                ended: false,
            }).sort({ endTime: 1 });

            if (giveaways.length === 0) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🎉 Active Giveaways')
                            .setDescription('No active giveaways.')
                            .setColor(Colors.Greyple),
                    ],
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🎉 Active Giveaways')
                .setColor(Colors.Gold);

            giveaways.forEach(g => {
                const timeRemaining = TimeHelper.formatTime(new Date(g.endTime) - Date.now());
                embed.addFields({
                    name: g.prize,
                    value: `**Winners:** ${g.winners}\n**Entries:** ${g.participants.length}\n**Ends:** ${timeRemaining}`,
                    inline: false,
                });
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logger.error('Giveaway list error:', error);
        }
    },

    async handleReroll(interaction, client) {
        await interaction.deferReply();

        try {
            const giveawayId = interaction.options.getString('giveaway_id');
            const Giveaway = require('../../database/models/index').Giveaway;

            const giveaway = await Giveaway.findOne({ giveawayId });

            if (!giveaway) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Giveaway Not Found')
                            .setColor(Colors.Red),
                    ],
                });
            }

            // Select new winners
            const winners = this.selectWinners(giveaway.participants, giveaway.winners);

            // Update database
            giveaway.winnerIds = winners;
            await giveaway.save();

            // Announce
            const channel = await interaction.guild.channels.fetch(giveaway.channelId);
            const embed = new EmbedBuilder()
                .setTitle('🎉 Giveaway Rerolled')
                .setDescription(`New winners selected for: ${giveaway.prize}`)
                .addFields({
                    name: 'Winners',
                    value: winners.map(id => `<@${id}>`).join('\n'),
                })
                .setColor(Colors.Gold);

            await channel.send({ embeds: [embed] });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('✅ Giveaway Rerolled')
                        .setColor(Colors.Green),
                ],
            });

        } catch (error) {
            client.logger.error('Giveaway reroll error:', error);
        }
    },

    async endGiveaway(giveawayId, client) {
        try {
            const Giveaway = require('../../database/models/index').Giveaway;
            const giveaway = await Giveaway.findOne({ giveawayId });

            if (!giveaway) return;

            // Validate and select winners
            const winners = this.selectWinners(giveaway.participants, giveaway.winners);

            giveaway.winnerIds = winners;
            giveaway.ended = true;
            await giveaway.save();

            // Announce winners
            const guild = client.guilds.cache.get(giveaway.guildId);
            const channel = await guild.channels.fetch(giveaway.channelId);

            const embed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY ENDED')
                .setDescription(`Prize: ${giveaway.prize}`)
                .addFields({
                    name: 'Winners',
                    value: winners.length > 0 ? winners.map(id => `<@${id}>`).join(', ') : 'No valid entries',
                })
                .setColor(Colors.Gold);

            await channel.send({ embeds: [embed] });

            client.logger.info(`Giveaway ${giveawayId} ended with ${winners.length} winners`);

        } catch (error) {
            client.logger.error('Giveaway end error:', error);
        }
    },

    selectWinners(participants, count) {
        if (participants.length === 0) return [];

        const winners = [];
        const shuffled = [...participants].sort(() => Math.random() - 0.5);

        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            winners.push(shuffled[i]);
        }

        return winners;
    },

    buttons: [
        {
            customId: /^giveaway_enter_(.+)$/,
            async execute(interaction, client) {
                const giveawayId = interaction.customId.split('_')[2];

                try {
                    const Giveaway = require('../../database/models/index').Giveaway;
                    const giveaway = await Giveaway.findOne({ giveawayId });

                    if (!giveaway) {
                        return interaction.reply({
                            content: 'Giveaway not found.',
                            ephemeral: true,
                        });
                    }

                    // Check if already entered
                    if (giveaway.participants.includes(interaction.user.id)) {
                        return interaction.reply({
                            content: 'You have already entered this giveaway!',
                            ephemeral: true,
                        });
                    }

                    // Check conditions
                    if (giveaway.requiredRoleId) {
                        const member = await interaction.guild.members.fetch(interaction.user.id);
                        if (!member.roles.cache.has(giveaway.requiredRoleId)) {
                            return interaction.reply({
                                content: 'You do not have the required role!',
                                ephemeral: true,
                            });
                        }
                    }

                    if (giveaway.requiredLevel > 0) {
                        const userData = await client.db.getUser(
                            interaction.guildId,
                            interaction.user.id,
                            client.cache
                        );
                        if (userData.level < giveaway.requiredLevel) {
                            return interaction.reply({
                                content: `You need to be level ${giveaway.requiredLevel} or higher!`,
                                ephemeral: true,
                            });
                        }
                    }

                    // Add to participants
                    giveaway.participants.push(interaction.user.id);
                    await giveaway.save();

                    await interaction.reply({
                        content: '✅ You have entered the giveaway!',
                        ephemeral: true,
                    });

                } catch (error) {
                    client.logger.error('Giveaway enter error:', error);
                }
            },
        },
    ],
};
