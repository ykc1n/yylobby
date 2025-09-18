import {create} from 'zustand'
import {trpc} from "../utils/trpc";
import { TypeOf } from 'zod';
const LobbyStore  = create(
    (set)=>({
     Engine: "N/A",
     Game: "N/A",
     UserCount: 0,
     channels: []
}) 
)

const connectionStore = create(
    set =>({
        zk_conn: undefined,
        setConnection: (newConnection):void => set({zk_conn: newConnection})
    })
)

export function useLobby():object{
    console.log("lul")

    const lobby = LobbyStore(state => state);     
    
    
    trpc.lobbyUpdateStream.useSubscription(undefined, {
        onData: (data) =>{
            console.log("woooaah..")
            console.log(data)
            LobbyStore.setState(data);
        }
    })



    return lobby;
}

