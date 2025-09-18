// export interface Command<T = any>{
//     name: string
//     data: T
// }

export interface LoginCommand{
    name:"Login"
    data: object
}

export interface WelcomeCommand{
    name:"Welcome"
    data: object

}