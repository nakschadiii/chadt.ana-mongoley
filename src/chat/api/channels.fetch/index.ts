import { actionsPipeline } from "./actionsPipeline";
import { eventsPipeline } from "./eventsPipeline";
import { lookupLastReadMessage } from "./lookupLastReadMessage";
import { lookupMembersIDs } from "./lookupMembersIDs";
import { memberWithChannelPipeline } from "./memberWithChannelPipeline";
import { projectChannelWithFallback } from "./projectChannelWithFallback";

export async function fetchChannels({ user, limit = 20 }) {
    try {
        const pipeline = [
            ...memberWithChannelPipeline({ user, limit }),
            ...projectChannelWithFallback(),
            ...lookupLastReadMessage(),
            ...lookupMembersIDs({ user }),
            ...actionsPipeline(),
            ...eventsPipeline({ user })

        ]
        const result = await this.models.member.aggregate(pipeline);

        if (!result) throw new Error("No channels found");
        console.log(user);

        return result;
    } catch (error) {
        throw new Error(error.message);
    }
};