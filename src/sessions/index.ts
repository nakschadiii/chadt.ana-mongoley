import mongoose from "mongoose";
import { visitorSchema } from "./schema/visitor";
import { clientSchema } from "./schema/client";
import { sessionSchema } from "./schema/session";

export default class {
    private connections: any;
    private models: any;

    constructor({ connections }: any) {
        this.connections = connections;
        this.models = {
            visitor: this.connections.sessions.model("visitor", visitorSchema),
            client: this.connections.sessions.model("client", clientSchema),
            session: this.connections.sessions.model("session", sessionSchema),
        };
    }

    async createVisitor() {
        try {
            const visitor = await this.models.visitor.create({});
            return { success: true, data: visitor?._id?.toString() };
        } catch (error) {
            return { success: false, error };
        }
    }

    async upsertVisitor(visitorId?: string) {
        try {
            let visitor;
            if (!visitorId) visitor = await this.models.visitor.create({});
            else visitor = await this.models.visitor.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(visitorId) }, {}, { upsert: true, returnDocument: true });
            return { success: true, data: visitor?._id?.toString() };
        } catch (error) {
            return { success: false, error };
        }
    }

    async createAndReturnClientID(visitorId: string) {
        try {
            const client = await this.models.client.create({ visitorId });
            return { success: true, data: client?._id?.toString() };
        } catch (error) {
            return { success: false, error };
        }
    }

    async findClient({ clientId, visitorId }) {
        const client = await this.models.client.findOne({ $or: [{ _id: new mongoose.Types.ObjectId(clientId) }, { visitorId }] });
        return client?._id?.toString();
    }

    async getSessions(client) {
        return await this.models.session.find({ client: new mongoose.Types.ObjectId(client), active: true });
    }
}