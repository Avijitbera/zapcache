import {UserStore} from './types'

export class MemoryUserStore implements UserStore {
    private user: string | undefined

    getUser(): string | undefined {
        return this.user
    }

    setUser(user: string): void {
        this.user = user
    }

    clearUser(): void {
        this.user = undefined
    }
}
