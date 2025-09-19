import {create} from 'zustand'
import {trpc} from "../utils/trpc";
import { TypeOf } from 'zod';
export const LobbyStore  = create(
    (set)=>({
     LoggedIn: false,
     LoginStatusMessage: "N/A",
     Engine: "N/A",
     Game: "N/A",
     UserCount: 0,
     channels: []
}) 
)



export function useLobby():object{
    console.log("lul")
    // const initialLobby = trpc.getLobby.useQuery();

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

