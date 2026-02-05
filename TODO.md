
# General

## UI
- [ ] De-slopify the main menu..
- [ ] Find some good backgrounds
    - maybe moving backgrounds could work?


## Resources
- [ ] Resource downloading
     - [ ] Download maps, handle when maps cant be found or downloaded
     - [ ] Download mods
     - [ ] Download replays (replay command from website)
- [ ] Resource loading
    - [ ] Show map images when needed ( in battle list, etc)
    - [ ] Check if resources exist
    - [ ] Decide when to look for resources
- [ ] Resource downloading ui / settings
    -  will this be a progress bar? maybe its own tab?
    -  might be able to set custom sources?
    -  customize where resources are downloaded from, and where they are checked? so that for example you can look both in your BAR directory, and your ZK directory for a certain map?

## Infra
- [ ] Should probably share types from the main process into the renderer process


# Multiplayer

## Account
- [ ] Sign up
- [ ] Steam integration?
- [ ] Logging out

## Player interactions / Chat
- [ ] Friend player
- [ ] Better friend visibility
    - [ ] Higher in chatroom?
    - [ ] Better freind menu?
- [ ] Ignore
- [ ] Private messageing
- [ ] Remember previous channels
- [ ] Differentiate messages that are from discord
- [ ] Tooltip over players
    - [ ] Show their rank
    - [ ] Show their level
    - [ ] Show their awards
    - [ ] Show their profile picture
    - [ ] Possibly show their steam information?
- [ ] Join player's lobby via right click context menu


## Battleroom
- [ ] Correctly update battle list
    - [ ] Remove battles from battle list
    - [ ] Add battles to battle list
    - [ ] Update players in battle list
- [ ] Add tooltip to battle list
- [ ] Join battleroom
- [ ] Leave battleroom
- [ ] Votes
- [ ] Set settings
    - [ ] tweakdefs
    - [ ] tweakunits
    - [ ] maybe a cool tweakunits ui?

## Matchmaking
- [ ] Correctly consume `MatchmakerSetup`
- [ ] Display whos in queue
- [ ] Show when im in the queue, for how long
    - ideally you should see this throughout the app
- [ ] Matchmaking popup


# Singleplayer

## Skirmish match
note, shares a little bit with battleroom. skirmishes are basically just a singleplayer battleroom
- [ ] Adding AIs 
- [ ] Support for dev mode?


## Replay browsing
- [ ] Customize the directory where replays are looked at
- [ ] Better replay searching?
    - Filter
    - Sort
    - Search

## Campaign (?)


# User / Release

notes:
 getting resource downloading done, as well as making skirmish work is probably a MVP to make some sort of release (if anything, to just *test* releasing)

## User related stuff
- [ ] Persistent configs
- [ ] Actually setup a user directory
- [ ] Check all the directories work as expected
    - [ ] Need to make sure required directories are accounted for in some sort of wizard or settings menu
- [ ] Possiblity to hot-swap installation
    - e.g one setup is hel-k, one setup is zk,  one setup is some dev mode, etc
- [ ] Widgets folder visible through lobby?

## Responsiveness / different ux
- [ ] Need to make sure this works on smaller screen sizes lol

## Releasing
- [ ] Actually build the project and create an executable
- [ ] Release on github
- [ ] Setup updating 

- [ ] Actually set up a user directory
- [ ] Testing



# Need to research

How does resource loading work?
    - Connect to wrapper
    using the PR downloader seems to be a common approach for BAR applications

    wait i think i literally just send messages to the server
    https://github.com/ZeroK-RTS/Zero-K-Infrastructure/blob/b8ad3b704a7adcedf3ab59b029b812eab7a0679d/ChobbyLauncher/ChobbyLoopbackMessages.cs#L69