import { Member } from "eris";

export interface ParentChannelOptions {
    childAutoDelete: boolean;
    childAutoDeleteIfOwnerLeaves: boolean;
    childFormat(member: Member, count: number): string;
    childMaxUsers?: number;
    childBitrate?: number;
    childCategory?: string;
}
