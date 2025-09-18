// Base command interface
export interface Command<T = any> {
    name: string;
    data: T;
}

// Enums
export enum Origin {
    Server = 1,
    Client = 2
}

export enum SayPlace {
    Channel = "Channel",
    Battle = "Battle",
    User = "User",
    BattlePrivate = "BattlePrivate",
    Game = "Game",
    MessageBox = "MessageBox"
}

export enum SaySource {
    Discord = "Discord",
    Spring = "Spring",
    Zk = "Zk",
    DiscordSpring = "DiscordSpring"
}

export enum SyncStatuses {
    Unknown = "Unknown",
    Synced = "Synced",
    Unsynced = "Unsynced"
}

export enum AutohostMode {
    None = "None",
    Planetwars = "Planetwars",
    Generic = "Generic",
    Teams = "Teams",
    GameChickens = "GameChickens",
    GameFFA = "GameFFA"
}

export enum PlanetWarsModes {
    AllOffline = "AllOffline",
    PreGame = "PreGame",
    Running = "Running",
    RoundEnding = "RoundEnding"
}

export enum Relation {
    Friend = "Friend",
    Ignore = "Ignore"
}

// Nested types
export interface FactionInfo {
    Name: string;
    Shortcut: string;
    Color: string;
}

export interface Topic {
    SetBy: string;
    SetDate?: Date;
    Text: string;
}

export interface BattleHeader {
    BattleID?: number;
    Engine: string;
    Founder: string;
    Game: string;
    IsMatchMaker?: boolean;
    IsRunning?: boolean;
    Map: string;
    MaxPlayers?: number;
    Mode?: AutohostMode;
    Password: string;
    PlayerCount?: number;
    RunningSince?: Date;
    SpectatorCount?: number;
    Title: string;
    TimeQueueEnabled?: boolean;
    MaxEvenPlayers?: number;
}

export interface User {
    AccountID: number;
    Avatar: string;
    AwaySince?: Date;
    BanMute: boolean;
    BanVotes: boolean;
    BanSpecChat: boolean;
    BattleID?: number;
    Clan: string;
    Country: string;
    DisplayName: string;
    Faction: string;
    InGameSince?: Date;
    IsAdmin: boolean;
    IsBot: boolean;
    LobbyVersion: string;
    Name: string;
    SteamID: string;
    Badges: string[];
    Icon: string;
    EffectiveMmElo: number;
    EffectiveElo: number;
    Level: number;
    Rank: number;
}

export interface FriendEntry {
    Name: string;
    SteamID: string;
}

// Server Messages
export interface WelcomeCommand extends Command<{
    Engine: string;
    Game: string;
    UserCount: number;
    Version: string;
    ChallengeToken: string;
    ServerPubKey: string;
    Blacklist: string[];
    Factions: FactionInfo[];
    UserCountLimited: boolean;
}> {
    name: "Welcome";
}

export interface NewsListCommand extends Command<{
    NewsItems: any[]; // Define NewsItem interface if needed
}> {
    name: "NewsList";
}

export interface LadderListCommand extends Command<{
    LadderItems: any[]; // Define LadderItem interface if needed
}> {
    name: "LadderList";
}

export interface ForumListCommand extends Command<{
    ForumItems: any[]; // Define ForumItem interface if needed
}> {
    name: "ForumList";
}

export interface DefaultEngineChangedCommand extends Command<{
    Engine: string;
}> {
    name: "DefaultEngineChanged";
}

export interface DefaultGameChangedCommand extends Command<{
    Game: string;
}> {
    name: "DefaultGameChanged";
}

export interface RegisterResponseCommand extends Command<{
    ResultCode: number;
    BanReason?: string;
}> {
    name: "RegisterResponse";
}

export interface LoginResponseCommand extends Command<{
    Name: string;
    BanReason?: string;
    ResultCode: number;
    SessionToken: string;
}> {
    name: "LoginResponse";
}

export interface ChannelHeaderCommand extends Command<{
    ChannelName: string;
    IsDeluge: boolean;
    Password: string;
    Topic: Topic;
    Users: string[];
}> {
    name: "ChannelHeader";
}

export interface ChannelUserAddedCommand extends Command<{
    ChannelName: string;
    UserName: string;
}> {
    name: "ChannelUserAdded";
}

export interface ChannelUserRemovedCommand extends Command<{
    ChannelName: string;
    UserName: string;
}> {
    name: "ChannelUserRemoved";
}

export interface JoinChannelResponseCommand extends Command<{
    Channel: any; // ChannelHeader
    ChannelName: string;
    Reason: string;
    Success: boolean;
}> {
    name: "JoinChannelResponse";
}

