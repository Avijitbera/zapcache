import {EventEmitter} from 'events'
import {logger} from '../utils/logger'

export class ExpirationManager extends EventEmitter {
    private expirationTimers: Map<string, NodeJS.Timeout> = new Map()

    scheduleExpiration(key: string, expiresAt: number): void {
        this.clearExpirationTimer(key)
        const now = Date.now()
        const delay = Math.max(0, expiresAt - now)
        
        if(delay > 0){
            const timer = setTimeout(() =>{
                this.emit('expired', key)
                this.clearExpirationTimer(key)
            }, delay)

            this.expirationTimers.set(key, timer)

            logger.info(`Scheduled expiration for key ${key} in ${delay}ms`)
        }
    }

    clearExpirationTimer(key: string): void {
        const timer = this.expirationTimers.get(key)
        if(timer){
            clearTimeout(timer)
            this.expirationTimers.delete(key)
        }
    }

    clearAll(): void{
        for(const [key, timer] of this.expirationTimers){
            clearTimeout(timer)
        }
        this.expirationTimers.clear()
    }

}

