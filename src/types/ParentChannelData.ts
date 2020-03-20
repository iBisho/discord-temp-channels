import { ChildChannelData, ParentChannelOptions } from "./";

export interface ParentChannelData {
    channelID: string;
    options: ParentChannelOptions;
    children: ChildChannelData[];
}
