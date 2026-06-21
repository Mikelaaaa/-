const {
    SlashCommandBuilder,
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configure ticketing and publish the ticket creation panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addChannelOption(option =>
            option
                .setName('ticket_category')
                .setDescription('Category where temporary ticket channels will be created')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName('support_role')
                .setDescription('Role that can view and manage tickets')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('panel_channel')
                .setDescription('Channel where the ticket panel will be posted')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const ticketCategory = interaction.options.getChannel('ticket_category');
            const supportRole = interaction.options.getRole('support_role');
            const panelChannel = interaction.options.getChannel('panel_channel') || interaction.channel;

            await client.db.updateGuildSettings(
                interaction.guildId,
                {
                    ticketCategory: ticketCategory.id,
                    supportRoles: [supportRole.id],
                },
                client.cache
            );

            const embed = new EmbedBuilder()
                .setTitle('🎫 Ticket Support Center')
                .setDescription(
                    'Welcome to support! Press the button below to create a private ticket channel for your request.'
                )
                .addFields(
                    { name: 'Category', value: `${ticketCategory}`, inline: true },
                    { name: 'Support Role', value: `${supportRole}`, inline: true },
                    {
                        name: 'How it works',
                        value:
                            'A private ticket channel will be created for you. Only you and support staff can see it. ' +
                            'When the ticket is closed, the channel will be deleted automatically.',
                    }
                )
                .setColor(Colors.Blurple)
                .setTimestamp();

            const buttonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_panel_create')
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Primary)
            );

            await panelChannel.send({ embeds: [embed], components: [buttonRow] });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('✅ Ticket System Configured')
                        .setDescription(
                            `Ticket category has been set to ${ticketCategory} and support role is ${supportRole}. ` +
                            `A ticket panel was posted in ${panelChannel}.`
                        )
                        .setColor(Colors.Green),
                ],
            });
        } catch (error) {
            client.logger.error('Setup command error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Setup Failed')
                        .setDescription('Could not configure the ticket system. Please try again.')
                        .setColor(Colors.Red),
                ],
            });
        }
    },

    buttons: [
        {
            customId: /^ticket_panel_create$/,
            async execute(interaction, client) {
                await interaction.deferReply({ ephemeral: true });

                try {
                    const guildSettings = await client.db.getGuildSettings(interaction.guildId, client.cache);

                    if (!guildSettings.ticketCategory || !guildSettings.supportRoles?.length) {
                        return interaction.editReply({
                            content: 'Ticket system is not configured. Please ask an admin to run /setup.',
                            ephemeral: true,
                        });
                    }

                    const category = await interaction.guild.channels.fetch(guildSettings.ticketCategory);

                    if (!category || category.type !== ChannelType.GuildCategory) {
                        return interaction.editReply({
                            content: 'Ticket category is invalid or missing. Please ask an admin to re-run /setup.',
                            ephemeral: true,
                        });
                    }

                    const ticketCounter = guildSettings.ticketCounter || 1;
                    const ticketName = `ticket-${ticketCounter}`;

                    const ticketChannel = await interaction.guild.channels.create({
                        name: ticketName,
                        type: ChannelType.GuildText,
                        parent: category,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: ['ViewChannel'],
                            },
                            {
                                id: interaction.user.id,
                                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                            },
                            ...guildSettings.supportRoles.map(roleId => ({
                                id: roleId,
                                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                            })),
                        ],
                    });

                    await client.db.createTicket(
                        ticketName,
                        interaction.user.id,
                        interaction.guildId,
                        ticketChannel.id,
                        'Ticket created from setup panel'
                    );

                    await client.db.updateGuildSettings(
                        interaction.guildId,
                        { ticketCounter: ticketCounter + 1 },
                        client.cache
                    );

                    const ticketEmbed = new EmbedBuilder()
                        .setTitle('🎟️ Ticket Opened')
                        .setDescription(
                            'A private ticket channel has been created for you. Our support team will respond shortly.'
                        )
                        .addFields(
                            { name: 'Ticket', value: ticketChannel.toString(), inline: true },
                            { name: 'Requested by', value: interaction.user.toString(), inline: true }
                        )
                        .setColor(Colors.Green)
                        .setTimestamp();

                    const ticketButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('ticket_close')
                            .setLabel('Close Ticket')
                            .setStyle(ButtonStyle.Danger)
                    );

                    await ticketChannel.send({ embeds: [ticketEmbed], components: [ticketButtons] });

                    await interaction.editReply({
                        content: `✅ Ticket created: ${ticketChannel}`,
                        ephemeral: true,
                    });
                } catch (error) {
                    client.logger.error('Ticket panel create error:', error);
                    await interaction.editReply({
                        content: '❌ Could not create ticket. Please try again later.',
                        ephemeral: true,
                    });
                }
            },
        },
    ],
};
