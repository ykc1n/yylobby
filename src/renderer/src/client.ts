import {create} from 'zustand'
import {trpc} from "../utils/trpc";
import { TypeOf } from 'zod';
import { useEffect } from 'react';
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

    useEffect(()=>{
        window.zkLobbyApi.onLobbyUpdate((lobby)=>{
            console.log(lobby)
            console.log("y combinating")
            LobbyStore.setState(lobby);
        })
    },[])



    return lobby;
}

