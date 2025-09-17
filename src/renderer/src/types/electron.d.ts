export interface LoginData {
  username: string
  password: string
}

export interface WelcomeData {
  Engine: string
  Game: string
  UserCount: string
}

export interface RawOutputData {
  command: string
  data: string
}

export interface ElectronAPI {
  sendLogin: (loginData: LoginData) => void
  sendRegister: (registerData: LoginData) => void
  mountListener: (channel: string, callback: (data: any) => void) => void
  unmountListeners: () => void
  onWelcome: (callback: (data: any) => void) => void
  onLoginUpdate: (callback: () => void) => void
  onRawOutput: (callback: (data: RawOutputData) => void) => void
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}