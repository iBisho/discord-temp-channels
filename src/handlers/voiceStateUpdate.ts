import { VoiceState, VoiceChannel, OldVoiceState } from 'eris';
import TempChannelsManager from "../index";

export const handleVoiceStateUpdate = async (manager: TempChannelsManager, oldState: OldVoiceState, newState: VoiceState) => {
    const voiceChannelLeft =!!oldState.channelID && !newState.channelID;
    const voiceChannelMoved = !!oldState.channelID && !!newState.channelID && oldState.channelID !== newState.channelID;
    const voiceChannelJoined = !oldState.channelID && !!newState.channelID;

    // If the member left a channel or moved to a new one
    if (voiceChannelLeft || voiceChannelMoved) {
        // The parent channel of the channel in which the member isn't anymore
        const parentChannel = manager.channels.find(channelData => channelData.children.some(child => child.channel.id === oldState.channelID));
        // If there is a parent
        if (parentChannel) {
						const childToDelete = parentChannel.children.find(child => child.channel.id === oldState.channelID);
						const voiceChannelState = manager.client.getChannel(oldState.channelID) as VoiceChannel;
            // If the channel has to be deleted and is empty
            if (
								(parentChannel.options.childAutoDelete && voiceChannelState.voiceMembers.size === 0)
								||
								(parentChannel.options.childAutoDeleteIfOwnerLeaves && !voiceChannelState.voiceMembers.has(childToDelete.owner.id))
            ) {
                // Delete it
                childToDelete.channel
                    .delete()
                    .then(() => {
                        // Remove the channel from the children
                        parentChannel.children = parentChannel.children.filter(
                            child =>
                                child.channel.id !== childToDelete.channel.id
                        );
                        manager.emit(
                            'childDelete',
                            newState.id,
                            childToDelete.channel,
                            manager.client.getChannel(parentChannel.channelID)
                        );
                    })
                    .catch((error) => {
                        manager.emit(
                            'error',
                            error.message,
                            "Cannot auto delete channel " + childToDelete.channel.id
                        );
                    });
            }
        }
    }

    // If the member joined a voice channel or moved to a new one
    if (voiceChannelJoined || voiceChannelMoved) {
        // Check if the member is in a parent channel
        const parentChannel = manager.channels.find(channelData => channelData.channelID === newState.channelID);
        // If the member is in a parent channel
        if (parentChannel) {
            // Create a child channel
						const count = parentChannel.children.length + 1;
						const guild = manager.client.guilds.get(manager.client.channelGuildMap[newState.channelID]);
						// Random check.
						if (!guild) return;

						const member = guild.members.get(newState.id);
						// Random check.
						if (!member) return;

            const newChannelName = parentChannel.options.childFormat(member, count);
            const channel = await guild.createChannel(newChannelName, 2,
                {
                    parentID: parentChannel.options.childCategory,
                    bitrate: parentChannel.options.childBitrate,
                    userLimit: parentChannel.options.childMaxUsers
                }
						);

            manager.emit(
                'childCreate',
                newState.id,
                channel,
                guild.channels.get(parentChannel.channelID)
            );
            // Move the member in the new channel
            member.edit({
							channelID: channel.id
						});
            // Add the child
            parentChannel.children.push({
                owner: member,
                channel
            });
        }
    }
};