export interface UserCommand extends Command<User> {
    name: "User";
}

export interface UserDisconnectedCommand extends Command<{
    Name: string;
    Reason: string;
}> {
    name: "UserDisconnected";
}

export interface SayCommand extends Command<{
    IsEmote: boolean;
    Place: SayPlace;
    Ring: boolean;
    Target: string;
    Text: string;
    Time?: Date;
    User: string;
    Source?: SaySource;
}> {
    name: "Say";
}

export interface BattleAddedCommand extends Command<{
    Header: BattleHeader;
}> {
    name: "BattleAdded";
}

export interface BattleUpdateCommand extends Command<{
    Header: BattleHeader;
}> {
    name: "BattleUpdate";
}

export interface BattleRemovedCommand extends Command<{
    BattleID: number;
}> {
    name: "BattleRemoved";
}

export interface JoinBattleSuccessCommand extends Command<{
    BattleID: number;
    Bots: any[]; // UpdateBotStatus[]
    Options: Record<string, string>;
    Players: any[]; // UpdateUserBattleStatus[]
    MapOptions: Record<string, string>;
}> {
    name: "JoinBattleSuccess";
}

export interface UpdateUserBattleStatusCommand extends Command<{
    AllyNumber?: number;
    IsSpectator?: boolean;
    QueueOrder?: number;
    Name: string;
    Sync?: SyncStatuses;
    JoinTime?: Date;
}> {
    name: "UpdateUserBattleStatus";
}

export interface UpdateBotStatusCommand extends Command<{
    AiLib: string;
    AllyNumber?: number;
    Name: string;
    Owner: string;
}> {
    name: "UpdateBotStatus";
}

export interface RemoveBotCommand extends Command<{
    Name: string;
}> {
    name: "RemoveBot";
}

export interface SetModOptionsCommand extends Command<{
    Options: Record<string, string>;
}> {
    name: "SetModOptions";
}

export interface SetMapOptionsCommand extends Command<{
    Options: Record<string, string>;
}> {
    name: "SetMapOptions";
}

export interface ConnectSpringCommand extends Command<{
    Engine: string;
    Game: string;
    Ip: string;
    Map: string;
    Port: number;
    ScriptPassword: string;
    Mode: AutohostMode;
    Title: string;
    IsSpectator: boolean;
}> {
    name: "ConnectSpring";
}

export interface RejoinOptionCommand extends Command<{
    BattleID: number;
}> {
    name: "RejoinOption";
}

export interface FriendListCommand extends Command<{
    Friends: FriendEntry[];
}> {
    name: "FriendList";
}

export interface IgnoreListCommand extends Command<{
    Ignores: string[];
}> {
    name: "IgnoreList";
}

export interface BattleDebriefingCommand extends Command<{
    DebriefingUsers: Record<string, any>; // DebriefingUser
    ChatChannel: string;
    Message: string;
    ServerBattleID: number;
    Url: string;
    RatingCategory: string;
}> {
    name: "BattleDebriefing";
}

export interface UserProfileCommand extends Command<{
    Name: string;
    Awards: any[]; // UserAward[]
    Badges: string[];
    Level: number;
    LevelUpRatio: string;
    Rank: number;
    RankUpRatio: string;
    EffectiveElo: number;
    EffectiveMmElo: number;
    EffectivePwElo: number;
    Kudos: number;
    PwMetal: string;
    PwDropships: string;
    PwBombers: string;
    PwWarpcores: string;
}> {
    name: "UserProfile";
}

export interface BattlePollCommand extends Command<{
    Topic: string;
    Url: string;
    Options: any[]; // PollOption[]
    VotesToWin: number;
    YesNoVote: boolean;
    MapSelection: boolean;
    NotifyPoll: boolean;
    MapName: string;
}> {
    name: "BattlePoll";
}

export interface BattlePollOutcomeCommand extends Command<{
    WinningOption: unknown; // PollOption
    Topic: string;
    Message: string;
    Success: boolean;
    YesNoVote: boolean;
    MapSelection: boolean;
}> {
    name: "BattlePollOutcome";
}

export interface CustomGameModeResponseCommand extends Command<{
    ShortName: string;
    DisplayName: string;
    GameModeJson: string;
}> {
    name: "CustomGameModeResponse";
}

// Client Messages
export interface LoginCommand extends Command<{
    ClientType: number; // ClientTypes enum
    LobbyVersion: string;
    Name: string;
    PasswordHash: string;
    SteamAuthToken: string;
    UserID: number;
    InstallID: string;
    ClientPubKey: string;
    SignedChallengeToken: string;
    EncryptedPasswordHash: string;
    Dlc: number[];
}> {
    name: "Login";
}

