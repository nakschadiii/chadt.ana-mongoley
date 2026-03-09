import mongoose from "mongoose";
import { getFile } from "./api/getFile";
import { uploadChunk } from "./api/uploadChunk";

interface constructor {
    bucket: any;
}

export default class {
    private uploads = new Map();

    bucket: any;

    constructor({ bucket }: constructor) {
        this.bucket = bucket;
        this.uploadChunk = uploadChunk.bind(this);
        this.getFile = getFile.bind(this);
    }

    async getStream(fileId: string) {
        try {
            const cursor = this.bucket.find({ _id: new mongoose.Types.ObjectId(fileId) });
            let { metadata: meta, ...data } = await cursor.next();

            if (!data) throw new Error("File not found");

            const metadata = { ...meta, ...data };

            return {
                metadata,
                downloadStream: this.bucket.openDownloadStream(
                    new mongoose.Types.ObjectId(fileId)
                )
            };
        } catch (error) {
            throw error;
        }
    }
}
