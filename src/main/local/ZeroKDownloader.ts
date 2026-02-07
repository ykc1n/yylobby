import axios from "axios";
import fs from "fs";
interface DownloadRequest {
    InternalName: string;
}

export class ZerokDownloader {
    downloads = [];
    PlasmaService = "https://zero-k.info/contentService";
     testDownload():void{
        const request: DownloadRequest = {
            InternalName: "Sands of Time v1.0"
        }

        const writer = fs.createWriteStream("Sands of Time v1.0");
        
        axios.post(this.PlasmaService,`DownloadFileRequest ${JSON.stringify(request)}\n`,{responseType: "stream"})
            .then(response => {
                console.log("Download successful:", response.data);
                response.data.pipe(writer);
                writer.on("finish", () => {
                    console.log("File saved successfully.");
                });
                writer.on("error", (err) => {
                    console.error("Error writing file:", err);
                });
            })
            .catch(error => {
                console.error("Error downloading:", error);
            });
    }

    constructor() {
        console.log("ZerokDownloader initialized");
    }
}