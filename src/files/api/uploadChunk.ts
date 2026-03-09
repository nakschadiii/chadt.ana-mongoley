export async function uploadChunk(payload) {
    try {
        const { name, type, size, chunk, uploadID, user } = payload;

        if (!this.uploads.has(uploadID)) {
            const uploadStream = this.bucket.openUploadStream(name, { metadata: { user, type } });
            this.uploads.set(uploadID, { stream: uploadStream, receivedBytes: 0, size });
        }

        const upload = this.uploads.get(uploadID);
        upload.stream.write(Buffer.from(chunk));
        upload.receivedBytes += chunk.length;

        if (upload.receivedBytes >= upload.size) {
            await new Promise((resolve, reject) => {
                upload.stream.end(err => {
                    if (err) reject(err);
                    resolve(null);
                });
            });

            this.uploads.delete(uploadID);
            return { done: true, fileId: upload.stream.id };
        }

        return { done: false };
    } catch (error) {
        throw error;
    }
}
