import mongoose from "mongoose";

export async function getFile({ user, file }): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const downloadStream = this.bucket.openDownloadStream(
            new mongoose.Types.ObjectId(file)
        );

        const chunks: Buffer[] = [];

        downloadStream.on("data", (chunk) => {
            chunks.push(chunk);
        });

        downloadStream.on("error", reject);

        downloadStream.on("end", () => {
            const buffer = Buffer.concat(chunks);

            // conversion propre vers ArrayBuffer
            const arrayBuffer = buffer.buffer.slice(
                buffer.byteOffset,
                buffer.byteOffset + buffer.byteLength
            );

            resolve(arrayBuffer);
        });
    });
}