export interface RegisterCommand extends Command<{
    Name: string;
    PasswordHash: string;
    EncryptedPasswordHash: string;
    SteamAuthToken: string;
    Email: string;
    UserID: number;
    InstallID: string;
}> {
    name: "Register";
}

export interface ChangeTopicCommand extends Command<{
    ChannelName: string;
    Topic: Topic;
}> {
    name: "ChangeTopic";
}

export interface JoinChannelCommand extends Command<{
    ChannelName: string;
    Password: string;
}> {
    name: "JoinChannel";
}

export interface LeaveChannelCommand extends Command<{
    ChannelName: string;
}> {
    name: "LeaveChannel";
}

export interface OpenBattleCommand extends Command<{
    Header: BattleHeader;
}> {
    name: "OpenBattle";
}

export interface JoinBattleCommand extends Command<{
    BattleID: number;
    Password: string;
}> {
    name: "JoinBattle";
}

export interface LeaveBattleCommand extends Command<{
    BattleID?: number;
}> {
    name: "LeaveBattle";
}

export interface ChangeUserStatusCommand extends Command<{
    IsAfk?: boolean;
    IsInGame?: boolean;
}> {
    name: "ChangeUserStatus";
}

export interface KickFromBattleCommand extends Command<{
    BattleID?: number;
    Name: string;
    Reason: string;
}> {
    name: "KickFromBattle";
}

export interface KickFromServerCommand extends Command<{
    Name: string;
    Reason: string;
}> {
    name: "KickFromServer";
}

export interface KickFromChannelCommand extends Command<{
    ChannelName: string;
    Reason: string;
    UserName: string;
}> {
    name: "KickFromChannel";
}

export interface ForceJoinChannelCommand extends Command<{
    ChannelName: string;
    UserName: string;
}> {
    name: "ForceJoinChannel";
}

export interface ForceJoinBattleCommand extends Command<{
    BattleID: number;
    Name: string;
}> {
    name: "ForceJoinBattle";
}

export interface PwJoinPlanetCommand extends Command<{
    PlanetID: number;
}> {
    name: "PwJoinPlanet";
}

export interface JoinFactionRequestCommand extends Command<{
    Faction: string;
}> {
    name: "JoinFactionRequest";
}

export interface SetAccountRelationCommand extends Command<{
    Relation: Relation;
    SteamID: string;
    TargetName: string;
}> {
    name: "SetAccountRelation";
}

export interface RequestConnectSpringCommand extends Command<{
    BattleID: number;
    Password: string;
}> {
    name: "RequestConnectSpring";
}

export interface UserReportCommand extends Command<{
    Username: string;
    Text: string;
}> {
    name: "UserReport";
}

export interface GetCustomGameModeCommand extends Command<{
    ShortName: string;
}> {
    name: "GetCustomGameMode";
}

// Union type for all commands
export type AnyCommand = 
    | WelcomeCommand
    | NewsListCommand
    | LadderListCommand
    | ForumListCommand
    | DefaultEngineChangedCommand
    | DefaultGameChangedCommand
    | RegisterResponseCommand
    | LoginResponseCommand
    | ChannelHeaderCommand
    | ChannelUserAddedCommand
    | ChannelUserRemovedCommand
    | JoinChannelResponseCommand
    | UserCommand
    | UserDisconnectedCommand
    | SayCommand
    | BattleAddedCommand
    | BattleUpdateCommand
    | BattleRemovedCommand
    | JoinBattleSuccessCommand
    | UpdateUserBattleStatusCommand
    | UpdateBotStatusCommand
    | RemoveBotCommand
    | SetModOptionsCommand
    | SetMapOptionsCommand
    | ConnectSpringCommand
    | RejoinOptionCommand
    | FriendListCommand
    | IgnoreListCommand
    | BattleDebriefingCommand
    | UserProfileCommand
    | BattlePollCommand
    | BattlePollOutcomeCommand
    | CustomGameModeResponseCommand
    | LoginCommand
    | RegisterCommand
    | ChangeTopicCommand
    | JoinChannelCommand
    | LeaveChannelCommand
    | OpenBattleCommand
    | JoinBattleCommand
    | LeaveBattleCommand
    | ChangeUserStatusCommand
    | KickFromBattleCommand
    | KickFromServerCommand
    | KickFromChannelCommand
    | ForceJoinChannelCommand
    | ForceJoinBattleCommand
    | PwJoinPlanetCommand
    | JoinFactionRequestCommand
    | SetAccountRelationCommand
    | RequestConnectSpringCommand
    | UserReportCommand
    | GetCustomGameModeCommand;