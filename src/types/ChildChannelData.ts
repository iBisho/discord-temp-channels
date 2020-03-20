import { Member, VoiceChannel } from "eris";

export interface ChildChannelData {
    owner: Member;
    channel: VoiceChannel;
}
