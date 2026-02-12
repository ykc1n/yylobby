import axios from "axios";
import { promises } from "dns";
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
     async GetDownloadInfo(name: string): Promise<null | DownloadFileResponse> {
      const response = await axios.post(this.PlasmaService,`DownloadFileRequest ${JSON.stringify({InternalName: name})}\n`,{responseType: "stream"})
            .catch(error => {
                console.error("Error downloading:", error);
            });
        if(!response || !response.data) return null;
        console.log(response)
        return response.data as DownloadFileResponse;
    }

    async DownloadResource(name:string):Promise<void> {
       const downloadInfo = await this.GetDownloadInfo(name);
       if(!downloadInfo) return
       //hmm, there are multiple downlaod links... not really sure how to deal with this
       //for now ill just be lazy and use the first link lol
       //if i do the whole thing with internalname, going from "internalname" to the actual filename might be tricky.. i could just split the link but that seems kinda meme
       const response = await axios.get(downloadInfo.links[0])
       
       if(!response.data) return
       const writer = fs.createWriteStream(`${name}.sd7`)
       response.data.pipe(writer)

    }


    constructor() {
        console.log("ZerokDownloader initialized");
    }
}