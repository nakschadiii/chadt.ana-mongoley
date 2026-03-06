import { fetchMessages } from "./api/messages.fetch";
import { fetchChannels } from "./api/channels.fetch";
import { setActivity } from "./api/activity.set";
import { setChannel } from "./api/channel.set";
import { setMember } from "./api/member.set";
import { setMessage } from "./api/message.set";
import { getMembers } from "./api/members.get";
import { channelSchema } from "./schemas/channel.schema";
import { memberSchema } from "./schemas/member.schema";
import { messageSchema } from "./schemas/message.schema";
import { activitySchema } from "./schemas/activity.schema";
import { markMessagesAsRead } from "./api/markMessagesAsRead";

interface constructor {
    connections: {
        chat: any;
        profiles: any;
    },
}

export default class {
    private connections: any;
    private models: any;

    getMembers: any;
    fetchChannels: any;
    fetchMessages: any;
    setMessage: any;
    setChannel: any;
    setMember: any;
    setActivity: any;

    constructor({ connections }: constructor) {
        this.connections = connections;
        this.models = {
            channel: connections.chat.model("channel", channelSchema),
            member: connections.chat.model("member", memberSchema),
            message: connections.chat.model("message", messageSchema),
            activity: connections.chat.model("activity", activitySchema),
        };
        this.getMembers = getMembers.bind(this);
        this.fetchChannels = fetchChannels.bind(this);
        this.fetchMessages = fetchMessages.bind(this);
        this.setMessage = setMessage.bind(this);
        this.setChannel = setChannel.bind(this);
        this.setMember = setMember.bind(this);
        this.setActivity = setActivity.bind(this);
        this.markMessagesAsRead = markMessagesAsRead.bind(this);
    }
}

