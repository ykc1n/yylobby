import axios from "axios";
import fs from "fs";
interface DownloadRequest {
    InternalName: string;
}

interface DownloadFileResponse{
    links: string[];
    torrent: string;
    dependencies: string[];
    resourceType: string;
    torrentName: string;
}

export class ZerokDownloader {
    downloads = [];
    PlasmaService = "https://zero-k.info/contentService";
     async DownloadFileRequest(name: string): Promise<null | DownloadFileResponse> {
      const response = await axios.post(this.PlasmaService,`DownloadFileRequest ${JSON.stringify({InternalName: name})}\n`,{responseType: "stream"})
            .catch(error => {
                console.error("Error downloading:", error);
            });
        if(!response || !response.data) return null;
        console.log(response)
        return response.data as DownloadFileResponse;
    }

    testDownload():void {
        this.DownloadFileRequest("maps/zk_map_asteroid_belt.sdz")
    }


    constructor() {
        console.log("ZerokDownloader initialized");
    }
}