/**
 * MODULE 4: TICKETING
 * Command: create-ticket - Open a support ticket
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('📧 Create or manage support tickets')
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub
                .setName('create')
                .setDescription('Create a new support ticket')
                .addStringOption(option =>
                    option
                        .setName('category')
                        .setDescription('Ticket category')
                        .setRequired(true)
                        .addChoices(
                            { name: '🐛 Bug Report', value: 'bug' },
                            { name: '💡 Feature Request', value: 'feature' },
                            { name: '❓ General Support', value: 'general' },
                            { name: '⚠️ Appeal', value: 'appeal' }
                        )
                )
                .addStringOption(option =>
                    option
                        .setName('description')
                        .setDescription('Describe your issue')
                        .setRequired(true)
                        .setMaxLength(1000)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('close')
                .setDescription('Close this ticket')
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Reason for closing')
                        .setRequired(false)
                )
        ),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            await this.handleCreate(interaction, client);
        } else if (subcommand === 'close') {
            await this.handleClose(interaction, client);
        }
    },

    async handleCreate(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const category = interaction.options.getString('category');
            const description = interaction.options.getString('description');
            const guildSettings = await client.db.getGuildSettings(
                interaction.guildId,
                client.cache
            );

            if (!guildSettings.ticketCategory) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Ticketing Disabled')
                            .setDescription('Ticket system is not configured.')
                            .setColor(Colors.Red),
                    ],
                });
            }

            // Get or create ticket counter
            const ticketNumber = guildSettings.ticketCounter || 1;
            const ticketId = `ticket-${ticketNumber}`;

            // Create ticket channel
            const ticketCategory = await interaction.guild.channels.fetch(
                guildSettings.ticketCategory
            );

            const ticketChannel = await interaction.guild.channels.create({
                name: `${category}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: ticketCategory,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: ['ViewChannel'],
                    },
                    {
                        id: interaction.user.id,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                    },
                    // Add support roles permissions
                    ...guildSettings.supportRoles.map(roleId => ({
                        id: roleId,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                    })),
                ],
            });

            // Save ticket to database
            await client.db.createTicket(
                ticketId,
                interaction.user.id,
                interaction.guildId,
                ticketChannel.id,
                description
            );

            // Update ticket counter
            await client.db.updateGuildSettings(
                interaction.guildId,
                { ticketCounter: ticketNumber + 1 },
                client.cache
            );

            // Send ticket channel message
            const embed = new EmbedBuilder()
                .setTitle(`📧 Ticket #${ticketNumber}`)
                .setDescription(description)
                .addFields(
                    { name: 'Category', value: this.getCategoryEmoji(category), inline: true },
                    { name: 'Status', value: '🔵 Open', inline: true },
                    { name: 'Created By', value: interaction.user.toString(), inline: false }
                )
                .setColor(Colors.Blurple)
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claim Ticket')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({
                embeds: [embed],
                components: [buttons],
            });

            // Notify user
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('✅ Ticket Created')
                        .setDescription(`Your ticket has been created: ${ticketChannel}`)
                        .setColor(Colors.Green),
                ],
            });

            client.logger.info(`Ticket ${ticketId} created by ${interaction.user.tag}`);

        } catch (error) {
            client.logger.error('Ticket creation error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not create ticket.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },

    async handleClose(interaction, client) {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {
            const reason = interaction.isChatInputCommand()
                ? interaction.options.getString('reason') || 'No reason provided'
                : 'Closed via ticket panel';

            // Get ticket data by channel ID
            let ticketData = await client.db.getTicketByChannel(
                interaction.channelId,
                client.cache
            );

            if (!ticketData && interaction.channel?.name) {
                const channelName = interaction.channel.name;
                if (channelName.startsWith('ticket-')) {
                    ticketData = await client.db.getTicket(channelName, client.cache);
                }
            }

            if (!ticketData) {
                client.logger.warn(`Ticket close attempt failed: no ticket record for channel ${interaction.channelId}, name=${interaction.channel?.name || 'unknown'}`);
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Not a Ticket Channel')
                            .setDescription('This command can only be used in ticket channels.')
                            .setColor(Colors.Red),
                    ],
                });
            }

            // Generate transcript (non-fatal)
            let transcript = '';
            try {
                transcript = await this.generateTranscript(interaction.channel, client);
            } catch (transcriptError) {
                client.logger.warn('Ticket transcript generation failed:', transcriptError.stack || transcriptError);
            }

            // Update ticket status
            await client.db.closeTicket(
                ticketData.ticketId,
                interaction.user.id,
                client.cache
            );

            // Create embed for closing
            const embed = new EmbedBuilder()
                .setTitle('✅ Ticket Closed')
                .setDescription(`This ticket has been closed by ${interaction.user}`)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Closed By', value: interaction.user.tag, inline: true }
                )
                .setColor(Colors.Green)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Archive to logs
            const logEmbed = new EmbedBuilder()
                .setTitle(`Ticket Closed: #${ticketData.ticketId}`)
                .setDescription(reason)
                .addFields(
                    { name: 'User', value: `<@${ticketData.userId}>`, inline: true },
                    { name: 'Closed By', value: interaction.user.tag, inline: true }
                )
                .setColor(Colors.Greyple)
                .setTimestamp();

            // Delete channel after 5 seconds
            setTimeout(async () => {
                await interaction.channel.delete().catch(() => {});
            }, 5000);

        } catch (error) {
            client.logger.error('Ticket close error:', error.stack || error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.deferReply({ ephemeral: true });
            }
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Could not close ticket.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },

    getCategoryEmoji(category) {
        const emojis = {
            bug: '🐛 Bug Report',
            feature: '💡 Feature Request',
            general: '❓ General Support',
            appeal: '⚠️ Appeal',
        };
        return emojis[category] || category;
    },

    async generateTranscript(channel, client) {
        const messages = [];
        let lastMessageId;

        // Fetch all messages
        while (true) {
            const options = { limit: 100 };
            if (lastMessageId) options.before = lastMessageId;

            const fetched = await channel.messages.fetch(options);
            if (fetched.size === 0) break;

            messages.unshift(...fetched.values());
            lastMessageId = fetched.last().id;
        }

        // Format as HTML or plain text
        return messages
            .map(
                msg =>
                    `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}`
            )
            .join('\n');
    },

    // Button handlers
    buttons: [
        {
            customId: 'ticket_claim',
            async execute(interaction, client) {
                await interaction.deferReply();

                try {
                    // Add user to channel
                    await interaction.channel.permissionOverwrites.edit(
                        interaction.user.id,
                        { SendMessages: true }
                    );

                    const embed = new EmbedBuilder()
                        .setTitle('✅ Ticket Claimed')
                        .setDescription(`This ticket has been claimed by ${interaction.user}`)
                        .setColor(Colors.Green);

                    await interaction.editReply({ embeds: [embed] });

                } catch (error) {
                    client.logger.error('Ticket claim error:', error);
                }
            },
        },
        {
            customId: 'ticket_close',
            async execute(interaction, client) {
                try {
                    if (typeof module.exports.handleClose === 'function') {
                        await module.exports.handleClose(interaction, client);
                    } else {
                        if (!interaction.replied && !interaction.deferred) {
                            await interaction.deferReply({ ephemeral: true });
                        }
                        await interaction.editReply({ content: 'Close functionality not available.', ephemeral: true });
                    }
                } catch (error) {
                    client.logger.error('Ticket close button error:', error.stack || error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.deferReply({ ephemeral: true });
                    }
                    await interaction.editReply({ content: 'An error occurred while closing the ticket.', ephemeral: true });
                }
            },
        },
    ],
};
