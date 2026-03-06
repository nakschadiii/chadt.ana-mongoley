export async function demo() {
    try {
        // 🔹 Utilisateurs
        const users = [
            { id: "demo", name: "Demo User" },
            { id: "83886116-e5b5-4438-8588-655b64639898", name: "Alice" },
            { id: "user3", name: "Bob" },
            { id: "user4", name: "Charlie" },
            { id: "user5", name: "Eve" },
            { id: "user6", name: "Mallory" }
        ];

        // 🔹 Channels
        const channels = [
            { id: "channel1", name: null, type: "private", createdBy: "demo" },
            { id: "channel2", name: null, type: "private", createdBy: "demo" }
        ];

        // 🔹 Crée/Met à jour les channels
        for (const c of channels) {
            await this.models.channel.findOneAndUpdate(
                { _id: c.id },
                { ...c, active: true },
                { upsert: true, returnDocument: "after" }
            );
        }

        // 🔹 Membres : tous les utilisateurs sont dans chaque channel
        for (const c of channels) {
            for (const u of users) {
                await this.models.member.findOneAndUpdate(
                    { channel: c.id, user: u.id },
                    { channel: c.id, user: u.id, status: u.id === "demo" ? "owner" : "member", lastReadMessage: null },
                    { upsert: true, returnDocument: "after" }
                );
            }
        }

        // 🔹 Messages : messages variés
        const messages = [
            // channel1
            { _id: crypto.randomUUID(), channel: "channel1", user: "83886116-e5b5-4438-8588-655b64639898", content: [{ type: "text", value: "Hello everyone!" }, { type: "mention", value: "demo" }] },
            { _id: crypto.randomUUID(), channel: "channel1", user: "user3", content: [{ type: "text", value: "Hi Alice!" }] },
            { _id: crypto.randomUUID(), channel: "channel1", user: "user4", content: [{ type: "sticker", value: "🎉" }] },
            { _id: crypto.randomUUID(), channel: "channel1", user: "user5", content: [{ type: "image", value: { url: "https://picsum.photos/200" } }] },
            { _id: crypto.randomUUID(), channel: "channel1", user: "demo", content: [{ type: "text", value: "Welcome all!" }] },

            // channel2
            { _id: crypto.randomUUID(), channel: "channel2", user: "demo", content: [{ type: "text", value: "Random chat starts" }] },
            { _id: crypto.randomUUID(), channel: "channel2", user: "user3", content: [{ type: "text", value: "Hey!" }] },
            { _id: crypto.randomUUID(), channel: "channel2", user: "user6", content: [{ type: "image", value: { url: "https://picsum.photos/201" } }] },
            { _id: crypto.randomUUID(), channel: "channel2", user: "user4", content: [{ type: "sticker", value: "😎" }] }
        ];

        for (const m of messages) {
            await this.models.message.findOneAndUpdate(
                { _id: m._id },
                { ...m, active: true },
                { upsert: true, returnDocument: "after" }
            );
        }

        // 🔹 Activities : plusieurs utilisateurs en activité
        const activities = [
            { channel: "channel1", user: "83886116-e5b5-4438-8588-655b64639898", type: "camera", active: true },
            { channel: "channel1", user: "user3", type: "typing", active: true },
            { channel: "channel1", user: "user4", type: "reaction", active: true },
            { channel: "channel1", user: "user5", type: "presence", active: true },
            { channel: "channel1", user: "demo", type: "camera", active: true },

            { channel: "channel2", user: "demo", type: "camera", active: true },
            { channel: "channel2", user: "user3", type: "presence", active: true },
            { channel: "channel2", user: "user4", type: "typing", active: true },
            { channel: "channel2", user: "user6", type: "reaction", active: true }
        ];

        for (const a of activities) {
            await this.models.activity.findOneAndUpdate(
                { channel: a.channel, user: a.user, type: a.type },
                a,
                { upsert: true, returnDocument: "after" }
            );
        }

        console.log("✅ Demo chat seeded with multiple users, channels, messages, and activities");
    } catch (error) {
        console.error(error);
    }
}
